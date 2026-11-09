/* Validações dos formulários do painel do administrador (retornam "" quando válido). */

export const MIN_JUSTIFICATIVA = 10;

/** Justificativa/motivo obrigatório (rejeição de cadastro, suspensão, reativação). */
export function validarJustificativa(texto, minimo = MIN_JUSTIFICATIVA) {
  const t = (texto ?? "").trim();
  if (!t) return "Informe a justificativa. Ela fica registrada na auditoria.";
  if (t.length < minimo) return `Detalhe um pouco mais (mínimo de ${minimo} caracteres).`;
  return "";
}

/** O checklist precisa estar 100% validado para aprovar um cadastro. */
export function validarChecklistCompleto(checklist) {
  const pendentes = checklist.filter((c) => c.status !== "valido").length;
  return pendentes === 0 ? "" : `Conclua todas as checagens do checklist antes de aprovar (${pendentes} restante${pendentes > 1 ? "s" : ""}).`;
}
