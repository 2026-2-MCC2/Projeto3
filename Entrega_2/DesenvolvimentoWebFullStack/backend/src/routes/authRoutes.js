const express = require('express');

const {
  register,
  login,
  me,
  documentoAtual,
  registrationStatus
} = require('../controllers/authController');

const { auth } = require('../middlewares/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/registration-status', auth, registrationStatus);
router.get('/me', auth, me);
router.get('/me/documento', auth, documentoAtual);

module.exports = router;