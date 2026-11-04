import React, { useMemo, useState } from "react";
import "./PainelFornecedor.css";

/* ---------- Ícones (SVG inline, sem biblioteca) ---------- */
const ICONES = {
  busca: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  oportunidades:
    "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
  propostas:
    "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  mensagens:
    "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
  ajuda:
    "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  dica: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  enviar: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8",
  calendario:
    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  local: [
    "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
    "M15 11a3 3 0 11-6 0 3 3 0 016 0z",
  ],
  pessoas:
    "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  relogio: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  chat: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  editar:
    "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
};

function Icone({ nome, className = "opp-icone" }) {
  const caminhos = Array.isArray(ICONES[nome]) ? ICONES[nome] : [ICONES[nome]];
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {caminhos.map((d, i) => (
        <path
          key={i}
          d={d}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}

/* ---------- Dados de exemplo (depois troque por dados da API) ---------- */
const EVENTOS_INICIAIS = [
  {
    id: 1,
    tipo: "Casamento",
    nome: "Casamento Helena & Tomás",
    local: "Fazenda Boa Vista",
    convidados: 120,
    data: "28/10/2026",
    prazo: "23/10/2026 · -4d",
    fecha: { texto: "fecha em -4d", tom: "perigo" },
    organizador: "Marina Braga",
    itens: [
      {
        id: 11,
        nome: "Buffet jantar servido",
        qtd: "120 pax",
        desc: "Entrada, prato principal, sobremesa · serviço à francesa",
        status: null,
      },
      {
        id: 12,
        nome: "Mobiliário e louças",
        qtd: "12 conj.",
        desc: "Mesas redondas, cadeiras Tiffany, louça premium",
        status: "enviada",
        valor: "6.200,00",
        enviada: "12/10/2026",
        validade: "12/11/2026",
        obs: "Inclui montagem e desmontagem.",
      },
      {
        id: 13,
        nome: "Decoração floral",
        qtd: "1 projeto",
        desc: "Centro de mesa, arco de flores, arranjos de altar",
        status: "analise",
        valor: "9.850,00",
        enviada: "10/10/2026",
        validade: "10/11/2026",
        obs: "Flores da estação.",
      },
      {
        id: 14,
        nome: "Som e iluminação",
        qtd: "1 kit",
        desc: "Palco, pista, DJ e iluminação cênica",
        status: "aprovada",
        valor: "7.400,00",
        enviada: "08/10/2026",
        validade: "14/11/2026",
        obs: "Contrato emitido.",
      },
    ],
  },
  {
    id: 2,
    tipo: "Corporativo",
    nome: "Convenção Nimbus Tech",
    local: "Centro de Convenções",
    convidados: 400,
    data: "15/11/2026",
    prazo: "03/11/2026 · 0d",
    fecha: { texto: "fecha em 0d", tom: "alerta" },
    organizador: "Equipe Nimbus",
    itens: [
      {
        id: 21,
        nome: "Coffee break",
        qtd: "400 pax",
        desc: "Café, salgados e doces para dois intervalos",
        status: "enviada",
        valor: "12.000,00",
        enviada: "01/11/2026",
        validade: "20/11/2026",
        obs: "",
      },
      {
        id: 22,
        nome: "Mobiliário de plenária",
        qtd: "1 kit",
        desc: "Cadeiras, mesas de apoio e credenciamento",
        status: null,
      },
    ],
  },
  {
    id: 3,
    tipo: "Social",
    nome: "Aniversário 50 anos Dona Rita",
    local: "Espaço Vila Verde",
    convidados: 80,
    data: "08/11/2026",
    prazo: "08/11/2026 · 5d",
    fecha: { texto: "fecha em 5d", tom: "alerta" },
    organizador: "Família Rita",
    itens: [
      {
        id: 31,
        nome: "Buffet de festa",
        qtd: "80 pax",
        desc: "Salgados, prato principal e bolo",
        status: "analise",
        valor: "5.400,00",
        enviada: "02/11/2026",
        validade: "15/11/2026",
        obs: "",
      },
      {
        id: 32,
        nome: "Decoração e mesas",
        qtd: "1 projeto",
        desc: "Mesas, toalhas e arranjos simples",
        status: null,
      },
    ],
  },
  {
    id: 4,
    tipo: "Festival",
    nome: "Festival da Primavera & Gastronomia",
    local: "Parque Ibirapuera",
    convidados: 800,
    data: "22/11/2026",
    prazo: "22 de nov",
    fecha: { texto: "22 de nov", tom: "neutro" },
    organizador: "Gastro SP",
    itens: [
      {
        id: 41,
        nome: "Tendas e estruturas",
        qtd: "20 un.",
        desc: "Tendas 3x3 com piso e iluminação",
        status: null,
      },
      {
        id: 42,
        nome: "Mobiliário de praça de alimentação",
        qtd: "60 conj.",
        desc: "Mesas altas, bancos e lixeiras",
        status: null,
      },
    ],
  },
  {
    id: 5,
    tipo: "Corporativo",
    nome: "Celebração de Fim de Ano FinTech",
    local: "Villa Blue Tree",
    convidados: 350,
    data: "05/12/2026",
    prazo: "05 de dez",
    fecha: { texto: "05 de dez", tom: "neutro" },
    organizador: "Time FinTech",
    itens: [
      {
        id: 51,
        nome: "Jantar corporativo",
        qtd: "350 pax",
        desc: "Menu de três tempos com bebidas",
        status: null,
      },
      {
        id: 52,
        nome: "Som e iluminação",
        qtd: "1 kit",
        desc: "DJ, palco e iluminação cênica",
        status: null,
      },
    ],
  },
];

const FILTROS = ["Todos", "Casamento", "Corporativo", "Social", "Festival"];

const PASSOS = [
  {
    icone: "busca",
    cor: "azul",
    titulo: "Encontre um evento",
    texto:
      "Na lista à esquerda estão os eventos abertos para cotação. Use a busca ou filtre por tipo.",
  },
  {
    icone: "dica",
    cor: "indigo",
    titulo: "Veja os itens",
    texto:
      "Clique no evento para ver os itens que o organizador precisa (buffet, mobiliário...).",
  },
  {
    icone: "enviar",
    cor: "ceu",
    titulo: "Envie sua proposta",
    texto:
      'Em cada item, clique em "Cotar item" e informe valor, descrição, validade e observações.',
  },
  {
    icone: "propostas",
    cor: "verde",
    titulo: "Acompanhe",
    texto:
      'Em "Minhas propostas" você vê o status. Dá para editar ou cancelar enquanto estiver Enviada ou Em análise.',
  },
];

const STATUS = {
  enviada: { rotulo: "Enviada", classe: "opp-badge--enviada" },
  analise: { rotulo: "Em análise", classe: "opp-badge--analise" },
  aprovada: { rotulo: "Aprovada", classe: "opp-badge--aprovada" },
};

function contarCotados(evento) {
  return evento.itens.filter((i) => i.status).length;
}

function formatarData(iso) {
  if (!iso) return "";
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

/* ---------- Componente principal ---------- */
export default function PainelFornecedor() {
  const [eventos, setEventos] = useState(EVENTOS_INICIAIS);
  const [eventoId, setEventoId] = useState(1);
  const [filtro, setFiltro] = useState("Todos");
  const [busca, setBusca] = useState("");
  const [guiaVisivel, setGuiaVisivel] = useState(true);

  // modal: null = fechado | { itemId, nome, qtd, valor, validade, obs }
  const [modal, setModal] = useState(null);

  const eventosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return eventos.filter((e) => {
      const okTipo = filtro === "Todos" || e.tipo === filtro;
      const okBusca =
        !termo ||
        e.nome.toLowerCase().includes(termo) ||
        e.local.toLowerCase().includes(termo);
      return okTipo && okBusca;
    });
  }, [eventos, filtro, busca]);

  const eventoAtual = eventos.find((e) => e.id === eventoId) || eventos[0];

  function abrirModal(item) {
    setModal({
      itemId: item.id,
      nome: item.nome,
      qtd: item.qtd,
      valor: item.valor || "",
      validade: "2026-11-20",
      obs: item.obs || "",
    });
  }

  function enviarProposta(e) {
    e.preventDefault();
    const hoje = new Date().toLocaleDateString("pt-BR");
    setEventos((lista) =>
      lista.map((ev) =>
        ev.id !== eventoId
          ? ev
          : {
              ...ev,
              itens: ev.itens.map((it) =>
                it.id !== modal.itemId
                  ? it
                  : {
                      ...it,
                      status: it.status || "enviada",
                      valor: modal.valor,
                      enviada: hoje,
                      validade: formatarData(modal.validade),
                      obs: modal.obs,
                    }
              ),
            }
      )
    );
    setModal(null);
  }

  const totalCotados = contarCotados(eventoAtual);
  const totalItens = eventoAtual.itens.length;

  return (
    <div className="opp-page">
      {/* ===== Conteúdo ===== */}
      <main className="opp-main">
        <div className="opp-titulo-bloco">
          <div>
            <p className="opp-saudacao">Bom dia, Casa Aurora</p>
            <h1 className="opp-titulo">Oportunidades abertas</h1>
          </div>
          <span className="opp-resumo">
            <strong>{eventos.length} eventos</strong> aguardando sua proposta
          </span>
        </div>

        {/* Como funciona */}
        {guiaVisivel && (
          <section className="opp-guia">
            <div className="opp-guia-topo">
              <div>
                <h2 className="opp-guia-titulo">
                  <span className="opp-ponto" />
                  Como funciona
                </h2>
                <p className="opp-guia-sub">
                  Do evento à proposta aprovada em 4 passos simples.
                </p>
              </div>
              <button
                type="button"
                className="opp-btn-entendi"
                onClick={() => setGuiaVisivel(false)}
              >
                ✕ Entendi
              </button>
            </div>

            <div className="opp-passos">
              {PASSOS.map((p, i) => (
                <div className="opp-passo" key={p.titulo}>
                  <div className="opp-passo-topo">
                    <div className={`opp-passo-icone opp-passo-icone--${p.cor}`}>
                      <Icone nome={p.icone} />
                    </div>
                    <span className={`opp-passo-num opp-passo-num--${p.cor}`}>
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="opp-passo-titulo">{p.titulo}</h3>
                  <p className="opp-passo-texto">{p.texto}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Master / Detail */}
        <div className="opp-layout">
          {/* ----- Coluna esquerda: lista ----- */}
          <section className="opp-coluna-lista" aria-label="Lista de Oportunidades">
            <div className="opp-busca">
              <span className="opp-busca-icone">
                <Icone nome="busca" />
              </span>
              <input
                type="text"
                className="opp-busca-input"
                placeholder="Buscar evento ou local"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            <div className="opp-filtros" role="toolbar" aria-label="Filtro de categorias">
              {FILTROS.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`opp-chip ${filtro === f ? "opp-chip--ativo" : ""}`}
                  onClick={() => setFiltro(f)}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="opp-cards" role="list">
              {eventosFiltrados.length === 0 && (
                <p className="opp-vazio">Nenhum evento encontrado.</p>
              )}

              {eventosFiltrados.map((ev) => {
                const cot = contarCotados(ev);
                const pct = (cot / ev.itens.length) * 100;
                return (
                  <div
                    key={ev.id}
                    role="listitem"
                    className={`opp-card ${
                      ev.id === eventoId ? "opp-card--ativo" : ""
                    }`}
                    onClick={() => setEventoId(ev.id)}
                  >
                    <div className="opp-card-topo">
                      <span className="opp-card-tipo">{ev.tipo}</span>
                      <span className={`opp-prazo opp-prazo--${ev.fecha.tom}`}>
                        {ev.fecha.texto}
                      </span>
                    </div>
                    <h3 className="opp-card-nome">{ev.nome}</h3>
                    <p className="opp-card-local">
                      {ev.local} · {ev.convidados} convidados
                    </p>
                    <div className="opp-progresso-linha">
                      <div className="opp-barra">
                        <div
                          className={`opp-barra-preenchida ${
                            cot === 0 ? "opp-barra-preenchida--vazia" : ""
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span
                        className={`opp-progresso-texto ${
                          ev.id === eventoId ? "opp-progresso-texto--ativo" : ""
                        }`}
                      >
                        {cot}/{ev.itens.length} cotados
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ----- Coluna direita: detalhe ----- */}
          <section className="opp-detalhe" aria-label="Detalhes da Oportunidade">
            <div className="opp-detalhe-banner">
              <div className="opp-tag-evento">{eventoAtual.tipo}</div>
              <h2 className="opp-detalhe-titulo">{eventoAtual.nome}</h2>

              <div className="opp-detalhe-meta">
                <div className="opp-meta-item">
                  <Icone nome="calendario" className="opp-icone opp-icone--azul" />
                  <span>{eventoAtual.data}</span>
                </div>
                <div className="opp-meta-item">
                  <Icone nome="local" className="opp-icone opp-icone--azul" />
                  <span>{eventoAtual.local}</span>
                </div>
                <div className="opp-meta-item">
                  <Icone nome="pessoas" className="opp-icone opp-icone--azul" />
                  <span>{eventoAtual.convidados} convidados</span>
                </div>
              </div>

              <div className="opp-info-grid">
                <div className="opp-info-card">
                  <p className="opp-info-label">Prazo para cotar</p>
                  <div className="opp-info-valor">
                    <Icone nome="relogio" className="opp-icone opp-icone--azul" />
                    <span>{eventoAtual.prazo}</span>
                  </div>
                </div>

                <div className="opp-info-card">
                  <p className="opp-info-label">Itens cotados</p>
                  <p className="opp-info-valor">
                    <span className="opp-destaque-azul">{totalCotados}</span>
                    &nbsp;de {totalItens}
                  </p>
                </div>

                <div className="opp-info-card opp-info-card--linha">
                  <div>
                    <p className="opp-info-label">Organizador</p>
                    <p className="opp-info-valor">{eventoAtual.organizador}</p>
                  </div>
                  <button
                    type="button"
                    className="opp-btn-chat"
                    title={`Conversar com ${eventoAtual.organizador}`}
                  >
                    <Icone nome="chat" />
                  </button>
                </div>
              </div>
            </div>

            <div className="opp-composicao">
              <div className="opp-composicao-topo">
                <h3 className="opp-composicao-titulo">Composição de custo</h3>
                <span className="opp-composicao-dica">
                  Cote cada item separadamente
                </span>
              </div>

              <div className="opp-itens">
                {eventoAtual.itens.map((item) =>
                  !item.status ? (
                    /* Item ainda não cotado */
                    <div className="opp-item opp-item--pendente" key={item.id}>
                      <div className="opp-item-linha">
                        <div>
                          <div className="opp-item-titulo-linha">
                            <h4 className="opp-item-nome">{item.nome}</h4>
                            <span className="opp-tag-qtd">{item.qtd}</span>
                          </div>
                          <p className="opp-item-desc">{item.desc}</p>
                        </div>
                        <button
                          type="button"
                          className="opp-btn-cotar"
                          onClick={() => abrirModal(item)}
                        >
                          + Cotar item
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Item já cotado */
                    <div className="opp-item" key={item.id}>
                      <div className="opp-item-linha opp-item-linha--topo">
                        <div>
                          <div className="opp-item-titulo-linha">
                            <h4 className="opp-item-nome">{item.nome}</h4>
                            <span className="opp-tag-qtd">{item.qtd}</span>
                          </div>
                          <p className="opp-item-desc">{item.desc}</p>
                        </div>
                        <div className="opp-item-acoes">
                          <span className={`opp-badge ${STATUS[item.status].classe}`}>
                            <span className="opp-badge-ponto" />
                            {STATUS[item.status].rotulo}
                          </span>
                          {item.status !== "aprovada" && (
                            <button
                              type="button"
                              className="opp-btn-editar"
                              onClick={() => abrirModal(item)}
                            >
                              <Icone nome="editar" className="opp-icone opp-icone--sm" />
                              Editar
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="opp-item-rodape">
                        <span className="opp-rodape-valor">R$ {item.valor}</span>
                        <span className="opp-rodape-sep">·</span>
                        <span className="opp-rodape-texto">
                          Enviada {item.enviada}
                        </span>
                        <span className="opp-rodape-sep">·</span>
                        <span className="opp-rodape-texto">
                          Válida até {item.validade}
                        </span>
                        {item.obs && (
                          <>
                            <span className="opp-rodape-sep">·</span>
                            <span className="opp-rodape-obs">"{item.obs}"</span>
                          </>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* ===== Modal de cotação ===== */}
      {modal && (
        <div className="opp-modal-overlay" onClick={() => setModal(null)}>
          <div className="opp-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="opp-modal-topo">
              <div>
                <h3 className="opp-modal-titulo">{modal.nome}</h3>
                <p className="opp-modal-sub">{modal.qtd}</p>
              </div>
              <button
                type="button"
                className="opp-modal-fechar"
                onClick={() => setModal(null)}
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>

            <form className="opp-form" onSubmit={enviarProposta}>
              <div>
                <label className="opp-label">Valor da proposta (R$)</label>
                <div className="opp-input-moeda">
                  <span className="opp-moeda-prefixo">R$</span>
                  <input
                    type="text"
                    className="opp-input opp-input--valor"
                    placeholder="0,00"
                    required
                    value={modal.valor}
                    onChange={(e) => setModal({ ...modal, valor: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="opp-label">Validade da proposta</label>
                <input
                  type="date"
                  className="opp-input"
                  required
                  value={modal.validade}
                  onChange={(e) => setModal({ ...modal, validade: e.target.value })}
                />
              </div>

              <div>
                <label className="opp-label">Observações e inclusões</label>
                <textarea
                  className="opp-input opp-textarea"
                  rows="3"
                  placeholder="Ex: Incluso frete, montagem, desmontagem..."
                  value={modal.obs}
                  onChange={(e) => setModal({ ...modal, obs: e.target.value })}
                />
              </div>

              <div className="opp-form-acoes">
                <button
                  type="button"
                  className="opp-btn-cancelar"
                  onClick={() => setModal(null)}
                >
                  Cancelar
                </button>
                <button type="submit" className="opp-btn-enviar">
                  Enviar Proposta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}