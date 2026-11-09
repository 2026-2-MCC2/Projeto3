import "./Badge.css";

const TONS_VALIDOS = ["neutral", "success", "warning", "danger", "info"];

/** Pill de status reutilizado em todas as tabelas do painel administrativo. */
export default function Badge({ tone = "neutral", children }) {
  const classe = TONS_VALIDOS.includes(tone) ? tone : "neutral";
  return <span className={`admin-badge admin-badge--${classe}`}>{children}</span>;
}
