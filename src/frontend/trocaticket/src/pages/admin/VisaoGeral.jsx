import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Banknote, CalendarRange, ClipboardCheck, Clock, PiggyBank } from "lucide-react";
import { ChartCard } from "../../components/admin/ChartCard.jsx";
import { ExportMenu } from "../../components/admin/ExportMenu.jsx";
import { Avatar, EmptyState, KpiCard, MiniBar, PageHeader, Pill, QueryBoundary, Segmented } from "../../components/admin/ui.jsx";
import { statusTone } from "../../utils/admin/status.js";
import { useAdminQuery } from "../../hooks/useAdminQuery.js";
import { useExporter } from "../../hooks/useExporter.js";
import { listarCotacoes, listarEventos, listarPendentes, obterSerie } from "../../services/adminApi.js";
import { economia } from "../../services/adminCalculos.js";
import { STATUS_EVENTO } from "../../services/adminSeed.js";
import { formatBRL, formatBRLCompact, formatPct } from "../../utils/admin/format.js";
import "./VisaoGeral.css";

const PERIODOS = [
  { value: "30d", label: "Últimos 30 dias" },
  { value: "trimestre", label: "Este trimestre" },
  { value: "ano", label: "Ano 2026" },
];

/** Números derivados dos dados brutos (usados na tela e na exportação). */
function calcular({ pendentes, eventos, cotacoes, serie }) {
  const gmv = serie[serie.length - 1].gmv;
  const gmvAnterior = serie.length > 1 ? serie[serie.length - 2].gmv : gmv;
  const ativos = eventos.filter((e) => e.status !== "Concluído" && e.status !== "Suspenso");
  const economiaMedia = cotacoes.reduce((s, c) => s + economia(c).pct, 0) / cotacoes.length;
  return {
    gmv,
    variacao: ((gmv - gmvAnterior) / gmvAnterior) * 100,
    ativos,
    cotacoesAbertas: cotacoes.filter((c) => c.situacao !== "Encerrada"),
    economiaMedia,
    economiaValor: cotacoes.reduce((s, c) => s + economia(c).valor, 0),
    resumo: [
      { label: "Volume transacionado", value: formatBRL(gmv) },
      { label: "Cadastros pendentes", value: String(pendentes.length) },
      { label: "Eventos ativos", value: String(ativos.length) },
      { label: "Economia média", value: formatPct(economiaMedia) },
    ],
  };
}

export default function VisaoGeral() {
  const [periodo, setPeriodo] = useState("trimestre");
  const { pdf, csv } = useExporter();
  const query = useAdminQuery(
    () => Promise.all([listarPendentes(), listarEventos(), listarCotacoes(), obterSerie(periodo)]).then(([pendentes, eventos, cotacoes, serie]) => ({ pendentes, eventos, cotacoes, serie })),
    [periodo],
  );

  return (
    <>
      <PageHeader
        eyebrow={<span className="adm-eyebrow">Painel executivo · {PERIODOS.find((p) => p.value === periodo).label}</span>}
        title="Visão geral"
        description="Métricas da plataforma, fila de aprovações e o andamento dos eventos em um só lugar."
        actions={
          <>
            <Segmented label="Período" options={PERIODOS} value={periodo} onChange={setPeriodo} />
            {query.data && (
              <ExportMenu
                label="Exportar resumo"
                variant="primary"
                onPDF={() => exportarPDF(pdf, query.data, periodo)}
                onCSV={() => csv("visao-geral", [{ key: "label", label: "Indicador" }, { key: "value", label: "Valor" }], calcular(query.data).resumo)}
              />
            )}
          </>
        }
      />
      <QueryBoundary query={query}>{(dados) => <Conteudo dados={dados} />}</QueryBoundary>
    </>
  );
}

function exportarPDF(pdf, dados, periodo) {
  const { resumo } = calcular(dados);
  return pdf({
    title: "Visão geral",
    subtitle: `Resumo executivo · ${PERIODOS.find((p) => p.value === periodo).label}`,
    summary: resumo,
    tables: [
      {
        title: "Custos por período",
        columns: [
          { key: "periodo", label: "Período" },
          { key: "previsto", label: "Previsto", format: (v) => formatBRL(Number(v)) },
          { key: "realizado", label: "Realizado", format: (v) => formatBRL(Number(v)) },
          { key: "eventos", label: "Eventos" },
        ],
        rows: dados.serie,
      },
      {
        title: "Fila de aprovações",
        columns: [
          { key: "nome", label: "Empresa" },
          { key: "tipo", label: "Tipo" },
          { key: "cnpj", label: "CNPJ" },
          { key: "horasNaFila", label: "Horas na fila" },
        ],
        rows: dados.pendentes,
      },
    ],
  });
}

