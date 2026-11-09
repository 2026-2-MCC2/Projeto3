import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Calculator,
  CheckCircle2,
  Download,
  Edit3,
  MapPin,
  UsersRound,
  Volume2,
  Shield,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb.jsx";
import SegmentedControl from "../components/SegmentedControl.jsx";
import {
  breakEvenIngressos,
  breakEvenPorIngresso,
  contratosConcluidos,
  custoFiscal,
  custoProducao,
  custoTotal,
  distribuirPercentuais,
  duracaoEmDias,
  itensPendentes,
  lucroMaximo,
  percentualPorTipo,
  precoPraticado,
  totalContratado,
  validacaoTecnica,
  valorPorCategoria,
} from "../services/calculos.js";
import { obterCategoria } from "../services/categorias.js";
import { etapaAtual, etapas } from "../services/etapas.js";
import { getStoreSnapshot, setEvento, setEventoAtivo, subscribe } from "../services/eventoStore.js";
import "./ResumoConsolidacao.css";

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const numero = new Intl.NumberFormat("pt-BR");
const percentual = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const numeroCurto = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const ordemDonut = ["som", "palco", "ecad", "uti", "seguranca", "limpeza", "gateway", "iss"];
const tipoGrafico = [
  { value: "rosca", label: "Rosca" },
  { value: "pizza", label: "Pizza" },
  { value: "barras", label: "Barras" },
  { value: "empilhado", label: "Empilhado" },
];
const tipoReceita = [
  { value: "area", label: "Área" },
  { value: "linha", label: "Linha" },
  { value: "barras", label: "Barras" },
];

function lerControles() {
  try {
    const salvo = sessionStorage.getItem("trocaticket:resumo-controles");
    const controles = salvo ? JSON.parse(salvo) : {};
    return {
      agrupamento: ["categoria", "tipo"].includes(controles.agrupamento) ? controles.agrupamento : "categoria",
      grafico: tipoGrafico.some((opcao) => opcao.value === controles.grafico) ? controles.grafico : "rosca",
      receita: tipoReceita.some((opcao) => opcao.value === controles.receita) ? controles.receita : "area",
    };
  } catch (erro) {
    console.error("Não foi possível ler as preferências dos gráficos.", erro);
    return { agrupamento: "categoria", grafico: "rosca", receita: "area" };
  }
}

