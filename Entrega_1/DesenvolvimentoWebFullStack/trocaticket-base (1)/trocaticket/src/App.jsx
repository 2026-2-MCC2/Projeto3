import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import AdminLayout from "./components/AdminLayout.jsx";
import AdminPanelLayout from "./components/admin/AdminPanelLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import EscolhaPerfil from "./pages/EscolhaPerfil.jsx";
import Login from "./pages/Login.jsx";
import LoginAdmin from "./pages/LoginAdmin.jsx";
import Cadastro from "./pages/Cadastro.jsx";
import EmConstrucao from "./pages/EmConstrucao.jsx";
import NotFound from "./pages/NotFound.jsx";
import VisaoGeral from "./pages/admin/VisaoGeral.jsx";
import Aprovacoes from "./pages/admin/Aprovacoes.jsx";
import Usuarios from "./pages/admin/Usuarios.jsx";
import Eventos from "./pages/admin/Eventos.jsx";
import Cotacoes from "./pages/admin/Cotacoes.jsx";
import RelatoriosAuditoria from "./pages/admin/RelatoriosAuditoria.jsx";

const publicas = [
  ["/cadastro/status", "Análise Cadastral"],
  ["/recuperar-senha", "Recuperar senha"],
  ["/ajuda", "Central de Ajuda"],
  ["/suporte", "Suporte"],
  ["/termos", "Termos de Uso"],
  ["/privacidade", "Privacidade"],
  ["/seguranca", "Segurança"],
  ["/politicas", "Políticas de Concessão"],
];

// Painéis dos perfis organizador/fornecedor ainda não implementados por outros
// integrantes: seguem como EmConstrucao dentro do layout público padrão.
const protegidas = {
  organizador: [
    ["/organizador", "Painel do Organizador"],
    ["/organizador/eventos/novo", "Criar Evento"],
  ],
  fornecedor: [["/fornecedor", "Painel do Fornecedor"]],
};

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<EscolhaPerfil />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro/organizador" element={<Cadastro perfilInicial="organizador" />} />
        <Route path="/cadastro/fornecedor" element={<Cadastro perfilInicial="fornecedor" />} />
        {publicas.map(([path, titulo]) => (
          <Route key={path} path={path} element={<EmConstrucao titulo={titulo} />} />
        ))}

        {Object.entries(protegidas).map(([perfil, telas]) => (
          <Route key={perfil} element={<ProtectedRoute perfil={perfil} />}>
            {telas.map(([path, titulo]) => (
              <Route key={path} path={path} element={<EmConstrucao titulo={titulo} />} />
            ))}
          </Route>
        ))}

        <Route path="*" element={<NotFound />} />
      </Route>
      <Route element={<AdminLayout />}>
        <Route path="/login-admin" element={<LoginAdmin />} />
      </Route>

      {/* painel do administrador: layout próprio com sidebar, atrás de login-admin + MFA */}
      <Route element={<ProtectedRoute perfil="admin" />}>
        <Route path="/admin" element={<AdminPanelLayout />}>
          <Route index element={<VisaoGeral />} />
          <Route path="aprovacoes" element={<Aprovacoes />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="eventos" element={<Eventos />} />
          <Route path="cotacoes" element={<Cotacoes />} />
          <Route path="relatorios" element={<RelatoriosAuditoria />} />
          <Route path="configuracoes" element={<EmConstrucao titulo="Configurações" />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}

