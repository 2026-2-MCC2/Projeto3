const pool = require('../config/db');

async function findByEmail(email) {
  const [rows] = await pool.query(
    'SELECT ID_USUARIO, NOME, EMAIL, SENHA, PERFIL FROM USUARIOS WHERE EMAIL = ?',
    [email]
  );
  return rows[0] || null;
}

// Dados do usuário + id do organizador/fornecedor (quando existir)
async function findById(id) {
  const [rows] = await pool.query(
    `SELECT u.ID_USUARIO, u.NOME, u.EMAIL, u.PERFIL,
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
async function create({ nome, email, senhaHash, perfil, organizador, fornecedor }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [resUser] = await conn.query(
      'INSERT INTO USUARIOS (NOME, EMAIL, SENHA, PERFIL) VALUES (?, ?, ?, ?)',
      [nome, email, senhaHash, perfil]
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

    await conn.commit();
    return idUsuario;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { findByEmail, findById, create };