function formatarDataCurta(valor) {
  if (!valor) return null;
  const data = new Date(`${String(valor).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(data.getTime())) return null;
  return { dia: data.getDate(), mes: meses[data.getMonth()], ano: data.getFullYear() };
}

function formatarPeriodo(evento) {
  const inicio = formatarDataCurta(evento.dataInicio);
  const fim = formatarDataCurta(evento.dataFim);
  if (!inicio) return "Data não informada";
  if (!fim || (inicio.dia === fim.dia && inicio.mes === fim.mes && inicio.ano === fim.ano)) {
    return `${inicio.dia} ${inicio.mes} ${inicio.ano}`;
  }
  if (inicio.mes === fim.mes && inicio.ano === fim.ano) {
    return `${inicio.dia} a ${fim.dia} ${fim.mes} ${fim.ano}`;
  }
  if (inicio.ano === fim.ano) {
    return `${String(inicio.dia).padStart(2, "0")} ${inicio.mes} a ${String(fim.dia).padStart(2, "0")} ${fim.mes} ${fim.ano}`;
  }
  return `${inicio.dia} ${inicio.mes} ${inicio.ano} a ${fim.dia} ${fim.mes} ${fim.ano}`;
}

function formatarHora(valor) {
  if (!valor) return "—:—";
  const data = new Date(valor);
  return Number.isNaN(data.getTime())
    ? "—:—"
    : data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function formatarMilhar(valor) {
  if (valor === 0) return "R$ 0";
  if (valor >= 1000000) return `R$ ${numeroCurto.format(valor / 1000000)}M`;
  if (valor >= 1000) return `R$ ${numeroCurto.format(valor / 1000)}k`;
  return moeda.format(valor);
}

function corCategoria(id) {
  const cores = {
    som: "#2563eb",
    palco: "#6d5bf0",
    ecad: "#f59e0b",
    uti: "#ef4444",
    seguranca: "#10b981",
    limpeza: "#a78bfa",
    gateway: "#1e40af",
    iss: "#64748b",
  };
  const aliases = { som_pa: "som", estruturas: "palco", municipal: "iss", operacao: "uti" };
  return cores[aliases[id] ?? id] ?? obterCategoria(id).cor;
}

function prepararDadosGrafico(evento, agrupamento) {
  const valoresPorCategoria = valorPorCategoria(evento);
  if (agrupamento === "tipo") {
    const grupos = [
      { id: "infraestrutura", nome: "Infraestrutura", cor: "#2563eb", valor: 0 },
      { id: "encargos_operacao", nome: "Encargos & Operação", cor: "#f59e0b", valor: 0 },
    ];
    for (const categoria of valoresPorCategoria) {
      const grupo = grupos.find((item) => item.id === categoria.tipoCusto);
      if (grupo) grupo.valor += categoria.valor;
    }
    return distribuirPercentuais(grupos);
  }

  const mapaDados = new Map(valoresPorCategoria.map((item) => [item.id, item]));
  const porAlias = {
    som: ["som", "som_pa", "iluminacao"],
    palco: ["palco", "estruturas"],
    ecad: ["ecad"],
    uti: ["uti", "operacao"],
    seguranca: ["seguranca"],
    limpeza: ["limpeza"],
    gateway: ["gateway"],
    iss: ["iss", "municipal"],
  };
  const dados = ordemDonut.flatMap((id) => {
    const valor = porAlias[id].reduce((soma, categoriaId) => soma + (mapaDados.get(categoriaId)?.valor ?? 0), 0);
    if (!valor) return [];
    return [{ id, nome: id === "iss" ? "ISS" : obterCategoria(id).rotuloCurto, cor: corCategoria(id), valor }];
  });
  return distribuirPercentuais(dados);
}

function caminhoArco(inicio, fim, raio) {
  const ponto = (angulo) => ({
    x: 110 + raio * Math.cos((angulo * Math.PI) / 180),
    y: 110 + raio * Math.sin((angulo * Math.PI) / 180),
  });
  const a = ponto(inicio);
  const b = ponto(fim);
  const grande = fim - inicio > 180 ? 1 : 0;
  return `M ${a.x} ${a.y} A ${raio} ${raio} 0 ${grande} 1 ${b.x} ${b.y}`;
}

function caminhoFatia(inicio, fim, raio) {
  const ponto = (angulo) => ({
    x: 110 + raio * Math.cos((angulo * Math.PI) / 180),
    y: 110 + raio * Math.sin((angulo * Math.PI) / 180),
  });
  const a = ponto(inicio);
  const b = ponto(fim);
  const grande = fim - inicio > 180 ? 1 : 0;
  return `M 110 110 L ${a.x} ${a.y} A ${raio} ${raio} 0 ${grande} 1 ${b.x} ${b.y} Z`;
}

function DonutChart({ dados, total, tipo }) {
  const [ativo, setAtivo] = useState(null);
  const itens = dados.filter((item) => item.valor > 0);
  const valorTotal = itens.reduce((soma, item) => soma + item.valor, 0);
  const setores = itens.reduce((resultado, item) => {
    const inicio = resultado.at(-1)?.fim ?? -90;
    const fim = inicio + (item.valor / (valorTotal || 1)) * 360;
    resultado.push({ ...item, inicio, fim });
    return resultado;
  }, []);
  const selecionado = setores.find((item) => item.id === ativo);

  return (
    <div className="rc-donut-wrap">
      {selecionado && (
        <div className="rc-chart-tooltip" role="status">
          <strong>{selecionado.nome}</strong> — {moeda.format(selecionado.valor)} ({percentual.format(selecionado.percentual ?? (selecionado.valor / (valorTotal || 1)) * 100)}%)
        </div>
      )}
      <svg
        className="rc-donut"
        viewBox="0 0 220 220"
        role="img"
        aria-label={`Origem dos custos, total ${moeda.format(total)}: ${itens.map((item) => `${item.nome} ${moeda.format(item.valor)}`).join(", ")}`}
      >
        {setores.map((setor) => {
          const gap = Math.min(1.2, (setor.fim - setor.inicio) / 4);
          const ativoEste = setor.id === ativo;
          return (
            <path
              key={setor.id}
              d={tipo === "pizza"
                ? caminhoFatia(setor.inicio + gap / 2, setor.fim - gap / 2, 90)
                : caminhoArco(setor.inicio + gap / 2, setor.fim - gap / 2, 80)}
              fill={tipo === "pizza" ? setor.cor : "none"}
              stroke={tipo === "pizza" ? "#fff" : setor.cor}
              strokeWidth={tipo === "pizza" ? (ativoEste ? 2 : 1) : ativoEste ? 32 : 26}
              tabIndex={0}
              aria-label={`${setor.nome}: ${moeda.format(setor.valor)}, ${percentual.format((setor.valor / (valorTotal || 1)) * 100)}%`}
              onMouseEnter={() => setAtivo(setor.id)}
              onMouseLeave={() => setAtivo(null)}
              onFocus={() => setAtivo(setor.id)}
              onBlur={() => setAtivo(null)}
            />
          );
        })}
        {tipo === "rosca" && (
          <>
            <text x="110" y="104" textAnchor="middle" className="rc-donut__label">TOTAL</text>
            <text x="110" y="128" textAnchor="middle" className="rc-donut__value">{formatarMilhar(total)}</text>
          </>
        )}
      </svg>
    </div>
  );
}

function Legend({ dados }) {
  const valorTotal = dados.reduce((soma, item) => soma + item.valor, 0);
  return (
    <div className={`rc-legend${dados.length <= 2 ? " is-short" : ""}`}>
      {dados.map((item) => (
        <div className="rc-legend__row" key={item.id}>
          <span className="rc-legend__name"><i style={{ backgroundColor: item.cor }} />{item.nome}</span>
          <strong>{percentual.format(item.percentual ?? (valorTotal ? item.valor / valorTotal * 100 : 0))}%</strong>
        </div>
      ))}
    </div>
  );
}

function CostGraph({ dados, total, tipo }) {
  const valorTotal = dados.reduce((soma, item) => soma + item.valor, 0);
  if (tipo === "rosca" || tipo === "pizza") {
    return (
      <div className={`rc-cost-visual${tipo === "pizza" ? " is-pie" : ""}`}>
        <DonutChart dados={dados} total={total} tipo={tipo} />
        <Legend dados={dados} />
      </div>
    );
  }
  if (tipo === "barras") {
    const ordenados = [...dados].sort((a, b) => b.valor - a.valor);
    const maior = Math.max(...ordenados.map((item) => item.valor), 1);
    return (
      <div className="rc-horizontal-bars" role="img" aria-label="Custos por categoria em barras horizontais">
        {ordenados.map((item) => (
          <div className="rc-horizontal-bars__row" key={item.id}>
            <span>{item.nome}</span>
            <i><b style={{ width: `${item.valor / maior * 100}%`, backgroundColor: item.cor }} /></i>
            <strong>{percentual.format(item.percentual ?? (valorTotal ? item.valor / valorTotal * 100 : 0))}%</strong>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="rc-stacked-visual" role="img" aria-label={`Custos empilhados: ${dados.map((item) => `${item.nome}, ${percentual.format(valorTotal ? item.valor / valorTotal * 100 : 0)}%`).join("; ")}`}>
      <div className="rc-stacked-bar">
        {dados.map((item) => (
          <span key={item.id} style={{ width: `${valorTotal ? item.valor / valorTotal * 100 : 0}%`, backgroundColor: item.cor }} title={`${item.nome}: ${moeda.format(item.valor)}`} />
        ))}
      </div>
      <Legend dados={dados} />
    </div>
  );
}

function niceAxis(maximo) {
  const bruto = maximo / 4;
  const magnitude = 10 ** Math.floor(Math.log10(bruto || 1));
  const normalizado = bruto / magnitude;
  const passoBase = normalizado <= 1 ? 1 : normalizado <= 2 ? 2 : normalizado <= 2.5 ? 2.5 : normalizado <= 5 ? 5 : 10;
  const passo = passoBase * magnitude;
  return { maximo: Math.ceil(maximo / passo) * passo, passo };
}

function RevenueChart({ evento, total, preco, ingressoBreakEven, lucro, modo }) {
  const [ocupacao, setOcupacao] = useState(null);
  const plot = { x: 60, y: 24, width: 420, height: 190 };
  const capacidade = Math.max(0, Number(evento.capacidadeAlvara) || 0);
  const receitaMaxima = preco * capacidade;
  const { maximo: tetoGrafico, passo } = niceAxis(Math.max(receitaMaxima, total, 1));
  const x = (proporcao) => plot.x + proporcao * plot.width;
  const y = (valor) => plot.y + plot.height - Math.min(1, valor / tetoGrafico) * plot.height;
  const pontos = Array.from({ length: 51 }, (_, indice) => {
    const proporcao = indice / 50;
    const ingressos = Math.round(proporcao * capacidade);
    return { proporcao, ingressos, receita: preco * ingressos };
  });
  const pathReceita = pontos.map((ponto, indice) => `${indice ? "L" : "M"} ${x(ponto.proporcao)} ${y(ponto.receita)}`).join(" ");
  const pontoEquilibrio = capacidade > 0 ? Math.min(1, (ingressoBreakEven / capacidade)) : 0;
  const receitaEquilibrio = total;
  const pontosArea = [
    { proporcao: pontoEquilibrio, receita: receitaEquilibrio },
    ...pontos.filter((ponto) => ponto.proporcao > pontoEquilibrio),
  ];
  const caminhoArea = `${pontosArea.map((ponto, indice) => `${indice ? "L" : "M"} ${x(ponto.proporcao)} ${y(ponto.receita)}`).join(" ")} L ${x(1)} ${y(0)} L ${x(pontoEquilibrio)} ${y(0)} Z`;
  const selecao = ocupacao == null
    ? null
    : { proporcao: ocupacao, ingressos: Math.round(ocupacao * capacidade), receita: preco * Math.round(ocupacao * capacidade) };
  const lucroAtual = selecao ? selecao.receita - total : 0;

  function atualizarPelaPosicao(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const relativo = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    setOcupacao(relativo);
  }

  return (
    <div className="rc-revenue-plot">
      {selecao && (
        <div className="rc-revenue-tooltip" role="status">
          <strong>{percentual.format(selecao.proporcao * 100)} de ocupação</strong>
          <span>{numero.format(selecao.ingressos)} ingressos</span>
          <span>Receita: {moeda.format(selecao.receita)}</span>
          <span>Custo: {moeda.format(total)}</span>
          <b className={lucroAtual >= 0 ? "is-positive" : "is-negative"}>Resultado: {moeda.format(lucroAtual)}</b>
        </div>
      )}
      <svg
        className="rc-revenue-svg"
        viewBox="0 0 520 254"
        role="img"
        aria-label={`Receita estimada a ${moeda.format(preco)} por ingresso; custo total ${moeda.format(total)}; break-even em ${numero.format(ingressoBreakEven)} ingressos; lucro máximo ${moeda.format(lucro)}.`}
        tabIndex={0}
        onPointerMove={atualizarPelaPosicao}
        onPointerLeave={() => setOcupacao(null)}
        onFocus={() => setOcupacao(pontoEquilibrio)}
        onBlur={() => setOcupacao(null)}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowUp") {
            event.preventDefault();
            setOcupacao((atual) => Math.min(1, (atual ?? 0) + .05));
          } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
            event.preventDefault();
            setOcupacao((atual) => Math.max(0, (atual ?? 1) - .05));
          }
        }}
      >
        <defs>
          <linearGradient id="rc-profit-gradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity=".28" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
          </linearGradient>
        </defs>
        {Array.from({ length: Math.floor(tetoGrafico / passo) + 1 }, (_, indice) => {
          const valor = indice * passo;
          return (
            <g key={valor}>
              <line x1={plot.x} x2={plot.x + plot.width} y1={y(valor)} y2={y(valor)} className="rc-gridline" />
              <text x={plot.x - 8} y={y(valor) + 4} textAnchor="end" className="rc-axis-label">{formatarMilhar(valor)}</text>
            </g>
          );
        })}
        {Array.from({ length: 6 }, (_, indice) => (
          <text key={indice} x={x(indice / 5)} y={plot.y + plot.height + 24} textAnchor="middle" className="rc-axis-label">
            {indice * 20}%
          </text>
        ))}
        {modo === "area" && <path d={caminhoArea} fill="url(#rc-profit-gradient)" />}
        {modo === "barras" && [20, 40, 60, 80, 100].map((valor) => {
          const receita = preco * Math.round((valor / 100) * capacidade);
          const barX = x(valor / 100) - 13;
          return (
            <rect
              key={valor}
              x={barX}
              y={y(receita)}
              width="26"
              height={plot.y + plot.height - y(receita)}
              rx="3"
              fill={receita >= total ? "#2563eb" : "#cbd5e1"}
              opacity=".8"
            />
          );
        })}
        <line x1={plot.x} x2={plot.x + plot.width} y1={y(total)} y2={y(total)} className="rc-cost-line" />
        {modo !== "barras" && <path d={pathReceita} className="rc-revenue-line" />}
        {modo === "area" && <text x={plot.x + plot.width - 6} y={plot.y + 16} textAnchor="end" className="rc-profit-label">Área de Lucro Operacional</text>}
        <circle cx={x(pontoEquilibrio)} cy={y(receitaEquilibrio)} r="5" className="rc-break-even-dot" />
        <g transform={`translate(${Math.max(plot.x, Math.min(plot.x + plot.width - 215, x(pontoEquilibrio) - 105))}, ${Math.max(3, y(receitaEquilibrio) - 38)})`}>
          <rect width="210" height="25" rx="12.5" className="rc-break-even-pill" />
          <circle cx="12" cy="12.5" r="3" className="rc-break-even-pill-dot" />
          <text x="21" y="17" className="rc-break-even-pill-text">Break-even: {numero.format(ingressoBreakEven)} ingressos ({formatarMilhar(total)})</text>
        </g>
        {selecao && <line x1={x(selecao.proporcao)} x2={x(selecao.proporcao)} y1={plot.y} y2={plot.y + plot.height} className="rc-focus-line" />}
      </svg>
    </div>
  );
}

function Tile({ icon: Icon, label, value, detail, validacao = false, valido = true }) {
  return (
    <article className="rc-event-tile">
      <span className={`rc-event-tile__icon${validacao ? valido ? " is-valid" : " is-invalid" : ""}`}>
        <Icon size={18} aria-hidden="true" />
      </span>
      <div>
        <span className="rc-event-tile__label">{label}</span>
        <strong className={validacao ? valido ? "is-valid" : "is-invalid" : ""}>{value}</strong>
        <small>{detail}</small>
      </div>
    </article>
  );
}

function Kpi({ title, value, note, color, highlighted = false, decor = null }) {
  const [moedaPrefixo, ...numeroPartes] = value.startsWith("R$ ") ? value.split(" ") : ["", value];
  const DecorIcon = decor?.type;
  return (
    <article className={`rc-kpi${highlighted ? " is-highlighted" : ""}`}>
      <span className="rc-kpi__title">{title}</span>
      <strong className={`rc-kpi__value${color ? ` is-${color}` : ""}`}>
        {moedaPrefixo && <small>{moedaPrefixo}</small>}{numeroPartes.join(" ")}
      </strong>
      <span className="rc-kpi__note"><i />{note}</span>
      {DecorIcon && <DecorIcon className="rc-kpi__decor" size={76} aria-hidden="true" />}
    </article>
  );
}

export default function ResumoConsolidacao() {
  const store = useSyncExternalStore(subscribe, getStoreSnapshot, getStoreSnapshot);
  const { id } = useParams();
  const navigate = useNavigate();
  const evento = store.eventos.find((item) => item.id === (id ?? store.eventoAtivoId));
  const fornecedores = store.usuarios;
  const [controles, setControles] = useState(lerControles);
  const [incluirFornecedores, setIncluirFornecedores] = useState(true);
  const [incluirReceita, setIncluirReceita] = useState(true);
  const [statusSalvar, setStatusSalvar] = useState("salvo");
  const [modalPendencias, setModalPendencias] = useState(false);
  const signatureAnterior = useRef(null);
  const timerAutosave = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (!evento) return;
    if (evento.id !== store.eventoAtivoId) setEventoAtivo(evento.id);
    if (evento.etapaAtual !== "resumo") setEvento(evento.id, { etapaAtual: "resumo" });
  }, [evento, store.eventoAtivoId]);

  const dadosAssinatura = evento ? JSON.stringify({ ...evento, atualizadoEm: undefined }) : "";
  useEffect(() => {
    if (!evento) return undefined;
    if (signatureAnterior.current === null) {
      signatureAnterior.current = dadosAssinatura;
      return undefined;
    }
    if (signatureAnterior.current === dadosAssinatura) return undefined;
    signatureAnterior.current = dadosAssinatura;
    setStatusSalvar("salvando");
    window.clearTimeout(timerAutosave.current);
    timerAutosave.current = window.setTimeout(() => {
      try {
        setEvento(evento.id, { atualizadoEm: new Date().toISOString() });
        setStatusSalvar("salvo");
      } catch (erro) {
        console.error("Não foi possível salvar as alterações do resumo.", erro);
        setStatusSalvar("erro");
      }
    }, 1500);
    return () => window.clearTimeout(timerAutosave.current);
  }, [dadosAssinatura, evento]);

  useEffect(() => {
    try {
      sessionStorage.setItem("trocaticket:resumo-controles", JSON.stringify(controles));
    } catch (erro) {
      console.error("Não foi possível salvar as preferências dos gráficos.", erro);
    }
  }, [controles]);

  useEffect(() => {
    if (!modalPendencias) return undefined;
    const disparador = document.activeElement;
    const modal = modalRef.current;
    modal?.querySelector("button")?.focus();
    function manterFoco(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        setModalPendencias(false);
      }
      if (event.key !== "Tab" || !modal) return;
      const botoes = [...modal.querySelectorAll("button:not([disabled])")];
      if (!botoes.length) return;
      if (event.shiftKey && document.activeElement === botoes[0]) {
        event.preventDefault();
        botoes.at(-1).focus();
      } else if (!event.shiftKey && document.activeElement === botoes.at(-1)) {
        event.preventDefault();
        botoes[0].focus();
      }
    }
    document.addEventListener("keydown", manterFoco);
    return () => {
      document.removeEventListener("keydown", manterFoco);
      disparador?.focus?.();
    };
  }, [modalPendencias]);

  useEffect(() => () => {
    window.clearTimeout(timerAutosave.current);
  }, []);

  const itensPendentesEvento = useMemo(
    () => evento ? itensPendentes(evento) : [],
    [evento],
  );
  const aceitas = useMemo(() => evento ? contratosConcluidos(evento) : [], [evento]);
  const fornecedoresPorId = useMemo(() => new Map(fornecedores.map((fornecedor) => [fornecedor.id, fornecedor])), [fornecedores]);
  const itensPorId = new Map((evento?.custos?.fornecedores ?? []).map((item) => [item.id, item]));
  const dadosCustos = useMemo(
    () => evento ? prepararDadosGrafico(evento, controles.agrupamento) : [],
    [evento, controles.agrupamento],
  );

  function mudarControle(chave, valor) {
    setControles((atual) => ({ ...atual, [chave]: valor }));
  }

  function exportarPdf() {
    const slug = (evento.nome || "evento")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("pt-BR")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const tituloOriginal = document.title;
    const hoje = new Date();
    const dataLocal = [
      hoje.getFullYear(),
      String(hoje.getMonth() + 1).padStart(2, "0"),
      String(hoje.getDate()).padStart(2, "0"),
    ].join("-");
    document.title = `Resumo-${slug}-${dataLocal}`;
    const restaurarTitulo = () => {
      document.title = tituloOriginal;
      window.removeEventListener("afterprint", restaurarTitulo);
    };
    window.addEventListener("afterprint", restaurarTitulo, { once: true });
    window.print();
  }

  function voltarPrecificacao() {
    try {
      setEvento(evento.id, { atualizadoEm: new Date().toISOString() });
      setStatusSalvar("salvo");
    } catch (erro) {
      console.error("Não foi possível salvar antes de avançar.", erro);
      setStatusSalvar("erro");
      return;
    }
    navigate(`/eventos/${encodeURIComponent(evento.id)}/precificacao`);
  }

  function avancarEtapa() {
    if (!valido || custoTotal(evento) <= 0) return;
    if (itensPendentesEvento.length) {
      setModalPendencias(true);
      return;
    }
    voltarPrecificacao();
  }

  function continuarComPendencias() {
    setModalPendencias(false);
    voltarPrecificacao();
  }

  function tentarSalvarNovamente() {
    setStatusSalvar("salvando");
    try {
      setEvento(evento.id, { atualizadoEm: new Date().toISOString() });
      setStatusSalvar("salvo");
    } catch (erro) {
      console.error("Não foi possível salvar novamente as alterações do resumo.", erro);
      setStatusSalvar("erro");
    }
  }

  if (!evento) {
    return <div className="rc-page"><div className="rc-container"><p className="rc-not-found">Evento não encontrado.</p></div></div>;
  }

  const etapaResumo = etapaAtual("resumo");
  const producao = custoProducao(evento);
  const fiscais = custoFiscal(evento);
  const total = custoTotal(evento);
  const minimo = Number(evento.publico?.minimo) || 0;
  const ingressoBreakEven = breakEvenIngressos(evento);
  const breakEvenValor = breakEvenPorIngresso(evento);
  const preco = precoPraticado(evento);
  const lucro = lucroMaximo(evento);
  const valido = validacaoTecnica(evento);
  const dias = duracaoEmDias(evento);
  const percentualTipo = percentualPorTipo(evento);
  const tipoInfra = percentualTipo.infraestrutura ?? 0;
  const tipoEncargos = percentualTipo.encargos_operacao ?? 0;
  const contratos = aceitas.map((proposta) => ({
    proposta,
    fornecedor: fornecedoresPorId.get(proposta.fornecedorId),
    item: itensPorId.get(proposta.itemCustoId),
  })).filter((linha) => linha.fornecedor && linha.item);
  const pendenciaOrcada = itensPendentesEvento.reduce((soma, item) => soma + (Number(item.valor) || 0), 0);
  const totaisAssinados = totalContratado(evento);
  const margem = Number(evento.precificacao?.margem) || 0;
  const dataAtualizacao = evento.atualizadoEm ?? new Date().toISOString();
  const tituloPreco = `Ingresso a ${moeda.format(preco)} (margem de ${numeroCurto.format(margem * 100)}% sobre o público mínimo).`;
  const statusTexto = statusSalvar === "salvando"
    ? "Salvando…"
    : statusSalvar === "erro"
      ? "Falha ao salvar • Tentar novamente"
      : `${formatarHora(dataAtualizacao)} • Todos os cálculos consolidados`;
  const pendenciasTecnicas = (valido ? 0 : 1) + (total > 0 ? 0 : 1);

  return (
    <div className="rc-page">
      <div className="rc-container">
        <Breadcrumb etapaAtual={etapaResumo?.n ?? 4} eventoId={evento.id} />

        <header className="rc-page-heading">
          <div className="rc-page-heading__copy">
            <span className="rc-step-pill">ETAPA {etapaResumo?.n ?? 4} DE {etapas.length}</span>
            <h1>Resumo do Evento &amp; Consolidação Financeira</h1>
            <p>Visão consolidada de infraestrutura, contratos fechados e simulação analítica do ponto de equilíbrio.</p>
          </div>
          <div className="rc-heading-actions">
            <label className="rc-checkbox"><input type="checkbox" checked={incluirFornecedores} onChange={(event) => setIncluirFornecedores(event.target.checked)} /> Fornecedores</label>
            <label className="rc-checkbox"><input type="checkbox" checked={incluirReceita} onChange={(event) => setIncluirReceita(event.target.checked)} /> Receita x Custo</label>
            <button type="button" className="rc-export-button" onClick={exportarPdf}><Download size={15} aria-hidden="true" /> Exportar PDF</button>
          </div>
        </header>

        <section className="rc-card rc-event-card">
          <div className="rc-event-card__heading">
            <div>
              <span className="rc-overline">EVENTO CADASTRADO</span>
              <h2>{evento.nome || "Evento sem nome"}</h2>
            </div>
            <button type="button" className="rc-edit-button" onClick={() => navigate(`/eventos/${encodeURIComponent(evento.id)}/editar`)}>
              <Edit3 size={15} aria-hidden="true" /> Editar
            </button>
          </div>
          <div className="rc-rule" />
          <div className="rc-event-tiles">
            <Tile icon={CalendarDays} label="Data & Duração" value={formatarPeriodo(evento)} detail={`${dias || 1} ${dias === 1 ? "dia de evento" : "dias de festival"}`} />
            <Tile icon={MapPin} label="Localização" value={evento.local?.nome || "Local não informado"} detail={[evento.local?.cidade, evento.local?.uf].filter(Boolean).join(", ") || "Cidade não informada"} />
            <Tile icon={UsersRound} label="Capacidade" value={`${numero.format(minimo)} mín. / ${numero.format(Number(evento.publico?.maximo) || 0)} máx.`} detail="mín. – máx. pessoas" />
            <Tile
              icon={CheckCircle2}
              label="Validação"
              value={valido ? "Lotação aprovada" : "Lotação inválida"}
              detail={valido ? "Mínimo < máximo" : "Mínimo ≥ máximo ou acima do alvará"}
              validacao
              valido={valido}
            />
          </div>
        </section>

        <section className="rc-kpis" aria-label="Indicadores financeiros">
          <Kpi title="Produção" value={moeda.format(producao)} note={`${numero.format((evento.custos?.fornecedores ?? []).length)} itens orçados`} color="blue" />
          <Kpi title="Fiscais & Operacionais" value={moeda.format(fiscais)} note="ECAD, ISS, gateway, UTI" color="orange" />
          <Kpi title="Custo Total" value={moeda.format(total)} note="Consolidado" color="green" highlighted decor={<Calculator />} />
          <Kpi title="Break-even" value={moeda.format(breakEvenValor)} note={`p/ ingresso com ${numero.format(minimo)} pax`} color="royal" />
        </section>

        <section className="rc-charts" aria-label="Gráficos financeiros">
          <article className="rc-card rc-chart-card">
            <header className="rc-chart-heading">
              <div>
                <h2>Origem dos Custos</h2>
                <p>Decomposição percentual das obrigações</p>
              </div>
              <div className="rc-chart-controls">
                <SegmentedControl
                  label="Agrupar por"
                  value={controles.agrupamento}
                  options={[{ value: "categoria", label: "Categoria" }, { value: "tipo", label: "Tipo" }]}
                  onChange={(value) => mudarControle("agrupamento", value)}
                />
                <SegmentedControl
                  label="Tipo de gráfico"
                  value={controles.grafico}
                  options={tipoGrafico}
                  onChange={(value) => mudarControle("grafico", value)}
                  className="is-chart-type"
                />
              </div>
            </header>
            <div className="rc-rule" />
            <CostGraph dados={dadosCustos} total={total} tipo={controles.grafico} />
            <div className="rc-cost-summary">
              <span>Custos fixos de infraestrutura: <strong>{percentual.format(tipoInfra)}%</strong></span>
              <span>Encargos &amp; Operação: <strong>{percentual.format(tipoEncargos)}%</strong></span>
            </div>
          </article>

          <article className={`rc-card rc-chart-card rc-revenue-card${incluirReceita ? "" : " pdf-ocultar"}`}>
            <header className="rc-chart-heading">
              <div>
                <h2>Receita × Custo por Ocupação</h2>
                <p>{tituloPreco}</p>
              </div>
              <SegmentedControl
                label="Visualização da receita"
                value={controles.receita}
                options={tipoReceita}
                onChange={(value) => mudarControle("receita", value)}
              />
            </header>
            <div className="rc-rule" />
            <RevenueChart
              evento={evento}
              total={total}
              preco={preco}
              ingressoBreakEven={ingressoBreakEven}
              lucro={lucro}
              modo={controles.receita}
            />
            <div className="rc-chart-legend">
              <span><i className="is-revenue" /> Receita Estimada</span>
              <span><i className="is-cost" /> Custo Fixo ({formatarMilhar(total)})</span>
              <strong>Lucro máx: +{moeda.format(lucro)}</strong>
            </div>
          </article>
        </section>

        <section className={`rc-card rc-contract-card${incluirFornecedores ? "" : " pdf-ocultar"}`}>
          <header className="rc-contract-heading">
            <div>
              <h2>Fornecedores Selecionados</h2>
              <p>Contratos validados e integrados no plano orçamentário</p>
            </div>
            <span className="rc-contract-count">{contratos.length} {contratos.length === 1 ? "Contrato Concluído" : "Contratos Concluídos"}</span>
          </header>
          <div className="rc-table-wrap">
            <table className="rc-contract-table">
              <thead>
                <tr><th scope="col">Fornecedor</th><th scope="col">Categoria</th><th scope="col">Validade</th><th scope="col" className="is-value">Valor</th></tr>
              </thead>
              <tbody>
                {contratos.map(({ proposta, fornecedor, item }) => {
                  const categoria = obterCategoria(item.categoriaId);
                  const Icon = categoria.id === "palco" || categoria.id === "estruturas"
                    ? Building2
                    : categoria.id === "seguranca"
                      ? Shield
                      : Volume2;
                  return (
                    <tr key={proposta.id}>
                      <td data-label="Fornecedor"><span className="rc-supplier-name"><i><Icon size={16} aria-hidden="true" /></i>{fornecedor.nome}</span></td>
                      <td data-label="Categoria"><span className="rc-category-tag">{categoria.nome}</span></td>
                      <td data-label="Validade">{formatarDataCurta(proposta.validade)
                        ? new Date(`${String(proposta.validade).slice(0, 10)}T12:00:00`).toLocaleDateString("pt-BR")
                        : "—"}</td>
                      <td data-label="Valor" className="is-value">{moeda.format(Number(proposta.valor) || 0)}</td>
                    </tr>
                  );
                })}
                {contratos.length === 0 && (
                  <tr><td className="rc-table-empty" colSpan="4">Nenhuma proposta confirmada até o momento.</td></tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3"><strong>Total contratado</strong><small>(propostas confirmadas)</small></td>
                  <td className="is-value">{moeda.format(totaisAssinados)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          {itensPendentesEvento.length > 0 && (
            <p className="rc-pending-note"><AlertTriangle size={14} aria-hidden="true" /> {itensPendentesEvento.length} {itensPendentesEvento.length === 1 ? "item ainda sem contrato" : "itens ainda sem contrato"} (orçado: {moeda.format(pendenciaOrcada)})</p>
          )}
        </section>

      </div>

      <footer className="rc-bottom-bar">
        <div className="rc-bottom-bar__inner">
          <button type="button" className="rc-back-button" onClick={() => navigate(`/eventos/${encodeURIComponent(evento.id)}/propostas`)}>
            <ArrowLeft size={15} aria-hidden="true" /> Voltar
          </button>
          <button
            type="button"
            className={`rc-save-status is-${statusSalvar}${pendenciasTecnicas ? " has-pending" : ""}`}
            onClick={statusSalvar === "erro" ? tentarSalvarNovamente : undefined}
            aria-live="polite"
          >
            <i />
            {pendenciasTecnicas
              ? `${pendenciasTecnicas} ${pendenciasTecnicas === 1 ? "pendência" : "pendências"} no cálculo`
              : statusTexto}
          </button>
          <button
            type="button"
            className="rc-next-button"
            onClick={avancarEtapa}
            disabled={!valido || total <= 0}
            title={!valido ? "Corrija a validação de lotação antes de avançar." : total <= 0 ? "O custo total deve ser maior que zero." : undefined}
          >
            Precificar ingresso <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </footer>

      {modalPendencias && (
        <div className="rc-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setModalPendencias(false);
        }}>
          <section className="rc-modal" ref={modalRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="rc-pending-title">
            <h2 id="rc-pending-title">Seguir com {itensPendentesEvento.length} {itensPendentesEvento.length === 1 ? "item sem contrato" : "itens sem contrato"}?</h2>
            <p>O valor orçado pendente é {moeda.format(pendenciaOrcada)}. Você poderá retomar as propostas depois.</p>
            <div className="rc-modal__actions">
              <button type="button" className="rc-back-button" onClick={() => { setModalPendencias(false); navigate(`/eventos/${encodeURIComponent(evento.id)}/propostas`); }}>Voltar às propostas</button>
              <button type="button" className="rc-next-button" onClick={continuarComPendencias}>Continuar <ArrowRight size={15} aria-hidden="true" /></button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
