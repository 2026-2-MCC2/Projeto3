import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlarmClock, FileText, Info, PiggyBank, Search, TriangleAlert, Trophy } from "lucide-react";
import { ChartCard } from "../../components/admin/ChartCard.jsx";
import { ExportMenu } from "../../components/admin/ExportMenu.jsx";
import { Modal } from "../../components/admin/Modal.jsx";
import { KpiCard, PageHeader, Pill, QueryBoundary, Segmented } from "../../components/admin/ui.jsx";
import { statusTone } from "../../utils/admin/status.js";
import { useAdminQuery } from "../../hooks/useAdminQuery.js";
import { useExporter } from "../../hooks/useExporter.js";
import { listarCotacoes, listarEventos } from "../../services/adminApi.js";
import { economia, melhorProposta, prazoLabel as calcularPrazo } from "../../services/adminCalculos.js";
import { DATA_REFERENCIA, SITUACOES_COTACAO } from "../../services/adminSeed.js";
import { formatBRL, formatBRLCompact, formatDateShort, formatPct } from "../../utils/admin/format.js";
import "./Cotacoes.css";

const HOJE = new Date(DATA_REFERENCIA);
const prazoLabel = (c) => calcularPrazo(c, HOJE, formatDateShort);
const COR_BARRA = { danger: "danger", warning: "warning", success: "success" };

export default function Cotacoes() {
  const query = useAdminQuery(() => Promise.all([listarCotacoes(), listarEventos()]).then(([cotacoes, eventos]) => ({ cotacoes, eventos })));
  return <QueryBoundary query={query}>{({ cotacoes, eventos }) => <Conteudo cotacoes={cotacoes} eventos={eventos} />}</QueryBoundary>;
}

