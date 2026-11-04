const express = require('express');
const router = express.Router();
const { responderSucesso } = require('../utils/response');

// Rota simulada para integração de Trocas (Extensão)
router.get('/status', (req, res) => {
  responderSucesso(res, {
    modulo: 'Trocas e Revenda de Ingressos',
    status: 'Em desenvolvimento (Extensão do MVP)',
    integrado: false
  }, 'Endpoint de extensão de TrocaTicket configurado');
});

module.exports = router;