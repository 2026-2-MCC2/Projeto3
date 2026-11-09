import { Link } from "react-router-dom";
import { etapas } from "../services/etapas.js";
import "./Breadcrumb.css";

export default function Breadcrumb({ etapaAtual, eventoId, onEtapaUmClick }) {
  return (
    <nav className="tt-steps-breadcrumb" aria-label="Etapas do evento">
      <Link to="/organizador">Meus Eventos</Link>
      {etapas.map((etapa) => (
        <span className="tt-steps-breadcrumb__step" key={etapa.id}>
          <span className="tt-steps-breadcrumb__separator" aria-hidden="true">›</span>
          {etapa.n < etapaAtual ? (
            <Link
              to={etapa.id === "cadastro"
                ? `${etapa.rota}?id=${encodeURIComponent(eventoId ?? "")}`
                : etapa.rota.replace(":id", encodeURIComponent(eventoId ?? ""))}
              onClick={etapa.id === "cadastro" ? onEtapaUmClick : undefined}
            >
              {etapa.rotulo}
            </Link>
          ) : etapa.n === etapaAtual ? (
            <span aria-current="step">{etapa.rotulo}</span>
          ) : (
            <span className="is-future">{etapa.rotulo}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
