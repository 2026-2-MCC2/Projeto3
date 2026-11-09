import { Link, Outlet } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import "./AdminLayout.css";

export default function AdminLayout() {
  return (
    <div className="admin">
      <header className="admin__header">
        <Link to="/" className="admin__brand">
          TrocaTicket
        </Link>
        <span className="admin__pill">
          <ShieldCheck size={12} aria-hidden="true" />
          Portal Administrativo
        </span>
        <span className="admin__divider" aria-hidden="true" />
        <span className="admin__env">
          <span className="admin__dot" aria-hidden="true" />
          Ambiente Restrito
        </span>
      </header>

      <main className="admin__main">
        <Outlet />
      </main>

      <footer className="admin__footer">
        <Link to="/termos">Termos de Serviço</Link>
        <Link to="/privacidade">Diretrizes de Privacidade</Link>
      </footer>
    </div>
  );
}
