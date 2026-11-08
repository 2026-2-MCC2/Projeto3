const test = require('node:test');
const assert = require('node:assert/strict');
const pool = require('../config/db');
const { listEvents } = require('./adminController');

function createResponse() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test('lists persisted events with organizer identity for the admin panel', async () => {
  const originalQuery = pool.query;
  pool.query = async () => [[{
    ID_EVENTO: 18,
    NOME: 'Evento real',
    LOCALIZACAO: 'Centro de eventos',
    DATA_INICIO: '2026-09-10 18:00:00',
    DATA_FINAL: '2026-09-11 02:00:00',
    PUBLICO_MINIMO: 100,
    PUBLICO_MAXIMO: 500,
    MARGEM_LUCRO: 0.2,
    STATUS: 'planejamento',
    DADOS_JSON: JSON.stringify({ nome: 'Evento salvo', local: { cidade: 'São Paulo', uf: 'SP' } }),
    ORGANIZADOR: 'Organizador real',
  }]];

  try {
    const res = createResponse();
    await listEvents({}, res, (error) => {
      throw error;
    });

    assert.equal(res.body.length, 1);
    assert.equal(res.body[0].id, '18');
    assert.equal(res.body[0].nome, 'Evento salvo');
    assert.equal(res.body[0].organizador, 'Organizador real');
    assert.equal(res.body[0].publico.minimo, 100);
    assert.deepEqual(res.body[0].local, { cidade: 'São Paulo', uf: 'SP' });
  } finally {
    pool.query = originalQuery;
  }
});
