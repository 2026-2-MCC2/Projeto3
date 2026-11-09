require('dotenv').config();

const mysql = require('mysql2/promise');

async function testarConexao() {
  console.log('HOST:', process.env.DB_HOST);
  console.log('USER:', process.env.DB_USER);
  console.log('PASSWORD:', !!process.env.DB_PASSWORD);
  console.log('DATABASE:', process.env.DB_NAME);

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('MYSQL CONECTADO COM SUCESSO!');

    const [rows] = await connection.query(
      'SELECT CURRENT_USER() AS usuario'
    );

    console.log('Usuário:', rows[0].usuario);

    await connection.end();

  } catch (error) {
    console.log('ERRO:', error.code);
    console.log('MENSAGEM:', error.message);
  }
}

testarConexao();