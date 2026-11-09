import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Download,
  FileText,
  Info,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Ticket,
  UsersRound,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb.jsx";
import SegmentedControl from "../components/SegmentedControl.jsx";
import { custoTotal, duracaoEmDias, itensPendentes } from "../services/calculos.js";
import { etapaAtual, etapas } from "../services/etapas.js";
import {
  calcularPrecificacao,
  calcularPontosSensibilidade,
  configuracaoInicialPrecificacao,
  componentesTicket,
} from "../services/precificacao.js";
import {
  IMPOSTO_MAX,
  IMPOSTO_PASSO,
  IMPOSTO_PADRAO,
  MARGEM_MAX,
  MARGEM_MERCADO_MAX,
  MARGEM_MERCADO_MIN,
  MARGEM_PASSO,
  PUBLICO_PASSO,
  TAXA_MAX,
  TAXA_PADRAO,
  TAXA_PASSO,
} from "../services/precificacaoConfig.js";
import { getStoreSnapshot, setEvento, setEventoAtivo, subscribe } from "../services/eventoStore.js";
import "./PrecificacaoTicket.css";

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const numero = new Intl.NumberFormat("pt-BR");
const percentual = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
const nomesCenarios = {
  conservador: "CONSERVADOR",
  esperado: "ESPERADO",
  otimista: "OTIMISTA",
};
const detalhesCenarios = {
  conservador: ["MÍN.", "Conservador", "Absorção mínima viável"],
  esperado: ["MÉDIO", "Esperado", "Meta operacional recomendada"],
  otimista: ["MÁX.", "Otimista", "Esgotamento de capacidade (Sold Out)"],
};
const opcoesGrafico = [
  { value: "linha", label: "Linha" },
  { value: "area", label: "Área" },
  { value: "barras", label: "Barras" },
];
const opcoesMetrica = [
  { value: "ticket", label: "Ticket" },
  { value: "receita", label: "Receita" },
  { value: "lucro", label: "Lucro" },
];
function clamp(valor, minimo, maximo) {
  return Math.min(maximo, Math.max(minimo, Number(valor) || 0));
}

function formatarPercentual(valor, casas = 0) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  }).format(valor * 100) + "%";
}

function formatarPeriodo(evento) {
  const dia = (valor) => {
    if (!valor) return null;
    const data = new Date(`${String(valor).slice(0, 10)}T12:00:00`);
    if (Number.isNaN(data.getTime())) return null;
    const mes = data.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
    return { dia: data.getDate(), mes: mes[0].toLocaleUpperCase("pt-BR") + mes.slice(1), ano: data.getFullYear() };
  };
  const inicio = dia(evento.dataInicio);
  const fim = dia(evento.dataFim);
  if (!inicio) return "Data não informada";
  if (!fim || (inicio.dia === fim.dia && inicio.mes === fim.mes && inicio.ano === fim.ano)) {
    return `${inicio.dia} ${inicio.mes} ${inicio.ano}`;
  }
  if (inicio.mes === fim.mes && inicio.ano === fim.ano) return `${inicio.dia} a ${fim.dia} ${fim.mes} ${fim.ano}`;
  return `${String(inicio.dia).padStart(2, "0")} ${inicio.mes} a ${String(fim.dia).padStart(2, "0")} ${fim.mes} ${fim.ano}`;
}

function slug(texto) {
  return (texto || "evento")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function ToolTip({ id, children }) {
  return <span className="pt-tooltip" id={id} role="tooltip">{children}</span>;
}

function EditableValue({ value, format, onCommit, ariaLabel, editScale = 100, editValue }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef(null);
  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);
  function startEditing() {
    setDraft(String(editValue ?? value * editScale).replace(".", ","));
    setEditing(true);
  }
  function commit() {
    const parsed = Number(draft.replace(",", ".")) / editScale;
    if (Number.isFinite(parsed)) onCommit(parsed);
    setEditing(false);
  }
  if (editing) {
    return (
      <input
        ref={inputRef}
        className="pt-inline-value"
        aria-label={ariaLabel}
        inputMode="decimal"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit();
          if (event.key === "Escape") setEditing(false);
        }}
        onBlur={() => setEditing(false)}
      />
    );
  }
  return <button type="button" className="pt-value-button" aria-label={`${ariaLabel}: ${format(value)}. Clique para editar.`} onClick={startEditing}>{format(value)}</button>;
}

