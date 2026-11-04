const responderSucesso = (res, dados, mensagem = 'Operação realizada com sucesso', status = 200) => {
  return res.status(status).json({
    sucesso: true,
    mensagem: mensagem,
    dados: dados
  });
};

module.exports = {
  responderSucesso
};