import { CircleHelp, Ticket } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import "./OrganizadorLayout.css";

export default function OrganizadorLayout() {
  return (
    <div className="organizador-layout">
      <header className="organizador-layout__topbar">
        <Link to="/organizador" className="organizador-layout__brand" aria-label="TrocaTicket, início">
          <span className="organizador-layout__brand-icon"><Ticket size={15} aria-hidden="true" /></span>
          <span><strong>Troca</strong>Ticket</span>
        </Link>
        <Link to="/ajuda" className="organizador-layout__help">
          <CircleHelp size={15} aria-hidden="true" />
          Central de Ajuda
        </Link>
      </header>
      <main className="organizador-layout__main">
        <Outlet />
      </main>
    </div>
  );
}