function SliderCard({
  id,
  label,
  icon: Icon,
  tooltip,
  value,
  range,
  min,
  max,
  step,
  center,
  left,
  right,
  format,
  onChange,
  disabled = false,
  accentCenter = false,
  suffix = "",
  editScale = 100,
  editValue,
}) {
  const tooltipId = `${id}-tooltip`;
  const progress = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <section className={`pt-slider-card${disabled ? " is-disabled" : ""}`}>
      <div className="pt-slider-card__top">
        <div className="pt-slider-label">
          <span>{label}</span>
          <button type="button" className="pt-help" aria-label={`Ajuda: ${label}`} aria-describedby={tooltipId}>
            <Icon size={14} aria-hidden="true" />
            <ToolTip id={tooltipId}>{tooltip}</ToolTip>
          </button>
        </div>
        <div className="pt-slider-current">
          {suffix ? (
            <strong>{format(value)}{suffix}</strong>
          ) : (
            <EditableValue value={value} format={format} onCommit={onChange} ariaLabel={label} editScale={editScale} editValue={editValue} />
          )}
          {range && <span>({range})</span>}
        </div>
      </div>
      <input
        className="pt-range"
        aria-label={label}
        aria-valuetext={id === "audience" ? `${numero.format(value)} pagantes` : `${format(value)} por cento`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        style={{ "--pt-progress": `${progress}%` }}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className={`pt-slider-legend${accentCenter ? " has-accent-center" : ""}`}>
        <span>{left}</span><span>{center}</span><span>{right}</span>
      </div>
    </section>
  );
}

function ScenarioCard({ scenarioId, data, selected, onSelect, onKeyDown }) {
  const [badge, title, subtitle] = detalhesCenarios[scenarioId];
  return (
    <article
      className={`pt-scenario-card${selected ? " is-selected" : ""}${scenarioId === "esperado" ? " is-expected" : ""}`}
      role="radio"
      aria-checked={selected}
      aria-label={`Selecionar cenário ${title}`}
      tabIndex={selected ? 0 : -1}
      onClick={onSelect}
      onKeyDown={onKeyDown}
    >
      {scenarioId === "esperado" && <span className="pt-optimum-badge">★ Ponto ótimo</span>}
      <div className="pt-scenario-card__top"><span className={`pt-scenario-badge${scenarioId === "esperado" ? " is-blue" : ""}`}>{badge}</span><span className={scenarioId === "esperado" ? "is-blue-text" : ""}>{numero.format(data.publico)} pagantes</span></div>
      <h3>{title}</h3>
      <p>{subtitle}</p>
      <span className="pt-ticket-label">TICKET FINAL</span>
      <strong className="pt-scenario-ticket">{moeda.format(data.final)}</strong>
      <div className="pt-scenario-finance">
        <span>Receita bruta:<strong>{moeda.format(data.receitaBruta)}</strong></span>
        <span>Lucro líquido:<strong className={scenarioId === "esperado" ? "is-profit" : ""}>{moeda.format(data.lucroLiquido)}</strong></span>
      </div>
    </article>
  );
}

