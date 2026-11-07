import { useEffect, useState, useSyncExternalStore } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeftRight,
  AudioLines,
  BadgeCheck,
  Building2,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  Lightbulb,
  Search,
  Shield,
  Speaker,
  Star,
} from "lucide-react";
import {
  getStoreSnapshot,
  setEvento,
  setEventoAtivo,
  subscribe,
} from "../services/eventoStore.js";
import { custoTotal, propostasAceitas } from "../services/calculos.js";

const categorias = [
  { nome: "Todos os Itens" },
  { nome: "Som & PA" },
  { nome: "Iluminação Cênica" },
  { nome: "Estruturas & Palco" },
  { nome: "Segurança Privada" },
];

const propostas = [
  {
    nome: "Acústica Prime Engenharia de Som",
    categoria: "Som & PA",
    servico: "Som & PA Acústico",
    cnpj: "14.820.301/001-44",
    cidade: "Curitiba, PR",
    avaliacao: "4.9",
    eventos: 42,
    valor: 48500,
    validade: "30/11/2026",
    icone: Speaker,
    auditada: true,
    selecionada: true,
  },
  {
    nome: "SoundWave Produções & Áudio",
    categoria: "Som & PA",
    servico: "Som & PA Acústico",
    cnpj: "09.341.220/001-90",
    cidade: "São Paulo, SP",
    avaliacao: "4.7",
    eventos: 28,
    valor: 52000,
    validade: "28/11/2026",
    comparacao: "-5,4% vs. Orçado (R$ 55.000,00)",
    icone: AudioLines,
  },
  {
    nome: "Luz & Arte Cenografia Iluminação",
    categoria: "Iluminação Cênica",
    servico: "Iluminação Cênica a Laser",
    cnpj: "22.189.540/001-12",
    cidade: "Florianópolis, SC",
    avaliacao: "4.8",
    eventos: 34,
    valor: 39800,
    validade: "05/12/2026",
    icone: Lightbulb,
    auditada: true,
  },
  {
    nome: "StagePro Estruturas Metálicas",
    categoria: "Estruturas & Palco",
    servico: "Palco & Cobertura Geodésica",
    cnpj: "18.239.001/002-81",
    cidade: "Porto Alegre, RS",
    avaliacao: "4.9",
    eventos: 61,
    valor: 64000,
    validade: "01/12/2026",
    icone: Building2,
    auditada: true,
  },
  {
    nome: "Sentinela Segurança Especializada",
    categoria: "Segurança Privada",
    servico: "Vigilância e Controle de Acesso",
    cnpj: "33.190.722/001-08",
    cidade: "Curitiba, PR",
    avaliacao: "4.9",
    eventos: 53,
    valor: 31000,
    validade: "15/12/2026",
    icone: Shield,
  },
];

const categoriasDistribuicao = [
  { nome: "Som & PA", categoria: "Som & PA", cor: "som" },
  { nome: "Iluminação", categoria: "Iluminação Cênica", cor: "luz" },
  { nome: "Estruturas", categoria: "Estruturas & Palco", cor: "estrutura" },
  { nome: "Segurança", categoria: "Segurança Privada", cor: "seguranca" },
];

const formatoMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function Proposta() {
  const store = useSyncExternalStore(subscribe, getStoreSnapshot, getStoreSnapshot);
  const { id } = useParams();
  const evento = store.eventos.find((item) => item.id === (id ?? store.eventoAtivoId));
  useEffect(() => {
    if (!evento) return;
    if (evento.id !== store.eventoAtivoId) setEventoAtivo(evento.id);
    if (evento.etapaAtual !== "proposta") setEvento(evento.id, { etapaAtual: "proposta" });
  }, [evento, store.eventoAtivoId]);
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos os Itens");
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState("menor-valor");
  const propostasDoEvento = evento
    ? evento.propostas.map((proposta, indice) => ({
        ...propostas[indice % propostas.length],
        ...proposta,
      }))
    : [];
  const selecionada = propostasDoEvento.find((proposta) => proposta.selecionada)?.fornecedorId
    ?? propostasDoEvento[0]?.fornecedorId;

  const termo = busca.trim().toLocaleLowerCase("pt-BR");
  const propostasVisiveis = propostasDoEvento
    .filter((proposta) => categoriaAtiva === "Todos os Itens" || proposta.categoria === categoriaAtiva)
    .filter((proposta) => !termo || `${proposta.nome} ${proposta.servico}`.toLocaleLowerCase("pt-BR").includes(termo))
    .sort((a, b) => ordem === "menor-valor" ? a.valor - b.valor : b.valor - a.valor);

  const propostasPorCategoria = categorias.map(({ nome }) => ({
    nome,
    total: nome === "Todos os Itens"
      ? propostasDoEvento.length
      : propostasDoEvento.filter((proposta) => proposta.categoria === nome).length,
  }));
  const propostasAnalise = propostasDoEvento.filter((proposta) => proposta.status === "em_analise").length;
  const totalEvento = evento ? custoTotal(evento) : 0;
  const totalAceito = evento ? propostasAceitas(evento).reduce((total, proposta) => total + proposta.valor, 0) : 0;
  const menorProposta = propostasDoEvento.length
    ? Math.min(...propostasDoEvento.map((proposta) => proposta.valor))
    : 0;
  const mediaPropostas = propostasDoEvento.length
    ? propostasDoEvento.reduce((total, proposta) => total + proposta.valor, 0) / propostasDoEvento.length
    : 0;

  function selecionarProposta(fornecedorId) {
    if (!evento) return;
    setEvento(evento.id, {
      propostas: evento.propostas.map((proposta) => ({
        ...proposta,
        selecionada: proposta.fornecedorId === fornecedorId,
      })),
    });
  }

  if (!evento) return <p className="event-empty">Selecione ou cadastre um evento para ver as propostas.</p>;

  return (
    <div className="propostas-page">
      <header className="propostas-page__heading">
        <h1>Propostas Recebidas</h1>
        <p>{evento.nome || "Novo evento"}</p>
        <div className="proposal-explainer">
          <Info size={17} aria-hidden="true" />
          <p>
            <strong>Como funciona:</strong> fornecedores respondem aos itens do seu evento com preço, condições e validade. Compare as ofertas e selecione uma para destacar. Essa seleção não confirma contratação; ela apenas ajuda na análise.
          </p>
        </div>
      </header>

      <div className="propostas-toolbar">
        <div className="proposal-filters" aria-label="Filtrar propostas por categoria">
          {propostasPorCategoria.map(({ nome, total }) => (
            <button
              className={categoriaAtiva === nome ? "proposal-filter is-active" : "proposal-filter"}
              key={nome}
              onClick={() => setCategoriaAtiva(nome)}
              type="button"
              aria-pressed={categoriaAtiva === nome}
            >
              {nome}<span>{total}</span>
            </button>
          ))}
        </div>
        <div className="proposal-controls">
          <label className="proposal-search">
            <Search size={15} aria-hidden="true" />
            <span className="visually-hidden">Filtrar fornecedor ou item</span>
            <input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Filtrar fornecedor ou item..." />
          </label>
          <label className="proposal-sort">
            <span className="visually-hidden">Ordenar propostas</span>
            <select value={ordem} onChange={(event) => setOrdem(event.target.value)}>
              <option value="menor-valor">Ordenar por: Menor Valor</option>
              <option value="maior-valor">Ordenar por: Maior Valor</option>
            </select>
            <ChevronDown size={14} aria-hidden="true" />
          </label>
        </div>
      </div>

      <div className="propostas-layout">
        <section className="comparison-card">
          <header className="comparison-card__heading">
            <h2><ArrowLeftRight size={17} aria-hidden="true" /> Matriz Comparativa de Fornecedores</h2>
            <div className="comparison-legend"><span><i className="is-selected" /> Opção Selecionada</span><span><i /> Em Análise</span></div>
          </header>
          <div className="supplier-list">
            {propostasVisiveis.length ? propostasVisiveis.map((proposta) => (
              <SupplierRow
                key={proposta.fornecedorId}
                proposta={proposta}
                selecionada={selecionada === proposta.fornecedorId}
                onSelect={() => selecionarProposta(proposta.fornecedorId)}
              />
            )) : <p className="proposal-empty">{propostasDoEvento.length ? "Nenhuma proposta corresponde aos filtros selecionados." : "Este evento ainda não recebeu propostas."}</p>}
          </div>
        </section>

        <ProposalSidebar
          evento={evento}
          propostas={propostasDoEvento}
          propostasAnalise={propostasAnalise}
          totalEvento={totalEvento}
          totalAceito={totalAceito}
          menorProposta={menorProposta}
          mediaPropostas={mediaPropostas}
        />
      </div>

      <footer className="proposal-step-actions">
        <Link to="/organizador/eventos/novo/custo" className="button button--secondary">Voltar aos custos</Link>
        <Link to="/organizador/eventos/novo/calculo" className="button button--primary">Continuar para cálculo</Link>
      </footer>
    </div>
  );
}

