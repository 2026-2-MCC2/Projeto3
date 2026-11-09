import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import AsyncState from "../../components/admin/AsyncState.jsx";
import StatCard from "../../components/admin/StatCard.jsx";
import { buscarRelatorios } from "../../services/adminService.js";
import { formatarMoeda, formatarDataHora } from "../../utils/admin.js";
import "./RelatoriosAuditoria.css";

const PERIODOS = ["Últimos 30 dias", "Trimestre", "Semestre", "Ano"];

function exportarRelatorio(eventosPorPeriodo) {
  const cabecalho = ["Mês", "Eventos", "Custo"];
  const linhas = eventosPorPeriodo.map((e) => [e.mes, e.eventos, e.custo]);
  const csv = [cabecalho, ...linhas].map((linha) => linha.map((v) => `"${v}"`).join(";")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "relatorio-gerencial-trocaticket.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function notaTone(nota) {
  if (nota >= 90) return "success";
  if (nota >= 70) return "warning";
  return "danger";
}

export default function RelatoriosAuditoria() {
  const [estado, setEstado] = useState({ carregando: true, erro: "", dados: null });
  const [aba, setAba] = useState("gerenciais");
  const [periodo, setPeriodo] = useState("Trimestre");
  const [busca, setBusca] = useState("");

  function carregar() {
    setEstado({ carregando: true, erro: "", dados: null });
    buscarRelatorios()
      .then((dados) => setEstado({ carregando: false, erro: "", dados }))
      .catch((err) => setEstado({ carregando: false, erro: err.message, dados: null }));
  }

  useEffect(carregar, []);

  const termo = busca.trim().toLowerCase();
  const auditoriaFiltrada = useMemo(() => {
    if (!estado.dados) return [];
    if (!termo) return estado.dados.auditoria;
    return estado.dados.auditoria.filter(
      (a) => a.autor.toLowerCase().includes(termo) || a.acao.toLowerCase().includes(termo) || a.detalhe.toLowerCase().includes(termo)
    );
  }, [estado.dados, termo]);

  const maxEventos = estado.dados ? Math.max(...estado.dados.eventosPorPeriodo.map((e) => e.eventos)) : 1;
  const maxCusto = estado.dados ? Math.max(...estado.dados.eventosPorPeriodo.map((e) => e.custo)) : 1;
  const maxCustoOrganizador = estado.dados ? Math.max(...estado.dados.custoPorOrganizador.map((o) => o.valor)) : 1;
  const eventosNoPeriodo = estado.dados ? estado.dados.eventosPorPeriodo.reduce((s, e) => s + e.eventos, 0) : 0;
  const custoConsolidado = estado.dados ? estado.dados.eventosPorPeriodo.reduce((s, e) => s + e.custo, 0) : 0;

  return (
    <section aria-labelledby="relatorios-titulo">
      <AdminPageHeader
        title="Relatórios e Auditoria"
        searchPlaceholder="Buscar eventos, logs, orgs..."
        searchValue={busca}
        onSearchChange={setBusca}
        actions={
          estado.dados && (
            <button
              type="button"
              className="relatorios__exportar"
              onClick={() => exportarRelatorio(estado.dados.eventosPorPeriodo)}
            >
              <Download size={15} aria-hidden="true" /> Exportar relatório
            </button>
          )
        }
      />

      <div className="filter-chips relatorios__abas">
        <button
          type="button"
          className={`filter-chip${aba === "gerenciais" ? " filter-chip--active" : ""}`}
          onClick={() => setAba("gerenciais")}
        >
          Relatórios gerenciais
        </button>
        <button
          type="button"
          className={`filter-chip${aba === "auditoria" ? " filter-chip--active" : ""}`}
          onClick={() => setAba("auditoria")}
        >
          Histórico de auditoria
        </button>
      </div>

      <AsyncState loading={estado.carregando} error={estado.erro} onRetry={carregar}>
        {estado.dados && aba === "gerenciais" && (
          <>
            <div className="relatorios__gerenciais-head">
              <h2 className="admin-section-title">Relatórios gerenciais</h2>
              <div className="filter-chips">
                {PERIODOS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`filter-chip${periodo === p ? " filter-chip--active" : ""}`}
                    onClick={() => setPeriodo(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="stat-grid">
              <StatCard label="Eventos no período" value={eventosNoPeriodo} />
              <StatCard label="Custo consolidado" value={formatarMoeda(custoConsolidado)} />
              <StatCard label="Tempo médio de aprovação" value={`${estado.dados.kpis.tempoMedioAprovacaoDias} d`} />
              <StatCard label="Economia em cotações" value={formatarMoeda(estado.dados.kpis.economiaCotacoes)} />
            </div>

            <div className="relatorios__linha-dupla">
              <div className="admin-card relatorios__grafico">
                <div className="relatorios__grafico-head">
                  <h2 className="admin-section-title">Eventos e custos por período</h2>
                  <span className="relatorios__legenda">
                    <span className="relatorios__legenda-item">
                      <i className="relatorios__dot relatorios__dot--eventos" /> eventos
                    </span>
                    <span className="relatorios__legenda-item">
                      <i className="relatorios__dot relatorios__dot--custo" /> custo
                    </span>
                  </span>
                </div>
                <div className="relatorios__barras">
                  {estado.dados.eventosPorPeriodo.map((e) => (
                    <div className="relatorios__barra-grupo" key={e.mes}>
                      <span className="relatorios__barra-numero">{e.eventos}</span>
                      <div className="relatorios__barra-par">
                        <div
                          className="relatorios__barra relatorios__barra--eventos"
                          style={{ height: `${(e.eventos / maxEventos) * 100}%` }}
                        />
                        <div
                          className="relatorios__barra relatorios__barra--custo"
                          style={{ height: `${(e.custo / maxCusto) * 100}%` }}
                        />
                      </div>
                      <span className="relatorios__barra-mes">{e.mes}</span>
                      <span className="relatorios__barra-custo-label">{Math.round(e.custo / 1000)}k</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-card relatorios__custo-org">
                <h2 className="admin-section-title">Custo por organizador</h2>
                <ul>
                  {estado.dados.custoPorOrganizador.map((o) => (
                    <li key={o.nome}>
                      <div className="relatorios__custo-org-topo">
                        <span>{o.nome}</span>
                        <strong>{formatarMoeda(o.valor)}</strong>
                      </div>
                      <div className="relatorios__custo-org-barra">
                        <div
                          className="relatorios__custo-org-fill"
                          style={{ width: `${(o.valor / maxCustoOrganizador) * 100}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="relatorios__custo-org-total">
                  {estado.dados.custoPorOrganizador.length} organizadores ativos • Total:{" "}
                  {formatarMoeda(estado.dados.custoPorOrganizador.reduce((s, o) => s + o.valor, 0))}
                </p>
              </div>
            </div>

            <div className="admin-card relatorios__desempenho">
              <div className="relatorios__desempenho-head">
                <h2 className="admin-section-title">Desempenho de fornecedores</h2>
                <span>base do período</span>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th scope="col">Fornecedor</th>
                      <th scope="col">Cotações</th>
                      <th scope="col">Contratado</th>
                      <th scope="col">Tempo de resposta</th>
                      <th scope="col">Nota de desempenho</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estado.dados.desempenhoFornecedores.map((f) => (
                      <tr key={f.nome}>
                        <td>
                          <strong>{f.nome}</strong>
                        </td>
                        <td>{f.cotacoes}</td>
                        <td>{f.contratado}</td>
                        <td>{f.tempoRespostaDias.toLocaleString("pt-BR", { minimumFractionDigits: 1 })} d</td>
                        <td>
                          <div className="relatorios__nota">
                            <div className="relatorios__nota-barra">
                              <div
                                className={`relatorios__nota-fill relatorios__nota-fill--${notaTone(f.nota)}`}
                                style={{ width: `${f.nota}%` }}
                              />
                            </div>
                            <span>{f.nota}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {estado.dados && aba === "auditoria" && (
          <div className="admin-card relatorios__auditoria">
            <h2 className="admin-section-title relatorios__auditoria-titulo">Histórico de auditoria</h2>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th scope="col">Data / hora</th>
                    <th scope="col">Autor</th>
                    <th scope="col">Ação</th>
                    <th scope="col">Detalhe</th>
                  </tr>
                </thead>
                <tbody>
                  {auditoriaFiltrada.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="admin-empty-cell">
                        Nenhum registro encontrado para a busca atual.
                      </td>
                    </tr>
                  ) : (
                    auditoriaFiltrada.map((a) => (
                      <tr key={a.id}>
                        <td>{formatarDataHora(a.data)}</td>
                        <td>{a.autor}</td>
                        <td>{a.acao}</td>
                        <td>{a.detalhe}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </AsyncState>
    </section>
  );
}
