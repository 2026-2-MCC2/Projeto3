const express = require('express');
const { register, login, me, documentoAtual } = require('../controllers/authController');
const { auth } = require('../middlewares/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, me); // rota protegida
router.get('/me/documento', auth, documentoAtual);

module.exports = router;
