import { useEffect, useMemo, useState } from "react";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import AsyncState from "../../components/admin/AsyncState.jsx";
import StatCard from "../../components/admin/StatCard.jsx";
import Badge from "../../components/admin/Badge.jsx";
import { buscarCotacoes } from "../../services/adminService.js";
import { tomStatus, formatarMoeda, formatarData } from "../../utils/admin.js";
import "./Cotacoes.css";

const SITUACOES = ["Todas", "Aberta", "Vencendo", "Vencida", "Encerrada"];

export default function Cotacoes() {
  const [estado, setEstado] = useState({ carregando: true, erro: "", lista: [] });
  const [situacao, setSituacao] = useState("Todas");
  const [busca, setBusca] = useState("");

  function carregar() {
    setEstado({ carregando: true, erro: "", lista: [] });
    buscarCotacoes()
      .then((lista) => setEstado({ carregando: false, erro: "", lista }))
      .catch((err) => setEstado({ carregando: false, erro: err.message, lista: [] }));
  }

  useEffect(carregar, []);

  const termo = busca.trim().toLowerCase();
  const filtradas = useMemo(
    () =>
      estado.lista.filter((c) => {
        const bateSituacao = situacao === "Todas" || c.situacao === situacao;
        const bateBusca =
          !termo || c.titulo.toLowerCase().includes(termo) || c.evento.toLowerCase().includes(termo) || c.codigo.toLowerCase().includes(termo);
        return bateSituacao && bateBusca;
      }),
    [estado.lista, situacao, termo]
  );

  const abertas = estado.lista.filter((c) => c.situacao === "Aberta").length;
  const vencendo = estado.lista.filter((c) => c.situacao === "Vencendo").length;
  const vencidas = estado.lista.filter((c) => c.situacao === "Vencida").length;
  const respostasRecebidas = estado.lista.reduce((soma, c) => soma + c.respostasRecebidas, 0);

  return (
    <section aria-labelledby="cotacoes-titulo">
      <AdminPageHeader
        title="Cotações"
        actions={
          <span className="updated-pill">
            <span className="updated-pill__dot" aria-hidden="true" /> Atualizado há 2 min
          </span>
        }
      />

      <AsyncState loading={estado.carregando} error={estado.erro} onRetry={carregar}>
        <div className="stat-grid">
          <StatCard label="Abertas" value={abertas} />
          <StatCard label="Vencendo em 48h" value={vencendo} />
          <StatCard label="Vencidas sem decisão" value={vencidas} />
          <StatCard label="Respostas recebidas" value={respostasRecebidas} />
        </div>

        <div className="admin-card cotacoes__card">
          <div className="cotacoes__card-head">
            <h2 className="admin-section-title">Cotações em acompanhamento</h2>
            <label className="admin-page-header__search">
              <input
                type="search"
                placeholder="Buscar cotação..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                aria-label="Buscar cotação"
              />
            </label>
          </div>

          <div className="filter-chips cotacoes__filtros">
            {SITUACOES.map((s) => (
              <button
                key={s}
                type="button"
                className={`filter-chip${situacao === s ? " filter-chip--active" : ""}`}
                onClick={() => setSituacao(s)}
              >
                {s}
                {s === "Todas" && ` (${estado.lista.length})`}
              </button>
            ))}
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Cotação</th>
                  <th scope="col">Evento / organizador</th>
                  <th scope="col">Situação</th>
                  <th scope="col">Respostas</th>
                  <th scope="col">Melhor proposta</th>
                  <th scope="col">Prazo</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="admin-empty-cell">
                      Nenhuma cotação encontrada para os filtros atuais.
                    </td>
                  </tr>
                ) : (
                  filtradas.map((c) => {
                    const percentual = c.respostasTotal ? Math.round((c.respostasRecebidas / c.respostasTotal) * 100) : 0;
                    return (
                      <tr key={c.id}>
                        <td>
                          <strong>{c.titulo}</strong>
                          <small>{c.codigo}</small>
                        </td>
                        <td>
                          <strong>{c.evento}</strong>
                          <small>{c.organizador}</small>
                        </td>
                        <td>
                          <Badge tone={tomStatus(c.situacao)}>{c.situacao}</Badge>
                        </td>
                        <td>
                          <div className="cotacoes__progresso">
                            <div className="cotacoes__progresso-barra">
                              <div
                                className={`cotacoes__progresso-fill cotacoes__progresso-fill--${tomStatus(c.situacao)}`}
                                style={{ width: `${percentual}%` }}
                              />
                            </div>
                            <span>
                              {c.respostasRecebidas}/{c.respostasTotal}
                            </span>
                          </div>
                        </td>
                        <td>{formatarMoeda(c.melhorProposta)}</td>
                        <td>
                          <strong>{formatarData(c.prazo)}</strong>
                          <small className={`cotacoes__prazo-msg cotacoes__prazo-msg--${tomStatus(c.situacao)}`}>
                            {c.prazoMensagem}
                          </small>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </AsyncState>
    </section>
  );
}