function Conteudo({ cotacoes, eventos }) {
  const { pdf, csv } = useExporter();
  const [params, setParams] = useSearchParams();
  const [filtro, setFiltro] = useState("todas");
  const [busca, setBusca] = useState("");
  const eventoDe = (id) => eventos.find((e) => e.id === id);
  const aberta = cotacoes.find((c) => c.id === params.get("id")) ?? null;

  const COLUNAS = [
    { key: "id", label: "Código" },
    { key: "servico", label: "Serviço" },
    { key: "evento", label: "Evento", format: (_, c) => eventoDe(c.eventoId)?.nome ?? "" },
    { key: "situacao", label: "Situação" },
    { key: "respostas", label: "Respostas", format: (_, c) => `${c.propostas.length}/${c.convidados}` },
    { key: "melhor", label: "Melhor proposta", format: (_, c) => formatBRL(melhorProposta(c)?.valor ?? 0) },
    { key: "fornecedor", label: "Fornecedor", format: (_, c) => melhorProposta(c)?.fornecedor ?? "" },
    { key: "economia", label: "Economia", format: (_, c) => formatPct(economia(c).pct) },
    { key: "prazo", label: "Prazo", format: (_, c) => prazoLabel(c) },
  ];

  const lista = useMemo(
    () =>
      cotacoes
        .filter((c) => filtro === "todas" || c.situacao === filtro)
        .filter((c) => [c.servico, c.id, eventos.find((e) => e.id === c.eventoId)?.nome].join(" ").toLowerCase().includes(busca.toLowerCase())),
    [cotacoes, eventos, filtro, busca],
  );

  const count = (s) => cotacoes.filter((c) => c.situacao === s).length;
  const respondidas = cotacoes.reduce((s, c) => s + c.propostas.length, 0);
  const convidados = cotacoes.reduce((s, c) => s + c.convidados, 0);
  const economiaTotal = cotacoes.reduce((s, c) => s + economia(c).valor, 0);

  const distribuicao = SITUACOES_COTACAO.map((s) => ({ situacao: s, cotacoes: count(s) }));
  const respostas = cotacoes
    .filter((c) => c.situacao !== "Encerrada")
    .map((c) => ({ cotacao: c.servico, respondidas: c.propostas.length, aguardando: c.convidados - c.propostas.length }));
  const engajamento = [
    { status: "Responderam", fornecedores: respondidas },
    { status: "Aguardando", fornecedores: convidados - respondidas },
  ];
  const economiaPorCat = useMemo(() => {
    const m = new Map();
    cotacoes.forEach((c) => m.set(c.categoria, (m.get(c.categoria) ?? 0) + economia(c).valor));
    return [...m.entries()].map(([categoria, valor]) => ({ categoria, economia: Math.round(valor) }));
  }, [cotacoes]);

  return (
    <>
      <PageHeader
        title="Cotações"
        description="Respostas dos fornecedores, prazos e consolidação das melhores propostas para os eventos."
        actions={
          <ExportMenu
            label="Exportar cotações"
            variant="primary"
            onPDF={() =>
              pdf({
                title: "Cotações em acompanhamento",
                subtitle: `Filtro: ${filtro}`,
                orientation: "landscape",
                summary: [
                  { label: "Abertas", value: String(count("Aberta")) },
                  { label: "Vencendo em 48h", value: String(count("Vencendo")) },
                  { label: "Vencidas", value: String(count("Vencida")) },
                  { label: "Economia gerada", value: formatBRL(economiaTotal) },
                ],
                tables: [{ columns: COLUNAS, rows: lista }],
              })
            }
            onCSV={() => csv("cotacoes", COLUNAS, lista)}
          />
        }
      />

      <div className="adm-grid adm-grid--kpi">
        <KpiCard label="Abertas" value={count("Aberta")} icon={FileText} hint="Em negociação ativa de propostas" />
        <KpiCard label="Vencendo em 48h" value={count("Vencendo")} icon={AlarmClock} tone="warning" hint={<span className="adm-text-warning adm-strong">Exigem atenção imediata</span>} delay={60} />
        <KpiCard label="Vencidas sem decisão" value={count("Vencida")} icon={TriangleAlert} tone="danger" hint="Aguardando resposta do organizador" delay={120} />
        <KpiCard label="Economia gerada" value={formatBRLCompact(economiaTotal)} icon={PiggyBank} tone="success" hint="vs. média das propostas recebidas" delay={180} />
      </div>

      <div className="adm-grid cot-graficos adm-mt">
        <ChartCard
          title="Taxa de resposta"
          description={`${respondidas} de ${convidados} fornecedores responderam (${formatPct((respondidas / convidados) * 100, 0)})`}
          data={engajamento}
          xKey="status"
          xLabel="Status"
          series={[{ key: "fornecedores", label: "Fornecedores" }]}
          types={["donut", "pie", "bar", "table"]}
          height={240}
        />
        <ChartCard
          title="Distribuição por situação"
          description="Cotações no pipeline atual"
          data={distribuicao}
          xKey="situacao"
          xLabel="Situação"
          series={[{ key: "cotacoes", label: "Cotações" }]}
          types={["donut", "pie", "bar", "horizontal", "table"]}
          height={240}
        />
        <ChartCard
          className="cot-graficos__largo"
          title="Respostas por cotação"
          description="Respondidas vs. aguardando"
          data={respostas}
          xKey="cotacao"
          xLabel="Cotação"
          series={[
            { key: "respondidas", label: "Respondidas" },
            { key: "aguardando", label: "Aguardando" },
          ]}
          types={["horizontal", "stacked", "bar", "table"]}
          height={240}
        />
      </div>

      <ChartCard
        className="adm-mt"
        title="Economia por categoria de serviço"
        description="Diferença entre a média das propostas e a melhor proposta"
        data={economiaPorCat}
        xKey="categoria"
        xLabel="Categoria"
        series={[{ key: "economia", label: "Economia" }]}
        types={["bar", "horizontal", "pie", "line", "table"]}
        valueFormat={formatBRL}
        axisFormat={formatBRLCompact}
        height={240}
      />

      <section className="adm-panel adm-panel--flush adm-mt">
        <div className="cot-topo">
          <div>
            <h3 style={{ fontSize: "1.1rem" }}>Cotações em acompanhamento</h3>
            <p className="adm-muted" style={{ fontSize: "0.875rem" }}>Clique em uma cotação para comparar as propostas</p>
          </div>
          <div className="adm-row" style={{ gap: 8 }}>
            <label className="adm-search" style={{ height: 36 }}>
              <Search aria-hidden="true" />
              <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Serviço, código ou evento…" aria-label="Buscar cotações" style={{ width: 180 }} />
            </label>
            <Segmented label="Situação da cotação" value={filtro} onChange={setFiltro} options={[{ value: "todas", label: "Todas" }, ...SITUACOES_COTACAO.map((s) => ({ value: s, label: s }))]} />
          </div>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table adm-table--wide">
            <thead>
              <tr>
                {["Cotação", "Evento / organizador", "Situação", "Respostas", "Melhor proposta", "Economia", "Prazo"].map((h) => (
                  <th key={h} scope="col">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lista.map((c) => {
                const ev = eventoDe(c.eventoId);
                const best = melhorProposta(c);
                const eco = economia(c);
                const pct = (c.propostas.length / c.convidados) * 100;
                const tone = statusTone(c.situacao);
                return (
                  <tr key={c.id} className="adm-row--click">
                    <td>
                      <button type="button" className="cot-abrir" onClick={() => setParams({ id: c.id }, { replace: true })} aria-label={`Comparar propostas de ${c.servico}`}>
                        <span className="adm-strong">{c.servico}</span>
                        <span className="adm-mono adm-muted" style={{ fontSize: "0.75rem" }}>{c.id}</span>
                      </button>
                    </td>
                    <td>
                      <div className="adm-strong" style={{ fontWeight: 500 }}>{ev?.nome}</div>
                      <div className="adm-muted" style={{ fontSize: "0.75rem" }}>{ev?.organizador}</div>
                    </td>
                    <td>
                      <Pill tone={tone} dot>
                        {c.situacao}
                      </Pill>
                    </td>
                    <td>
                      <div className="adm-row adm-row--between adm-mono" style={{ width: 128, fontSize: "0.75rem", marginBottom: 4, flexWrap: "nowrap" }}>
                        <span>
                          {c.propostas.length} de {c.convidados}
                        </span>
                        <span className="adm-muted">{Math.round(pct)}%</span>
                      </div>
                      <div className="cot-segmentos" aria-hidden="true">
                        {Array.from({ length: c.convidados }, (_, i) => (
                          <span key={i} className={i < c.propostas.length ? `is-on is-${COR_BARRA[tone] ?? "primary"}` : ""} />
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="adm-mono adm-tabular adm-strong">{formatBRL(best?.valor ?? 0)}</div>
                      <div className="adm-muted" style={{ fontSize: "0.75rem" }}>{best?.fornecedor}</div>
                    </td>
                    <td className="adm-mono adm-strong adm-text-success">↓ {formatPct(eco.pct)}</td>
                    <td>
                      <Pill tone={c.situacao === "Encerrada" ? "neutral" : tone}>{prazoLabel(c)}</Pill>
                    </td>
                  </tr>
                );
              })}
              {lista.length === 0 && (
                <tr>
                  <td colSpan={7} className="adm-table-empty">
                    Nenhuma cotação encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="cot-nota">
          <Info aria-hidden="true" />
          <span>
            <b>Economia gerada:</b> diferença entre a média de todas as propostas recebidas e a menor proposta válida da cotação.
          </span>
        </div>
      </section>

      <Modal side open={!!aberta} onClose={() => setParams({}, { replace: true })} title={aberta?.servico ?? ""} description={aberta ? `${aberta.id} · ${aberta.propostas.length} de ${aberta.convidados} propostas · ${prazoLabel(aberta)}` : ""}>
        {aberta && <PropostasDetalhe c={aberta} ev={eventoDe(aberta.eventoId)} />}
      </Modal>
    </>
  );
}

function PropostasDetalhe({ c, ev }) {
  const { pdf, csv } = useExporter();
  const ordenadas = [...c.propostas].sort((a, b) => a.valor - b.valor);
  const cols = [
    { key: "fornecedor", label: "Fornecedor" },
    { key: "valor", label: "Valor", format: (v) => formatBRL(Number(v)) },
    { key: "prazoEntregaDias", label: "Prazo (dias)" },
    { key: "notaTecnica", label: "Nota técnica" },
    { key: "enviadaEm", label: "Enviada em", format: (v) => formatDateShort(String(v)) },
  ];
  return (
    <div className="adm-stack adm-stack--sm">
      <div className="adm-row adm-row--between">
        {ev ? (
          <Link to={`/admin/eventos/${ev.id}`} className="adm-link">
            {ev.nome}
          </Link>
        ) : (
          <span />
        )}
        <ExportMenu
          label="Exportar propostas"
          onPDF={() => pdf({ title: `${c.id} · ${c.servico}`, subtitle: `${ev?.nome ?? ""} · ${c.situacao}`, tables: [{ title: "Propostas recebidas", columns: cols, rows: ordenadas }] })}
          onCSV={() => csv(`propostas-${c.id}`, cols, ordenadas)}
        />
      </div>
      <ol className="cot-propostas">
        {ordenadas.map((p, i) => (
          <li key={p.id} className={i === 0 ? "is-melhor" : ""}>
            <div className="adm-row adm-row--between" style={{ flexWrap: "nowrap" }}>
              <div className="adm-row" style={{ gap: 8 }}>
                <span className="cot-posicao">{i + 1}</span>
                <span className="adm-strong">{p.fornecedor}</span>
                {i === 0 && (
                  <Pill tone="success">
                    <Trophy aria-hidden="true" /> Melhor
                  </Pill>
                )}
              </div>
              <span className="adm-mono adm-tabular adm-strong">{formatBRL(p.valor)}</span>
            </div>
            <div className="cot-propostas__grid">
              <div>
                <div className="adm-eyebrow">Prazo</div>
                <strong>{p.prazoEntregaDias} dias</strong>
              </div>
              <div>
                <div className="adm-eyebrow">Nota técnica</div>
                <strong className={p.notaTecnica < 70 ? "adm-text-danger" : ""}>{p.notaTecnica}</strong>
              </div>
              <div>
                <div className="adm-eyebrow">Enviada</div>
                <strong>{formatDateShort(p.enviadaEm)}</strong>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
