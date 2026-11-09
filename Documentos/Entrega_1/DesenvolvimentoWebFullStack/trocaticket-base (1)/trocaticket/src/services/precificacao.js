import { custoTotal, publicoEsperado as publicoMedioEvento } from "./calculos.js";
import {
  IMPOSTO_PADRAO,
  PUBLICO_PASSO,
  RISCO_BAIXO_MAX,
  RISCO_MEDIO_MAX,
  TAXA_PADRAO,
} from "./precificacaoConfig.js";

export function arredondarCentavos(valor) {
  return Math.round((Number(valor) + Number.EPSILON) * 100) / 100;
}

export function publicoEsperadoPadrao(evento) {
  const media = publicoMedioEvento(evento);
  return Math.round(media / PUBLICO_PASSO) * PUBLICO_PASSO;
}

export function precoBase(custo, publico, margem) {
  if (custo <= 0 || publico <= 0 || margem >= 1) return 0;
  return arredondarCentavos(custo / (publico * (1 - margem)));
}

export function componentesTicket(custo, publico, margem, taxa, imposto) {
  const base = precoBase(custo, publico, margem);
  const taxaValor = arredondarCentavos(base * taxa);
  const impostoValor = arredondarCentavos(base * imposto);
  return {
    base,
    taxaValor,
    impostoValor,
    final: arredondarCentavos(base + taxaValor + impostoValor),
  };
}

export function calcularPontosSensibilidade(data, scenarioId, precificacao) {
  const cenario = data.cenarios[scenarioId];
  if (!cenario) throw new RangeError(`Cenário de precificação inválido: ${scenarioId}`);

  return Array.from({ length: 71 }, (_, index) => {
    const ocupacao = 0.3 + index / 100;
    const publico = Math.round(ocupacao * data.capacidade);
    const ticket = componentesTicket(
      data.custo,
      publico,
      precificacao.margem,
      precificacao.taxaPlataforma,
      precificacao.impostos,
    );
    const receita = cenario.base * publico;

    return {
      occupancy: ocupacao,
      publicCount: publico,
      ticket: ticket.final,
      revenue: receita,
      profit: receita - data.custo,
    };
  });
}

export function calcularCenarioPrecificacao(evento, publico, precificacao = evento.precificacao) {
  const custo = custoTotal(evento);
  const margem = Number(precificacao.margem) || 0;
  const taxa = Number(precificacao.taxaPlataforma) || 0;
  const imposto = Number(precificacao.impostos) || 0;
  const ticket = componentesTicket(custo, publico, margem, taxa, imposto);
  const receitaBruta = margem < 1 ? custo / (1 - margem) : 0;
  return {
    publico,
    ...ticket,
    receitaBruta,
    lucroLiquido: receitaBruta - custo,
    breakEvenIngressos: Math.ceil(publico * (1 - margem)),
  };
}

export function calcularPrecificacao(evento, precificacao = evento.precificacao) {
  const custo = custoTotal(evento);
  const publicoMinimo = Number(evento.publico?.minimo) || 0;
  const publicoMaximo = Number(evento.publico?.maximo) || 0;
  const capacidade = Number(evento.capacidadeAlvara) || 0;
  const publicoEsperado = Number(precificacao.publicoEsperado)
    || publicoEsperadoPadrao(evento);
  const cenarios = {
    conservador: calcularCenarioPrecificacao(evento, publicoMinimo, precificacao),
    esperado: calcularCenarioPrecificacao(evento, publicoEsperado, precificacao),
    otimista: calcularCenarioPrecificacao(evento, publicoMaximo, precificacao),
  };
  const esperado = cenarios.esperado;
  const breakEvenPorIngressoMin = publicoMinimo > 0 ? custo / publicoMinimo : 0;
  const margemSeguranca = capacidade > 0 ? (capacidade - esperado.publico) / capacidade : 0;
  const ocupacaoBreakEven = capacidade > 0 ? esperado.breakEvenIngressos / capacidade : 0;
  const nivelRisco = ocupacaoBreakEven < RISCO_BAIXO_MAX
    ? "Baixo"
    : ocupacaoBreakEven <= RISCO_MEDIO_MAX
      ? "Médio"
      : "Alto";
  const taxasPercentual = (Number(precificacao.taxaPlataforma) || 0)
    + (Number(precificacao.impostos) || 0);

  return {
    custo,
    capacidade,
    publicoMinimo,
    publicoEsperado,
    publicoMaximo,
    cenarios,
    breakEvenPorIngressoMin,
    margemSeguranca,
    ocupacaoBreakEven,
    nivelRisco,
    taxasPercentual,
    faixaConsumidor: [cenarios.otimista.final, cenarios.conservador.final],
  };
}

export function configuracaoInicialPrecificacao(precificacao = {}) {
  return {
    margem: Number.isFinite(Number(precificacao.margem)) ? Number(precificacao.margem) : 0.2,
    taxaPlataforma: Number.isFinite(Number(precificacao.taxaPlataforma))
      ? Number(precificacao.taxaPlataforma)
      : TAXA_PADRAO,
    impostos: Number.isFinite(Number(precificacao.impostos))
      ? Number(precificacao.impostos)
      : IMPOSTO_PADRAO,
    publicoEsperado: precificacao.publicoEsperado ?? null,
    cenarioEscolhido: ["conservador", "esperado", "otimista"].includes(precificacao.cenarioEscolhido)
      ? precificacao.cenarioEscolhido
      : "esperado",
  };
}
