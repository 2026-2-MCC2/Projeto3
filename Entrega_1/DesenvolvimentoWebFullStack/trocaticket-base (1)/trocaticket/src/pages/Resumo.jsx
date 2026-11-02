import { useEffect, useSyncExternalStore } from "react";
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
import {
  getStoreSnapshot,
  setEvento,
  subscribe,
} from "../services/eventoStore.js";
import {
  custoTotal,
  duracaoEmDias,
  ingressoSugerido,
  publicoEsperado,
} from "../services/calculos.js";

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const numero = new Intl.NumberFormat("pt-BR");
const percentual = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

export default function Resumo() {
  const store = useSyncExternalStore(subscribe, getStoreSnapshot, getStoreSnapshot);
  const evento = store.eventos.find((item) => item.id === store.eventoAtivoId);
  useEffect(() => {
    if (evento && evento.etapaAtual !== "resumo") {
      setEvento(evento.id, { etapaAtual: "resumo" });
    }
  }, [evento]);

  if (!evento) return <p className="event-empty">Selecione ou cadastre um evento para ver o resumo.</p>;

  const total = custoTotal(evento);
  const fornecedores = evento.custos.fornecedores.reduce((soma, item) => soma + item.valor, 0);
  const fiscal = evento.custos.fiscais;
  const aceito = evento.custos.propostasAceitas.reduce((soma, item) => soma + item.valor, 0);
  const percentualAceito = total > 0 ? Math.round((aceito / total) * 100) : 0;
  const margem = evento.precificacao.margem;
  const publicoMedio = publicoEsperado(evento);
  const duracao = duracaoEmDias(evento);
  const cenarios = [
    {
      nome: "Cenário Conservador",
      publico: evento.publico.minimo,
      classe: "conservador",
      tipo: "Público Mínimo",
    },
    {
      nome: "Cenário Equilibrado",
      publico: publicoMedio,
      classe: "equilibrado",
      tipo: "Público Esperado",
    },
    {
      nome: "Lotação Máxima",
      publico: evento.publico.maximo,
      classe: "maximo",
      tipo: "Capacidade Total",
    },
  ];
  const indicadores = [
    { rotulo: "Orçamento", valor: fornecedores, detalhe: "Custos de fornecedores", icone: Archive },
    { rotulo: "Custos Fiscais & Operacionais", valor: fiscal, detalhe: "Taxas e impostos previstos", icone: Landmark },
    { rotulo: "Custo Total Projetado", valor: total, detalhe: "Total consolidado", icone: ReceiptText },
    {
      rotulo: "Ingresso Sugerido",
      valor: ingressoSugerido(evento),
      detalhe: "Preço calculado para o público esperado",
      icone: Ticket,
    },
  ];

  return (
    <div className="financial-summary">
      <header className="financial-summary__heading">
        <h1>Resumo do Evento &amp; Dashboard Financeiro</h1>
      </header>

      <section className="event-summary-card">
        <header className="event-summary-card__heading">
          <span className="summary-icon"><CalendarDays size={17} aria-hidden="true" /></span>
          <div><small>Evento Cadastrado</small><h2>{evento.nome || "Novo evento"}</h2></div>
          <Link to="/organizador/eventos/novo" className="button button--secondary"><Pencil size={13} aria-hidden="true" /> Editar</Link>
        </header>
        <div className="event-summary-facts">
          <SummaryFact
            label="Data & Duração"
            value={evento.dataInicio
              ? `${new Date(`${evento.dataInicio.slice(0, 10)}T12:00:00`).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}${evento.dataFim ? ` – ${new Date(`${evento.dataFim.slice(0, 10)}T12:00:00`).toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}` : ""}`
              : "Data não definida"}
            detail={duracao ? `${numero.format(duracao)} ${duracao === 1 ? "dia" : "dias"} de evento` : evento.categoria}
          />
          <SummaryFact
            label="Localização"
            value={evento.local.nome || "Local não definido"}
            detail={`${evento.local.cidade}, ${evento.local.uf}`}
          />
          <SummaryFact
            label="Capacidade de Público"
            value={`${numero.format(evento.publico.minimo)} mín / ${numero.format(evento.publico.maximo)} máx`}
            detail={`Capacidade do alvará: ${numero.format(evento.capacidadeAlvara)}`}
          />
          <div className="summary-fact">
            <span>Validação Técnica</span>
            <strong><BadgeCheck size={14} aria-hidden="true" /> Lotação configurada</strong>
            <small>Mínimo e máximo de público cadastrados</small>
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
          <div
            className="cost-donut"
            role="img"
            aria-label={`Custos totais: ${percentual.format(total > 0 ? (fornecedores / total) * 100 : 0)}% de fornecedores, ${percentual.format(total > 0 ? (fiscal / total) * 100 : 0)}% fiscais e ${percentualAceito}% em propostas aceitas`}
          >
            <div><small>Total Geral</small><strong>{moeda.format(total)}</strong></div>
          </div>
          <ul className="cost-origin-legend">
            <li><span className="legend-swatch suppliers" /> Itens de Fornecedores <strong>{percentual.format(total > 0 ? (fornecedores / total) * 100 : 0)}% ({moeda.format(fornecedores)})</strong></li>
            <li><span className="legend-swatch fixed-costs" /> Custos Fiscais / Fixos <strong>{percentual.format(total > 0 ? (fiscal / total) * 100 : 0)}% ({moeda.format(fiscal)})</strong></li>
            <li><span className="legend-swatch accepted" /> Propostas Aceitas <strong>{percentualAceito}% ({moeda.format(aceito)})</strong></li>
          </ul>
        </section>

        <section className="ticket-simulation-card">
          <h2>Simulação de Ticket <ChartNoAxesColumnIncreasing size={15} aria-hidden="true" /></h2>
          <div className="ticket-scenarios">
            {cenarios.map((cenario) => (
              <TicketScenario
                key={cenario.nome}
                cenario={cenario}
                margem={margem}
                custo={total}
              />
            ))}
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

function TicketScenario({ cenario, margem, custo }) {
  const ingresso = cenario.publico > 0
    ? custo / (cenario.publico * (1 - margem))
    : 0;
  return (
    <article className={`ticket-scenario ${cenario.classe}`}>
      <header><strong>{cenario.nome}</strong><span>{cenario.tipo} ({numero.format(cenario.publico)})</span></header>
      <strong className="ticket-scenario__price">{moeda.format(ingresso)}</strong>
      <small>por ingresso</small>
    </article>
  );
}
