require('dotenv').config();

const bcrypt = require('bcrypt');

if (process.env.MYSQL_PUBLIC_URL) {
  const databaseUrl = new URL(process.env.MYSQL_PUBLIC_URL);
  process.env.DB_HOST = databaseUrl.hostname;
  process.env.DB_PORT = databaseUrl.port || '3306';
  process.env.DB_USER = decodeURIComponent(databaseUrl.username);
  process.env.DB_PASSWORD = decodeURIComponent(databaseUrl.password);
  process.env.DB_NAME = databaseUrl.pathname.replace(/^\//, '');
}

const pool = require('../src/config/db');

const users = [
  {
    nome: 'Organizador Demo',
    email: 'organizador.demo@trocaticket.com',
    senha: process.env.DEMO_ORGANIZADOR_PASSWORD,
    perfil: 'ORGANIZADOR',
    cnpj: '11222333000181',
    telefone: '11999990000',
  },
  {
    nome: 'Fornecedor Demo',
    email: 'fornecedor.demo@trocaticket.com',
    senha: process.env.DEMO_FORNECEDOR_PASSWORD,
    perfil: 'FORNECEDOR',
    cnpj: '44555666000102',
    categoria: 'Serviços para eventos',
    descricao: 'Conta de demonstração do fornecedor',
  },
];

async function seedUser(user) {
  if (!user.senha || user.senha.length < 6) {
    throw new Error(`Senha ausente ou inválida para ${user.email}`);
  }

  const senhaHash = await bcrypt.hash(user.senha, 10);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      `INSERT INTO USUARIOS (NOME, EMAIL, SENHA, PERFIL, STATUS_CADASTRO, APROVADO_EM)
       VALUES (?, ?, ?, ?, 'APROVADO', NOW())
       ON DUPLICATE KEY UPDATE
         NOME = VALUES(NOME), SENHA = VALUES(SENHA), PERFIL = VALUES(PERFIL),
         STATUS_CADASTRO = 'APROVADO', MOTIVO_REPROVACAO = NULL, APROVADO_EM = NOW()`,
      [user.nome, user.email, senhaHash, user.perfil]
    );

    const [[savedUser]] = await conn.query('SELECT ID_USUARIO FROM USUARIOS WHERE EMAIL = ?', [user.email]);
    if (user.perfil === 'ORGANIZADOR') {
      await conn.query(
        `INSERT INTO ORGANIZADORES (ID_USUARIO, CNPJ, TELEFONE) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE ID_USUARIO = VALUES(ID_USUARIO), TELEFONE = VALUES(TELEFONE)`,
        [savedUser.ID_USUARIO, user.cnpj, user.telefone]
      );
    } else {
      await conn.query(
        `INSERT INTO FORNECEDORES (ID_USUARIO, CNPJ, CATEGORIA, DESCRICAO) VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE ID_USUARIO = VALUES(ID_USUARIO), CATEGORIA = VALUES(CATEGORIA), DESCRICAO = VALUES(DESCRICAO)`,
        [savedUser.ID_USUARIO, user.cnpj, user.categoria, user.descricao]
      );
    }
    await conn.commit();
    console.log(`Usuário demo configurado: ${user.email}`);
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

Promise.all(users.map(seedUser))
  .then(() => pool.end())
  .catch(async (error) => {
    console.error(error.message);
    await pool.end();
    process.exitCode = 1;
  });