function Conteudo({ dados }) {
  const { pendentes, eventos, serie } = dados;
  const { gmv, variacao, ativos, cotacoesAbertas, economiaMedia, economiaValor } = calcular(dados);

  const porStatus = useMemo(
    () =>
      STATUS_EVENTO.map((s) => ({
        status: s,
        eventos: eventos.filter((e) => e.status === s).length,
        previsto: eventos.filter((e) => e.status === s).reduce((a, e) => a + e.previsto, 0),
      })),
    [eventos],
  );

  const destaque = [...ativos].sort((a, b) => b.previsto - a.previsto).slice(0, 4);

  return (
    <>
      <div className="adm-grid adm-grid--kpi">
        <KpiCard
          label="Volume transacionado (GMV)"
          value={formatBRLCompact(gmv)}
          icon={Banknote}
          tone="brand"
          hint={
            <span>
              <strong className={variacao >= 0 ? "adm-text-success" : "adm-text-danger"}>
                {variacao >= 0 ? "▲" : "▼"} {formatPct(Math.abs(variacao))}
              </strong>{" "}
              vs. período anterior
            </span>
          }
        />
        <KpiCard
          label="Cadastros pendentes"
          value={pendentes.length}
          unit="na fila"
          icon={ClipboardCheck}
          tone="warning"
          delay={60}
          hint={
            <Link to="/admin/aprovacoes" className="adm-link vg-link">
              {pendentes.some((p) => p.horasNaFila > 24) ? "SLA crítico · ver fila" : "Ver fila"} <ArrowRight aria-hidden="true" />
            </Link>
          }
        />
        <KpiCard
          label="Eventos ativos"
          value={ativos.length}
          unit="em andamento"
          icon={CalendarRange}
          tone="primary"
          delay={120}
          hint={
            <div className="adm-chips">
              {["Em produção", "Em cotação", "Planejamento"].map((s) => (
                <Pill key={s} tone={statusTone(s)}>
                  {eventos.filter((e) => e.status === s).length} {s}
                </Pill>
              ))}
            </div>
          }
        />
        <KpiCard
          label="Economia em cotações"
          value={formatBRLCompact(economiaValor)}
          icon={PiggyBank}
          tone="success"
          delay={180}
          hint={`${cotacoesAbertas.length} cotações abertas · ${formatPct(economiaMedia)} de economia média`}
        />
      </div>

      <div className="adm-grid adm-grid--2-1 adm-mt">
        <ChartCard
          title="Eventos e custos por período"
          description="Custos orçados versus liquidados"
          data={serie}
          xKey="periodo"
          xLabel="Período"
          series={[
            { key: "previsto", label: "Previsto" },
            { key: "realizado", label: "Realizado" },
          ]}
          types={["area", "line", "bar", "stacked", "radar", "table"]}
          valueFormat={formatBRL}
          axisFormat={formatBRLCompact}
          height={300}
        />

        <section className="adm-panel adm-panel--pad adm-rise vg-destaque">
          <div className="adm-row adm-row--between">
            <h3>Eventos em destaque</h3>
            <span className="adm-eyebrow">Execução</span>
          </div>
          <ul>
            {destaque.map((e) => {
              const pct = (e.realizado / e.previsto) * 100;
              return (
                <li key={e.id}>
                  <Link to={`/admin/eventos/${e.id}`}>
                    <div className="adm-row adm-row--between">
                      <strong>{e.nome}</strong>
                      <span className="adm-mono adm-strong adm-text-primary">{Math.round(pct)}%</span>
                    </div>
                    <MiniBar value={pct} tone="brand" />
                    <div className="adm-row adm-row--between vg-destaque__meta">
                      <span className="adm-mono adm-tabular">
                        {formatBRLCompact(e.realizado)} / {formatBRLCompact(e.previsto)}
                      </span>
                      <Pill tone={statusTone(e.status)}>{e.status}</Pill>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link to="/admin/eventos" className="adm-btn adm-btn--primary vg-destaque__cta">
            Gerenciar todos os eventos <ArrowRight aria-hidden="true" />
          </Link>
        </section>
      </div>

      <div className="adm-grid adm-grid--2-1 adm-mt">
        <section className="adm-panel adm-panel--pad adm-rise">
          <div className="adm-row adm-row--between" style={{ marginBottom: 20 }}>
            <div className="adm-row">
              <h3>Fila de aprovações</h3>
              <Pill tone="danger">{pendentes.length} aguardando</Pill>
            </div>
            <Link to="/admin/relatorios?aba=auditoria" className="adm-link">
              Ver histórico completo
            </Link>
          </div>
          {pendentes.length === 0 ? (
            <EmptyState>Nenhum cadastro aguardando análise. 🎉</EmptyState>
          ) : (
            <ul className="vg-fila">
              {pendentes.map((p) => {
                const critico = p.horasNaFila > 24;
                return (
                  <li key={p.id}>
                    <Avatar name={p.nome} tone="neutral" />
                    <div className="vg-fila__info">
                      <div className="adm-row" style={{ gap: 8 }}>
                        <strong>{p.nome}</strong>
                        <Pill tone={p.tipo === "Organizador" ? "brand" : "neutral"}>{p.tipo}</Pill>
                      </div>
                      <div className="vg-fila__meta">
                        <span className="adm-mono">{p.cnpj}</span>
                        <span className={critico ? "adm-text-danger adm-strong" : ""}>
                          <Clock aria-hidden="true" /> {p.horasNaFila}h na fila{critico && " · alerta de SLA"}
                        </span>
                      </div>
                    </div>
                    <Link to={`/admin/aprovacoes?id=${p.id}`} className="adm-btn adm-btn--secondary adm-btn--sm">
                      Avaliar <ArrowRight aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <ChartCard
          title="Eventos por status"
          description="Distribuição do pipeline atual"
          data={porStatus}
          xKey="status"
          xLabel="Status"
          series={[
            { key: "eventos", label: "Eventos", format: (n) => String(n) },
            { key: "previsto", label: "Orçamento previsto", format: formatBRL },
          ]}
          types={["donut", "pie", "horizontal", "table"]}
          valueFormat={(n) => (n > 1000 ? formatBRL(n) : String(n))}
          height={260}
        />
      </div>
    </>
  );
}
