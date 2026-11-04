const jwt = require('jsonwebtoken');

// Valida o token JWT e coloca o payload em req.user
function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token não informado.' });
  }

  const token = header.split(' ')[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

// Uso: router.post('/', auth, autorizar('ORGANIZADOR'), handler)
function autorizar(...perfis) {
  return (req, res, next) => {
    if (!req.user || !perfis.includes(req.user.perfil)) {
      return res.status(403).json({ erro: 'Acesso negado para este perfil.' });
    }
    next();
  };
}

module.exports = { auth, autorizar };
