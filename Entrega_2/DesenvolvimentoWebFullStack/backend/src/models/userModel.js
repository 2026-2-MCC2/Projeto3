const pool = require('../config/db');

async function findByEmail(email) {
  const [rows] = await pool.query(
    `SELECT ID_USUARIO, NOME, EMAIL, SENHA, PERFIL, MFA_SECRET, STATUS_CADASTRO,
            MOTIVO_REPROVACAO FROM USUARIOS WHERE EMAIL = ?`,
    [email]
  );
  return rows[0] || null;
}

async function findRegistrationStatusById(id) {
  const [rows] = await pool.query(
    `SELECT STATUS_CADASTRO, MOTIVO_REPROVACAO
       FROM USUARIOS
      WHERE ID_USUARIO = ?`,
    [id]
  );
  return rows[0] || null;
}

// Dados do usuário + id do organizador/fornecedor (quando existir)
async function findById(id) {
  const [rows] = await pool.query(
    `SELECT u.ID_USUARIO, u.NOME, u.EMAIL, u.PERFIL, u.STATUS_CADASTRO,
            u.MOTIVO_REPROVACAO,
            o.ID_ORGANIZADOR, f.ID_FORNECEDOR
       FROM USUARIOS u
       LEFT JOIN ORGANIZADORES o ON o.ID_USUARIO = u.ID_USUARIO
       LEFT JOIN FORNECEDORES f ON f.ID_USUARIO = u.ID_USUARIO
      WHERE u.ID_USUARIO = ?`,
    [id]
  );
  return rows[0] || null;
}

// Cria o usuário e, conforme o perfil, a linha em ORGANIZADORES ou FORNECEDORES.
// Tudo em transação: se algo falhar, nada é gravado.
async function create({ nome, email, senhaHash, perfil, organizador, fornecedor, documento }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [resUser] = await conn.query(
      `INSERT INTO USUARIOS
         (NOME, EMAIL, SENHA, PERFIL, STATUS_CADASTRO, CHECKLIST_JSON)
       VALUES (?, ?, ?, ?, 'PENDENTE', ?)`,
      [nome, email, senhaHash, perfil, JSON.stringify(checklistInicial())]
    );
    const idUsuario = resUser.insertId;

    if (perfil === 'ORGANIZADOR') {
      await conn.query(
        'INSERT INTO ORGANIZADORES (ID_USUARIO, CNPJ, TELEFONE) VALUES (?, ?, ?)',
        [idUsuario, organizador.cnpj, organizador.telefone]
      );
    } else if (perfil === 'FORNECEDOR') {
      await conn.query(
        'INSERT INTO FORNECEDORES (ID_USUARIO, CNPJ, CATEGORIA, DESCRICAO) VALUES (?, ?, ?, ?)',
        [idUsuario, fornecedor.cnpj, fornecedor.categoria || null, fornecedor.descricao || null]
      );
    }

    function checklistInicial() {
      return [
        { id: 'receita', titulo: 'Consulta Receita Federal', descricao: 'CNPJ ativo e situação cadastral regular.', status: 'pendente' },
        { id: 'cnd', titulo: 'Certidão Negativa de Débitos (CND)', descricao: 'Certidões fiscais e trabalhistas válidas.', status: 'pendente' },
        { id: 'contrato', titulo: 'Contrato Social e Última Alteração', descricao: 'Conferência dos documentos societários.', status: 'pendente' },
        { id: 'endereco', titulo: 'Comprovante de Endereço Operacional', descricao: 'Comprovante recente do endereço informado.', status: 'pendente' },
      ];
    }

    if (documento) {
      await conn.query(
        'INSERT INTO DOCUMENTOS (ID_USUARIO, NOME_ARQUIVO, MIME_TYPE, CONTEUDO) VALUES (?, ?, ?, ?)',
        [idUsuario, documento.nome, documento.tipo, Buffer.from(documento.conteudo, 'base64')]
      );
    }

    await conn.commit();
    return idUsuario;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function findDocumentByUserId(id) {
  const [rows] = await pool.query(
    'SELECT NOME_ARQUIVO, MIME_TYPE, CONTEUDO FROM DOCUMENTOS WHERE ID_USUARIO = ? ORDER BY ID_DOCUMENTO DESC LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

module.exports = { findByEmail, findRegistrationStatusById, findById, create, findDocumentByUserId };
