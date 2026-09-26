import {
  Archive,
  BadgeCheck,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  CircleDollarSign,
  Landmark,
  Pencil,
  ReceiptText,
  Ticket,
} from "lucide-react";
import { Link } from "react-router-dom";

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const indicadores = [
  { rotulo: "Orçamento", valor: 256000, detalhe: "7 itens orçados para concorrência", icone: Archive },
  { rotulo: "Custos Fiscais & Operacionais", valor: 96500, detalhe: "Taxas, ECAD, UTi e impostos", icone: Landmark },
  { rotulo: "Custo Total Projetado", valor: 352500, detalhe: "Total consolidado", icone: ReceiptText },
  { rotulo: "Break-even", valor: 100.71, detalhe: "Preço mínimo de equilíbrio p/ cota", icone: Ticket },
];

const cenarios = [
  { nome: "Cenário Conservador", publico: 3500, ingresso: 100.71, tipo: "Público Mínimo", classe: "conservador" },
  { nome: "Cenário Equilibrado", publico: 6000, ingresso: 58.75, tipo: "Médio", classe: "equilibrado" },
  { nome: "Lotação Máxima", publico: 8500, ingresso: 41.47, tipo: "Capacidade Total", classe: "maximo" },
];

export default function Resumo() {
  return (
    <div className="financial-summary">
      <header className="financial-summary__heading">
        <h1>Resumo do Evento &amp; Dashboard Financeiro</h1>
      </header>

      <section className="event-summary-card">
        <header className="event-summary-card__heading">
          <span className="summary-icon"><CalendarDays size={17} aria-hidden="true" /></span>
          <div><small>Evento Cadastrado</small><h2>Festival Aurora Sound 2026</h2></div>
          <Link to="/organizador/eventos/novo" className="button button--secondary"><Pencil size={13} aria-hidden="true" /> Editar</Link>
        </header>
        <div className="event-summary-facts">
          <SummaryFact label="Data & Duração" value="14 a 16 Nov 2026" detail="3 dias de festival" />
          <SummaryFact label="Localização" value="Pedreira Paulo Leminski" detail="Curitiba, PR" />
          <SummaryFact label="Capacidade de Público" value="3.500 mín / 8.500 máx" detail="Capacidade do Alvará" />
          <div className="summary-fact">
            <span>Validação Técnica</span>
            <strong><BadgeCheck size={14} aria-hidden="true" /> Lotação Aprovada</strong>
            <small>Mínimo &lt; Máximo respeitado</small>
          </div>
        </div>
      </section>

      <section className="finance-metrics" aria-label="Indicadores financeiros">
        {indicadores.map(({ rotulo, valor, detalhe, icone: Icon }) => (
          <article className="finance-metric" key={rotulo}>
            <div><span>{rotulo}</span><Icon size={15} aria-hidden="true" /></div>
            <strong>{moeda.format(valor)}</strong>
            <small>{detalhe}</small>
          </article>
        ))}
      </section>

      <div className="financial-summary__details">
        <section className="cost-origin-card">
          <h2>Origem dos Custos</h2>
          <div className="cost-donut" role="img" aria-label="Custos totais: 72,6% de fornecedores, 27,4% de custos fiscais e fixos">
            <div><small>Total Geral</small><strong>352,5k</strong></div>
          </div>
          <ul className="cost-origin-legend">
            <li><span className="legend-swatch suppliers" /> Itens de Fornecedores <strong>72,6% (256k)</strong></li>
            <li><span className="legend-swatch fixed-costs" /> Custos Fiscais / Fixos <strong>27,4% (96,5k)</strong></li>
            <li><span className="legend-swatch accepted" /> Propostas Aceitas <strong>0% (Fase inicial)</strong></li>
          </ul>
        </section>

        <section className="ticket-simulation-card">
          <h2>Simulação de Ticket <ChartNoAxesColumnIncreasing size={15} aria-hidden="true" /></h2>
          <div className="ticket-scenarios">
            {cenarios.map((cenario) => <TicketScenario key={cenario.nome} cenario={cenario} />)}
          </div>
        </section>
      </div>

      <footer className="financial-summary__footer">
        <Link to="/organizador/eventos/novo/calculo" className="button button--secondary">Voltar ao cálculo</Link>
        <Link to="/organizador/eventos/novo/publicar" className="button button--primary"><CircleDollarSign size={15} aria-hidden="true" /> Revisar e publicar</Link>
      </footer>
    </div>
  );
}

function SummaryFact({ label, value, detail }) {
  return <div className="summary-fact"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;
}

function TicketScenario({ cenario }) {
  return (
    <article className={`ticket-scenario ${cenario.classe}`}>
      <header><strong>{cenario.nome}</strong><span>{cenario.tipo} ({new Intl.NumberFormat("pt-BR").format(cenario.publico)})</span></header>
      <strong className="ticket-scenario__price">{moeda.format(cenario.ingresso)}</strong>
      <small>por ingresso</small>
    </article>
  );
}
