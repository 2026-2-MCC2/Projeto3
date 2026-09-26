import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="container" style={{ padding: "96px 24px", textAlign: "center" }}>
      <p style={{ fontSize: "var(--fs-title)", fontWeight: 600 }}>404</p>
      <h1 style={{ fontSize: "var(--fs-display)", color: "var(--color-primary)" }}>
        Página não encontrada
      </h1>
      <p style={{ margin: "16px 0 32px" }}>O endereço que você acessou não existe.</p>
      <Link to="/" className="perfil-card__button" style={{ display: "inline-flex", padding: "0 24px" }}>
        Voltar para o início
      </Link>
    </section>
  );
}
