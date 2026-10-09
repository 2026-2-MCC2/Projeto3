import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import AsyncState from "../../components/admin/AsyncState.jsx";
import StatCard from "../../components/admin/StatCard.jsx";
import Badge from "../../components/admin/Badge.jsx";
import { buscarEventos } from "../../services/adminService.js";
import { tomStatus, formatarMoeda, formatarData } from "../../utils/admin.js";
import "./Eventos.css";

const STATUS = ["Todos", "Em produção", "Em cotação", "Planejamento", "Concluído", "Suspenso"];

function exportarCsv(eventos) {
  const cabecalho = ["Evento", "Status", "Organizador", "Data", "Previsto", "Realizado", "Cotações"];
  const linhas = eventos.map((ev) => [
    ev.nome,
    ev.status,
    ev.organizador,
    ev.data,
    ev.custoPrevisto,
    ev.custoRealizado,
    `${ev.cotacoesRespondidas}/${ev.cotacoesTotal}`,
  ]);
  const csv = [cabecalho, ...linhas].map((linha) => linha.map((v) => `"${v}"`).join(";")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "eventos-trocaticket.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function Eventos() {
  const [estado, setEstado] = useState({ carregando: true, erro: "", lista: [] });
  const [status, setStatus] = useState("Todos");
  const [busca, setBusca] = useState("");

  function carregar() {
    setEstado({ carregando: true, erro: "", lista: [] });
    buscarEventos()
      .then((lista) => setEstado({ carregando: false, erro: "", lista }))
      .catch((err) => setEstado({ carregando: false, erro: err.message, lista: [] }));
  }

  useEffect(carregar, []);

  const termo = busca.trim().toLowerCase();
  const filtrados = useMemo(
    () =>
      estado.lista.filter((ev) => {
        const bateStatus = status === "Todos" || ev.status === status;
        const bateBusca = !termo || ev.nome.toLowerCase().includes(termo) || ev.organizador.toLowerCase().includes(termo);
        return bateStatus && bateBusca;
      }),
    [estado.lista, status, termo]
  );

  const custoPrevistoTotal = estado.lista.reduce((soma, ev) => soma + ev.custoPrevisto, 0);
  const custoRealizadoTotal = estado.lista.reduce((soma, ev) => soma + ev.custoRealizado, 0);
  const percentualRealizado = custoPrevistoTotal ? Math.round((custoRealizadoTotal / custoPrevistoTotal) * 100) : 0;

  return (
    <section aria-labelledby="eventos-titulo">
      <AdminPageHeader
        title="Eventos"
        searchPlaceholder="Buscar evento, organizador..."
        searchValue={busca}
        onSearchChange={setBusca}
        actions={
          <span className="updated-pill">
            <span className="updated-pill__dot" aria-hidden="true" /> Atualizado há 2 min
          </span>
        }
      />

      <AsyncState loading={estado.carregando} error={estado.erro} onRetry={carregar}>
        <div className="stat-grid">
          <StatCard label="Eventos listados" value={estado.lista.length} />
          <StatCard label="Custo previsto" value={formatarMoeda(custoPrevistoTotal)} />
          <StatCard
            label="Custo realizado"
            value={formatarMoeda(custoRealizadoTotal)}
            helper={`${percentualRealizado}% do previsto`}
          />
        </div>

        <div className="admin-card eventos__card">
          <div className="eventos__card-head">
            <div className="filter-chips">
              {STATUS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`filter-chip${status === s ? " filter-chip--active" : ""}`}
                  onClick={() => setStatus(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            <button type="button" className="eventos__exportar" onClick={() => exportarCsv(filtrados)}>
              <Download size={15} aria-hidden="true" /> Exportar CSV
            </button>
          </div>

          <div className="eventos__resultado">
            <h2 className="admin-section-title">Eventos cadastrados</h2>
            <span>{filtrados.length} resultados</span>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Evento</th>
                  <th scope="col">Status</th>
                  <th scope="col">Organizador</th>
                  <th scope="col">Data</th>
                  <th scope="col">Previsto</th>
                  <th scope="col">Realizado</th>
                  <th scope="col">Cotações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="admin-empty-cell">
                      Nenhum evento encontrado para os filtros atuais.
                    </td>
                  </tr>
                ) : (
                  filtrados.map((ev) => {
                    const percentualCotacoes = ev.cotacoesTotal
                      ? Math.round((ev.cotacoesRespondidas / ev.cotacoesTotal) * 100)
                      : 0;
                    return (
                      <tr key={ev.id}>
                        <td>
                          <strong>{ev.nome}</strong>
                          <small>
                            {ev.local}, {ev.uf}
                          </small>
                        </td>
                        <td>
                          <Badge tone={tomStatus(ev.status)}>{ev.status}</Badge>
                        </td>
                        <td>{ev.organizador}</td>
                        <td>{formatarData(ev.data)}</td>
                        <td>{formatarMoeda(ev.custoPrevisto)}</td>
                        <td>{formatarMoeda(ev.custoRealizado)}</td>
                        <td>
                          <div className="eventos__progresso">
                            <div className="eventos__progresso-barra">
                              <div className="eventos__progresso-fill" style={{ width: `${percentualCotacoes}%` }} />
                            </div>
                            <span>
                              {ev.cotacoesRespondidas}/{ev.cotacoesTotal}
                            </span>
                          </div>
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
