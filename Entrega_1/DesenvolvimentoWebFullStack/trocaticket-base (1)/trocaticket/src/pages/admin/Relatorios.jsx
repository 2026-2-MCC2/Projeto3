import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ClipboardList, History, Play, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { ChartCard } from "../../components/admin/ChartCard.jsx";
import { ExportMenu } from "../../components/admin/ExportMenu.jsx";
import { Button, EmptyState, PageHeader, Pill, QueryBoundary, Segmented } from "../../components/admin/ui.jsx";
import { statusTone } from "../../utils/admin/status.js";
import { useAdminQuery } from "../../hooks/useAdminQuery.js";
import { useExporter } from "../../hooks/useExporter.js";
import { listarAuditoria, obterDatasetRelatorios } from "../../services/adminApi.js";
import { FONTES, MODELOS, executarConsulta, fonteById, opcoesFiltro } from "../../services/adminRelatorios.js";
import { formatBRL, formatBRLCompact, formatDateTime, formatNumber } from "../../utils/admin/format.js";
import "./Relatorios.css";

const ABAS = [
  { value: "gerador", label: "Gerador de relatórios" },
  { value: "auditoria", label: "Auditoria" },
];

export default function Relatorios() {
  const [params, setParams] = useSearchParams();
  const aba = params.get("aba") === "auditoria" ? "auditoria" : "gerador";
  const mudarAba = (v) => setParams(v === "gerador" ? {} : { aba: v }, { replace: true });

  return (
    <>
      <PageHeader
        eyebrow={<span className="adm-eyebrow">Gestão & controle</span>}
        title="Relatórios e auditoria"
        description="Consulte cadastros, eventos e valores do planejamento. Vendas, propostas e mensagens ainda não são disponibilizadas pela API."
        actions={<Segmented label="Seção" options={ABAS} value={aba} onChange={mudarAba} />}
      />
      {aba === "gerador" ? <Gerador /> : <Auditoria />}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Gerador de relatórios                                              */
/* ------------------------------------------------------------------ */

const CONSULTA_INICIAL = MODELOS[0].consulta;

function Gerador() {
  const query = useAdminQuery(obterDatasetRelatorios);
  return <QueryBoundary query={query} linhasSkeleton={2}>{(dataset) => <Construtor dataset={dataset} />}</QueryBoundary>;
}

function Construtor({ dataset }) {
  const { pdf, csv } = useExporter();
  // `rascunho` é o que o usuário está montando; `consulta` só muda ao clicar em "Gerar relatório".
  const [rascunho, setRascunho] = useState({ ...CONSULTA_INICIAL, ordenar: "valor-desc", limite: 0 });
  const [consulta, setConsulta] = useState(rascunho);

  const fonte = fonteById(rascunho.fonte);
  const linhas = useMemo(() => executarConsulta(consulta, dataset), [consulta, dataset]);
  const fonteGerada = fonteById(consulta.fonte);
  const metricasGeradas = fonteGerada.metricas.filter((m) => consulta.metricas.includes(m.id));
  const dimensaoGerada = fonteGerada.dimensoes.find((d) => d.id === consulta.dimensao);
  const mudou = JSON.stringify(rascunho) !== JSON.stringify(consulta);

  function aplicarModelo(modelo) {
    const nova = { ordenar: "valor-desc", limite: 0, ...modelo.consulta };
    setRascunho(nova);
    setConsulta(nova);
  }

  function trocarFonte(id) {
    const f = fonteById(id);
    setRascunho({ fonte: id, dimensao: f.dimensoes[0].id, metricas: [f.metricas[0].id], filtros: {}, ordenar: "valor-desc", limite: 0 });
  }

  function alternarMetrica(id) {
    setRascunho((r) => {
      const tem = r.metricas.includes(id);
      if (tem && r.metricas.length === 1) return r; // pelo menos uma métrica
      return { ...r, metricas: tem ? r.metricas.filter((m) => m !== id) : [...r.metricas, id] };
    });
  }

  const formatoMetrica = (m) => (m.moeda ? formatBRL : formatNumber);
  const series = metricasGeradas.map((m) => ({ key: m.id, label: m.label, format: formatoMetrica(m) }));
  const soMoeda = metricasGeradas.every((m) => m.moeda);
  const escalasMistas = metricasGeradas.some((m) => m.moeda) && !soMoeda;
  const colunas = [{ key: "rotulo", label: dimensaoGerada.label }, ...series.map((s) => ({ key: s.key, label: s.label, format: (v) => s.format(Number(v)) }))];
  const tituloRelatorio = `${fonteGerada.label} por ${dimensaoGerada.label.toLowerCase()}`;

  return (
    <div className="rel-layout">
      <aside className="adm-stack adm-stack--sm" aria-label="Montar consulta">
        <section className="adm-panel adm-panel--pad">
          <div className="adm-eyebrow" style={{ marginBottom: 12 }}>Modelos prontos</div>
          <div className="rel-modelos">
            {MODELOS.map((m) => (
              <button key={m.id} type="button" onClick={() => aplicarModelo(m)}>
                <strong>{m.titulo}</strong>
                <span>{m.descricao}</span>
              </button>
            ))}
          </div>
        </section>

        <form
          className="adm-panel adm-panel--pad adm-stack adm-stack--sm"
          onSubmit={(e) => {
            e.preventDefault();
            setConsulta(rascunho);
          }}
        >
          <div className="adm-row" style={{ flexWrap: "nowrap" }}>
            <div className="adm-icon-tile">
              <SlidersHorizontal aria-hidden="true" />
            </div>
            <h3 style={{ fontSize: "1.05rem" }}>Montar consulta</h3>
          </div>

          <fieldset className="rel-fieldset">
            <legend className="adm-label">1 · Fonte de dados</legend>
            <div className="rel-fontes">
              {FONTES.map((f) => (
                <label key={f.id} className={rascunho.fonte === f.id ? "is-on" : ""}>
                  <input type="radio" name="fonte" value={f.id} checked={rascunho.fonte === f.id} onChange={() => trocarFonte(f.id)} />
                  <strong>{f.label}</strong>
                  <span>{f.descricao}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="adm-field">
            <label htmlFor="rel-dimensao">2 · Agrupar por</label>
            <select id="rel-dimensao" className="adm-select" value={rascunho.dimensao} onChange={(e) => setRascunho({ ...rascunho, dimensao: e.target.value })}>
              {fonte.dimensoes.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <fieldset className="rel-fieldset">
            <legend className="adm-label">3 · Métricas</legend>
            <div className="adm-chips">
              {fonte.metricas.map((m) => (
                <button key={m.id} type="button" className="adm-chip" aria-pressed={rascunho.metricas.includes(m.id)} onClick={() => alternarMetrica(m.id)}>
                  {m.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="rel-fieldset">
            <legend className="adm-label">4 · Filtros</legend>
            <div className="rel-filtros">
              {fonte.filtros.map((f) => (
                <div className="adm-field" key={f.id}>
                  <label htmlFor={`rel-f-${f.id}`}>{f.label}</label>
                  <select
                    id={`rel-f-${f.id}`}
                    className="adm-select"
                    value={rascunho.filtros[f.id] ?? "todos"}
                    onChange={(e) => setRascunho({ ...rascunho, filtros: { ...rascunho.filtros, [f.id]: e.target.value } })}
                  >
                    <option value="todos">Todos</option>
                    {opcoesFiltro(rascunho.fonte, f.id, dataset).map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </fieldset>

          <div className="rel-filtros">
            <div className="adm-field">
              <label htmlFor="rel-ordem">Ordenar por</label>
              <select id="rel-ordem" className="adm-select" value={rascunho.ordenar} onChange={(e) => setRascunho({ ...rascunho, ordenar: e.target.value })}>
                <option value="valor-desc">Maior valor</option>
                <option value="valor-asc">Menor valor</option>
                <option value="rotulo">Ordem alfabética</option>
              </select>
            </div>
            <div className="adm-field">
              <label htmlFor="rel-limite">Mostrar</label>
              <select id="rel-limite" className="adm-select" value={rascunho.limite} onChange={(e) => setRascunho({ ...rascunho, limite: Number(e.target.value) })}>
                <option value={0}>Todos</option>
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
              </select>
            </div>
          </div>

          <div className="adm-row" style={{ gap: 8 }}>
            <Button type="submit" icon={Play} style={{ flex: 1 }}>
              Gerar relatório
            </Button>
            <Button variant="outline" icon={RotateCcw} aria-label="Limpar consulta" onClick={() => aplicarModelo(MODELOS[0])} />
          </div>
          {mudou && <p className="adm-help" role="status">Você alterou a consulta. Clique em “Gerar relatório” para atualizar.</p>}
        </form>
      </aside>

      <div className="adm-stack">
        {linhas.length === 0 ? (
          <div className="adm-panel adm-panel--pad">
            <EmptyState>Nenhum resultado para esta combinação de filtros. Ajuste a consulta e gere novamente.</EmptyState>
          </div>
        ) : (
          <>
            <ChartCard
              key={`${consulta.fonte}-${consulta.dimensao}-${consulta.metricas.join(",")}`}
              title={tituloRelatorio}
              description={`${fonteGerada.label} · ${linhas.length} grupo${linhas.length > 1 ? "s" : ""}${Object.entries(consulta.filtros).filter(([, v]) => v && v !== "todos").map(([k, v]) => ` · ${k}: ${v}`).join("")}`}
              data={linhas}
              xKey="rotulo"
              xLabel={dimensaoGerada.label}
              series={series}
              types={["bar", "horizontal", "stacked", "line", "area", "pie", "donut", "radar", "table"]}
              valueFormat={soMoeda ? formatBRL : formatNumber}
              axisFormat={soMoeda ? formatBRLCompact : formatNumber}
              height={340}
              exportName={tituloRelatorio}
              footer={escalasMistas ? "Atenção: as métricas combinam valores em R$ com contagens; compare-as na tabela para evitar leituras enganosas." : "Troque o formato do gráfico nos ícones acima e exporte em PDF, CSV ou PNG."}
            />
            <section className="adm-panel adm-panel--flush">
              <div className="adm-row adm-row--between" style={{ padding: "16px 20px", borderBottom: "1px solid var(--adm-border)" }}>
                <h3 style={{ fontSize: "1.05rem" }}>Resultado da consulta</h3>
                <ExportMenu
                  label="Exportar resultado"
                  onPDF={() => pdf({ title: tituloRelatorio, subtitle: `Relatório gerencial · fonte: ${fonteGerada.label}`, tables: [{ title: "Resultado da consulta", columns: colunas, rows: linhas }] })}
                  onCSV={() => csv(tituloRelatorio, colunas, linhas)}
                />
              </div>
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      {colunas.map((c, i) => (
                        <th key={c.key} scope="col" className={i > 0 ? "adm-right" : ""}>
                          {c.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {linhas.map((l) => (
                      <tr key={l.rotulo}>
                        {colunas.map((c, i) => (
                          <td key={c.key} className={i > 0 ? "adm-right adm-mono adm-tabular" : "adm-strong"}>
                            {i === 0 ? l.rotulo : c.format(l[c.key])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Auditoria                                                          */
/* ------------------------------------------------------------------ */

const COLUNAS_AUDITORIA = [
  { key: "data", label: "Data/hora", format: (v) => formatDateTime(String(v)) },
  { key: "entidade", label: "Entidade" },
  { key: "acao", label: "Ação" },
  { key: "alvo", label: "Alvo" },
  { key: "justificativa", label: "Justificativa" },
  { key: "autor", label: "Autor" },
];

function Auditoria() {
  const query = useAdminQuery(listarAuditoria);
  return <QueryBoundary query={query} linhasSkeleton={1}>{(log) => <Log log={log} />}</QueryBoundary>;
}

function Log({ log }) {
  const { pdf, csv } = useExporter();
  const [entidade, setEntidade] = useState("todas");
  const [busca, setBusca] = useState("");
  const entidades = ["todas", ...new Set(log.map((l) => l.entidade))];

  const lista = useMemo(
    () =>
      log
        .filter((l) => entidade === "todas" || l.entidade === entidade)
        .filter((l) => [l.alvo, l.autor, l.acao, l.justificativa].join(" ").toLowerCase().includes(busca.toLowerCase())),
    [log, entidade, busca],
  );

  return (
    <section className="adm-panel adm-panel--flush">
      <div className="rel-log-topo">
        <div className="adm-row" style={{ flexWrap: "nowrap" }}>
          <div className="adm-icon-tile">
            <History aria-hidden="true" />
          </div>
          <div>
            <h3 style={{ fontSize: "1.1rem" }}>Histórico de auditoria</h3>
            <p className="adm-muted" style={{ fontSize: "0.875rem" }}>Toda aprovação, rejeição, suspensão e reativação fica registrada aqui.</p>
          </div>
        </div>
        <ExportMenu
          label="Exportar auditoria"
          onPDF={() => pdf({ title: "Histórico de auditoria", subtitle: `${lista.length} registros`, orientation: "landscape", tables: [{ columns: COLUNAS_AUDITORIA, rows: lista }] })}
          onCSV={() => csv("auditoria", COLUNAS_AUDITORIA, lista)}
        />
      </div>
      <div className="rel-log-filtros">
        <label className="adm-search" style={{ height: 40 }}>
          <Search aria-hidden="true" />
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por alvo, autor, ação ou justificativa…" aria-label="Buscar na auditoria" />
        </label>
        <div className="adm-chips" role="group" aria-label="Filtrar por entidade">
          {entidades.map((e) => (
            <button key={e} type="button" className="adm-chip" aria-pressed={entidade === e} onClick={() => setEntidade(e)}>
              {e === "todas" ? "Todas" : e}
            </button>
          ))}
        </div>
      </div>
      <div className="adm-table-wrap">
        <table className="adm-table adm-table--wide">
          <thead>
            <tr>
              {COLUNAS_AUDITORIA.map((c) => (
                <th key={c.key} scope="col">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lista.map((l) => (
              <tr key={l.id}>
                <td className="adm-mono" style={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}>{formatDateTime(l.data)}</td>
                <td>
                  <Pill tone="neutral">
                    <ClipboardList aria-hidden="true" /> {l.entidade}
                  </Pill>
                </td>
                <td>
                  <Pill tone={statusTone(l.acao)}>{l.acao}</Pill>
                </td>
                <td className="adm-strong">{l.alvo}</td>
                <td className="adm-muted" style={{ maxWidth: 380 }}>{l.justificativa}</td>
                <td>{l.autor}</td>
              </tr>
            ))}
            {lista.length === 0 && (
              <tr>
                <td colSpan={6} className="adm-table-empty">
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
