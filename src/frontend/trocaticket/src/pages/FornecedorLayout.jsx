import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import "./FornecedorLayout.css";

/* ---------- Ícones (SVG inline) ---------- */
const ICONES = {
  oportunidades:
    "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
  propostas:
    "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  mensagens:
    "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
  ajuda:
    "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};

function Icone({ nome, className = "fl-icone" }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d={ICONES[nome]}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

/* ---------- Itens do menu ----------
   "to" precisa ser igual ao path das rotas no App.jsx.
   "ativoEm" diz em quais endereços a aba fica destacada. */
const NAV = [
  {
    to: "/fornecedor",
    rotulo: "Oportunidades",
    icone: "oportunidades",
    contador: 5,
    cor: "azul",
    ativoEm: ["/fornecedor", "/fornecedor/painel"],
  },
  {
    to: "/fornecedor/minhas-propostas",
    rotulo: "Minhas propostas",
    icone: "propostas",
    ativoEm: ["/fornecedor/minhas-propostas"],
  },
  {
    to: "/fornecedor/mensagens-fornecedor",
    rotulo: "Mensagens",
    icone: "mensagens",
    contador: 2,
    cor: "laranja",
    ativoEm: ["/fornecedor/mensagens-fornecedor"],
  },
];

export default function FornecedorLayout() {
  const { user, sair } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);

  const caminho = location.pathname.replace(/\/+$/, "") || "/";

  const nomeUsuario = user?.nome ?? "Fornecedor";
  const iniciais =
    user?.iniciais ??
    nomeUsuario
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0])
      .join("")
      .toUpperCase();

  return (
    <div className="fl-page">
      <header className="fl-header">
        <div className="fl-header-inner">
          <div className="fl-header-left">
            <Link className="fl-logo" to="/fornecedor">
              TrocaTicket
            </Link>
          </div>

          <nav className="fl-nav" aria-label="Navegação do fornecedor">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`fl-nav-link ${
                  item.ativoEm.includes(caminho) ? "fl-nav-link--ativo" : ""
                }`}
              >
                <Icone nome={item.icone} />
                <span>{item.rotulo}</span>
                {item.contador > 0 && (
                  <span className={`fl-contador fl-contador--${item.cor}`}>
                    {item.contador}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="fl-header-right">
            <Link
              to="/ajuda"
              className="fl-btn-icone"
              aria-label="Central de Ajuda"
            >
              <Icone nome="ajuda" className="fl-icone fl-icone--lg" />
            </Link>
            <div className="fl-divisor" />

            <button
              type="button"
              className="fl-usuario"
              aria-expanded={menuAberto}
              aria-haspopup="menu"
              onClick={() => setMenuAberto((aberto) => !aberto)}
            >
              <span className="fl-usuario-texto">
                <span className="fl-usuario-nome">{nomeUsuario}</span>
                <span className="fl-usuario-tipo">Fornecedor</span>
              </span>
              <span className="fl-avatar-wrap">
                <span className="fl-avatar">{iniciais}</span>
                <span className="fl-avatar-status" />
              </span>
            </button>

            {menuAberto && (
              <div className="fl-menu" role="menu">
                <Link
                  role="menuitem"
                  to="/fornecedor/perfil"
                  onClick={() => setMenuAberto(false)}
                >
                  Perfil
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuAberto(false);
                    sair();
                    navigate("/login");
                  }}
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="fl-main">
        <Outlet />
      </main>

      <footer className="fl-footer">
        <div className="fl-footer-inner">
          <div>
            <span className="fl-footer-marca">TrocaTicket © 2026</span>
            <span> · Plataforma de Gestão e Cotações</span>
          </div>
          <div className="fl-footer-links">
            <Link to="/termos">Termos de Uso</Link>
            <Link to="/privacidade">Privacidade</Link>
            <Link to="/seguranca">Segurança</Link>
            <Link to="/suporte">Suporte ao Fornecedor</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}