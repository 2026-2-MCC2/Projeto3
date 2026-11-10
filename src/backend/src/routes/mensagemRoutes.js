const express = require('express');
const { auth } = require('../middlewares/auth');
const { listar, enviar } = require('../controllers/mensagemController');

const router = express.Router();
router.use(auth);
router.get('/', listar);
router.post('/', enviar);
module.exports = router;
