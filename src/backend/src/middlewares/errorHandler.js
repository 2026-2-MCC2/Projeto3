function notFound(req, res) {
  res.status(404).json({ erro: 'Rota não encontrada.' });
}

function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
}

module.exports = { notFound, errorHandler };
