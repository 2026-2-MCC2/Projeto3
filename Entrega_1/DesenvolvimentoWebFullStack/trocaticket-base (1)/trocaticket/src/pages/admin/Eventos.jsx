import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Banknote, CalendarRange, ChevronRight, ClipboardCheck, MapPin, Wallet } from "lucide-react";
import { ChartCard } from "../../components/admin/ChartCard.jsx";
import { ExportMenu } from "../../components/admin/ExportMenu.jsx";
import { FilterChips, KpiCard, MiniBar, PageHeader, Pill, QueryBoundary } from "../../components/admin/ui.jsx";
import { statusTone } from "../../utils/admin/status.js";
import { useAdminQuery } from "../../hooks/useAdminQuery.js";
import { useExporter } from "../../hooks/useExporter.js";
import { listarEventos } from "../../services/adminApi.js";
import { STATUS_EVENTO } from "../../services/adminSeed.js";
import { formatBRL, formatBRLCompact, formatDate, formatNumber, formatPct } from "../../utils/admin/format.js";
import "./Eventos.css";

const COLUNAS = [
  { key: "nome", label: "Evento" },
  { key: "status", label: "Status" },
  { key: "organizador", label: "Organizador" },
  { key: "cidade", label: "Cidade", format: (_, e) => `${e.cidade}/${e.uf}` },
  { key: "data", label: "Data", format: (v) => formatDate(String(v)) },
  { key: "publico", label: "Público" },
  { key: "previsto", label: "Previsto", format: (v) => formatBRL(Number(v)) },
  { key: "realizado", label: "Realizado", format: (v) => v == null ? "Não disponível" : formatBRL(Number(v)) },
  { key: "execucao", label: "Execução", format: (_, e) => e.realizado == null ? "Não disponível" : formatPct((e.realizado / e.previsto) * 100, 0) },
];

export default function Eventos() {
  const query = useAdminQuery(() => listarEventos().then((eventos) => ({ eventos, cotacoes: [] })));
  return <QueryBoundary query={query}>{({ eventos, cotacoes }) => <Conteudo eventos={eventos} cotacoes={cotacoes} />}</QueryBoundary>;
}

