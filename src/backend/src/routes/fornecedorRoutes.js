const express = require('express');
const { auth, autorizar } = require('../middlewares/auth');
const { oportunidades, listarPropostas, criarProposta } = require('../controllers/fornecedorController');

const router = express.Router();
router.use(auth, autorizar('FORNECEDOR'));
router.get('/oportunidades', oportunidades);
router.get('/propostas', listarPropostas);
router.post('/propostas', criarProposta);
module.exports = router;
