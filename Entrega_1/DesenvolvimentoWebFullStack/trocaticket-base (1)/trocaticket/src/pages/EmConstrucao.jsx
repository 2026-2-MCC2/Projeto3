import { Link, useLocation } from "react-router-dom";

// Tela provisória: cada integrante substitui pela página real do Figma.
export default function EmConstrucao({ titulo }) {
  const { pathname } = useLocation();
  return (
    <section className="container" style={{ padding: "64px 24px" }}>
      <h1 style={{ color: "var(--color-primary)" }}>{titulo}</h1>
      <p style={{ margin: "8px 0 24px" }}>
        Rota <code>{pathname}</code> ainda não implementada.
      </p>
      <Link to="/">Voltar para o início</Link>
    </section>
  );
}
