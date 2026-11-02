export function custoTotal(evento) {
  return evento.custos.fornecedores.reduce(
    (total, fornecedor) => total + fornecedor.valor,
    evento.custos.fiscais,
  );
}

export function eventosAtivos(eventos) {
  return eventos.filter((evento) => evento.status !== "publicado" && evento.status !== "encerrado");
}

export function propostasEmAnalise(evento) {
  return evento.propostas.filter((proposta) => proposta.status === "em_analise").length;
}

export function totalPropostasEmAnalise(eventos) {
  return eventos.reduce((total, evento) => total + propostasEmAnalise(evento), 0);
}

export function margemMediaProjetada(eventos) {
  if (eventos.length === 0) return 0;
  return eventos.reduce((total, evento) => total + evento.precificacao.margem, 0) / eventos.length;
}

export function orcamentoConsolidado(eventos) {
  return eventos.reduce((total, evento) => total + custoTotal(evento), 0);
}

export function percentualOrcamentoAlocado(evento) {
  const totalAceito = evento.custos.propostasAceitas.reduce(
    (total, proposta) => total + proposta.valor,
    0,
  );
  const total = custoTotal(evento);
  return total === 0 ? 0 : Math.round((totalAceito / total) * 100);
}

export function publicoEsperado(evento) {
  return (evento.publico.minimo + evento.publico.maximo) / 2;
}

export function duracaoEmDias(evento) {
  if (!evento.dataInicio || !evento.dataFim) return 0;
  const inicio = new Date(`${evento.dataInicio.slice(0, 10)}T00:00:00`);
  const fim = new Date(`${evento.dataFim.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime()) || fim < inicio) return 0;
  return Math.round((fim - inicio) / 86400000) + 1;
}

export function ocupacaoMinima(evento) {
  const capacidade = evento.capacidadeAlvara;
  return capacidade > 0 ? evento.publico.minimo / capacidade : 0;
}

export function ingressoSugerido(evento) {
  const publico = publicoEsperado(evento);
  const margem = evento.precificacao.margem;
  if (publico <= 0 || margem >= 1) return 0;
  return custoTotal(evento) / (publico * (1 - margem));
}
