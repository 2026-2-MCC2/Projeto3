import { NavLink, useNavigate } from "react-router-dom";
import { CalendarRange, ChartNoAxesCombined, FileText, LayoutDashboard, LogOut, ShieldCheck, Ticket, UsersRound } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import { useAdminQuery } from "../../hooks/useAdminQuery.js";
import { listarPendentes } from "../../services/adminApi.js";
import "./AdminSidebar.css";

const NAV = [
  {
    grupo: "Operacional",
    itens: [
      { to: "/admin", label: "Visão geral", icon: LayoutDashboard, fim: true },
      { to: "/admin/aprovacoes", label: "Aprovações", icon: ShieldCheck, badge: true },
      { to: "/admin/usuarios", label: "Cadastros", icon: UsersRound },
      { to: "/admin/eventos", label: "Eventos", icon: CalendarRange },
      { to: "/admin/cotacoes", label: "Cotações", icon: FileText },
    ],
  },
  {
    grupo: "Gestão & controle",
    itens: [{ to: "/admin/relatorios", label: "Relatórios e auditoria", icon: ChartNoAxesCombined }],
  },
];

export default function AdminSidebar({ aberto, onNavegar }) {
  const { sair } = useAuth();
  const navigate = useNavigate();
  const { data: pendentes } = useAdminQuery(listarPendentes);
  const totalPendentes = pendentes?.length ?? 0;

  function handleSair() {
    sair();
    navigate("/login-admin", { replace: true });
  }

  return (
    <aside className={`adm-sidebar${aberto ? " adm-sidebar--open" : ""}`} aria-label="Menu do painel administrativo">
      <div className="adm-sidebar__brand">
        <div className="adm-sidebar__logo">
          <Ticket aria-hidden="true" />
        </div>
        <div>
          <div className="adm-sidebar__name">TrocaTicket</div>
          <div className="adm-sidebar__tag">ADMIN</div>
        </div>
      </div>

      <nav className="adm-sidebar__nav">
        {NAV.map((g) => (
          <div key={g.grupo}>
            <div className="adm-sidebar__group">{g.grupo}</div>
            <ul>
              {g.itens.map(({ to, label, icon: Icone, fim, badge }) => (
                <li key={to}>
                  <NavLink to={to} end={fim} onClick={onNavegar} className={({ isActive }) => `adm-sidebar__link${isActive ? " is-active" : ""}`}>
                    <Icone aria-hidden="true" />
                    <span>{label}</span>
                    {badge && totalPendentes > 0 && (
                      <span className="adm-sidebar__badge" aria-label={`${totalPendentes} pendentes`}>
                        {totalPendentes}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="adm-sidebar__foot">
        <div className="adm-sidebar__sync">
          <span className="adm-sidebar__pulse" aria-hidden="true" />
          Base sincronizada
          <small>Auditoria ativa em todas as ações</small>
        </div>
        <button type="button" className="adm-sidebar__logout" onClick={handleSair}>
          <LogOut aria-hidden="true" /> Sair do painel
        </button>
      </div>
    </aside>
  );
}
