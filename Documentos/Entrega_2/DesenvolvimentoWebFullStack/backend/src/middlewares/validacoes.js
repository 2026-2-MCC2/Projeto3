const validarNovoEvento = (req, res, next) => {
  const { nome, local, publico_minimo, publico_maximo, periodo } = req.body;
  let erros = [];

  if (!nome || nome.trim() === '') {
    erros.push('O nome do evento é obrigatório.');
  }

  if (!local || local.trim() === '') {
    erros.push('O local do evento é obrigatório.');
  }

  if (!periodo) {
    erros.push('O período do evento é obrigatório.');
  }

  if (!publico_minimo || publico_minimo <= 0) {
    erros.push('O público mínimo deve ser um número maior que zero.');
  }

  if (!publico_maximo || publico_maximo <= 0) {
    erros.push('O público máximo deve ser um número maior que zero.');
  }

  if (publico_minimo > 0 && publico_maximo > 0 && Number(publico_maximo) < Number(publico_minimo)) {
    erros.push('O público máximo não pode ser menor que o público mínimo.');
  }

  if (erros.length > 0) {
    return res.status(400).json({
      sucesso: false,
      erro: 'Dados inválidos ao criar evento',
      detalhes: erros
    });
  }

  next();
};

const validarProposta = (req, res, next) => {
  const { valor, validade, descricao } = req.body;
  let erros = [];

  if (!valor || valor <= 0) {
    erros.push('O valor da proposta deve ser maior que zero.');
  }

  if (!validade) {
    erros.push('A data de validade da proposta é obrigatória.');
  }

  if (!descricao || descricao.trim() === '') {
    erros.push('A descrição da proposta é obrigatória.');
  }

  if (erros.length > 0) {
    return res.status(400).json({
      sucesso: false,
      erro: 'Dados inválidos na proposta',
      detalhes: erros
    });
  }

  next();
};

module.exports = {
  validarNovoEvento,
  validarProposta
};