require('dotenv').config();

const bcrypt = require('bcrypt');
const pool = require('../src/config/db');

const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const password = String(process.env.ADMIN_PASSWORD || '');
const mfaSecret = String(process.env.ADMIN_MFA_SECRET || '').trim().replace(/\s+/g, '').toUpperCase();

if (!email || !password || !mfaSecret) {
  throw new Error('Defina ADMIN_EMAIL, ADMIN_PASSWORD e ADMIN_MFA_SECRET no ambiente.');
}

if (password.length < 6) {
  throw new Error('ADMIN_PASSWORD deve ter pelo menos 6 caracteres.');
}

if (!/^([A-Z2-7]{16,})$/.test(mfaSecret)) {
  throw new Error('ADMIN_MFA_SECRET deve ser um segredo TOTP Base32 com pelo menos 16 caracteres.');
}

async function seedAdmin() {
  const passwordHash = await bcrypt.hash(password, 10);
  const conn = await pool.getConnection();
  try {
    await conn.query(
      `INSERT INTO USUARIOS (NOME, EMAIL, SENHA, PERFIL, STATUS_CADASTRO, APROVADO_EM, MFA_SECRET)
       VALUES (?, ?, ?, 'ADMIN', 'APROVADO', NOW(), ?)
       ON DUPLICATE KEY UPDATE
         NOME = VALUES(NOME), SENHA = VALUES(SENHA), PERFIL = 'ADMIN',
         STATUS_CADASTRO = 'APROVADO', MOTIVO_REPROVACAO = NULL,
         APROVADO_EM = NOW(), MFA_SECRET = VALUES(MFA_SECRET)`,
      ['Administrador TrocaTicket', email, passwordHash, mfaSecret]
    );
    console.log(`Administrador provisionado: ${email}`);
  } finally {
    conn.release();
    await pool.end();
  }
}

seedAdmin().catch(async (error) => {
  console.error(error.message);
  await pool.end();
  process.exitCode = 1;
});
