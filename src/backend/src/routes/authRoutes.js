const express = require('express');
const { register, login, me, updateMe, documentoAtual, registrationStatus } = require('../controllers/authController');
const { auth } = require('../middlewares/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/registration-status', registrationStatus);
router.get('/me', auth, me); // rota protegida
router.put('/me', auth, updateMe);
router.get('/me/documento', auth, documentoAtual);

module.exports = router;
