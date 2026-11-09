import { useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  CircleHelp,
  Eye,
  FileText,
  Grid2X2,
  MapPin,
  MessageCircle,
  Pencil,
  Plus,
  Search,
  Settings2,
  Share2,
  SlidersHorizontal,
  Tag,
  Upload,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";

const eventos = [
  {
    status: "Vendas Abertas",
    statusClass: "is-open",
    detail: "4 orçamentos",
    detailIcon: Tag,
    metric: "12.800",
    metricLabel: "Ingressos Vendidos",
    title: "Aurora Sound Festival 2026",
    date: "24 Outubro 2026 • 18:00",
    location: "Sambódromo Anhembi, São Paulo - SP",
  },
  {
    status: "Montagem de Pauta",
    statusClass: "is-review",
    detail: "2 em análise",
    detailIcon: FileText,
    metric: "2.740",
    metricLabel: "Credenciamentos",
    title: "Encontro Criativo SP",
    date: "08 Novembro 2026 • 09:00",
    location: "Centro Cultural São Paulo, São Paulo - SP",
  },
  {
    status: "Aguardando Orçamentos",
    statusClass: "is-waiting",
    detail: "0 propostas",
    detailIcon: FileText,
    metric: "0",
    metricLabel: "Capacidade: 600",
    title: "Festival Sabores da Cidade",
    date: "15 Dezembro 2026 • 12:00",
    location: "Parque da Água Branca, São Paulo - SP",
  },
];

export default function PainelOrganizador() {
  const [busca, setBusca] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState("Todos");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const eventosVisiveis = eventos.filter((evento) => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    const correspondeBusca = `${evento.title} ${evento.date} ${evento.location}`
      .toLocaleLowerCase("pt-BR")
      .includes(termo);
    const correspondeStatus = filtroAtivo === "Todos" || evento.status === filtroAtivo;
    return correspondeBusca && correspondeStatus;
  });

  return (
    <div className="organizador-page">
      <header className="organizador-hero">
        <p className="eyebrow">Área do organizador</p>
        <h1>Painel do Organizador</h1>
      </header>

      <div className="organizador-dashboard">
        <section className="eventos-card">
          <div className="card-heading">
            <h2>
              Meus Eventos <span className="active-badge">3 ativos</span>
            </h2>
            <div className="card-actions">
              <div className="event-filter-control">
                <button
                  className="button button--secondary"
                  type="button"
                  aria-expanded={mostrarFiltros}
                  aria-controls="organizador-event-filters"
                  onClick={() => setMostrarFiltros((aberto) => !aberto)}
                >
                  <SlidersHorizontal size={16} aria-hidden="true" />
                  Filtros
                </button>
                {mostrarFiltros && (
                  <div className="event-filter-menu" id="organizador-event-filters" aria-label="Filtrar por status">
                    {["Todos", ...eventos.map(({ status }) => status)].map((status) => (
                      <button
                        className={filtroAtivo === status ? "is-active" : ""}
                        key={status}
                        type="button"
                        onClick={() => {
                          setFiltroAtivo(status);
                          setMostrarFiltros(false);
                        }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Link className="button button--primary" to="/organizador/eventos/novo">
                <Plus size={17} aria-hidden="true" />
                Novo Evento
              </Link>
            </div>
          </div>

          <label className="event-search">
            <Search size={18} aria-hidden="true" />
            <span className="visually-hidden">Pesquisar eventos</span>
            <input
              type="search"
              placeholder="Pesquisar eventos por nome, data ou local..."
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
            />
          </label>

          <div className="event-list">
            {eventosVisiveis.map((evento) => (
              <EventCard key={evento.title} {...evento} />
            ))}
            {eventosVisiveis.length === 0 && (
              <p className="event-empty">Nenhum evento corresponde à busca ou filtro selecionado.</p>
            )}
          </div>

          <Link className="history-link" to="/organizador/eventos">
            Ver Histórico Completo de Eventos (3)
            <ChevronRight size={16} aria-hidden="true" />
          </Link>
        </section>

        <QuickActions />
      </div>
    </div>
  );
}

function EventCard({ status, statusClass, detail, detailIcon: DetailIcon, metric, metricLabel, title, date, location }) {
  return (
    <article className="event-card">
      <div className="event-card__top">
        <div className="event-card__status">
          <span className={`status-dot ${statusClass}`} />
          <strong>{status}</strong>
          <span className="event-card__tag">
            <DetailIcon size={14} aria-hidden="true" />
            {detail}
          </span>
        </div>
        <div className="event-card__metric">
          <strong>{metric}</strong>
          <span>{metricLabel}</span>
        </div>
      </div>

      <h3>{title}</h3>
      <div className="event-card__meta">
        <span>
          <CalendarDays size={15} aria-hidden="true" />
          {date}
        </span>
        <span>
          <MapPin size={15} aria-hidden="true" />
          {location}
        </span>
      </div>

      <div className="event-card__footer">
        <div>
          <Link className="button button--secondary" to="/organizador/eventos/novo">
            <Pencil size={15} aria-hidden="true" />
            Editar
          </Link>
          <Link className="button button--secondary" to="/organizador/eventos/novo/resumo">
            <Eye size={15} aria-hidden="true" />
            Ver Detalhes
          </Link>
        </div>
        <Link className="button button--primary" to="/organizador/eventos/novo/publicar">
          <Upload size={15} aria-hidden="true" />
          Publicar
        </Link>
      </div>
    </article>
  );
}

function QuickActions() {
  const actions = [
    { icon: Plus, label: "Criar Eventos", to: "/organizador/eventos/novo", trailingIcon: ChevronRight },
    { icon: CircleHelp, label: "Propostas", to: "/organizador/eventos/novo/proposta", trailingIcon: Settings2 },
    { icon: MessageCircle, label: "Mensagens", to: "/organizador/mensagens", trailingIcon: ChevronRight },
    { icon: UserRound, label: "Meu Perfil", to: "/organizador/perfil", trailingIcon: Share2 },
    { icon: CircleHelp, label: "Central de Ajuda", to: "/ajuda", trailingIcon: CircleHelp },
  ];

  return (
    <aside className="quick-actions">
      <div className="quick-actions__heading">
        <h2>Ações rápidas</h2>
        <Grid2X2 size={18} aria-hidden="true" />
      </div>
      <div className="quick-actions__list">
        {actions.map(({ icon: Icon, label, to, trailingIcon: TrailingIcon }) => (
          <Link
            to={to}
            className="quick-action"
            key={label}
          >
            <span className="quick-action__icon">
              <Icon size={17} aria-hidden="true" />
            </span>
            <strong>{label}</strong>
            <TrailingIcon size={17} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </aside>
  );
}