function SupplierRow({ proposta, selecionada, onSelect }) {
  const Icon = proposta.icone;
  return (
    <article className="supplier-row">
      <button className="supplier-row__select" type="button" onClick={onSelect} aria-label={`Selecionar ${proposta.nome}`} aria-pressed={selecionada}>
        <span className={selecionada ? "selection-indicator is-selected" : "selection-indicator"} />
      </button>
      <span className="supplier-row__icon"><Icon size={18} aria-hidden="true" /></span>
      <div className="supplier-row__details">
        <div className="supplier-row__name">
          <strong>{proposta.nome}</strong>
          {proposta.auditada && <span className="audited-badge"><BadgeCheck size={12} aria-hidden="true" /> Auditada</span>}
          <span className="supplier-rating"><Star size={11} fill="currentColor" aria-hidden="true" /> {proposta.avaliacao} ({proposta.eventos} eventos)</span>
        </div>
        <p>CNPJ: {proposta.cnpj} <span>•</span> {proposta.cidade} <span>•</span> <strong>Item: {proposta.servico}</strong></p>
      </div>
      <div className="supplier-row__price">
        <strong>{formatoMoeda.format(proposta.valor)}</strong>
        {proposta.comparacao && <span className="comparison-badge">{proposta.comparacao}</span>}
        <small><CalendarDays size={12} aria-hidden="true" /> Válida até {proposta.validade}</small>
      </div>
    </article>
  );
}

function ProposalSidebar({
  evento,
  propostas,
  propostasAnalise,
  totalEvento,
  totalAceito,
  menorProposta,
  mediaPropostas,
}) {
  const distribuicao = categoriasDistribuicao.map((item) => ({
    ...item,
    total: propostas.filter((proposta) => proposta.categoria === item.categoria).length,
  })).filter((item) => item.total > 0);

  return (
    <aside className="proposals-sidebar">
      <p className="proposals-sidebar__eyebrow">Faixa de Estado</p>
      <section className="proposal-summary-card">
        <div className="proposal-total"><strong>{propostasAnalise} Propostas em análise</strong><span>{propostas.length} propostas vinculadas a {evento.nome || "este evento"}</span></div>
        <div className="category-distribution">
          <div className="sidebar-section-heading"><strong>Distribuição por Categoria</strong><span>{propostas.length} totais</span></div>
          <div
            className="distribution-bar"
            aria-label={distribuicao.length
              ? `Distribuição: ${distribuicao.map((item) => `${item.total} de ${item.nome}`).join(", ")}`
              : "Nenhuma proposta recebida"}
          >
            {distribuicao.map((item) => <span key={item.cor} className={`distribution-segment ${item.cor}`} style={{ flexGrow: item.total }} />)}
          </div>
          <div className="distribution-legend">
            {distribuicao.map((item) => <span key={item.cor}><i className={item.cor} />{item.nome} ({item.total})</span>)}
          </div>
        </div>
        <div className="projected-budget">
          <h3>Resumo Orçamentário Projetado</h3>
          <BudgetRow label="Propostas Aceitas:" value={formatoMoeda.format(totalAceito)} highlight />
          <BudgetRow label="Menor Proposta Ativa:" value={menorProposta ? formatoMoeda.format(menorProposta) : "—"} />
          <BudgetRow label="Média das Propostas:" value={propostas.length ? formatoMoeda.format(mediaPropostas) : "—"} />
          <BudgetRow label="Orçamento Total do Evento:" value={formatoMoeda.format(totalEvento)} />
        </div>
      </section>

      <div className="proposal-event-image">
        {evento.capa && <img src={evento.capa} alt="" />}
        <span>{evento.nome || "Novo evento"} <i>•</i> {evento.local.nome || "Local não definido"}</span>
      </div>
      <div className="proposal-help"><CircleHelp size={15} aria-hidden="true" /> Compare valores, avaliações e validade antes de escolher.</div>
    </aside>
  );
}

function BudgetRow({ label, value, highlight = false }) {
  return <div className="budget-row"><span>{label}</span><strong className={highlight ? "is-highlighted" : ""}>{value}</strong></div>;
}
