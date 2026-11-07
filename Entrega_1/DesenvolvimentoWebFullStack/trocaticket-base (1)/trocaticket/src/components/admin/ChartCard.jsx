import { useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartArea,
  ChartBar,
  ChartColumn,
  ChartColumnStacked,
  ChartLine,
  ChartPie,
  Donut,
  Radar as RadarIcon,
  Table2,
} from "lucide-react";
import { useChartColors } from "../../hooks/useChartColors.js";
import { useExporter } from "../../hooks/useExporter.js";
import { ExportMenu } from "./ExportMenu.jsx";
import "./ChartCard.css";

/** Formatos de gráfico disponíveis. Para oferecer um formato numa tela, inclua a chave em `types`. */
const CHART_KINDS = {
  bar: { label: "Colunas", icon: ChartColumn },
  stacked: { label: "Colunas empilhadas", icon: ChartColumnStacked },
  horizontal: { label: "Barras horizontais", icon: ChartBar },
  line: { label: "Linhas", icon: ChartLine },
  area: { label: "Área", icon: ChartArea },
  pie: { label: "Pizza", icon: ChartPie },
  donut: { label: "Rosca", icon: Donut },
  radar: { label: "Radar", icon: RadarIcon },
  table: { label: "Tabela", icon: Table2 },
};

const formatoPadrao = (n) => Number(n).toLocaleString("pt-BR");
const tick = { fontSize: 11, fill: "#596475" };
/** Encurta rótulos longos no eixo X (o tooltip e a tabela mostram o nome completo). */
const encurtar = (v) => (String(v).length > 13 ? `${String(v).slice(0, 12)}…` : v);

/**
 * Cartão com gráfico que o administrador pode trocar de formato (colunas, linhas,
 * pizza, radar, tabela...) e exportar (PDF, CSV, PNG).
 *
 *  data     linhas [{ [xKey]: "Rótulo", serieA: 10, serieB: 20 }]
 *  series   [{ key, label, format? }]  (format substitui valueFormat só nessa série)
 *  types    formatos oferecidos; o primeiro (ou defaultType) abre por padrão
 */
