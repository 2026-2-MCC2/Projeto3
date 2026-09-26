import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Calculator,
  ChartNoAxesColumnIncreasing,
  MapPin,
  ReceiptText,
  SlidersHorizontal,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";

const custoTotal = 210000;
const capacidadeTotal = 5000;
const cenariosPublico = [
  { id: "minimo", nome: "Conservador", detalhe: "Mínimo · 50%", publico: 2500, classe: "conservador" },
  { id: "esperado", nome: "Esperado", detalhe: "Esperado · 70%", publico: 3500, classe: "esperado" },
  { id: "maximo", nome: "Otimista", detalhe: "Máximo · 90%", publico: 4500, classe: "otimista" },
];
const margens = [
  { valor: 10, titulo: "Baixo Risco / Preço Agressivo", rotulo: "Margem Enxuta", detalhe: "Rápida adesão e alta rotatividade, porém com margem de segurança reduzida." },
  { valor: 20, titulo: "Padrão Recomendado", rotulo: "Ativo", detalhe: "Equilíbrio ideal entre atratividade mercadológica e sustentabilidade financeira do evento." },
  { valor: 30, titulo: "Alta Rentabilidade", rotulo: "Premium", detalhe: "Foco em eventos com público qualificado e demanda inelástica." },
  { valor: 40, titulo: "Maximização de Retorno", rotulo: "Exclusivo", detalhe: "Exige alto valor agregado, experiências exclusivas e marketing direcionado." },
];

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const numero = new Intl.NumberFormat("pt-BR");

function calcularTicket(publico, margem) {
  return custoTotal / (publico * (1 - margem / 100));
}

export default function Calculo() {
  const [margem, setMargem] = useState(20);
  const [publicos, setPublicos] = useState({ minimo: 2500, esperado: 3500, maximo: 4500 });

  const cenarios = useMemo(() => cenariosPublico.map((cenario) => {
    const publico = publicos[cenario.id];
    const ticket = calcularTicket(publico, margem);
    const receita = ticket * publico;
    return { ...cenario, publico, ticket, receita, lucro: receita - custoTotal };
  }), [margem, publicos]);

  const precoMinimo = calcularTicket(publicos.minimo, margem);
  const precoMaximo = calcularTicket(publicos.maximo, margem);

  function atualizarPublico(id, value) {
    setPublicos((atuais) => ({ ...atuais, [id]: Math.max(1, Number(value) || 1) }));
  }

  return (
    <div className="ticket-calculation">
      <header className="ticket-calculation__header">
        <h1>Cálculo e Simulação de Ticket</h1>
      </header>

      <div className="ticket-calculation__grid">
        <div className="ticket-calculation__primary">
          <section className="operational-card">
            <SectionTitle icon={SlidersHorizontal} title="Parâmetros Operacionais do Evento" />

            <div className="event-facts">
              <div><span>Nome do Evento</span><strong>Festival Aurora Sound 2026</strong></div>
              <div><span>Local</span><strong><MapPin size={12} aria-hidden="true" /> Arena Aurora · Curitiba, PR</strong></div>
              <div><span>Custo Consolidado (Orçamento + Fornecedores)</span><strong>{moeda.format(custoTotal)} <em>Fechado</em></strong></div>
              <div><span>Capacidade Total do Local</span><strong>{numero.format(capacidadeTotal)} <small>pessoas</small></strong></div>
            </div>

            <div className="audience-section">
              <h3><UsersRound size={13} aria-hidden="true" /> Projeção de Público Pagante</h3>
              <div className="audience-fields">
                {cenariosPublico.map((cenario) => (
                  <label className="audience-field" key={cenario.id}>
                    <span>{cenario.detalhe} <small>{Math.round((publicos[cenario.id] / capacidadeTotal) * 100)}%</small></span>
                    <div><input type="number" min="1" max={capacidadeTotal} value={publicos[cenario.id]} onChange={(event) => atualizarPublico(cenario.id, event.target.value)} /><small>pax</small></div>
                  </label>
                ))}
              </div>
            </div>

            <div className="pricing-formula">
              <strong><Calculator size={13} aria-hidden="true" /> Fórmula de Precificação Homologada</strong>
              <p>Ticket Estimado = Custo Total / [Público × (1 − Margem)]</p>
            </div>
          </section>

          <section className="dynamic-scenarios">
            <header className="dynamic-scenarios__heading">
              <h2>Projeção de Cenários Dinâmicos</h2>
              <span>Margem simulada: {margem}%</span>
            </header>
            <div className="scenario-cards">
              {cenarios.map((cenario) => <ScenarioCard key={cenario.id} cenario={cenario} ativo={cenario.id === "esperado"} />)}
            </div>
          </section>
        </div>

        <aside className="ticket-calculation__sidebar">
          <section className="margin-card">
            <SectionTitle icon={ChartNoAxesColumnIncreasing} title="Timeline de Margens" />
            <div className="margin-control">
              <label htmlFor="margin-range">Margem Operacional Desejada <strong>{margem}<small>%</small></strong></label>
              <input id="margin-range" type="range" min="0" max="50" step="1" value={margem} onChange={(event) => setMargem(Number(event.target.value))} />
              <div className="margin-markers"><span>0% (Custo Puro)</span><span>20% (Padrão)</span><span>50%</span><span>99% (Teto)</span></div>
            </div>

            <div className="margin-presets">
              {margens.map((opcao) => <MarginOption key={opcao.valor} opcao={opcao} ativa={margem === opcao.valor} minimo={calcularTicket(publicos.minimo, opcao.valor)} maximo={calcularTicket(publicos.maximo, opcao.valor)} onClick={() => setMargem(opcao.valor)} />)}
            </div>

            <section className="taxes-card">
              <h3><ReceiptText size={13} aria-hidden="true" /> Encargos Fiscais & Taxa Plataforma</h3>
              <div><span>Taxa TrocaTicket (Gestão/Checkout):</span><strong>8% <small>(+{moeda.format(precoMinimo * 0.08)})</small></strong></div>
              <div><span>Alíquota estimada de impostos (ISS/Simples):</span><strong>5% <small>(+{moeda.format(precoMinimo * 0.05)})</small></strong></div>
              <div className="consumer-price"><span>Ticket Final Consumidor (Min. – Máx.):</span><strong>{moeda.format(precoMinimo * 1.13)} <i>–</i> {moeda.format(precoMaximo * 1.13)}</strong></div>
            </section>
          </section>

          <footer className="ticket-calculation__actions">
            <Link to="/organizador/eventos/novo/proposta" className="button button--secondary"><ArrowLeft size={14} aria-hidden="true" /> Voltar</Link>
            <Link to="/organizador/eventos/novo/resumo" className="button button--primary">Continuar <BadgeCheck size={14} aria-hidden="true" /></Link>
          </footer>
        </aside>
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }) {
  return <h2 className="ticket-section-title"><span><Icon size={15} aria-hidden="true" /></span>{title}</h2>;
}

