/* Cálculos puros usados pelas telas de cotações, eventos e dashboard. */

/** Proposta de menor valor de uma cotação (ou undefined se ainda não há propostas). */
export function melhorProposta(cotacao) {
  return [...cotacao.propostas].sort((a, b) => a.valor - b.valor)[0];
}

/** Economia = (média das propostas − menor proposta) / média. */
export function economia(cotacao) {
  if (cotacao.propostas.length === 0) return { pct: 0, valor: 0 };
  const media = cotacao.propostas.reduce((s, x) => s + x.valor, 0) / cotacao.propostas.length;
  const min = Math.min(...cotacao.propostas.map((x) => x.valor));
  return { pct: media === 0 ? 0 : ((media - min) / media) * 100, valor: media - min };
}

/** Texto do prazo de uma cotação em relação a uma data de referência ("hoje"). */
export function prazoLabel(cotacao, hoje, formatarData) {
  if (cotacao.situacao === "Encerrada") return `Concluída em ${formatarData(cotacao.prazo)}`;
  const dias = Math.round((new Date(`${cotacao.prazo}T12:00:00`).getTime() - hoje.getTime()) / 86400000);
  if (dias < 0) return dias === -1 ? "Venceu ontem" : `Venceu há ${-dias} dias`;
  if (dias === 0) return "Vence hoje";
  if (dias === 1) return "Vence amanhã";
  return `Vence em ${dias} dias`;
}