export function ChartCard({
  title,
  description,
  data,
  xKey,
  xLabel = "Categoria",
  series,
  types = ["bar", "line", "area", "table"],
  defaultType,
  valueFormat = formatoPadrao,
  axisFormat,
  height = 300,
  className = "",
  headerExtra,
  footer,
  exportName,
}) {
  const [tipo, setTipo] = useState(defaultType ?? types[0]);
  const [pieKey, setPieKey] = useState(series[0]?.key);
  const chaveFatia = series.some((s) => s.key === pieKey) ? pieKey : series[0]?.key;
  const areaGrafico = useRef(null);
  const cores = useChartColors();
  const { pdf, csv, png } = useExporter();
  const nome = exportName ?? title;
  const formatoEixo = axisFormat ?? valueFormat;
  const formatar = (chave, v) => (series.find((s) => s.key === chave)?.format ?? valueFormat)(Number(v ?? 0));

  const colunas = useMemo(
    () => [
      { key: xKey, label: xLabel },
      ...series.map((s) => ({ key: s.key, label: s.label, format: (v) => (s.format ?? valueFormat)(Number(v ?? 0)) })),
    ],
    [xKey, xLabel, series, valueFormat],
  );

  const dica = (
    <Tooltip
      cursor={{ fill: "#eaeef3", opacity: 0.6 }}
      content={({ active, payload, label }) =>
        active && payload?.length ? (
          <div className="adm-tooltip">
            <div className="adm-tooltip__title">{label ?? payload[0]?.name}</div>
            {payload.map((p) => (
              <div key={String(p.dataKey) + String(p.name)} className="adm-tooltip__row">
                <span className="adm-tooltip__dot" style={{ background: p.color ?? p.payload?.fill }} />
                <span className="adm-muted">{series.find((s) => s.key === p.dataKey)?.label ?? p.name}</span>
                <span className="adm-mono adm-tabular adm-tooltip__value">{formatar(p.dataKey, p.value)}</span>
              </div>
            ))}
          </div>
        ) : null
      }
    />
  );

  const legenda = (
    <Legend
      iconType="circle"
      iconSize={8}
      wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
      formatter={(v) => <span className="adm-muted">{series.find((s) => s.key === v)?.label ?? v}</span>}
    />
  );

  const grade = <CartesianGrid strokeDasharray="3 4" vertical={false} stroke="#dae0e8" />;

  function renderizar() {
    switch (tipo) {
      case "bar":
      case "stacked":
        return (
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            {grade}
            <XAxis dataKey={xKey} tick={tick} axisLine={false} tickLine={false} interval={0} tickFormatter={data.length > 5 ? encurtar : undefined} />
            <YAxis tick={tick} axisLine={false} tickLine={false} tickFormatter={formatoEixo} width={72} />
            {dica}
            {series.length > 1 && legenda}
            {series.map((s, i) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                fill={cores[i % cores.length]}
                stackId={tipo === "stacked" ? "a" : undefined}
                radius={tipo === "stacked" ? (i === series.length - 1 ? [6, 6, 0, 0] : 0) : [6, 6, 0, 0]}
                maxBarSize={44}
              />
            ))}
          </BarChart>
        );
      case "horizontal":
        return (
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 4" horizontal={false} stroke="#dae0e8" />
            <XAxis type="number" tick={tick} axisLine={false} tickLine={false} tickFormatter={formatoEixo} />
            <YAxis type="category" dataKey={xKey} tick={tick} axisLine={false} tickLine={false} width={140} />
            {dica}
            {series.length > 1 && legenda}
            {series.map((s, i) => (
              <Bar key={s.key} dataKey={s.key} fill={cores[i % cores.length]} radius={[0, 6, 6, 0]} maxBarSize={18} />
            ))}
          </BarChart>
        );
      case "line":
        return (
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            {grade}
            <XAxis dataKey={xKey} tick={tick} axisLine={false} tickLine={false} />
            <YAxis tick={tick} axisLine={false} tickLine={false} tickFormatter={formatoEixo} width={72} />
            {dica}
            {series.length > 1 && legenda}
            {series.map((s, i) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={cores[i % cores.length]}
                strokeWidth={2.5}
                dot={{ r: 3.5, strokeWidth: 2, fill: "#fefdfc" }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        );
      case "area":
        return (
          <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <defs>
              {series.map((s, i) => (
                <linearGradient key={s.key} id={`adm-grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={cores[i % cores.length]} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={cores[i % cores.length]} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            {grade}
            <XAxis dataKey={xKey} tick={tick} axisLine={false} tickLine={false} />
            <YAxis tick={tick} axisLine={false} tickLine={false} tickFormatter={formatoEixo} width={72} />
            {dica}
            {series.length > 1 && legenda}
            {series.map((s, i) => (
              <Area key={s.key} type="monotone" dataKey={s.key} stroke={cores[i % cores.length]} strokeWidth={2.5} fill={`url(#adm-grad-${s.key})`} />
            ))}
          </AreaChart>
        );
      case "pie":
      case "donut":
        return (
          <PieChart>
            {dica}
            <Legend
              iconType="circle"
              iconSize={8}
              layout="vertical"
              align="right"
              verticalAlign="middle"
              wrapperStyle={{ fontSize: 12 }}
              formatter={(v) => <span className="adm-muted">{v}</span>}
            />
            <Pie
              data={data}
              dataKey={chaveFatia}
              nameKey={xKey}
              innerRadius={tipo === "donut" ? "55%" : 0}
              outerRadius="85%"
              paddingAngle={tipo === "donut" ? 2 : 0}
              stroke="#fefdfc"
              strokeWidth={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={cores[i % cores.length]} />
              ))}
            </Pie>
          </PieChart>
        );
      case "radar":
        return (
          <RadarChart data={data} outerRadius="75%">
            <PolarGrid stroke="#dae0e8" />
            <PolarAngleAxis dataKey={xKey} tick={tick} />
            <PolarRadiusAxis tick={false} axisLine={false} />
            {dica}
            {series.length > 1 && legenda}
            {series.map((s, i) => (
              <Radar key={s.key} dataKey={s.key} stroke={cores[i % cores.length]} fill={cores[i % cores.length]} fillOpacity={0.18} strokeWidth={2} />
            ))}
          </RadarChart>
        );
      default:
        return <div />;
    }
  }

  return (
    <section className={`adm-panel adm-chart adm-rise ${className}`}>
      <header className="adm-chart__header">
        <div className="adm-chart__titles">
          <h3>{title}</h3>
          {description && <p>{description}</p>}
        </div>
        <div className="adm-row" style={{ gap: 8 }}>
          {headerExtra}
          <div className="adm-chart__kinds" role="radiogroup" aria-label="Formato do gráfico">
            {types.map((t) => {
              const Icone = CHART_KINDS[t].icon;
              return (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={t === tipo}
                  aria-label={CHART_KINDS[t].label}
                  title={CHART_KINDS[t].label}
                  onClick={() => setTipo(t)}
                >
                  <Icone aria-hidden="true" />
                </button>
              );
            })}
          </div>
          <ExportMenu
            compact
            onPDF={() =>
              pdf({
                title,
                subtitle: description,
                charts: tipo !== "table" && areaGrafico.current ? [areaGrafico.current] : [],
                tables: [{ title: "Dados do gráfico", columns: colunas, rows: data }],
              })
            }
            onCSV={() => csv(nome, colunas, data)}
            onPNG={
              tipo !== "table"
                ? async () => {
                    if (areaGrafico.current) await png(nome, areaGrafico.current);
                  }
                : undefined
            }
          />
        </div>
      </header>

      {(tipo === "pie" || tipo === "donut") && series.length > 1 && (
        <div className="adm-chips" style={{ marginBottom: 12 }} role="group" aria-label="Série exibida">
          {series.map((s) => (
            <button key={s.key} type="button" className="adm-chip" aria-pressed={s.key === chaveFatia} onClick={() => setPieKey(s.key)}>
              {s.label}
            </button>
          ))}
        </div>
      )}

      <div ref={areaGrafico} className="adm-chart__area">
        {tipo === "table" ? (
          <div className="adm-chart__table adm-table-wrap">
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
                {data.map((linha, ri) => (
                  <tr key={ri}>
                    {colunas.map((c, i) => (
                      <td key={c.key} className={i > 0 ? "adm-right adm-mono adm-tabular" : "adm-strong"}>
                        {i === 0 ? String(linha[c.key]) : c.format(linha[c.key], linha)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ height }} role="img" aria-label={`Gráfico: ${title}. Use o formato Tabela para ler os valores.`}>
            <ResponsiveContainer width="100%" height="100%">
              {renderizar()}
            </ResponsiveContainer>
          </div>
        )}
      </div>
      {footer && <footer className="adm-chart__footer">{footer}</footer>}
    </section>
  );
}
