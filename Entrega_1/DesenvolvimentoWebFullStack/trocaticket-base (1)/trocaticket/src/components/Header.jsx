import { Link, useNavigate } from "react-router-dom";
import { Ticket, CircleHelp } from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";
import "./Header.css";

export default function Header() {
  const { user, sair } = useAuth();
  const navigate = useNavigate();

  function handleSair() {
    sair();
    navigate("/", { replace: true });
  }

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="header__brand" aria-label="TrocaTicket — página inicial">
          <span className="header__logo" aria-hidden="true">
            <Ticket size={18} />
          </span>
          <span className="header__name">TrocaTicket</span>
        </Link>
        <nav className="header__nav" aria-label="Principal">
          {user && (
            <>
              <span className="header__user">{user.nome}</span>
              <button type="button" className="header__link header__logout" onClick={handleSair}>
                Sair
              </button>
            </>
          )}
          <Link to="/ajuda" className="header__link">
            <CircleHelp size={15} aria-hidden="true" />
            Central de Ajuda
          </Link>
        </nav>
      </div>
    </header>
  );
}
