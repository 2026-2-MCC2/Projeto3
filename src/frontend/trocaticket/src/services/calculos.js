import { categorias, obterCategoria } from "./categorias.js";

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

export function custoProducao(evento) {
  return subtotalProducao(evento);
}

export function custoFiscal(evento) {
  return subtotalFiscal(evento);
}

export function breakEvenPorIngresso(evento) {
  return evento.publico.minimo > 0 ? custoTotal(evento) / evento.publico.minimo : 0;
}

export function precoPraticado(evento) {
  const publicoMinimo = Number(evento.publico?.minimo) || 0;
  const margem = Number(evento.precificacao?.margem) || 0;
  if (publicoMinimo <= 0 || margem >= 1) return 0;
  return Math.round((custoTotal(evento) / (publicoMinimo * (1 - margem)) + Number.EPSILON) * 100) / 100;
}

export function breakEvenIngressos(evento) {
  const preco = precoPraticado(evento);
  return preco > 0 ? Math.ceil(custoTotal(evento) / preco) : 0;
}

export function lucroMaximo(evento) {
  const publico = Number(evento.capacidadeAlvara) || 0;
  return precoPraticado(evento) * publico - custoTotal(evento);
}

export function valorPorCategoria(evento) {
  const totais = new Map(categorias.map(({ id }) => [id, 0]));
  const itens = [
    ...(evento.custos?.fornecedores ?? []),
    ...(Array.isArray(evento.custos?.fiscais) ? evento.custos.fiscais : []),
  ];
  for (const item of itens) {
    const categoria = obterCategoria(item.categoriaId);
    totais.set(categoria.id, (totais.get(categoria.id) ?? 0) + (Number(item.valor) || 0));
  }
  return categorias
    .map((categoria) => ({ ...categoria, valor: totais.get(categoria.id) ?? 0 }))
    .filter((categoria) => categoria.valor > 0);
}

export function percentuaisPorCategoria(evento) {
  return distribuirPercentuais(valorPorCategoria(evento));
}

export function distribuirPercentuais(itens) {
  const total = itens.reduce((soma, item) => soma + item.valor, 0);
  if (!total) return itens.map((item) => ({ ...item, percentual: 0 }));
  const exatos = itens.map((item) => (item.valor / total) * 1000);
  const arredondados = exatos.map(Math.floor);
  const faltantes = 1000 - arredondados.reduce((soma, valor) => soma + valor, 0);
  const ordem = exatos
    .map((valor, indice) => ({ indice, resto: valor - Math.floor(valor) }))
    .sort((a, b) => b.resto - a.resto || a.indice - b.indice);
  for (let indice = 0; indice < faltantes; indice += 1) {
    arredondados[ordem[indice].indice] += 1;
  }
  return itens.map((item, indice) => ({ ...item, percentual: arredondados[indice] / 10 }));
}

export function percentualPorTipo(evento) {
  const totais = { infraestrutura: 0, encargos_operacao: 0 };
  for (const item of [
    ...(evento.custos?.fornecedores ?? []),
    ...(Array.isArray(evento.custos?.fiscais) ? evento.custos.fiscais : []),
  ]) {
    const tipo = obterCategoria(item.categoriaId).tipoCusto;
    totais[tipo] += Number(item.valor) || 0;
  }
  const percentuais = distribuirPercentuais([
    { id: "infraestrutura", valor: totais.infraestrutura },
    { id: "encargos_operacao", valor: totais.encargos_operacao },
  ]);
  return Object.fromEntries(percentuais.map((item) => [item.id, item.percentual]));
}

export function validacaoTecnica(evento) {
  const minimo = Number(evento.publico?.minimo) || 0;
  const maximo = Number(evento.publico?.maximo) || 0;
  const capacidade = Number(evento.capacidadeAlvara) || 0;
  return minimo > 0 && minimo < maximo && maximo <= capacidade;
}

export function contratosConcluidos(evento) {
  return propostasAceitas(evento);
}

export function totalContratado(evento) {
  return contratosConcluidos(evento).reduce((total, proposta) => total + (Number(proposta.valor) || 0), 0);
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
  const totalAceito = propostasAceitas(evento).reduce((total, proposta) => total + proposta.valor, 0);
  const total = custoTotal(evento);
  return total === 0 ? 0 : Math.round((totalAceito / total) * 100);
}

export function propostaExpirada(proposta, hoje = new Date()) {
  const validade = proposta.validade?.slice(0, 10);
  if (!validade) return false;
  const dataHoje = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
  return validade < dataHoje;
}

export function propostaAtiva(proposta, hoje = new Date()) {
  return proposta.status !== "recusada" && !propostaExpirada(proposta, hoje);
}

export function propostasAtivas(evento) {
  return (evento.propostas ?? []).filter((proposta) => propostaAtiva(proposta));
}

export function propostasAceitas(evento) {
  return (evento.propostas ?? []).filter((proposta) => proposta.status === "confirmada");
}

export function contagemPropostasPorCategoria(evento) {
  const itens = new Map((evento.custos?.fornecedores ?? []).map((item) => [item.id, item.categoriaId]));
  return propostasAtivas(evento).reduce((contagens, proposta) => {
    const categoriaId = itens.get(proposta.itemCustoId);
    if (categoriaId) contagens[categoriaId] = (contagens[categoriaId] ?? 0) + 1;
    return contagens;
  }, {});
}

export function itensPendentes(evento) {
  const confirmados = new Set(propostasAceitas(evento).map((proposta) => proposta.itemCustoId));
  return (evento.custos?.fornecedores ?? []).filter(
    (item) => item.alocacao === "cotacao" && !confirmados.has(item.id),
  );
}

export function menorPropostaAtiva(evento) {
  const valores = propostasAtivas(evento).map((proposta) => Number(proposta.valor) || 0);
  return valores.length ? Math.min(...valores) : 0;
}

export function mediaPropostas(evento) {
  const propostas = propostasAtivas(evento);
  return propostas.length
    ? propostas.reduce((total, proposta) => total + Number(proposta.valor || 0), 0) / propostas.length
    : 0;
}

export function valorEscolhido(evento, item) {
  const propostas = propostasAtivas(evento).filter((proposta) => proposta.itemCustoId === item.id);
  return propostas.find((proposta) => proposta.status === "confirmada")
    ?? propostas.find((proposta) => proposta.status === "selecionada")
    ?? propostas.reduce((menor, proposta) => !menor || proposta.valor < menor.valor ? proposta : menor, null);
}

export function economiaTotalProjetada(evento) {
  return (evento.custos?.fornecedores ?? [])
    .filter((item) => item.alocacao === "cotacao")
    .reduce((total, item) => {
      const proposta = valorEscolhido(evento, item);
      return total + (proposta ? Number(item.valor || 0) - Number(proposta.valor || 0) : 0);
    }, 0);
}

export function diferencaVsOrcado(proposta, item) {
  return item?.valor > 0 ? (Number(proposta.valor) - item.valor) / item.valor : 0;
}

export function tetoOrcamento(evento) {
  return Number(evento.tetoOrcamento) || custoTotal(evento);
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
