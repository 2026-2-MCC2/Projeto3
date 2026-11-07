import { Bell, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { useAdminQuery } from "../../hooks/useAdminQuery.js";
import { listarPendentes } from "../../services/adminApi.js";
import { iniciais } from "../../utils/admin/format.js";
import GlobalSearch from "./GlobalSearch.jsx";
import "./AdminTopbar.css";

export default function AdminTopbar({ onAbrirMenu }) {
  const { user } = useAuth();
  const { data: pendentes } = useAdminQuery(listarPendentes);
  const nome = user?.nome ?? "Administrador";

  return (
    <header className="adm-topbar">
      <button type="button" className="adm-topbar__menu" aria-label="Abrir menu" onClick={onAbrirMenu}>
        <Menu aria-hidden="true" />
      </button>
      <GlobalSearch />
      <div className="adm-topbar__right">
        <Link to="/admin/aprovacoes" className="adm-topbar__bell" aria-label={`Notificações: ${pendentes?.length ?? 0} aprovações pendentes`}>
          <Bell aria-hidden="true" />
          {pendentes?.length > 0 && <span aria-hidden="true" />}
        </Link>
        <div className="adm-topbar__user">
          <div className="adm-topbar__avatar" aria-hidden="true">
            {iniciais(nome) || "AD"}
          </div>
          <div>
            <strong>{nome}</strong>
            <small>Administrador(a)</small>
          </div>
        </div>
      </div>
    </header>
  );
}
