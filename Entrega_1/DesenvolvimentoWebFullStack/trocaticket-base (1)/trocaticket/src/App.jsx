import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import AdminLayout from "./components/AdminLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import EscolhaPerfil from "./pages/EscolhaPerfil.jsx";
import Login from "./pages/Login.jsx";
import LoginAdmin from "./pages/LoginAdmin.jsx";
import EmConstrucao from "./pages/EmConstrucao.jsx";
import NotFound from "./pages/NotFound.jsx";

// Telas do Figma que ainda viram página real: [caminho, título]
// Cada integrante troca o <EmConstrucao> pela página verdadeira.
const publicas = [
  ["/cadastro/organizador", "Cadastro — Organizador"],
  ["/cadastro/fornecedor", "Cadastro — Fornecedor"],
  ["/cadastro/status", "Análise Cadastral"],
  ["/recuperar-senha", "Recuperar senha"],
  ["/ajuda", "Central de Ajuda"],
  ["/suporte", "Suporte"],
  ["/termos", "Termos de Uso"],
  ["/privacidade", "Privacidade"],
  ["/seguranca", "Segurança"],
  ["/politicas", "Políticas de Concessão"],
];

const protegidas = {
  organizador: [
    ["/organizador", "Painel do Organizador"],
    ["/organizador/eventos/novo", "Criar Evento"],
  ],
  fornecedor: [["/fornecedor", "Painel do Fornecedor"]],
  admin: [["/admin", "Painel do Administrador"]],
};

export default function App() {
  return (
    <Routes>
      {/* layout padrão (header + footer) */}
      <Route element={<Layout />}>
        <Route path="/" element={<EscolhaPerfil />} />
        <Route path="/login" element={<Login />} />
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

      {/* portal administrativo tem header e footer próprios */}
      <Route element={<AdminLayout />}>
        <Route path="/login-admin" element={<LoginAdmin />} />
      </Route>
    </Routes>
  );
}
