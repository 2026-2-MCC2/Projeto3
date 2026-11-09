/* Formatadores de números, moeda e datas do painel do administrador (pt-BR). */

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export const formatBRL = (v) => brl.format(v);

/** Moeda compacta: R$ 1,8 mi / R$ 480 mil */
export function formatBRLCompact(v) {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) {
    return `R$ ${(v / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} mi`;
  }
  if (abs >= 1_000) {
    return `R$ ${(v / 1_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil`;
  }
  return brl.format(v);
}

export const formatNumber = (v) => Number(v).toLocaleString("pt-BR");

export const formatPct = (v, digits = 1) =>
  `${Number(v).toLocaleString("pt-BR", { maximumFractionDigits: digits, minimumFractionDigits: 0 })}%`;

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export const formatDateShort = (iso) => new Date(iso).toLocaleDateString("pt-BR");

export function formatDateTime(iso) {
  const d = new Date(iso);
  return `${d.toLocaleDateString("pt-BR")} ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

/** Iniciais (até 2 letras) para avatares. */
export function iniciais(nome = "") {
  return nome
    .split(/\s+/)
    .filter((p) => p.length > 2 || /^[A-Z]/.test(p))
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