function SensitivityChart({ data, selectedScenario, metric, chartType }) {
  const [pointSelection, setPointSelection] = useState(null);
  const plot = { left: 44, right: 578, top: 24, bottom: 184 };
  const scenarioData = data.cenarios[selectedScenario.id];
  const samples = useMemo(
    () => calcularPontosSensibilidade(data, selectedScenario.id, selectedScenario),
    [data, selectedScenario],
  );
  const values = samples.map((sample) => sample[metric]);
  const minValue = metric === "lucro" ? Math.min(0, ...values) : Math.min(...values);
  const maxValue = Math.max(1, ...values);
  const x = (occupancy) => plot.left + ((occupancy - 0.3) / 0.7) * (plot.right - plot.left);
  const y = (value) => plot.bottom - ((value - minValue) / (maxValue - minValue || 1)) * (plot.bottom - plot.top);
  const points = samples.map((sample) => `${x(sample.occupancy)},${y(sample[metric])}`).join(" ");
  const scenarioPublic = scenarioData.publico;
  const selectedIndex = pointSelection?.scenarioId === selectedScenario.id
    ? pointSelection.index
    : clamp(Math.round((scenarioPublic / data.capacidade - 0.3) * 100), 0, 70);
  const active = samples[selectedIndex];
  const breakEvenX = x(scenarioData.breakEvenIngressos / data.capacidade);
  const areaPath = `M ${plot.left} ${plot.bottom} L ${points.replaceAll(" ", " L ")} L ${plot.right} ${plot.bottom} Z`;
  const metricLabel = metric === "ticket" ? "Ticket" : metric === "receita" ? "Receita" : "Lucro";
  const tooltip = `${metricLabel}: ${moeda.format(active[metric])}`;
  const visibleIndices = Array.from({ length: 8 }, (_, index) => index * 10);

  function updateFromPointer(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const normalized = (event.clientX - rect.left) / rect.width;
    setPointSelection({ scenarioId: selectedScenario.id, index: clamp(Math.round(normalized * 70), 0, 70) });
  }
  function handleKeys(event) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    setPointSelection({ scenarioId: selectedScenario.id, index: clamp(selectedIndex + (event.key === "ArrowRight" ? 1 : -1), 0, 70) });
  }

  return (
    <div className="pt-chart-wrap">
      <svg
        className="pt-sensitivity-svg"
        viewBox="0 0 600 250"
        role="slider"
        aria-label={`Sensibilidade de ${metricLabel.toLowerCase()} por ocupação. ${percentual.format(active.occupancy * 100)} por cento, ${numero.format(active.publicCount)} pagantes. ${tooltip}.`}
        aria-valuemin={30}
        aria-valuemax={100}
        aria-valuenow={Math.round(active.occupancy * 100)}
        aria-valuetext={`Ocupação ${percentual.format(active.occupancy * 100)} por cento, ${numero.format(active.publicCount)} pagantes. ${tooltip}`}
        tabIndex={0}
        onPointerMove={updateFromPointer}
        onFocus={() => setPointSelection({ scenarioId: selectedScenario.id, index: selectedIndex })}
        onKeyDown={handleKeys}
      >
        <defs>
          <linearGradient id="pt-sensitivity-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#2563eb" stopOpacity=".22" /><stop offset="100%" stopColor="#2563eb" stopOpacity="0" /></linearGradient>
        </defs>
        <rect x="0" y="0" width="600" height="250" rx="8" fill="#f5f8fd" />
        {[0, 1, 2, 3].map((line) => {
          const lineY = plot.top + (line / 3) * (plot.bottom - plot.top);
          return <line key={line} x1={plot.left} x2={plot.right} y1={lineY} y2={lineY} stroke="#e6ecf5" />;
        })}
        <line x1={breakEvenX} x2={breakEvenX} y1={plot.top} y2={plot.bottom} stroke="#dc2626" strokeDasharray="5 4" strokeWidth="1.5" />
        <text x={clamp(breakEvenX + 5, plot.left + 2, plot.right - 172)} y="16" className="pt-break-even-label">Break-even ({numero.format(scenarioData.breakEvenIngressos)} pax)</text>
        {chartType === "barras" ? visibleIndices.slice(0, 8).map((index) => {
          const sample = samples[index];
          const barWidth = 28;
          const baseline = metric === "lucro" ? y(0) : plot.bottom;
          const sampleY = y(sample[metric]);
          return <rect key={index} x={x(sample.occupancy) - barWidth / 2} y={Math.min(baseline, sampleY)} width={barWidth} height={Math.abs(baseline - sampleY)} rx="3" fill="#2563eb" opacity=".8" />;
        }) : (
          <>
            {chartType === "area" && <path d={areaPath} fill="url(#pt-sensitivity-fill)" />}
            <polyline points={points} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinejoin="round" />
          </>
        )}
        {metric === "lucro" && minValue < 0 && <line x1={plot.left} x2={plot.right} y1={y(0)} y2={y(0)} stroke="#94a3b8" strokeDasharray="3 4" />}
        <circle cx={x(active.occupancy)} cy={y(active[metric])} r="6" fill="#fff" stroke="#2563eb" strokeWidth="3" />
        <g transform={`translate(${clamp(x(active.occupancy) - 70, 5, 455)} ${clamp(y(active[metric]) - 62, 28, 155)})`} pointerEvents="none">
          <rect width="140" height="48" rx="6" fill="#0f172a" />
          <text x="10" y="16" className="pt-tooltip-overline">OCUPAÇÃO {percentual.format(active.occupancy * 100)}% ({numero.format(active.publicCount)} PAX)</text>
          <text x="10" y="35" className="pt-tooltip-value">{tooltip}</text>
        </g>
        {[0.3, 0.5, data.publicoEsperado / data.capacidade, 0.85, 1].map((occupancy, index) => (
          <text key={`${occupancy}-${index}`} x={x(occupancy)} y="218" textAnchor={index === 0 ? "start" : index === 4 ? "end" : "middle"} className={index === 2 ? "pt-axis-label is-active" : "pt-axis-label"}>
            {index === 0 ? `30% (${numero.format(Math.round(data.capacidade * .3))} pax)` : index === 2 ? `${Math.round(occupancy * 100)}% (Meta)` : index === 4 ? `100% (${numero.format(data.capacidade)} pax)` : `${Math.round(occupancy * 100)}%`}
          </text>
        ))}
      </svg>
      <div className="pt-chart-legend">
        <span><i className="is-blue-line" />Curva elástica de precificação</span>
        <span><i className="is-red-line" />Limite de viabilidade fiscal</span>
      </div>
      <table className="pt-visually-hidden">
        <caption>Dados de sensibilidade por ocupação</caption>
        <thead><tr><th>Ocupação</th><th>Pagantes</th><th>{metricLabel}</th></tr></thead>
        <tbody>{samples.filter((_, index) => index % 10 === 0).map((sample) => <tr key={sample.occupancy}><td>{percentual.format(sample.occupancy * 100)}%</td><td>{sample.publicCount}</td><td>{moeda.format(sample[metric])}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

function MarginChart({ values, selectedMargin, onSelect, chartType, totalRate }) {
  const view = { left: 45, right: 580, top: 22, bottom: 181 };
  const max = Math.max(...values.map((entry) => entry.final), 1) * 1.15;
  const y = (amount) => view.bottom - (amount / max) * (view.bottom - view.top);
  const x = (index) => 105 + index * 94;
  const lineBase = values.map((entry, index) => `${x(index)},${y(entry.base)}`).join(" ");
  const lineFinal = values.map((entry, index) => `${x(index)},${y(entry.final)}`).join(" ");
  return (
    <div className="pt-chart-wrap">
      <svg className="pt-margin-svg" viewBox="0 0 600 230" aria-label={`Comparativo de margens para ${numero.format(values[0]?.publico ?? 0)} pagantes.`}>
        <rect width="600" height="230" rx="8" fill="#f5f8fd" />
        {[0, 1, 2, 3].map((line) => {
          const lineY = view.top + (line / 3) * (view.bottom - view.top);
          return <line key={line} x1={view.left} x2={view.right} y1={lineY} y2={lineY} stroke="#e6ecf5" />;
        })}
        {chartType === "barras" ? values.map((entry, index) => {
          const groupX = x(index);
          const selected = Math.abs(entry.margin - selectedMargin) < 0.0001;
          return (
            <g
              key={entry.margin}
              role="radio"
              aria-checked={selected}
              aria-label={`Aplicar margem de ${percentual.format(entry.margin * 100)}%`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onSelect(entry.margin)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(entry.margin);
                }
              }}
            >
              {selected && <rect x={groupX - 36} y={12} width="72" height="177" rx="8" fill="#2563eb" fillOpacity=".08" stroke="#2563eb" />}
              <rect x={groupX - 18} y={y(entry.base)} width="14" height={view.bottom - y(entry.base)} rx="3" fill={selected ? "#475569" : "#94a3b8"} />
              <rect x={groupX + 4} y={y(entry.final)} width="14" height={view.bottom - y(entry.final)} rx="3" fill={selected ? "#2563eb" : "#5b8def"} />
              <text x={groupX} y="208" textAnchor="middle" className={selected ? "pt-axis-label is-active" : "pt-axis-label"}>{percentual.format(entry.margin * 100)}{selected ? "*" : ""}</text>
            </g>
          );
        }) : (
          <>
            {chartType === "area" && <>
              <polygon points={`${values.map((entry, index) => `${x(index)},${y(entry.base)}`).join(" ")} ${values.slice().reverse().map((entry, index) => `${x(values.length - 1 - index)},${view.bottom}`).join(" ")}`} fill="#94a3b8" fillOpacity=".14" />
              <polygon points={`${values.map((entry, index) => `${x(index)},${y(entry.final)}`).join(" ")} ${values.slice().reverse().map((entry, index) => `${x(values.length - 1 - index)},${view.bottom}`).join(" ")}`} fill="#2563eb" fillOpacity=".12" />
            </>}
            <polyline points={lineBase} fill="none" stroke="#64748b" strokeWidth="2" />
            <polyline points={lineFinal} fill="none" stroke="#2563eb" strokeWidth="2.5" />
            {values.map((entry, index) => {
              const selected = Math.abs(entry.margin - selectedMargin) < 0.0001;
              return (
                <g key={entry.margin} role="radio" aria-checked={selected} aria-label={`Aplicar margem de ${percentual.format(entry.margin * 100)}%`} tabIndex={selected ? 0 : -1} onClick={() => onSelect(entry.margin)} onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(entry.margin); }
                }}>
                  <circle cx={x(index)} cy={y(entry.base)} r="5" fill="#64748b" />
                  <circle cx={x(index)} cy={y(entry.final)} r="5" fill="#2563eb" />
                  <text x={x(index)} y="208" textAnchor="middle" className={selected ? "pt-axis-label is-active" : "pt-axis-label"}>{percentual.format(entry.margin * 100)}{selected ? "*" : ""}</text>
                </g>
              );
            })}
          </>
        )}
      </svg>
      <table className="pt-visually-hidden">
        <caption>Comparação de preço base e final por margem</caption>
        <thead><tr><th>Margem</th><th>Preço base</th><th>Preço final</th></tr></thead>
        <tbody>{values.map((entry) => <tr key={entry.margin}><td>{formatarPercentual(entry.margin)}</td><td>{moeda.format(entry.base)}</td><td>{moeda.format(entry.final)}</td></tr>)}</tbody>
      </table>
      <div className="pt-margin-chart-footer"><span>Margens Simuladas</span><span>* Seleção atual ({formatarPercentual(selectedMargin)})</span></div>
      <div className="pt-chart-legend"><span><i className="pt-legend-square is-base" />Preço Base</span><span><i className="pt-legend-square is-final" />Preço Final (com {formatarPercentual(totalRate)} taxas)</span></div>
    </div>
  );
}

