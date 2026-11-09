// Mapa central de status -> tom visual do Badge, usado em todas as telas do
// painel do administrador para manter a mesma paleta em qualquer lista.
const TONS_POR_STATUS = {
  ativo: "success",
  suspenso: "neutral",
  aberta: "info",
  vencendo: "warning",
  vencida: "danger",
  encerrada: "success",
  "em produção": "success",
  planejamento: "info",
  "em cotação": "warning",
  concluído: "neutral",
};

export function tomStatus(status) {
  return TONS_POR_STATUS[status?.toLowerCase()] ?? "neutral";
}

export function formatarMoeda(valor) {
  if (valor === null || valor === undefined) return "—";
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export function formatarData(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function formatarDataHora(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function iniciais(nome) {
  if (!nome) return "";
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}
