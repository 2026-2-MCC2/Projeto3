require('dotenv').config();

const bcrypt = require('bcrypt');
const pool = require('./src/config/db');

async function redefinirSenha() {
  try {
    const email = 'ana@email.com';

    // Nova senha temporária
    const novaSenha = 'TrocaTicket@2026';

    const senhaHash = await bcrypt.hash(novaSenha, 10);

    const [result] = await pool.query(
      `UPDATE USUARIOS
       SET SENHA = ?
       WHERE EMAIL = ? AND PERFIL = 'ORGANIZADOR'`,
      [senhaHash, email]
    );

    if (result.affectedRows === 0) {
      console.log('Organizador não encontrado.');
    } else {
      console.log('Senha redefinida com sucesso!');
      console.log('Nova senha:', novaSenha);
    }

  } catch (error) {
    console.error(error);
  } finally {
    await pool.end();
  }
}

redefinirSenha();