export default function PrecificacaoTicket() {
  const store = useSyncExternalStore(subscribe, getStoreSnapshot, getStoreSnapshot);
  const { id } = useParams();
  const navigate = useNavigate();
  const evento = store.eventos.find((item) => item.id === (id ?? store.eventoAtivoId));
  const [precificacao, setPrecificacao] = useState(() => configuracaoInicialPrecificacao(evento?.precificacao));
  const [grafico, setGrafico] = useState("linha");
  const [metrica, setMetrica] = useState("ticket");
  const [graficoMargem, setGraficoMargem] = useState("barras");
  const [statusSalvar, setStatusSalvar] = useState("salvo");
  const [falhaSalvar, setFalhaSalvar] = useState("");
  const [aviso, setAviso] = useState("");
  const [rotacao, setRotacao] = useState(0);
  const dirtyRef = useRef(false);
  const skipSyncRef = useRef(false);
  const timerSalvar = useRef(null);
  const timerAnuncio = useRef(null);
  const announceRef = useRef(null);
  const [anuncio, setAnuncio] = useState("");

  useEffect(() => {
    if (!evento) return;
    if (evento.id !== store.eventoAtivoId) setEventoAtivo(evento.id);
    if (evento.etapaAtual !== "precificacao") setEvento(evento.id, { etapaAtual: "precificacao" });
  }, [evento, store.eventoAtivoId]);

  useEffect(() => {
    if (!evento || skipSyncRef.current) {
      skipSyncRef.current = false;
      return;
    }
    setPrecificacao(configuracaoInicialPrecificacao(evento.precificacao));
  }, [evento]);

  useEffect(() => {
    if (!evento || !dirtyRef.current) return undefined;
    setStatusSalvar("sincronizando");
    setFalhaSalvar("");
    window.clearTimeout(timerSalvar.current);
    timerSalvar.current = window.setTimeout(() => {
      try {
        const atualizadoEm = new Date().toISOString();
        skipSyncRef.current = true;
        dirtyRef.current = false;
        setEvento(evento.id, { precificacao, atualizadoEm });
        setStatusSalvar("salvo");
        setRotacao((atual) => atual + 1);
      } catch (error) {
        skipSyncRef.current = false;
        setStatusSalvar("erro");
        setFalhaSalvar(error instanceof Error ? error.message : "Não foi possível salvar a precificação.");
        console.error("Falha ao salvar os parâmetros de precificação.", error);
      }
    }, 600);
    return () => window.clearTimeout(timerSalvar.current);
  }, [precificacao, evento]);

  useEffect(() => () => {
    window.clearTimeout(timerSalvar.current);
    window.clearTimeout(timerAnuncio.current);
    window.cancelAnimationFrame(announceRef.current);
  }, []);

  const total = evento ? custoTotal(evento) : 0;
  const resultado = useMemo(
    () => evento ? calcularPrecificacao(evento, precificacao) : null,
    [evento, precificacao],
  );
  const publicoValido = Boolean(evento && evento.publico.minimo > 0
    && evento.publico.minimo < evento.publico.maximo
    && evento.publico.maximo <= evento.capacidadeAlvara);
  const itensCotacao = evento?.custos?.fornecedores?.filter((item) => item.alocacao === "cotacao") ?? [];
  const contratosPendentes = evento ? itensPendentes(evento) : [];
  const percentualAuditoria = itensCotacao.length
    ? Math.round(((itensCotacao.length - contratosPendentes.length) / itensCotacao.length) * 100)
    : 100;
  const cenarios = resultado?.cenarios;
  const cenarioAtivo = cenarios?.[precificacao.cenarioEscolhido] ?? cenarios?.esperado;
  const margemAtual = Number(precificacao.margem) || 0;
  const taxa = Number(precificacao.taxaPlataforma) || 0;
  const imposto = Number(precificacao.impostos) || 0;
  const lotacao = resultado?.capacidade > 0 ? resultado.publicoEsperado / resultado.capacidade : 0;
  const diaHoje = new Date().toISOString().slice(0, 10);
  const etapa = etapaAtual("precificacao");

  const comparativoMargens = useMemo(() => {
    if (!evento || !resultado) return [];
    const margens = [0, .1, .2, .3, .4];
    if (!margens.some((valor) => Math.abs(valor - margemAtual) < .0001)) margens.push(margemAtual);
    return margens.sort((a, b) => a - b).map((margem) => {
      const ticket = componentesTicket(total, resultado.publicoEsperado, margem, taxa, imposto);
      return { margin: margem, publico: resultado.publicoEsperado, base: ticket.base, final: ticket.final };
    });
  }, [evento, resultado, margemAtual, total, taxa, imposto]);

  function updatePrecificacao(changes) {
    dirtyRef.current = true;
    setStatusSalvar("sincronizando");
    setAviso("");
    setPrecificacao((current) => ({ ...current, ...changes }));
    window.clearTimeout(timerAnuncio.current);
    timerAnuncio.current = window.setTimeout(() => {
      const next = { ...precificacao, ...changes };
      const dados = calcularPrecificacao(evento, next);
      setAnuncio(`Ingresso recomendado ${moeda.format(dados.cenarios[next.cenarioEscolhido].final)} para ${numero.format(dados.cenarios[next.cenarioEscolhido].publico)} pagantes.`);
    }, 250);
  }

  function updateSlider(changes) {
    window.cancelAnimationFrame(announceRef.current);
    announceRef.current = window.requestAnimationFrame(() => updatePrecificacao(changes));
  }

  function selectScenario(scenarioId) {
    updatePrecificacao({ cenarioEscolhido: scenarioId });
  }

  function exportPdf() {
    const titleOriginal = document.title;
    document.title = `Precificacao-${slug(evento?.nome)}-${diaHoje}`;
    window.addEventListener("afterprint", () => { document.title = titleOriginal; }, { once: true });
    window.print();
  }

  function retrySave() {
    if (!evento) return;
    dirtyRef.current = true;
    setStatusSalvar("sincronizando");
    setFalhaSalvar("");
    window.clearTimeout(timerSalvar.current);
    timerSalvar.current = window.setTimeout(() => {
      try {
        skipSyncRef.current = true;
        dirtyRef.current = false;
        setEvento(evento.id, { precificacao, atualizadoEm: new Date().toISOString() });
        setStatusSalvar("salvo");
      } catch (error) {
        skipSyncRef.current = false;
        setStatusSalvar("erro");
        setFalhaSalvar(error instanceof Error ? error.message : "Não foi possível salvar a precificação.");
        console.error("Falha ao tentar salvar novamente a precificação.", error);
      }
    }, 0);
  }

  function concluir() {
    if (!evento) return;
    if (total <= 0 || !publicoValido) {
      setAviso(total <= 0 ? "Cadastre custos antes de concluir." : "Corrija a lotação antes de concluir.");
      document.querySelector(".pt-error")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    try {
      window.clearTimeout(timerSalvar.current);
      dirtyRef.current = false;
      setEvento(evento.id, {
        precificacao,
        status: "precificado",
        atualizadoEm: new Date().toISOString(),
      });
      navigate("/eventos", { state: { toast: "Precificação concluída" } });
    } catch (error) {
      setStatusSalvar("erro");
      setFalhaSalvar(error instanceof Error ? error.message : "Não foi possível concluir a precificação.");
      console.error("Falha ao concluir a precificação do evento.", error);
    }
  }

  function onScenarioKeyDown(event, currentId) {
    const ids = ["conservador", "esperado", "otimista"];
    const currentIndex = ids.indexOf(currentId);
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const nextIndex = (currentIndex + (event.key === "ArrowRight" ? 1 : -1) + ids.length) % ids.length;
    selectScenario(ids[nextIndex]);
    event.currentTarget.parentElement.children[nextIndex]?.focus();
  }

  if (!evento) {
    return <div className="pt-page"><div className="pt-container"><div className="pt-error-card"><h1>Não foi possível carregar o evento</h1><p>Verifique se o evento ainda está disponível e tente novamente.</p><button type="button" onClick={() => window.location.reload()}>Tentar novamente</button></div></div></div>;
  }

  const faixa = resultado?.faixaConsumidor ?? [0, 0];
  const riscoClasse = resultado?.nivelRisco.toLowerCase() ?? "baixo";
  const auditadoTexto = percentualAuditoria === 100
    ? "Auditoria 100% fechada"
    : `Auditoria ${percentualAuditoria}% fechada • ${contratosPendentes.length} ${contratosPendentes.length === 1 ? "item sem contrato" : "itens sem contrato"}`;
  const tituloStatus = statusSalvar === "sincronizando"
    ? "Sincronizando…"
    : statusSalvar === "erro"
      ? "Falha ao salvar • Tentar novamente"
      : "Parâmetros de precificação sincronizados em tempo real";

  return (
    <div className="pt-page">
      <div className="pt-container">
        <Breadcrumb etapaAtual={etapa?.n ?? 5} eventoId={evento.id} />
        <header className="pt-heading">
          <div className="pt-heading__copy">
            <span className="pt-step-pill"><i />ETAPA {etapa?.n ?? 5} DE {etapas.length}</span>
            <h1>Cálculo e Precificação de Ticket</h1>
            <p>Defina as variáveis operacionais para recalibrar o valor do ingresso e estimar a liquidez do evento.</p>
          </div>
          <button type="button" className="pt-export-button" onClick={exportPdf}><Download size={16} aria-hidden="true" /> Exportar PDF</button>
        </header>

        {total <= 0 ? (
          <div className="pt-error-card pt-error"><h2>Cadastre os custos na Etapa 2</h2><p>A precificação depende de um custo total maior que zero.</p><Link to={`/eventos/${encodeURIComponent(evento.id)}/custos`}>Ir para composição de custos</Link></div>
        ) : (
          <>
            <div className="pt-main-grid">
              <aside className="pt-right-column">
                <section className="pt-recommended-card">
                  <div className="pt-recommended-card__top">
                    <span>INGRESSO RECOMENDADO · CENÁRIO {nomesCenarios[precificacao.cenarioEscolhido]}</span>
                    <span className="pt-active-pill">ATIVO</span>
                  </div>
                  <strong className="pt-recommended-price">{moeda.format(cenarioAtivo.final)}</strong>
                  <div className="pt-recommended-base"><Ticket size={15} aria-hidden="true" />Base {moeda.format(cenarioAtivo.base)} + {formatarPercentual(resultado.taxasPercentual)} de taxas</div>
                  <div className="pt-recommended-list">
                    <div><span>Faixa ao consumidor:</span><strong>{moeda.format(faixa[0])} a {moeda.format(faixa[1])}</strong></div>
                    <div><span>Break-even (mín.):</span><strong>{moeda.format(resultado.breakEvenPorIngressoMin)}</strong></div>
                    <div><span>Lucro esperado:</span><strong className="is-profit">+ {moeda.format(cenarioAtivo.lucroLiquido)}</strong></div>
                    <div><span>Taxa TrocaTicket:</span><strong>{moeda.format(cenarioAtivo.taxaValor)} / ingresso</strong></div>
                  </div>
                  <div className="pt-liquidity-note"><ShieldCheck size={19} aria-hidden="true" /><span>Garantia de liquidez contratual: 100% dos custos fixos cobertos atingindo {numero.format(cenarioAtivo.breakEvenIngressos)} ingressos vendidos.</span></div>
                </section>
                <section className="pt-risk-card">
                  <h2><CheckCircle2 size={19} aria-hidden="true" />Índice de Risco Operacional</h2>
                  <p>Com margem de segurança de <strong>{percentual.format(resultado.margemSeguranca * 100)}%</strong> frente ao limite técnico de capacidade física, o evento apresenta risco de déficit classificado como <strong className={`is-${riscoClasse}`}>{resultado.nivelRisco}</strong>.</p>
                </section>
              </aside>

              <section className="pt-parameters-card">
                <header className="pt-card-heading">
                  <h2><SlidersHorizontal size={20} aria-hidden="true" />Parâmetros de precificação</h2>
                  <span className="pt-realtime"><RefreshCw key={rotacao} size={15} aria-hidden="true" />Cálculo em tempo real</span>
                </header>
                <div className="pt-event-tiles">
                  <article><span>EVENTO</span><strong title={evento.nome}>{evento.nome || "Evento sem nome"}</strong><small><CalendarDays size={13} aria-hidden="true" />{formatarPeriodo(evento)}{duracaoEmDias(evento) > 0 ? ` · ${duracaoEmDias(evento)} ${duracaoEmDias(evento) === 1 ? "dia" : "dias"}` : ""}</small></article>
                  <article><span>CUSTO CONSOLIDADO</span><strong>{moeda.format(total)}</strong><small className={percentualAuditoria === 100 ? "is-audited" : "is-pending"}>{auditadoTexto}</small></article>
                  <article><span>CAPACIDADE</span><strong>{numero.format(evento.capacidadeAlvara)} pessoas</strong><small>Lotação máxima permitida</small></article>
                </div>
                {!publicoValido && <div className="pt-validation-warning pt-error" role="alert"><Info size={15} aria-hidden="true" />Público mínimo, máximo e alvará estão inconsistentes. <Link to={`/eventos/${encodeURIComponent(evento.id)}/editar`}>Corrigir na Etapa 1</Link></div>}
                <div className="pt-sliders">
                  <SliderCard
                    id="margin"
                    label="Margem desejada"
                    icon={Info}
                    tooltip="Percentual de lucro sobre a receita bruta: receita = custo ÷ (1 − margem)."
                    value={margemAtual}
                    range="0% a 60%"
                    min={0}
                    max={MARGEM_MAX}
                    step={MARGEM_PASSO}
                    format={formatarPercentual}
                    onChange={(value) => updateSlider({ margem: clamp(value, 0, MARGEM_MAX) })}
                    left="0% (Custo zero)"
                    center={`Padrão mercado: ${formatarPercentual(MARGEM_MERCADO_MIN)} - ${formatarPercentual(MARGEM_MERCADO_MAX)}`}
                    right="60% (Máxima)"
                  />
                  <SliderCard
                    id="audience"
                    label="Público esperado"
                    icon={UsersRound}
                    tooltip="Quantidade de pagantes usada no cenário esperado (padrão: média entre mínimo e máximo)."
                    value={resultado.publicoEsperado}
                    range={`mín ${numero.format(resultado.publicoMinimo)} a máx ${numero.format(resultado.publicoMaximo)} pax`}
                    min={resultado.publicoMinimo}
                    max={resultado.publicoMaximo}
                    step={PUBLICO_PASSO}
                    format={(value) => `${numero.format(value)} pax`}
                    onChange={(value) => updateSlider({ publicoEsperado: clamp(value, resultado.publicoMinimo, resultado.publicoMaximo) })}
                    left={`${numero.format(resultado.publicoMinimo)} pax (Mínimo de viabilidade)`}
                    center={`${percentual.format(lotacao * 100)}% da lotação total`}
                    right={`${numero.format(resultado.publicoMaximo)} pax (Sold out)`}
                    disabled={!publicoValido}
                    accentCenter
                    editScale={1}
                    editValue={resultado.publicoEsperado}
                  />
                  <SliderCard
                    id="platform-fee"
                    label="Taxa da plataforma"
                    icon={FileText}
                    tooltip="Taxa de gestão e checkout da TrocaTicket, aplicada sobre o preço base."
                    value={taxa}
                    range="0% a 15%"
                    min={0}
                    max={TAXA_MAX}
                    step={TAXA_PASSO}
                    format={formatarPercentual}
                    suffix=""
                    onChange={(value) => updateSlider({ taxaPlataforma: clamp(value, 0, TAXA_MAX) })}
                    left="0% (Isenção direta)"
                    center={Math.abs(taxa - TAXA_PADRAO) < .0001 ? "TrocaTicket Pro tier standard (8%)" : `Valor ajustado (${formatarPercentual(taxa)})`}
                    right="15%"
                  />
                  <SliderCard
                    id="tax"
                    label="Impostos (ISS/Simples)"
                    icon={FileText}
                    tooltip="ISS/Simples estimado, aplicado sobre o preço base."
                    value={imposto}
                    range="0% a 15%"
                    min={0}
                    max={IMPOSTO_MAX}
                    step={IMPOSTO_PASSO}
                    format={formatarPercentual}
                    onChange={(value) => updateSlider({ impostos: clamp(value, 0, IMPOSTO_MAX) })}
                    left="0%"
                    center={`Alíquota municipal simulada (${formatarPercentual(IMPOSTO_PADRAO)})`}
                    right="15%"
                  />
                </div>
              </section>
            </div>

            <section className="pt-scenarios-section">
              <header className="pt-section-heading">
                <div><h2>Matriz de Três Cenários</h2><p>Comparação estruturada de liquidez baseada em sensibilidade de vendas.</p></div>
                <span>Custos fixos indexados: {moeda.format(total)}</span>
              </header>
              <div className="pt-scenario-grid" role="radiogroup" aria-label="Selecionar cenário de público">
                {["conservador", "esperado", "otimista"].map((scenarioId) => (
                  <ScenarioCard
                    key={scenarioId}
                    scenarioId={scenarioId}
                    data={cenarios[scenarioId]}
                    selected={precificacao.cenarioEscolhido === scenarioId}
                    onSelect={() => selectScenario(scenarioId)}
                    onKeyDown={(event) => onScenarioKeyDown(event, scenarioId)}
                  />
                ))}
              </div>
            </section>

            <div className="pt-charts-grid">
              <section className="pt-chart-card">
                <header className="pt-chart-card__heading">
                  <div><h2>Sensibilidade por ocupação</h2><p>Faixa de 30% a 100% de capacidade</p></div>
                  <div className="pt-controls-stack">
                    <SegmentedControl label="Tipo de gráfico" value={grafico} options={opcoesGrafico} onChange={setGrafico} className="pt-segmented" />
                    <SegmentedControl label="Métrica do gráfico" value={metrica} options={opcoesMetrica} onChange={setMetrica} className="pt-segmented" variant="primary" />
                  </div>
                </header>
                <SensitivityChart data={resultado} selectedScenario={{ ...precificacao, id: precificacao.cenarioEscolhido }} metric={metrica} chartType={grafico} />
              </section>
              <section className="pt-chart-card">
                <header className="pt-chart-card__heading">
                  <div><h2>Comparativo de margens</h2><p>Projeção para {numero.format(resultado.publicoEsperado)} pagantes</p></div>
                  <SegmentedControl label="Visualização de margens" value={graficoMargem} options={opcoesGrafico} onChange={setGraficoMargem} className="pt-segmented" />
                </header>
                <MarginChart values={comparativoMargens} selectedMargin={margemAtual} onSelect={(value) => updatePrecificacao({ margem: value })} chartType={graficoMargem} totalRate={resultado.taxasPercentual} />
              </section>
            </div>
          </>
        )}

        <p className="pt-live-announcement" aria-live="polite">{anuncio}</p>
      </div>

      <footer className="pt-fixed-bar">
        <div className="pt-fixed-bar__inner">
          <button type="button" className="pt-back-button" onClick={() => {
            window.clearTimeout(timerSalvar.current);
            if (dirtyRef.current) {
              try {
                dirtyRef.current = false;
                skipSyncRef.current = true;
                setEvento(evento.id, { precificacao, atualizadoEm: new Date().toISOString() });
              } catch (error) {
                skipSyncRef.current = false;
                setStatusSalvar("erro");
                setFalhaSalvar(error instanceof Error ? error.message : "Não foi possível salvar a precificação.");
                console.error("Falha ao salvar antes de voltar ao resumo.", error);
                return;
              }
            }
            navigate(`/eventos/${encodeURIComponent(evento.id)}/resumo`);
          }}><ArrowLeft size={15} aria-hidden="true" /> Voltar</button>
          <button type="button" className={`pt-save-status is-${statusSalvar}`} aria-live="polite" onClick={statusSalvar === "erro" ? retrySave : undefined} disabled={statusSalvar !== "erro"} title={falhaSalvar || undefined}>
            <i />{statusSalvar === "erro" ? tituloStatus : aviso || tituloStatus}
          </button>
          <button type="button" className="pt-finish-button" onClick={concluir}><Check size={16} aria-hidden="true" /> Concluir e voltar ao painel <ArrowRight size={15} aria-hidden="true" /></button>
        </div>
      </footer>
    </div>
  );
}
