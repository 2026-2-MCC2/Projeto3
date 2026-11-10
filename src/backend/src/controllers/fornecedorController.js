const pool = require('../config/db');

let tabelasProntas;
async function prepararTabela() {
  if (!tabelasProntas) {
    tabelasProntas = pool.query(`
      CREATE TABLE IF NOT EXISTS PROPOSTAS_EVENTO (
        ID_PROPOSTA INT PRIMARY KEY AUTO_INCREMENT,
        ID_EVENTO INT NOT NULL,
        ID_FORNECEDOR INT NOT NULL,
        ID_ITEM VARCHAR(120) NOT NULL,
        VALOR DOUBLE NOT NULL,
        DESCRICAO TEXT NULL,
        VALIDADE DATE NOT NULL,
        SITUACAO VARCHAR(30) NOT NULL DEFAULT 'ENVIADA',
        CRIADO_EM TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT FKPropostaEvento FOREIGN KEY (ID_EVENTO) REFERENCES EVENTOS (ID_EVENTO),
        CONSTRAINT FKPropostaFornecedor FOREIGN KEY (ID_FORNECEDOR) REFERENCES FORNECEDORES (ID_FORNECEDOR)
      )
    `);
  }
  await tabelasProntas;
}

async function fornecedorId(userId) {
  const [rows] = await pool.query('SELECT ID_FORNECEDOR FROM FORNECEDORES WHERE ID_USUARIO = ?', [userId]);
  return rows[0]?.ID_FORNECEDOR || null;
}

function json(value) {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return {}; }
}

async function oportunidades(req, res, next) {
  try {
    const idFornecedor = await fornecedorId(req.user.id);
    if (!idFornecedor) return res.status(403).json({ erro: 'A conta não possui um perfil de fornecedor.' });
    await prepararTabela();
    const [rows] = await pool.query(`
      SELECT ID_EVENTO, NOME, LOCALIZACAO, DATA_INICIO, DATA_FINAL, DADOS_JSON
      FROM EVENTOS
      WHERE STATUS IS NULL OR STATUS NOT IN ('concluido', 'cancelado', 'CONCLUIDO', 'CANCELADO')
      ORDER BY DATA_INICIO ASC
    `);
    const [propostas] = await pool.query('SELECT ID_EVENTO, ID_ITEM, SITUACAO FROM PROPOSTAS_EVENTO WHERE ID_FORNECEDOR = ?', [idFornecedor]);
    const enviadas = new Set(propostas.map((p) => `${p.ID_EVENTO}:${p.ID_ITEM}`));
    const itens = [];
    for (const row of rows) {
      const evento = json(row.DADOS_JSON);
      const custos = Array.isArray(evento.custos?.fornecedores) ? evento.custos.fornecedores : [];
      for (const item of custos) {
        const itemId = String(item.id || item.itemId || item.fornecedorId || `${row.ID_EVENTO}-item`);
        itens.push({
          id: `${row.ID_EVENTO}:${itemId}`,
          eventoId: String(row.ID_EVENTO),
          itemId,
          evento: evento.nome || row.NOME,
          nome: item.titulo || item.nome || 'Item para cotação',
          qtd: item.qtd || item.quantity || 'Conforme especificação',
          descricao: item.especificacao || item.descricao || '',
          local: evento.local?.nome || row.LOCALIZACAO,
          data: evento.dataInicio || row.DATA_INICIO,
          propostaEnviada: enviadas.has(`${row.ID_EVENTO}:${itemId}`),
        });
      }
    }
    return res.json(itens);
  } catch (err) { return next(err); }
}

async function listarPropostas(req, res, next) {
  try {
    const idFornecedor = await fornecedorId(req.user.id);
    if (!idFornecedor) return res.status(403).json({ erro: 'A conta não possui um perfil de fornecedor.' });
    await prepararTabela();
    const [rows] = await pool.query(`
      SELECT p.ID_PROPOSTA AS id, p.ID_EVENTO AS eventoId, p.ID_ITEM AS itemId,
             p.VALOR AS valor, p.DESCRICAO AS descricao, p.VALIDADE AS validade,
             p.SITUACAO AS situacao, e.NOME AS evento
      FROM PROPOSTAS_EVENTO p JOIN EVENTOS e ON e.ID_EVENTO = p.ID_EVENTO
      WHERE p.ID_FORNECEDOR = ? ORDER BY p.CRIADO_EM DESC
    `, [idFornecedor]);
    return res.json(rows);
  } catch (err) { return next(err); }
}

async function criarProposta(req, res, next) {
  try {
    const idFornecedor = await fornecedorId(req.user.id);
    if (!idFornecedor) return res.status(403).json({ erro: 'A conta não possui um perfil de fornecedor.' });
    const { eventoId, itemId, valor, descricao = '', validade } = req.body || {};
    if (!eventoId || !itemId || Number(valor) <= 0 || !validade) return res.status(400).json({ erro: 'Evento, item, valor e validade são obrigatórios.' });
    await prepararTabela();
    const [evento] = await pool.query('SELECT ID_EVENTO FROM EVENTOS WHERE ID_EVENTO = ?', [eventoId]);
    if (!evento.length) return res.status(404).json({ erro: 'Evento não encontrado.' });
    const [result] = await pool.query(`
      INSERT INTO PROPOSTAS_EVENTO (ID_EVENTO, ID_FORNECEDOR, ID_ITEM, VALOR, DESCRICAO, VALIDADE)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [eventoId, idFornecedor, String(itemId), Number(valor), descricao, validade]);
    return res.status(201).json({ id: result.insertId, eventoId: String(eventoId), itemId: String(itemId), valor: Number(valor), descricao, validade, situacao: 'ENVIADA' });
  } catch (err) { return next(err); }
}

module.exports = { oportunidades, listarPropostas, criarProposta };
