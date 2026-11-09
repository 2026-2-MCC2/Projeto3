
require('dotenv').config();

const bcrypt = require('bcrypt');
const pool = require('./src/config/db');

async function criarAdmin() {
  try {
    const nome = 'Administrador TROCATICKET';
    const email = 'admin@trocaticket.com';
    const senha = 'Admin@123456';

    // Verifica se já existe
    const [usuarios] = await pool.query(
      'SELECT ID_USUARIO FROM USUARIOS WHERE EMAIL = ?',
      [email]
    );

    if (usuarios.length > 0) {
      console.log('Este administrador já existe.');
      return;
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const [result] = await pool.query(
      `INSERT INTO USUARIOS
       (NOME, EMAIL, SENHA, PERFIL, STATUS_CADASTRO)
       VALUES (?, ?, ?, 'ADMIN', 'APROVADO')`,
      [nome, email, senhaHash]
    );

    console.log('Administrador criado com sucesso!');
    console.log('ID:', result.insertId);
    console.log('E-mail:', email);
    console.log('Senha:', senha);

  } catch (error) {
    console.error('Erro ao criar administrador:', error);
  } finally {
    await pool.end();
  }
}

criarAdmin();
