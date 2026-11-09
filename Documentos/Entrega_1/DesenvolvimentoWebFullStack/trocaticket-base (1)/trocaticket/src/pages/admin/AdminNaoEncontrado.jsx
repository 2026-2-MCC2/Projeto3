import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";

/** 404 dentro do painel admin: mantém a sidebar e oferece o caminho de volta. */
export default function AdminNaoEncontrado() {
  return (
    <div className="adm-panel adm-state" role="alert">
      <SearchX aria-hidden="true" />
      <h2>Página não encontrada</h2>
      <p>Essa rota não existe no painel do administrador.</p>
      <Link to="/admin" className="adm-btn adm-btn--primary">
        Voltar para a visão geral
      </Link>
    </div>
  );
}
