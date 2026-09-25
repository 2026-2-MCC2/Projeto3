import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  CircleCheck,
  Users,
  CalendarDays,
  FileText,
  ChartColumn,
  Settings,
  LogOut,
  Ticket,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import { buscarAprovacoes } from "../../services/adminService.js";
import { iniciais } from "../../utils/admin.js";
import "./AdminSidebar.css";

const GRUPOS = [
  {
    titulo: "Geral",
    itens: [{ to: "/admin", label: "Visão Geral", icon: LayoutGrid, fim: true }],
  },
  {
    titulo: "Operacional",
    itens: [
      { to: "/admin/aprovacoes", label: "Aprovações", icon: CircleCheck, badge: "aprovacoes" },
      { to: "/admin/usuarios", label: "Usuários", icon: Users },
      { to: "/admin/eventos", label: "Eventos", icon: CalendarDays },
      { to: "/admin/cotacoes", label: "Cotações", icon: FileText },
    ],
  },
  {
    titulo: "Gestão & Controle",
    itens: [
      { to: "/admin/relatorios", label: "Relatórios e Auditoria", icon: ChartColumn },
      { to: "/admin/configuracoes", label: "Configurações", icon: Settings },
    ],
  },
];

export default function AdminSidebar() {
  const { user, sair } = useAuth();
  const navigate = useNavigate();
  const [pendentes, setPendentes] = useState(null);

  useEffect(() => {
    let ativo = true;
    buscarAprovacoes()
      .then((lista) => {
        if (ativo) setPendentes(lista.length);
      })
      .catch(() => {
        if (ativo) setPendentes(null);
      });
    return () => {
      ativo = false;
    };
  }, []);

  function handleSair() {
    sair();
    navigate("/login-admin", { replace: true });
  }

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        <span className="admin-sidebar__logo" aria-hidden="true">
          <Ticket size={16} />
        </span>
        <span>TrocaTicket</span>
      </div>

      <nav className="admin-sidebar__nav" aria-label="Navegação do painel administrativo">
        {GRUPOS.map((grupo) => (
          <div className="admin-sidebar__group" key={grupo.titulo}>
            <span className="admin-sidebar__group-title">{grupo.titulo}</span>
            <ul>
              {grupo.itens.map(({ to, label, icon: Icon, fim, badge }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={fim}
                    className={({ isActive }) =>
                      `admin-sidebar__link${isActive ? " admin-sidebar__link--active" : ""}`
                    }
                  >
                    <Icon size={17} aria-hidden="true" />
                    <span>{label}</span>
                    {badge === "aprovacoes" && Boolean(pendentes) && (
                      <span className="admin-sidebar__badge">{pendentes}</span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {user && (
        <div className="admin-sidebar__user">
          <span className="admin-sidebar__avatar" aria-hidden="true">
            {iniciais(user.nome)}
          </span>
          <div className="admin-sidebar__user-info">
            <strong>{user.nome}</strong>
            <span>Administrador(a)</span>
          </div>
          <button
            type="button"
            className="admin-sidebar__logout"
            onClick={handleSair}
            aria-label="Sair do painel administrativo"
            title="Sair"
          >
            <LogOut size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </aside>
  );
}
