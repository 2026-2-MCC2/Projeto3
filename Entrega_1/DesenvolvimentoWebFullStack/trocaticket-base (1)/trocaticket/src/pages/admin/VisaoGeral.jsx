import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, CalendarClock } from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import AsyncState from "../../components/admin/AsyncState.jsx";
import StatCard from "../../components/admin/StatCard.jsx";
import Badge from "../../components/admin/Badge.jsx";
import { buscarResumo, buscarAprovacoes, buscarEventos } from "../../services/adminService.js";
import { tomStatus, formatarMoeda, formatarDataHora } from "../../utils/admin.js";
import "./VisaoGeral.css";

const EVENTOS_ATIVOS = ["Em produção", "Planejamento", "Em cotação"];

export default function VisaoGeral() {
  const [periodo, setPeriodo] = useState("7dias");
  const [busca, setBusca] = useState("");
  const [estado, setEstado] = useState({ carregando: true, erro: "", resumo: null, aprovacoes: [], eventos: [] });

  function carregar() {
    setEstado((e) => ({ ...e, carregando: true, erro: "" }));
    Promise.all([buscarResumo(), buscarAprovacoes(), buscarEventos()])
      .then(([resumo, aprovacoes, eventos]) => {
        setEstado({ carregando: false, erro: "", resumo, aprovacoes, eventos });
      })
      .catch((err) => {
        setEstado((e) => ({ ...e, carregando: false, erro: err.message }));
      });
  }

  useEffect(carregar, []);

  const termo = busca.trim().toLowerCase();
  const aprovacoesFiltradas = useMemo(
    () => estado.aprovacoes.filter((a) => !termo || a.nome.toLowerCase().includes(termo)),
    [estado.aprovacoes, termo]
  );
  const eventosFiltrados = useMemo(
    () => estado.eventos.filter((ev) => !termo || ev.nome.toLowerCase().includes(termo)),
    [estado.eventos, termo]
  );

  const eventosAtivos = estado.eventos.filter((ev) => EVENTOS_ATIVOS.includes(ev.status)).length;

  return (
    <section aria-labelledby="visao-geral-titulo">
      <AdminPageHeader
        title="Visão Geral"
        searchPlaceholder="Buscar usuários, eventos, CNPJ..."
        searchValue={busca}
        onSearchChange={setBusca}
        actions={
          <div className="visao-geral__periodo" role="group" aria-label="Período">
            <button
              type="button"
              className={`filter-chip${periodo === "hoje" ? " filter-chip--active" : ""}`}
              onClick={() => setPeriodo("hoje")}
            >
              Hoje
            </button>
            <button
              type="button"
              className={`filter-chip${periodo === "7dias" ? " filter-chip--active" : ""}`}
              onClick={() => setPeriodo("7dias")}
            >
              Últimos 7 dias
            </button>
          </div>
        }
      />

      <AsyncState loading={estado.carregando} error={estado.erro} onRetry={carregar}>
        <div className="stat-grid">
          <StatCard
            label="Cadastros pendentes"
            value={estado.aprovacoes.length}
            helper={`${estado.aprovacoes.filter((a) => a.tipo === "Fornecedor").length} fornecedores, ${
              estado.aprovacoes.filter((a) => a.tipo === "Organizador").length
            } org.`}
          />
          <StatCard
            label="Usuários ativos"
            value={estado.resumo?.usuariosAtivos.toLocaleString("pt-BR")}
            helper={estado.resumo?.usuariosAtivosVariacao}
          />
          <StatCard label="Eventos ativos" value={eventosAtivos} helper="Monitoramento ativo" />
          <StatCard label="Cotações abertas" value={estado.resumo?.cotacoesAbertas} helper="Em negociação" />
        </div>

        <div className="admin-card visao-geral__section">
          <div className="visao-geral__section-head">
            <h2 className="admin-section-title">
              <ClipboardList size={16} aria-hidden="true" /> Aprovações Pendentes de Cadastros
            </h2>
            <Link to="/admin/aprovacoes" className="admin-link-button">
              Ver todas
            </Link>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Razão social / Nome fantasia</th>
                  <th scope="col">Perfil &amp; categoria</th>
                  <th scope="col">Documento (CNPJ)</th>
                  <th scope="col">Submissão / UF</th>
                </tr>
              </thead>
              <tbody>
                {aprovacoesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="admin-empty-cell">
                      Nenhum cadastro pendente encontrado.
                    </td>
                  </tr>
                ) : (
                  aprovacoesFiltradas.slice(0, 3).map((a) => (
                    <tr key={a.id}>
                      <td>
                        <strong>{a.nome}</strong>
                        <small>{a.contatoEmail}</small>
                      </td>
                      <td>
                        <Badge tone={a.tipo === "Fornecedor" ? "info" : "warning"}>{a.tipo}</Badge>
                      </td>
                      <td>{a.cnpj}</td>
                      <td>{formatarDataHora(a.submetidoEm)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-card visao-geral__section">
          <div className="visao-geral__section-head">
            <h2 className="admin-section-title">
              <CalendarClock size={16} aria-hidden="true" /> Eventos Cadastrados &amp; Acompanhamento de Custos
            </h2>
            <Link to="/admin/eventos" className="admin-link-button">
              Ver todos
            </Link>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Evento &amp; cronograma</th>
                  <th scope="col">Organizador responsável</th>
                  <th scope="col">Status operacional</th>
                  <th scope="col">Custo consolidado</th>
                </tr>
              </thead>
              <tbody>
                {eventosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="admin-empty-cell">
                      Nenhum evento encontrado.
                    </td>
                  </tr>
                ) : (
                  eventosFiltrados.slice(0, 3).map((ev) => (
                    <tr key={ev.id}>
                      <td>
                        <strong>{ev.nome}</strong>
                        <small>
                          {ev.local}, {ev.uf}
                        </small>
                      </td>
                      <td>{ev.organizador}</td>
                      <td>
                        <Badge tone={tomStatus(ev.status)}>{ev.status}</Badge>
                      </td>
                      <td>{formatarMoeda(ev.custoRealizado)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </AsyncState>
    </section>
  );
}
