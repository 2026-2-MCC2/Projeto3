const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { verifyTotp } = require('../utils/totp');

const SALT_ROUNDS = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Perfis permitidos no cadastro público (ADMIN, se existir, não deve se autocadastrar)
const PERFIS = ['ORGANIZADOR', 'FORNECEDOR'];

const apenasDigitos = (v) => String(v || '').replace(/\D/g, '');

async function register(req, res, next) {
  try {
    const { nome, senha, cnpj, telefone, categoria, descricao, documento } = req.body;
    const email = String(req.body.email || '').trim().toLowerCase();
    const perfil = String(req.body.perfil || '').trim().toUpperCase();

    if (!nome || !email || !senha || !perfil) {
      return res.status(400).json({ erro: 'Nome, e-mail, senha e perfil são obrigatórios.' });
    }
    if (nome.length > 120 || email.length > 50) {
      return res.status(400).json({ erro: 'O nome aceita até 120 caracteres e o e-mail até 50.' });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ erro: 'E-mail inválido.' });
    }
    if (senha.length < 6) {
      return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres.' });
    }
    if (!PERFIS.includes(perfil)) {
      return res.status(400).json({ erro: `Perfil inválido. Use: ${PERFIS.join(' ou ')}.` });
    }

    const cnpjLimpo = apenasDigitos(cnpj);
    if (cnpjLimpo.length !== 14) {
      return res.status(400).json({ erro: 'CNPJ inválido (informe 14 dígitos).' });
    }
    if (perfil === 'ORGANIZADOR' && !telefone) {
      return res.status(400).json({ erro: 'Telefone é obrigatório para organizadores.' });
    }
    if (documento && (
      typeof documento.nome !== 'string'
      || typeof documento.tipo !== 'string'
      || typeof documento.conteudo !== 'string'
      || !['application/pdf', 'image/jpeg', 'image/png'].includes(documento.tipo)
      || !/^[A-Za-z0-9+/]*={0,2}$/.test(documento.conteudo)
      || Buffer.from(documento.conteudo, 'base64').length > 10 * 1024 * 1024
    )) {
      return res.status(400).json({ erro: 'Documento inválido. Envie PDF, JPG ou PNG com até 10 MB.' });
    }

    const existente = await User.findByEmail(email);
    if (existente) {
      return res.status(409).json({ erro: 'E-mail já cadastrado.' });
    }

    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
    const id = await User.create({
      nome,
      email,
      senhaHash,
      perfil,
      organizador: { cnpj: cnpjLimpo, telefone },
      fornecedor: { cnpj: cnpjLimpo, categoria, descricao },
      documento,
    });

    return res.status(201).json({ id, nome, email, perfil });
  } catch (err) {
    // E-mail ou CNPJ duplicado (UNIQUE) numa corrida entre requisições
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'E-mail ou CNPJ já cadastrado.' });
    }
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { senha, mfa } = req.body;
    const adminRequested = req.body.admin === true;
    const email = String(req.body.email || '').trim().toLowerCase();

    if (!email || !senha) {
      return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
    }

    const usuario = await User.findByEmail(email);
    const senhaOk = usuario && (await bcrypt.compare(senha, usuario.SENHA));

    if (!senhaOk) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const isAdmin = String(usuario.PERFIL).toUpperCase() === 'ADMIN';
    if (adminRequested !== isAdmin) {
      return res.status(403).json({ erro: 'Credenciais inválidas para este tipo de acesso.' });
    }
    if (isAdmin && (!usuario.MFA_SECRET || !verifyTotp(usuario.MFA_SECRET, mfa))) {
      return res.status(401).json({ erro: 'Código MFA inválido ou não configurado.' });
    }

    const token = jwt.sign(
      { id: usuario.ID_USUARIO, email: usuario.EMAIL, perfil: String(usuario.PERFIL).toUpperCase() },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    return res.status(200).json({
      token,
      usuario: {
        id: usuario.ID_USUARIO,
        nome: usuario.NOME,
        email: usuario.EMAIL,
        perfil: usuario.PERFIL,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const u = await User.findById(req.user.id);
    if (!u) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }
    return res.status(200).json({
      id: u.ID_USUARIO,
      nome: u.NOME,
      email: u.EMAIL,
      perfil: u.PERFIL,
      idOrganizador: u.ID_ORGANIZADOR || null,
      idFornecedor: u.ID_FORNECEDOR || null,
    });
  } catch (err) {
    next(err);
  }
}

async function documentoAtual(req, res, next) {
  try {
    const documento = await User.findDocumentByUserId(req.user.id);
    if (!documento) return res.status(404).json({ erro: 'Nenhum documento foi enviado para esta conta.' });
    res.setHeader('Content-Type', documento.MIME_TYPE);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(documento.NOME_ARQUIVO)}"`);
    return res.send(documento.CONTEUDO);
  } catch (err) {
    return next(err);
  }
}

async function registrationStatus(req, res, next) {
  try {
    const u = await User.findById(req.user.id);

    if (!u) {
      return res.status(404).json({
        erro: 'Usuário não encontrado.'
      });
    }

    return res.status(200).json({
      status: u.STATUS_CADASTRO
    });

  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me, documentoAtual, registrationStatus };

