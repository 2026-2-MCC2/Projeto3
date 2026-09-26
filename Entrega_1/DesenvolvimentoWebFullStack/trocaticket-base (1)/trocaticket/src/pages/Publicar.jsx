import { CheckCircle2, Send } from "lucide-react";
import { Link } from "react-router-dom";

export default function Publicar() {
  return (
    <div className="organizador-page">
      <header className="organizador-page__header">
        <div>
          <p className="eyebrow">Novo evento · 6 de 6</p>
          <h1>Publicar evento</h1>
          <p>Está tudo pronto? Confirme para tornar seu evento visível.</p>
        </div>
      </header>

      <section className="publicar-box">
        <Send size={32} aria-hidden="true" />
        <h2>Pronto para publicar</h2>
        <p>Ao publicar, seu evento ficará disponível para divulgação e venda de ingressos.</p>
        <button className="button button--primary" type="button">
          <CheckCircle2 size={17} aria-hidden="true" />
          Publicar evento
        </button>
        <Link to="/organizador">Voltar ao painel</Link>
      </section>
    </div>
  );
}
