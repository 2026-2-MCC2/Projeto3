import { useState, useSyncExternalStore } from "react";
import {
  Bell,
  CalendarDays,
  Calculator,
  CreditCard,
  ChevronDown,
  FileText,
  MapPin,
  Pencil,
  Plus,
  LogOut,
  Ticket,
  TrendingUp,
  X,
} from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import {
  getStoreSnapshot,
  setEventoAtivo,
  subscribe,
} from "../services/eventoStore.js";
import {
  custoTotal,
  eventosAtivos,
  ingressoSugerido,
  margemMediaProjetada,
  orcamentoConsolidado,
  percentualOrcamentoAlocado,
  propostasEmAnalise,
  totalPropostasEmAnalise,
} from "../services/calculos.js";
import "./OrganizadorDashboard.css";

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
const moedaSemCentavos = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});
const percentual = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const inteiro = new Intl.NumberFormat("pt-BR");

const passos = [
  {
    numero: 1,
    icone: Pencil,
    classe: "blue",
    titulo: "Cadastre",
    descricao: "Configure os parâmetros do evento, locais e volumetria de público.",
  },
  {
    numero: 2,
    icone: FileText,
    classe: "blue",
    titulo: "Cotar & Compor",
    descricao: "Solicite e receba propostas de fornecedores homologados para cada item.",
  },
  {
    numero: 3,
    icone: TrendingUp,
    classe: "orange",
    titulo: "Precifique & Lance",
    descricao: "Simule o ticket ideal, consolide o orçamento e lance as vendas.",
  },
];