function ScenarioCard({ cenario, ativo }) {
  return (
    <article className={`scenario-card ${ativo ? "is-active" : ""}`}>
      {ativo && <span className="scenario-card__flag">Ponto ótimo</span>}
      <header><strong>{cenario.nome}</strong><span>{cenario.id === "minimo" ? "Min." : cenario.id === "maximo" ? "Máx." : "Médio"}</span></header>
      <small>{numero.format(cenario.publico)} pagantes</small>
      <span className="scenario-card__label">Ticket calculado</span>
      <strong className="scenario-card__ticket">{moeda.format(cenario.ticket)}</strong>
      <div className="scenario-card__finance"><span>Receita Bruta<strong>{moeda.format(cenario.receita)}</strong></span><span>Lucro Líquido<strong>{moeda.format(cenario.lucro)}</strong></span></div>
    </article>
  );
}

function MarginOption({ opcao, ativa, minimo, maximo, onClick }) {
  return (
    <button className={`margin-option ${ativa ? "is-active" : ""}`} type="button" onClick={onClick} aria-pressed={ativa}>
      <span className="margin-option__marker" />
      <span className="margin-option__content">
        <span className="margin-option__title"><strong>{opcao.valor}% · {opcao.titulo}</strong><small>{ativa ? "Ativo" : opcao.rotulo}</small></span>
        <span className="margin-option__prices"><span>Ticket Min: <strong>{moeda.format(minimo)}</strong></span><span>Ticket Máx: <strong>{moeda.format(maximo)}</strong></span></span>
        <span className="margin-option__description">{opcao.detalhe}</span>
      </span>
    </button>
  );
}
