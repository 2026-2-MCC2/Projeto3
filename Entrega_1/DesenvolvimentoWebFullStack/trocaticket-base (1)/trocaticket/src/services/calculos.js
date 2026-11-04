export const gruposCusto = [
  { id: "som", nome: "Som & Iluminação", cor: "#3B9EF5" },
  { id: "palco", nome: "Palco & Estrutura", cor: "#F0524F" },
  { id: "fiscais", nome: "Custos Fiscais & ECAD", cor: "#F58A2E" },
  { id: "seguranca", nome: "Segurança & Operação", cor: "#5B5BE0" },
  { id: "variaveis", nome: "Variáveis & Contingência", cor: "#4F7CF2" },
];

export function subtotalProducao(evento) {
  return evento.custos.fornecedores.reduce(
    (total, item) => total + (Number(item.valor) || 0),
    0,
  );
}

export function subtotalFiscal(evento) {
  const fiscais = evento.custos.fiscais;
  if (Array.isArray(fiscais)) {
    return fiscais.reduce((total, item) => total + (Number(item.valor) || 0), 0);
  }
  return Number(fiscais) || 0;
}

export function custoTotal(evento) {
  return subtotalProducao(evento) + subtotalFiscal(evento);
}

export function custoPorPaxLotacao(evento) {
  return evento.capacidadeAlvara > 0 ? custoTotal(evento) / evento.capacidadeAlvara : 0;
}

export function pontoEquilibrio(evento) {
  return evento.publico.minimo > 0 ? custoTotal(evento) / evento.publico.minimo : 0;
}

export function valorGrupo(evento, grupoId) {
  const producao = evento.custos.fornecedores
    .filter((item) => item.grupoGrafico === grupoId)
    .reduce((total, item) => total + (Number(item.valor) || 0), 0);
  const fiscais = Array.isArray(evento.custos.fiscais)
    ? evento.custos.fiscais
        .filter((item) => item.grupoGrafico === grupoId)
        .reduce((total, item) => total + (Number(item.valor) || 0), 0)
    : 0;
  return producao + fiscais;
}

export function percentuaisGrupo(evento) {
  const total = custoTotal(evento);
  const valores = gruposCusto.map((grupo) => valorGrupo(evento, grupo.id));
  const naoAlocado = Math.max(0, total - valores.reduce((soma, valor) => soma + valor, 0));
  const valoresComNaoAlocado = [...valores, naoAlocado];
  if (total <= 0) return { grupos: Object.fromEntries(gruposCusto.map(({ id }) => [id, 0])), naoAlocado: 0 };

  const percentuaisExatos = valoresComNaoAlocado.map((valor) => (valor / total) * 100);
  const percentuais = percentuaisExatos.map(Math.floor);
  const pontosRestantes = 100 - percentuais.reduce((soma, valor) => soma + valor, 0);
  const ordem = percentuaisExatos
    .map((valor, indice) => ({ indice, resto: valor - Math.floor(valor) }))
    .sort((a, b) => b.resto - a.resto);
  for (let indice = 0; indice < pontosRestantes; indice += 1) {
    percentuais[ordem[indice].indice] += 1;
  }
  return {
    grupos: Object.fromEntries(gruposCusto.map(({ id }, indice) => [id, percentuais[indice]])),
    naoAlocado: percentuais.at(-1),
  };
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
