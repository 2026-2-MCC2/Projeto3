import { lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import LayoutPublico from "./components/LayoutPublico.jsx";
import AdminLayout from "./components/AdminLayout.jsx";
import AdminPanelLayout from "./components/admin/AdminPanelLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import EscolhaPerfil from "./pages/EscolhaPerfil.jsx";
import Login from "./pages/Login.jsx";
import LoginAdmin from "./pages/LoginAdmin.jsx";
import Cadastro from "./pages/Cadastro.jsx";
import EmConstrucao from "./pages/EmConstrucao.jsx";
import NotFound from "./pages/NotFound.jsx";
import OrganizadorLayout from "./pages/OrganizadorLayout.jsx";
import EventoRedirect from "./pages/EventoRedirect.jsx";
import CriarEvento from "./pages/CriarEvento.jsx";
import CustosOrcamento from "./pages/CustosOrcamento.jsx";
import PropostasRecebidas from "./pages/PropostasRecebidas.jsx";
import ResumoConsolidacao from "./pages/ResumoConsolidacao.jsx";
import PrecificacaoTicket from "./pages/PrecificacaoTicket.jsx";
import Publicar from "./pages/Publicar.jsx";
import CadastroEmAnalise from "./pages/CadastroEmAnalise.jsx";
import FornecedorLayout from "./pages/FornecedorLayout.jsx";
import PainelFornecedor from "./pages/PainelFornecedor.jsx";
import MinhasPropostas from "./pages/MinhasPropostas.jsx";
import MensagensFornecedor from "./pages/MensagensFornecedor.jsx";
import Mensagens from "./pages/Mensagens.jsx";
import PerfilFornecedor from "./pages/PerfilFornecedor.jsx";
import Resumo from "./pages/Resumo.jsx";

// O painel administrativo é carregado por demanda para não aumentar o pacote
// inicial usado pelas áreas pública, de organizador e de fornecedor.
const VisaoGeral = lazy(() => import("./pages/admin/VisaoGeral.jsx"));
const Aprovacoes = lazy(() => import("./pages/admin/Aprovacoes.jsx"));
const Cadastros = lazy(() => import("./pages/admin/Cadastros.jsx"));
const Eventos = lazy(() => import("./pages/admin/Eventos.jsx"));
const EventoDetalhe = lazy(() => import("./pages/admin/EventoDetalhe.jsx"));
const Cotacoes = lazy(() => import("./pages/admin/Cotacoes.jsx"));
const Relatorios = lazy(() => import("./pages/admin/Relatorios.jsx"));
const AdminNaoEncontrado = lazy(() => import("./pages/admin/AdminNaoEncontrado.jsx"));

const publicas = [
  ["/cadastro/status", "Análise Cadastral"],
  ["/recuperar-senha", "Recuperar senha"],
  ["/ajuda", "Central de Ajuda"],
  ["/suporte", "Suporte"],
  ["/termos", "Termos de Uso"],
  ["/privacidade", "Privacidade"],
  ["/seguranca", "Segurança"],
  ["/politicas", "Políticas de Concessão"],
  ["/politicas-de-concessao", "Políticas de Concessão"],
];

const protegidas = {
  fornecedor: [["/fornecedor", "Painel do Fornecedor"]],
};

export default function App() {
  return (
    <Routes>
      {/* ===== Páginas públicas de acesso ===== */}
      <Route element={<LayoutPublico />}>
        <Route path="/" element={<EscolhaPerfil />} />
        <Route path="/escolha-perfil" element={<EscolhaPerfil />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route
          path="/cadastro/em-analise"
          element={<CadastroEmAnalise />}
        />
        <Route path="/cadastro/organizador" element={<Cadastro perfilInicial="organizador" />} />
        <Route path="/cadastro/fornecedor" element={<Cadastro perfilInicial="fornecedor" />} />
      </Route>

      {/* ===== Demais páginas públicas (com Header/Footer) ===== */}
      <Route element={<Layout />}>
        {/* Análise Cadastral (pública, após cadastro) */}
        <Route path="/cadastro/status" element={<CadastroEmAnalise />} />

        {publicas
          .filter(([path]) => path !== "/cadastro/status") // Remove a que já tem rota
          .map(([path, titulo]) => (
            <Route key={path} path={path} element={<EmConstrucao titulo={titulo} />} />
          ))}

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

      {/* ===== Fornecedor: layout próprio (header + footer) ===== */}
      <Route element={<ProtectedRoute perfil="fornecedor" />}>
        <Route element={<FornecedorLayout />}>
          <Route path="/fornecedor" element={<PainelFornecedor />} />
          <Route path="/fornecedor/painel" element={<PainelFornecedor />} />
          <Route path="/fornecedor/minhas-propostas" element={<MinhasPropostas />} />
          <Route path="/fornecedor/mensagens-fornecedor" element={<MensagensFornecedor />} />
          <Route path="/fornecedor/perfil" element={<PerfilFornecedor />} />
        </Route>
      </Route>

      {/* ===== Organizador ===== */}
      <Route element={<ProtectedRoute perfil="organizador" />}>
        <Route path="/organizador" element={<OrganizadorLayout />}>
          <Route path="eventos/:id/custos" element={<CustosOrcamento />} />
          <Route path="eventos/:id" element={<EventoRedirect />} />
          <Route path="eventos/novo" element={<CriarEvento />} />
          <Route path="eventos/novo/custo" element={<CustosOrcamento />} />
          <Route path="eventos/novo/proposta" element={<PropostasRecebidas />} />
          <Route path="eventos/:id/propostas" element={<PropostasRecebidas />} />
          <Route path="eventos/novo/resumo" element={<ResumoConsolidacao />} />
          <Route path="eventos/novo/publicar" element={<Publicar />} />
          <Route path="eventos" element={<Navigate to="/organizador" replace />} />
          <Route path="mensagens" element={<Mensagens perfil="organizador" />} />
          <Route path="perfil" element={<EmConstrucao titulo="Meu Perfil" />} />
          <Route path="resumo" element={<Resumo />} />
        </Route>
        <Route path="/eventos/:id/custos" element={<OrganizadorLayout />}>
          <Route index element={<CustosOrcamento />} />
        </Route>
        <Route path="/eventos/:id/propostas" element={<OrganizadorLayout />}>
          <Route index element={<PropostasRecebidas />} />
        </Route>
        <Route path="/eventos/:id/resumo" element={<OrganizadorLayout />}>
          <Route index element={<ResumoConsolidacao />} />
        </Route>
        <Route path="/eventos/:id/editar" element={<OrganizadorLayout />}>
          <Route index element={<CriarEvento />} />
        </Route>
        <Route path="/eventos/:id/precificacao" element={<OrganizadorLayout />}>
          <Route index element={<PrecificacaoTicket />} />
        </Route>
        <Route path="/eventos" element={<Navigate to="/organizador" replace />} />
      </Route>

      {/* ===== Admin ===== */}
      <Route element={<AdminLayout />}>
        <Route path="/login-admin" element={<LoginAdmin />} />
      </Route>

      {/* painel do administrador: layout próprio com sidebar, atrás de login-admin + MFA */}
      <Route element={<ProtectedRoute perfil="admin" />}>
        <Route path="/admin" element={<AdminPanelLayout />}>
          <Route index element={<VisaoGeral />} />
          <Route path="aprovacoes" element={<Aprovacoes />} />
          <Route path="usuarios" element={<Cadastros />} />
          <Route path="cadastros" element={<Navigate to="/admin/usuarios" replace />} />
          <Route path="eventos" element={<Eventos />} />
          <Route path="eventos/:eventoId" element={<EventoDetalhe />} />
          <Route path="cotacoes" element={<Cotacoes />} />
          <Route path="relatorios" element={<Relatorios />} />
          <Route path="*" element={<AdminNaoEncontrado />} />
        </Route>
      </Route>
    </Routes>
  );
}