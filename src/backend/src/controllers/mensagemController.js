const pool = require('../config/db');

let tabela;
async function prepararTabela() {
  if (!tabela) tabela = pool.query(`
    CREATE TABLE IF NOT EXISTS MENSAGENS (
      ID_MENSAGEM INT PRIMARY KEY AUTO_INCREMENT,
      ID_REMETENTE INT NOT NULL,
      ID_DESTINATARIO INT NULL,
      ID_EVENTO INT NULL,
      TEXTO TEXT NOT NULL,
      CRIADO_EM TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT FKMensagemRemetente FOREIGN KEY (ID_REMETENTE) REFERENCES USUARIOS (ID_USUARIO),
      CONSTRAINT FKMensagemDestinatario FOREIGN KEY (ID_DESTINATARIO) REFERENCES USUARIOS (ID_USUARIO)
    )
  `);
  await tabela;
}

async function listar(req, res, next) {
  try {
    await prepararTabela();
    const [rows] = await pool.query(`
      SELECT ID_MENSAGEM AS id, ID_REMETENTE AS remetenteId, ID_DESTINATARIO AS destinatarioId,
             ID_EVENTO AS eventoId, TEXTO AS texto, CRIADO_EM AS criadoEm
      FROM MENSAGENS WHERE ID_REMETENTE = ? OR ID_DESTINATARIO = ? ORDER BY CRIADO_EM ASC
    `, [req.user.id, req.user.id]);
    return res.json(rows);
  } catch (err) { return next(err); }
}

async function enviar(req, res, next) {
  try {
    const { destinatarioId = null, eventoId = null, texto } = req.body || {};
    if (!String(texto || '').trim()) return res.status(400).json({ erro: 'A mensagem não pode estar vazia.' });
    await prepararTabela();
    const [result] = await pool.query(
      'INSERT INTO MENSAGENS (ID_REMETENTE, ID_DESTINATARIO, ID_EVENTO, TEXTO) VALUES (?, ?, ?, ?)',
      [req.user.id, destinatarioId || null, eventoId || null, String(texto).trim()]
    );
    return res.status(201).json({ id: result.insertId, remetenteId: req.user.id, destinatarioId, eventoId, texto: String(texto).trim() });
  } catch (err) { return next(err); }
}

module.exports = { listar, enviar };
