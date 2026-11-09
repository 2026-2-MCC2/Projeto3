const pool = require('../config/db');

const json = (value) => (typeof value === 'string' ? JSON.parse(value) : value);
const sqlDate = (value) => (value ? String(value).replace('T', ' ').slice(0, 19) : null);

async function organizerId(userId) {
  const [rows] = await pool.query(
    'SELECT ID_ORGANIZADOR FROM ORGANIZADORES WHERE ID_USUARIO = ?',
    [userId]
  );
  return rows[0]?.ID_ORGANIZADOR || null;
}

function eventFromRow(row) {
  const event = json(row.DADOS_JSON) || {
    nome: row.NOME,
    categoria: "",
    descricao: "",
    capa: "",
    dataInicio: row.DATA_INICIO,
    dataFim: row.DATA_FINAL,
    local: { nome: row.LOCALIZACAO, cidade: "", uf: "" },
    capacidadeAlvara: row.PUBLICO_MAXIMO,
    publico: { minimo: row.PUBLICO_MINIMO, maximo: row.PUBLICO_MAXIMO },
    precificacao: {
      margem: Number(row.MARGEM_LUCRO) || 0,
      taxaPlataforma: 0.08,
      impostos: 0.05,
      publicoEsperado: null,
      cenarioEscolhido: 'esperado',
    },
    custos: { fornecedores: [], fiscais: [], propostasAceitas: [] },
    propostas: [],
    status: row.STATUS || 'planejamento',
    etapaAtual: 'cadastro',
  };
  return { ...event, id: String(row.ID_EVENTO) };
}

async function list(req, res, next) {
  try {
    const id = await organizerId(req.user.id);
    if (!id) return res.status(403).json({ erro: 'A conta não possui um perfil de organizador.' });
    const [rows] = await pool.query(
      `SELECT ID_EVENTO, NOME, LOCALIZACAO, DATA_INICIO, DATA_FINAL,
              PUBLICO_MINIMO, PUBLICO_MAXIMO, MARGEM_LUCRO, STATUS, DADOS_JSON
         FROM EVENTOS WHERE ID_ORGANIZADOR = ? ORDER BY ID_EVENTO DESC`,
      [id]
    );
    return res.json(rows.map(eventFromRow));
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const id = await organizerId(req.user.id);
    if (!id) return res.status(403).json({ erro: 'A conta não possui um perfil de organizador.' });
    const event = req.body;
    if (!event || typeof event !== 'object' || Array.isArray(event)) {
      return res.status(400).json({ erro: 'Os dados do evento são obrigatórios.' });
    }

    const local = event.local || {};
    const publico = event.publico || {};
    const values = [
      id,
      (event.nome || 'Rascunho sem título').slice(0, 100),
      (local.nome || [local.cidade, local.uf].filter(Boolean).join(', ') || 'Não informado').slice(0, 50),
      sqlDate(event.dataInicio) || new Date().toISOString().slice(0, 19).replace('T', ' '),
      sqlDate(event.dataFim) || new Date(Date.now() + 86400000).toISOString().slice(0, 19).replace('T', ' '),
      Math.max(1, Number(publico.minimo) || 1),
      Math.max(1, Number(publico.maximo) || Number(publico.minimo) || 1),
      Number(event.precificacao?.margem) || 0,
      event.status || 'rascunho',
      JSON.stringify(event),
    ];
    const [result] = await pool.query(
      `INSERT INTO EVENTOS
         (ID_ORGANIZADOR, NOME, LOCALIZACAO, DATA_INICIO, DATA_FINAL,
          PUBLICO_MINIMO, PUBLICO_MAXIMO, MARGEM_LUCRO, STATUS, DADOS_JSON)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      values
    );
    return res.status(201).json({ ...event, id: String(result.insertId) });
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const id = await organizerId(req.user.id);
    if (!id) return res.status(403).json({ erro: 'A conta não possui um perfil de organizador.' });
    const event = req.body;
    if (!event || typeof event !== 'object' || Array.isArray(event)) {
      return res.status(400).json({ erro: 'Os dados do evento são obrigatórios.' });
    }
    const local = event.local || {};
    const publico = event.publico || {};
    const [result] = await pool.query(
      `UPDATE EVENTOS
          SET NOME = ?, LOCALIZACAO = ?, DATA_INICIO = ?, DATA_FINAL = ?,
              PUBLICO_MINIMO = ?, PUBLICO_MAXIMO = ?, MARGEM_LUCRO = ?,
              STATUS = ?, DADOS_JSON = ?
        WHERE ID_EVENTO = ? AND ID_ORGANIZADOR = ?`,
      [
        (event.nome || 'Rascunho sem título').slice(0, 100),
        (local.nome || [local.cidade, local.uf].filter(Boolean).join(', ') || 'Não informado').slice(0, 50),
        sqlDate(event.dataInicio) || new Date().toISOString().slice(0, 19).replace('T', ' '),
        sqlDate(event.dataFim) || new Date(Date.now() + 86400000).toISOString().slice(0, 19).replace('T', ' '),
        Math.max(1, Number(publico.minimo) || 1),
        Math.max(1, Number(publico.maximo) || Number(publico.minimo) || 1),
        Number(event.precificacao?.margem) || 0,
        event.status || 'rascunho',
        JSON.stringify(event),
        req.params.id,
        id,
      ]
    );
    if (!result.affectedRows) {
      const [rows] = await pool.query(
        'SELECT ID_EVENTO FROM EVENTOS WHERE ID_EVENTO = ? AND ID_ORGANIZADOR = ?',
        [req.params.id, id]
      );
      if (!rows.length) return res.status(404).json({ erro: 'Evento não encontrado.' });
    }
    return res.json({ ...event, id: req.params.id });
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, create, update };