function Conteudo({ eventos, cotacoes }) {
  const { pdf, csv } = useExporter();
  const [status, setStatus] = useState("todos");
  const lista = useMemo(() => eventos.filter((e) => status === "todos" || e.status === status), [eventos, status]);

  const previsto = eventos.reduce((s, e) => s + e.previsto, 0);
  const possuiRealizado = eventos.some((evento) => evento.realizado != null);
  const realizado = eventos.reduce((s, e) => s + (e.realizado ?? 0), 0);
  const publico = eventos.reduce((s, e) => s + e.publico, 0);
  const cotacoesDo = (id) => {
    const cs = cotacoes.filter((c) => c.eventoId === id);
    return { total: cs.length, fechadas: cs.filter((c) => c.situacao === "Encerrada").length };
  };

  const porEvento = lista.map((e) => ({ evento: e.nome, previsto: e.previsto, realizado: e.realizado ?? 0 }));

  const porOrganizador = useMemo(() => {
    const m = new Map();
    eventos.forEach((e) => {
      const r = m.get(e.organizador) ?? { organizador: e.organizador, previsto: 0, realizado: 0, eventos: 0, publico: 0 };
      r.previsto += e.previsto;
      r.realizado += e.realizado ?? 0;
      r.eventos += 1;
      r.publico += e.publico;
      m.set(e.organizador, r);
    });
    return [...m.values()].sort((a, b) => b.previsto - a.previsto);
  }, [eventos]);

  return (
    <>
      <PageHeader
        title="Eventos"
        description="Status, organizadores, custos e andamento dos eventos. Dados de cotações ainda não são disponibilizados pela API."
        actions={
          <ExportMenu
            label="Exportar eventos"
            variant="primary"
            onPDF={() =>
              pdf({
                title: "Eventos cadastrados",
                subtitle: `Filtro: ${status === "todos" ? "todos os status" : status}`,
                orientation: "landscape",
                summary: [
                  { label: "Eventos", value: String(lista.length) },
                  { label: "Custo previsto", value: formatBRLCompact(previsto) },
                  { label: "Custo realizado", value: possuiRealizado ? formatBRLCompact(realizado) : "Não disponível" },
                  { label: "Público esperado", value: formatNumber(publico) },
                ],
                tables: [{ columns: COLUNAS, rows: lista }],
              })
            }
            onCSV={() => csv("eventos", COLUNAS, lista)}
          />
        }
      />

      <div className="adm-grid adm-grid--kpi">
        <KpiCard label="Eventos cadastrados" value={eventos.length} unit="eventos" icon={CalendarRange} hint={`Capacidade de ${formatNumber(publico)} espectadores`} />
        <KpiCard label="Custo previsto consolidado" value={formatBRLCompact(previsto)} icon={Wallet} tone="primary" hint="Orçamento aprovado nos editais" delay={60} />
        <KpiCard label="Custo realizado" value={possuiRealizado ? formatBRLCompact(realizado) : "—"} icon={Banknote} tone="brand" progress={possuiRealizado && previsto > 0 ? (realizado / previsto) * 100 : 0} hint={possuiRealizado ? `${formatPct((realizado / previsto) * 100)} liquidado até hoje` : "A API ainda não registra pagamentos realizados."} delay={120} />
        <KpiCard label="Cotações fechadas" value="—" icon={ClipboardCheck} tone="success" hint="A API ainda não disponibiliza dados de cotações." delay={180} />
      </div>

      <div className="adm-grid adm-grid--3-2 adm-mt">
        <ChartCard
          title="Previsto × realizado por evento"
          description="Valores em R$ dos eventos filtrados"
          data={porEvento}
          xKey="evento"
          xLabel="Evento"
          series={[
            { key: "previsto", label: "Previsto" },
            { key: "realizado", label: "Realizado" },
          ]}
          types={["horizontal", "bar", "line", "radar", "table"]}
          valueFormat={formatBRL}
          axisFormat={formatBRLCompact}
          height={340}
          footer="A API disponibiliza os custos previstos; pagamentos realizados ainda não são registrados."
        />
        <ChartCard
          title="Custo previsto por organizador"
          description="Volume financeiro alocado por parceiro"
          data={porOrganizador}
          xKey="organizador"
          xLabel="Organizador"
          series={[
            { key: "previsto", label: "Previsto", format: formatBRL },
            { key: "realizado", label: "Realizado", format: formatBRL },
            { key: "publico", label: "Público", format: formatNumber },
          ]}
          types={["donut", "pie", "horizontal", "table"]}
          valueFormat={formatNumber}
          height={340}
        />
      </div>

      <div className="adm-row adm-row--between adm-mt" style={{ marginBottom: 12 }}>
        <FilterChips
          label="Status do evento"
          value={status}
          onChange={setStatus}
          options={[
            { value: "todos", label: "Todos", count: eventos.length },
            ...STATUS_EVENTO.map((s) => ({ value: s, label: s, count: eventos.filter((e) => e.status === s).length })),
          ]}
        />
        <span className="adm-muted" style={{ fontSize: "0.875rem" }}>
          Mostrando <b style={{ color: "var(--adm-fg)" }}>{lista.length}</b> eventos
        </span>
      </div>

      <section className="adm-panel adm-panel--flush">
        <div className="adm-table-wrap">
          <table className="adm-table adm-table--wide">
            <thead>
              <tr>
                <th scope="col">Evento</th>
                <th scope="col">Status</th>
                <th scope="col">Organizador</th>
                <th scope="col">Data</th>
                <th scope="col" className="adm-right">Previsto</th>
                <th scope="col">Execução do custo</th>
                <th scope="col">Cotações</th>
                <th scope="col">
                  <span className="adm-sr-only">Abrir</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {lista.map((e) => {
                const pct = e.realizado == null || !e.previsto ? null : (e.realizado / e.previsto) * 100;
                const c = cotacoesDo(e.id);
                return (
                  <tr key={e.id} className="evt-linha">
                    <td>
                      <Link to={`/admin/eventos/${e.id}`} className="adm-strong evt-nome">
                        {e.nome}
                      </Link>
                      <div className="evt-local">
                        <MapPin aria-hidden="true" /> {e.cidade}, {e.uf} · {formatNumber(e.publico)} pax
                      </div>
                    </td>
                    <td>
                      <Pill tone={statusTone(e.status)} dot>
                        {e.status}
                      </Pill>
                    </td>
                    <td className="adm-strong">{e.organizador}</td>
                    <td>{formatDate(e.data)}</td>
                    <td className="adm-right adm-mono adm-tabular adm-strong">{formatBRL(e.previsto)}</td>
                    <td>
                      <div style={{ width: 160 }}>
                        <div className="adm-row adm-row--between adm-mono" style={{ fontSize: "0.75rem", marginBottom: 4 }}>
                          <span>{e.realizado == null ? "—" : formatBRLCompact(e.realizado)}</span>
                          <span className={e.status === "Suspenso" ? "adm-text-danger" : "adm-muted"}>{pct === null ? "—" : `${Math.round(pct)}%`}</span>
                        </div>
                        <MiniBar value={pct ?? 0} tone={e.status === "Suspenso" ? "danger" : pct >= 100 ? "primary" : "brand"} />
                      </div>
                    </td>
                    <td className="adm-mono" style={{ fontSize: "0.75rem" }}>{c.total ? `${c.fechadas}/${c.total}` : "—"}</td>
                    <td className="adm-right">
                      <Link to={`/admin/eventos/${e.id}`} aria-label={`Abrir ${e.nome}`} className="evt-abrir">
                        <ChevronRight aria-hidden="true" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {lista.length === 0 && (
                <tr>
                  <td colSpan={8} className="adm-table-empty">
                    Nenhum evento com este status.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
