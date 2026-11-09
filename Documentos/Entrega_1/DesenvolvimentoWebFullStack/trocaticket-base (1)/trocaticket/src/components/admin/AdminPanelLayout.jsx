import { Suspense, useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar.jsx";
import AdminTopbar from "./AdminTopbar.jsx";
import { ToastProvider } from "./Toast.jsx";
import "./admin-theme.css";
import "./AdminPanelLayout.css";

/**
 * Casca do painel do administrador (rota /admin/*): sidebar + barra superior +
 * conteúdo da tela atual (<Outlet />). Tudo dentro de `.adm`, que carrega o tema.
 */
export default function AdminPanelLayout() {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <div className="adm">
      <ToastProvider>
        <a className="adm-skip" href="#adm-conteudo">
          Pular para o conteúdo
        </a>
        <AdminSidebar aberto={menuAberto} onNavegar={() => setMenuAberto(false)} />
        {menuAberto && <button type="button" className="adm-scrim" aria-label="Fechar menu" onClick={() => setMenuAberto(false)} />}
        <div className="adm-main">
          <AdminTopbar onAbrirMenu={() => setMenuAberto(true)} />
          <main id="adm-conteudo" className="adm-content" tabIndex={-1}>
            <Suspense fallback={<div className="adm-skeleton" style={{ height: 320 }} role="status" aria-label="Carregando tela" />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </ToastProvider>
    </div>
  );
}
