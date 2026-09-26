import { useMemo, useState } from "react";
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

const categorias = [
  { nome: "Todos os Itens", total: 8 },
  { nome: "Som & PA", total: 3 },
  { nome: "Iluminação Cênica", total: 2 },
  { nome: "Estruturas & Palco", total: 2 },
  { nome: "Segurança Privada", total: 1 },
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

const distribuicao = [
  { nome: "Som & PA", total: 3, cor: "som" },
  { nome: "Iluminação", total: 2, cor: "luz" },
  { nome: "Estruturas", total: 2, cor: "estrutura" },
  { nome: "Segurança", total: 1, cor: "seguranca" },
];

const formatoMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function Proposta() {
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos os Itens");
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState("menor-valor");
  const [selecionada, setSelecionada] = useState("Acústica Prime Engenharia de Som");

  const propostasVisiveis = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    return propostas
      .filter((proposta) => categoriaAtiva === "Todos os Itens" || proposta.categoria === categoriaAtiva)
      .filter((proposta) => !termo || `${proposta.nome} ${proposta.servico}`.toLocaleLowerCase("pt-BR").includes(termo))
      .sort((a, b) => ordem === "menor-valor" ? a.valor - b.valor : b.valor - a.valor);
  }, [busca, categoriaAtiva, ordem]);

  return (
    <div className="propostas-page">
      <header className="propostas-page__heading">
        <h1>Propostas Recebidas</h1>
      </header>

      <div className="propostas-toolbar">
        <div className="proposal-filters" aria-label="Filtrar propostas por categoria">
          {categorias.map(({ nome, total }) => (
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
                key={proposta.nome}
                proposta={proposta}
                selecionada={selecionada === proposta.nome}
                onSelect={() => setSelecionada(proposta.nome)}
              />
            )) : <p className="proposal-empty">Nenhuma proposta corresponde aos filtros selecionados.</p>}
          </div>
        </section>

        <ProposalSidebar />
      </div>
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

function ProposalSidebar() {
  return (
    <aside className="proposals-sidebar">
      <p className="proposals-sidebar__eyebrow">Faixa de Estado</p>
      <section className="proposal-summary-card">
        <div className="proposal-total"><strong>8 Propostas</strong><span>4 itens de custo aguardando fechamento definitivo</span></div>
        <div className="category-distribution">
          <div className="sidebar-section-heading"><strong>Distribuição por Categoria</strong><span>8 totais</span></div>
          <div className="distribution-bar" aria-label="Distribuição: 3 propostas de Som e PA, 2 de Iluminação, 2 de Estruturas e 1 de Segurança">
            {distribuicao.map((item) => <span key={item.cor} className={`distribution-segment ${item.cor}`} style={{ flexGrow: item.total }} />)}
          </div>
          <div className="distribution-legend">
            {distribuicao.map((item) => <span key={item.cor}><i className={item.cor} />{item.nome} ({item.total})</span>)}
          </div>
        </div>
        <div className="projected-budget">
          <h3>Resumo Orçamentário Projetado</h3>
          <BudgetRow label="Economia Total Projetada:" value="R$ 17.200,00" highlight />
          <BudgetRow label="Menor Proposta Ativa:" value="R$ 31.000,00" />
          <BudgetRow label="Média das Propostas:" value="R$ 47.060,00" />
          <BudgetRow label="Teto Orçado do Evento:" value="R$ 210.000,00" />
        </div>
      </section>

      <div className="proposal-event-image">
        <img src="https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=700&q=85" alt="Palco de show ao entardecer com público" />
        <span>Palco Principal <i>•</i> Arena Aurora</span>
      </div>
      <div className="proposal-help"><CircleHelp size={15} aria-hidden="true" /> Compare valores, avaliações e validade antes de escolher.</div>
    </aside>
  );
}

function BudgetRow({ label, value, highlight = false }) {
  return <div className="budget-row"><span>{label}</span><strong className={highlight ? "is-highlighted" : ""}>{value}</strong></div>;
}