const dataPorExtenso = (data) => {
  if (!data) return "";
  const [ano, mes, dia] = data.split("-").map(Number);
  return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function OrganizadorLayout() {
  const store = useSyncExternalStore(subscribe, getStoreSnapshot, getStoreSnapshot);
  const { user, sair } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const eventos = store.eventos;
  const ativos = eventosAtivos(eventos);
  const notificacoes = store.notificacoes;
  const [onboardingDispensado, setOnboardingDispensado] = useState(
    () => localStorage.getItem("trocaticket:onboarding-dispensado") === "true",
  );
  const paginaInicial = location.pathname.replace(/\/+$/, "") === "/organizador";
  const [menuUsuarioAberto, setMenuUsuarioAberto] = useState(false);
  const nomeUsuario = user?.nome ?? store.usuario.nome;
  const iniciaisUsuario = user?.iniciais
    ?? nomeUsuario.split(/\s+/).filter(Boolean).slice(0, 2).map((parte) => parte[0]).join("").toUpperCase();
  const planoUsuario = user?.plano ?? store.usuario.plano;

  function iniciarCadastro() {
    navigate("/organizador/eventos/novo");
  }

  function dispensarOnboarding() {
    localStorage.setItem("trocaticket:onboarding-dispensado", "true");
    setOnboardingDispensado(true);
  }

  return (
    <div className="tt-page">
      <header className="tt-header">
        <div className="tt-header__inner">
          <Link className="tt-brand" to="/organizador" aria-label="TrocaTicket, início">
            <span className="tt-brand__icon"><Ticket size={14} aria-hidden="true" /></span>
            <span>Troca<strong>Ticket</strong></span>
          </Link>

          <nav className="tt-nav" aria-label="Navegação do organizador">
            <Link
              className={`tt-nav__link${paginaInicial || location.pathname.startsWith("/organizador/eventos/novo") ? " is-active" : ""}`}
              to="/organizador"
            >
              Meus Eventos
            </Link>
            <Link
              className="tt-nav__link"
              to="/organizador/eventos/novo/proposta"
            >
              Fornecedores
              {notificacoes.fornecedores > 0 && (
                <span className="tt-nav__badge is-orange">{notificacoes.fornecedores}</span>
              )}
            </Link>
            <Link className="tt-nav__link" to="/organizador/mensagens">
              Mensagens
              {notificacoes.mensagens > 0 && (
                <span className="tt-nav__badge is-blue">{notificacoes.mensagens}</span>
              )}
            </Link>
          </nav>

          <div className="tt-user">
            <button type="button" className="tt-notifications" aria-label="Notificações">
              <Bell size={14} aria-hidden="true" />
              <span />
            </button>
            <span className="tt-user__divider" />
            <button
              type="button"
              className="tt-user__menu-trigger"
              aria-expanded={menuUsuarioAberto}
              aria-haspopup="menu"
              onClick={() => setMenuUsuarioAberto((aberto) => !aberto)}
            >
              <span className="tt-user__avatar">{iniciaisUsuario}</span>
              <span className="tt-user__details">
                <strong>{nomeUsuario}</strong>
                <small>{planoUsuario}</small>
              </span>
              <ChevronDown size={12} aria-hidden="true" />
            </button>
            {menuUsuarioAberto && (
              <div className="tt-user__menu" role="menu">
                <Link role="menuitem" to="/organizador/perfil" onClick={() => setMenuUsuarioAberto(false)}>
                  Perfil
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    sair();
                    navigate("/login");
                  }}
                >
                  <LogOut size={13} aria-hidden="true" /> Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="tt-main">
        {paginaInicial ? (
          <div className="tt-dashboard">
            <section className="tt-page-heading">
              <div>
                <h1>Meus eventos</h1>
                <p>Estruture custos e descubra o valor ideal do ingresso antes do evento.</p>
              </div>
              <button className="tt-primary-button" type="button" onClick={iniciarCadastro}>
                <Plus size={13} aria-hidden="true" />
                Criar evento
              </button>
            </section>

            <section className="tt-kpis" aria-label="Indicadores dos eventos">
              <KpiCard
                label="Eventos Ativos"
                value={inteiro.format(ativos.length)}
                icon={CalendarDays}
              />
              <KpiCard
                label="Orçamento Consolidado"
                value={moedaSemCentavos.format(orcamentoConsolidado(ativos))}
                icon={CreditCard}
              />
              <KpiCard
                label="Propostas em Análise"
                value={`${inteiro.format(totalPropostasEmAnalise(eventos))} fornecedores`}
                icon={FileText}
                color="orange"
              />
              <KpiCard
                label="Margem Média Projetada"
                value={`${percentual.format(margemMediaProjetada(ativos) * 100)}%`}
                icon={TrendingUp}
                color="blue"
              />
            </section>

            {!onboardingDispensado && (
              <section className="tt-onboarding">
                <div className="tt-section-heading">
                  <h2>Do planejamento ao evento em {passos.length} passos</h2>
                  <button type="button" onClick={dispensarOnboarding}>
                    Dispensar <X size={11} aria-hidden="true" />
                  </button>
                </div>
                <div className="tt-steps">
                  {passos.map(({ numero, icone: Icon, classe, titulo, descricao }) => (
                    <article className="tt-step" key={titulo}>
                      <span className="tt-step__number">{numero}</span>
                      <span className={`tt-icon-box is-${classe}`}>
                        <Icon size={13} aria-hidden="true" />
                      </span>
                      <h3>{titulo}</h3>
                      <p>{descricao}</p>
                    </article>
                  ))}
                </div>
              </section>
            )}

            <section className="tt-projects">
              <div className="tt-section-heading">
                <h2>Projetos em andamento</h2>
                <span className="tt-count-pill">{inteiro.format(eventos.length)} eventos</span>
              </div>
              {eventos.length === 0 ? (
                <p className="tt-empty">Nenhum evento cadastrado. Crie seu primeiro planejamento.</p>
              ) : (
                <div className="tt-event-grid">
                  {eventos.map((evento) => (
                    <EventCard
                      evento={evento}
                      key={evento.id}
                      onOpen={() => setEventoAtivo(evento.id)}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="tt-new-edition">
              <span className="tt-icon-box is-blue">
                <Calculator size={16} aria-hidden="true" />
              </span>
              <div>
                <h2>Precisa planejar uma nova edição?</h2>
                <p>Adicione custos fixos e variáveis para calibrar a taxa de break-even e lucro desejado.</p>
              </div>
              <button className="tt-secondary-button" type="button" onClick={iniciarCadastro}>
                <Plus size={12} aria-hidden="true" />
                Novo planejamento
              </button>
            </section>
          </div>
        ) : (
          <Outlet />
        )}
      </main>

      {location.pathname !== "/organizador/eventos/novo" && (
        <footer className="tt-footer">
          <div className="tt-footer__inner">
            <Link to="/ajuda">Central de Ajuda</Link>
            <Link to="/termos">Termos para Organizadores</Link>
            <Link to="/privacidade">Privacidade</Link>
          </div>
        </footer>
      )}
    </div>
  );
}

function KpiCard({ label, value, icon: Icon, color = "default" }) {
  return (
    <article className={`tt-kpi is-${color}`}>
      <span className="tt-kpi__label">{label}</span>
      <span className="tt-icon-box">
        <Icon size={14} aria-hidden="true" />
      </span>
      <strong>{value}</strong>
    </article>
  );
}

function EventCard({ evento, onOpen }) {
  const propostas = propostasEmAnalise(evento);
  const alocado = percentualOrcamentoAlocado(evento);
  const local = [evento.local.nome, `${evento.local.cidade}, ${evento.local.uf}`]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      className="tt-event-card"
      to={`/organizador/eventos/${evento.id}`}
      onClick={onOpen}
    >
      <div className="tt-event-card__cover">
        {evento.capa && <img src={evento.capa} alt="" />}
        <div className="tt-event-card__cover-shade" />
        <span className="tt-category-pill">{evento.categoria}</span>
        {propostas > 0 ? (
          <span className="tt-proposals-pill">
            <Bell size={10} aria-hidden="true" />
            {inteiro.format(propostas)} propostas
          </span>
        ) : (
          <span className="tt-on-track-pill"><i /> Em dia</span>
        )}
        <h3>{evento.nome}</h3>
      </div>
      <div className="tt-event-card__body">
        <div className="tt-event-meta">
          <span><CalendarDays size={11} aria-hidden="true" />{dataPorExtenso(evento.dataInicio)}</span>
          <span><MapPin size={11} aria-hidden="true" />{local}</span>
        </div>
        <div className="tt-budget">
          <div><span>Orçamento alocado</span><strong>{inteiro.format(alocado)}%</strong></div>
          <span className="tt-budget__track">
            <span style={{ width: `${alocado}%` }} />
          </span>
        </div>
        <div className="tt-event-card__footer">
          <div>
            <span className="tt-overline">Custo total</span>
            <strong>{moeda.format(custoTotal(evento))}</strong>
          </div>
          <div className="is-ticket">
            <span className="tt-overline">Ingresso sugerido</span>
            <strong>{moeda.format(ingressoSugerido(evento))}</strong>
          </div>
        </div>
      </div>
    </Link>
  );
}
