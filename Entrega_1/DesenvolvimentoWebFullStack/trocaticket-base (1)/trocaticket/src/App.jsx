import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import AdminLayout from "./components/AdminLayout.jsx";
import AdminPanelLayout from "./components/admin/AdminPanelLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Páginas públicas
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
import OrganizadorLayout from "./pages/OrganizadorLayout.jsx";
import PainelOrganizador from "./pages/PainelOrganizador.jsx";
import CriarEvento from "./pages/CriarEvento.jsx";
import CustoOrcamento from "./pages/CustoOrcamento.jsx";
import Proposta from "./pages/Proposta.jsx";
import Calculo from "./pages/Calculo.jsx";
import Resumo from "./pages/Resumo.jsx";
import Publicar from "./pages/Publicar.jsx";

// PÁGINAS CINTYA
import AnaliseCadastral from './pages/AnaliseCadastral.jsx';
import PainelFornecedor from './pages/PainelFornecedor.jsx';
import MinhasPropostas from './pages/MinhasPropostas.jsx';
import Mensagens from './pages/Mensagens.jsx';
import ResumoePublicar from './pages/ResumoePublicar.jsx';

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

const protegidas = {
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

        {/* ✅ ROTA NOVA: Análise Cadastral (pública, após cadastro) */}
        <Route path="/cadastro/status" element={<AnaliseCadastral />} />

        {publicas
          .filter(([path]) => path !== "/cadastro/status") // Remove a que já tem rota
          .map(([path, titulo]) => (
            <Route key={path} path={path} element={<EmConstrucao titulo={titulo} />} />
          ))}

        {/* ✅ ROTAS NOVO: Fornecedor */}
        <Route element={<ProtectedRoute perfil="fornecedor" />}>
          <Route path="/fornecedor/painel" element={<PainelFornecedor />} />
          <Route path="/fornecedor" element={<PainelFornecedor />} />
          <Route path="/fornecedor/minhas-propostas" element={<MinhasPropostas />} />
          <Route path="/fornecedor/mensagens" element={<Mensagens />} />
        </Route>

        {/* Outras rotas protegidas que já existem */}
        {Object.entries(protegidas).map(([perfil, telas]) => {
          const rotasJaAdicionadas = perfil === "fornecedor" || perfil === "organizador";
          if (rotasJaAdicionadas) return null;

          return (
            <Route key={perfil} element={<ProtectedRoute perfil={perfil} />}>
              {telas.map(([path, titulo]) => (
                <Route key={path} path={path} element={<EmConstrucao titulo={titulo} />} />
              ))}
            </Route>
          );
        })}

        <Route path="*" element={<NotFound />} />
      </Route>
      <Route element={<ProtectedRoute perfil="organizador" />}>
        <Route path="/organizador" element={<OrganizadorLayout />}>
          <Route index element={<PainelOrganizador />} />
          <Route path="eventos/novo" element={<CriarEvento />} />
          <Route path="eventos/novo/custo" element={<CustoOrcamento />} />
          <Route path="eventos/novo/proposta" element={<Proposta />} />
          <Route path="eventos/novo/calculo" element={<Calculo />} />
          <Route path="eventos/novo/resumo" element={<Resumo />} />
          <Route path="eventos/novo/publicar" element={<Publicar />} />
          <Route path="eventos" element={<EmConstrucao titulo="Histórico de Eventos" />} />
          <Route path="mensagens" element={<EmConstrucao titulo="Mensagens" />} />
          <Route path="perfil" element={<EmConstrucao titulo="Meu Perfil" />} />
          <Route path="resumo" element={<ResumoePublicar />} />
        </Route>
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
  )
}
