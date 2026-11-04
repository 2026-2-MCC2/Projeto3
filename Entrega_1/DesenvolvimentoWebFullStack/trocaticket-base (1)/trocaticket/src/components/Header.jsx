import { useSyncExternalStore } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Ticket, CircleHelp, LogOut } from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";
import { getStoreSnapshot, subscribe } from "../services/eventoStore.js";
import "./Header.css";

export default function Header({ variant = "logado" }) {
  const { user, sair } = useAuth();
  const store = useSyncExternalStore(subscribe, getStoreSnapshot, getStoreSnapshot);
  const navigate = useNavigate();
  const usuarioSalvo = store.usuario;
  const nome = user?.email && usuarioSalvo.email === user.email
    ? usuarioSalvo.nome
    : user?.nome ?? usuarioSalvo.nome;
  const iniciais = user?.email && usuarioSalvo.email === user.email
    ? usuarioSalvo.iniciais
    : user?.iniciais ?? nome.split(/\s+/).slice(0, 2).map((parte) => parte[0]).join("").toUpperCase();
  const plano = user?.email && usuarioSalvo.email === user.email
    ? usuarioSalvo.plano
    : user?.plano ?? usuarioSalvo.plano;

  function handleSair() {
    sair();
    navigate("/", { replace: true });
  }

  return (
    <header className={`header header--${variant}`}>
      <div className="container header__inner">
        <Link to="/" className="header__brand" aria-label="TrocaTicket — página inicial">
          <span className="header__logo" aria-hidden="true">
            <Ticket size={18} />
          </span>
          <span className="header__name"><span>Troca</span><strong>Ticket</strong></span>
        </Link>
        <nav className="header__nav" aria-label="Principal">
          {variant === "logado" && user && (
            <>
              <span className="header__account">
                <span className="header__avatar">{iniciais}</span>
                <span className="header__account-details">
                  <strong className="header__user">{nome}</strong>
                  <small>{plano}</small>
                </span>
              </span>
              <button type="button" className="header__link header__logout" onClick={handleSair} aria-label="Sair">
                <LogOut size={15} aria-hidden="true" />
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
