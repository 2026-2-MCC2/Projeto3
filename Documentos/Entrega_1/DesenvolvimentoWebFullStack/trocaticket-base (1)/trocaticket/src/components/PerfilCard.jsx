import { Link } from "react-router-dom";
import { ArrowRight, Info } from "lucide-react";
import "./PerfilCard.css";

export default function PerfilCard({ id, icon: Icon, tag, titulo, atribuicao, textoBotao, to }) {
  return (
    <article className="perfil-card" aria-labelledby={`${id}-titulo`}>
      <div className="perfil-card__top">
        <div className="perfil-card__icon" aria-hidden="true">
          <Icon size={26} />
        </div>
        <div>
          <span className="perfil-card__tag">{tag}</span>
          <h3 id={`${id}-titulo`} className="perfil-card__title">
            {titulo}
          </h3>
        </div>
      </div>

      <p className="perfil-card__note">
        <Info size={15} aria-hidden="true" />
        <span>
          <strong>Atribuição:</strong> {atribuicao}
        </span>
      </p>

      <Link to={to} className="perfil-card__button">
        {textoBotao}
        <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </article>
  );
}
