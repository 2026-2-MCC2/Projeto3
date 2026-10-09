import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import "./OrganizadorLayout.css";

export default function PainelOrganizador() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const rotaAtual = pathname.replace(/\/+$/, "") || "/";

  // Dados extraídos do script original do Stitch
  const eventosMock = [
    {
      id: "aurora",
      titulo: "Aurora Sound Festival 2026",
      mes: "Out",
      dia: "24",
      status: "Vendas Abertas",
      statusClass: "status-green",
      tipo: "Festival",
      hora: "14h00",
      local: "Sambódromo Anhembi · SP",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuChAXjuzp278WCoQ7yKglKUcbUHtNnUWE249eoX0NMORp5ubfi6Heqf-bdYu4gyq5rSDt0DNJjJsWTuifpHNNJAAh7GjDALd0VlbWmULnwilGCzGan2r8iDUwrzdiW1isxhZNaHZL3OWh6nGlyUKmKk3RGdXCAG8yh8Xo0q-jW99YR3TQUh07HtuVQrSIxvCubrOCXz8fcAGbFLtZ_WohVVju-2W7Af-zbMi3D-uMXvyruGTXoe89uOVA",
      metricaLabel: "Vendas 85%",
      metricaValor: "R$ 1.152.000",
      metricaProgresso: 85,
      metricaCor: "#2A753C",
      metricaSub: "12.8k ingressos",
      meta: "12.800 ingressos vendidos · 24 de outubro · Sambódromo Anhembi, São Paulo - SP",
      organizador: "Aurora Sound Produções",
      itens: [
        { id: 1, nome: "Som & Iluminação Line Array", desc: "Palco principal, DJ e iluminação cênica de arena", unit: "1 kit", badge: "Aprovada", badgeClass: "badge-green", btnText: "Ver Propostas (3)", detail: "R$ 74.000,00 · Fornecedor homologado: SomPro Áudio · Contrato formalizado." },
        { id: 2, nome: "Estruturas e Palco Geodésico", desc: "Palco 24x18m com cobertura cristal e house mix", unit: "1 projeto", badge: "Em análise", badgeClass: "badge-yellow", btnText: "Ver Propostas (2)", detail: "R$ 62.500,00 · Melhor oferta por StagePro Brasil · Aguardando validação técnica." },
        { id: 3, nome: "Mobiliário e Camarins", desc: "Mesas, cadeiras, lounges e espelhos camarim", unit: "1 lote", badge: "Enviada / Aguardando", badgeClass: "badge-gray", btnText: "Cotar item", detail: "R$ 18.400,00 (orçamento base de referência) · 1 fornecedor consultado." },
        { id: 4, nome: "Segurança & Brigada", desc: "Contingente 65 vigilantes patrimoniais + 12 bombeiros civis", unit: "Turno 12h", badge: "Pendente de cotação", badgeClass: "badge-red", btnText: "Cotar item", detail: "" }
      ]
    },
    {
      id: "techbeats",
      titulo: "Conferência Tech & Beats SP",
      mes: "Nov",
      dia: "12",
      status: "Lote 2 Aberto",
      statusClass: "status-yellow",
      tipo: "Conferência",
      hora: "12 a 13 de nov",
      local: "Centro Frei Caneca · SP",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYfXKOgRinYdLz8vOdPrCaG_9nrD75C0O8eNwDOov7n0djhlJGMOm3pwqSmh81h0ofmRYW1Z0Dxz49V65LszME46_7YhnDRt58ixM5sk9d6ZfRuDD8lFOm17cUMG8lmjSf6naOSLNQP-JcrLmp_XaYuS_BXPIN39Ya8Dwj73jyhbnONtQrhLSRSicrjZh7J22S8381-bC0XpuCrr6v5xt3B-M_0p4bVTtFJkLbikGYcPATLchq94lBsg",
      metricaLabel: "Inscritos 85%",
      metricaValor: "R$ 380.000",
      metricaProgresso: 85,
      metricaCor: "#8C6B34",
      metricaSub: "2.7k participantes",
      meta: "2.740 credenciamentos · 12 de novembro · Centro de Convenções Frei Caneca, SP",
      organizador: "Aurora Sound Produções",
      itens: [
        { id: 5, nome: "Painéis de LED P2.5 e Broadcast", desc: "Painel central 10x4m e 2 laterais 4x3m para transmissão simultânea", unit: "3 painéis", badge: "Aprovada", badgeClass: "badge-green", btnText: "Ver Propostas (4)", detail: "R$ 48.000,00 · Fornecedor homologado: LED Pro Brasil." },
        { id: 6, nome: "Sistema de Credenciamento & Catracas", desc: "8 totens de autoatendimento e controle de acessos sem fio", unit: "8 totens", badge: "Em análise", badgeClass: "badge-yellow", btnText: "Ver Propostas (2)", detail: "R$ 19.800,00 · Proposta recebida de TechAccess." },
        { id: 7, nome: "Buffet Executivo e Coffee Breaks", desc: "Manhã e tarde para 2.700 congressistas em 2 dias", unit: "2 dias", badge: "Pendente de cotação", badgeClass: "badge-red", btnText: "Cotar item", detail: "" }
      ]
    },
    {
      id: "sunset",
      titulo: "Sunset Acústico Rooftop",
      mes: "Dez",
      dia: "05",
      status: "Planejamento",
      statusClass: "status-red",
      tipo: "Música & Rooftop",
      hora: "16h00",
      local: "Villa Lobos Open Air · SP",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBK4dC4m7-gC6MS5wCrD_yyjb6GahN7kGhR01thmOcPa3fZovMrNJIp-IpJtbFJECdj3jTGni4qqbWc3ORRvgr2crlxRI37OJE_OAhFerLZQ3D-MLqH1t73Ax89cxcRdS1LNvfFYAsd64O0P8rVgSw3hEGlkuR3L8yq7RDvKl6QmlOimU0vLjv7apt7sxJ6y6E902cKyFxXSKsE1SIkdLB2atqzV7xk-jNB587g97lGY4xcMaZxczI11A",
      metricaLabel: "Capacidade",
      metricaValor: "600 vagas",
      metricaProgresso: 15,
      metricaCor: "#8D9BA4",
      metricaSub: "2 itens em cotação",
      meta: "Capacidade: 600 · 05 de dezembro · Villa Lobos Open Air, São Paulo - SP",
      organizador: "Aurora Sound Produções",
      itens: [
        { id: 8, nome: "Sonorização Acústica e P.A. Compacto", desc: "Sistema estéreo para pocket show e voz/violão", unit: "1 kit", badge: "Pendente de cotação", badgeClass: "badge-red", btnText: "Cotar item", detail: "" },
        { id: 9, nome: "Bar de Coquetelaria & Chopp Artesanal", desc: "Estrutura de bar em ilha com 4 bartenders e insumos", unit: "1 estrutura", badge: "Pendente de cotação", badgeClass: "badge-red", btnText: "Cotar item", detail: "" }
      ]
    }
  ];

  const [eventoAtivo, setEventoAtivo] = useState(eventosMock[0]);
  const [modalCotacaoAberto, setModalCotacaoAberto] = useState(false);
  const [itemParaCotar, setItemParaCotar] = useState(null);

  const abrirModalCotacao = (item) => {
    setItemParaCotar(item);
    setModalCotacaoAberto(true);
  };

  const handleNovaCotacao = (e) => {
    e.preventDefault();
    alert("Demanda de cotação transmitida para a rede de fornecedores homologados TrocaTicket.");
    setModalCotacaoAberto(false);
  };

  return (
    <div className="po-page">
      {/* HEADER ORGANIZADOR */}
      <header className="po-header">
        <div className="po-header-content">
          <div className="po-brand">
            <span className="po-brand-text">TrocaTicket</span>
          </div>
          
          <nav className="po-nav">
            <Link to="/organizador" className={`po-nav-item${rotaAtual === "/organizador" ? " active" : ""}`}>Meus Eventos</Link>
            <Link to="/organizador/eventos/novo/proposta" className={`po-nav-item${rotaAtual.endsWith("/proposta") ? " active" : ""}`}>Propostas Recebidas</Link>
            <Link to="/organizador/mensagens" className={`po-nav-item${rotaAtual.endsWith("/mensagens") ? " active" : ""}`}>Mensagens <span className="po-dot"></span></Link>
          </nav>
          
          <div className="po-profile">
            <div className="po-profile-info">
              <span className="po-profile-name">Aurora Sound Produções</span>
              <span className="po-profile-role">Organizador de Eventos</span>
            </div>
            <div className="po-profile-avatar">AS</div>
          </div>
        </div>
      </header>

      <main className="po-main">
        {rotaAtual === "/organizador" ? (
          <>
        {/* ONBOARDING STEPS */}
        <section className="po-onboarding">
          <div className="po-section-header">
            <h2>Do planejamento ao evento em 3 passos</h2>
            <span>3 eventos ativos · próximo 24 out</span>
          </div>
          
          <div className="po-steps-grid">
            <div className="po-step-card">
              <div className="po-step-top">
                <div className="po-icon-box bg-gray">📋</div>
                <span className="po-step-num">1</span>
              </div>
              <div className="po-step-text">
                <h3>Cadastre</h3>
                <p>Configure os parâmetros do evento, locais e volumetria de público.</p>
              </div>
            </div>

            <div className="po-step-card">
              <div className="po-step-top">
                <div className="po-icon-box bg-light">💬</div>
                <span className="po-step-num">2</span>
              </div>
              <div className="po-step-text">
                <h3>Cotar & Compor</h3>
                <p>Solicite e receba propostas de fornecedores homologados para cada item.</p>
              </div>
            </div>

            <div className="po-step-card">
              <div className="po-step-top">
                <div className="po-icon-box bg-gray">🚀</div>
                <span className="po-step-num">3</span>
              </div>
              <div className="po-step-text">
                <h3>Precifique & Lance</h3>
                <p>Simule o ticket ideal, consolide o orçamento e lance as vendas.</p>
              </div>
            </div>
          </div>
        </section>

        {/* WORKSPACE - GRID 2 COLUNAS */}
        <div className="po-workspace">
          
          {/* LADO ESQUERDO: LISTA DE EVENTOS */}
          <section className="po-events-section" id="eventos">
            <div className="po-events-header">
              <div className="po-events-title">
                <h2>Meus Eventos</h2>
                <span className="po-badge-outline">3 eventos ativos</span>
              </div>
              <Link className="po-btn-new" to="/organizador/eventos/novo">+ Novo Evento</Link>
            </div>

            <div className="po-events-list">
              {eventosMock.map((evento) => (
                <article 
                  key={evento.id} 
                  className={`po-event-card ${eventoAtivo.id === evento.id ? 'active' : ''}`}
                  onClick={() => setEventoAtivo(evento)}
                >
                  <div className="po-card-content">
                    <div className="po-card-image-box">
                      <img src={evento.img} alt={evento.titulo} />
                      <div className="po-date-badge">
                        <span className="po-month">{evento.mes}</span>
                        <span className="po-day">{evento.dia}</span>
                      </div>
                    </div>

                    <div className="po-card-info">
                      <div className="po-tags">
                        <span className={`po-status-tag ${evento.statusClass}`}>
                          <span className="po-tag-dot"></span> {evento.status}
                        </span>
                        <span className="po-type-tag">{evento.tipo}</span>
                      </div>
                      <h3>{evento.titulo}</h3>
                      <div className="po-meta">
                        <span>🕒 {evento.hora}</span>
                        <span>📍 {evento.local}</span>
                      </div>
                    </div>
                  </div>

                  <div className="po-card-footer">
                    <div className="po-metric-box">
                      <div className="po-metric-labels">
                        <span className="po-metric-title">{evento.metricaLabel}</span>
                        <span className="po-metric-value">{evento.metricaValor}</span>
                      </div>
                      <div className="po-progress-bar">
                        <div className="po-progress-fill" style={{ width: `${evento.metricaProgresso}%`, backgroundColor: evento.metricaCor }}></div>
                      </div>
                      <span className="po-metric-sub">{evento.metricaSub}</span>
                    </div>

                    <div className="po-card-actions">
                      {/* O botão "Gerenciar" redireciona para a tela Resumo e Publicar que criamos */}
                      <button className="po-btn-manage" onClick={(e) => { e.stopPropagation(); navigate('/organizador/resumo'); }}>
                        Gerenciar ➔
                      </button>
                      <button className="po-btn-edit" onClick={(e) => { e.stopPropagation(); navigate('/organizador/eventos/novo'); }} aria-label={`Editar ${evento.titulo}`}>✎</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* LADO DIREITO: DETALHES E CUSTOS DO EVENTO (Recriado do JS) */}
          <section className="po-details-section">
            <div className="po-details-header">
              <h2>{eventoAtivo.titulo}</h2>
              <p>{eventoAtivo.meta}</p>
              <div className="po-details-actions">
                <button className="po-btn-outline" onClick={() => navigate('/organizador/mensagens')}>💬 Chat com Fornecedores</button>
                <button className="po-btn-primary" onClick={() => navigate('/organizador/resumo')}>📊 Resumo Financeiro</button>
              </div>
            </div>

            <div className="po-cost-items">
              <h3>Composição de Custos ({eventoAtivo.itens.length} itens)</h3>
              
              <div className="po-items-list">
                {eventoAtivo.itens.map(item => (
                  <div key={item.id} className="po-item-card">
                    <div className="po-item-top">
                      <div className="po-item-info">
                        <h4>{item.nome}</h4>
                        <p>{item.desc}</p>
                        <span className="po-item-unit">{item.unit}</span>
                      </div>
                      <div className="po-item-actions">
                        <span className={`po-item-badge ${item.badgeClass}`}>{item.badge}</span>
                        <button 
                          className="po-btn-action"
                          onClick={() => {
                            if(item.btnText === "Cotar item") abrirModalCotacao(item);
                            else navigate("/organizador/eventos/novo/proposta");
                          }}
                        >
                          {item.btnText}
                        </button>
                      </div>
                    </div>
                    {item.detail && (
                      <div className="po-item-detail">
                        {item.detail}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>
          </>
        ) : (
          <Outlet />
        )}
      </main>

      {/* MODAL DE COTAÇÃO */}
      {modalCotacaoAberto && (
        <div className="po-modal-overlay">
          <div className="po-modal-content">
            <div className="po-modal-header">
              <div>
                <span>SOLICITAÇÃO DE COTAÇÃO</span>
                <h3>{itemParaCotar?.nome} ({itemParaCotar?.unit})</h3>
              </div>
              <button className="po-btn-close" onClick={() => setModalCotacaoAberto(false)}>✕</button>
            </div>
            
            <form className="po-modal-form" onSubmit={handleNovaCotacao}>
              <div className="po-form-grid">
                <div className="po-form-group">
                  <label>Teto Orçamentário (R$)</label>
                  <input type="text" placeholder="R$ 35.000,00" required />
                  <small>Limite previsto na composição de custos.</small>
                </div>
                <div className="po-form-group">
                  <label>Prazo para Respostas</label>
                  <input type="date" required />
                  <small>Data limite para os fornecedores.</small>
                </div>
              </div>
              
              <div className="po-form-group">
                <label>Especificações Técnicas e Requisitos</label>
                <textarea rows="3" placeholder="Ex: Detalhes de montagem, horário de passagem de som..."></textarea>
              </div>

              <div className="po-modal-footer">
                <button type="button" className="po-btn-cancel" onClick={() => setModalCotacaoAberto(false)}>Cancelar</button>
                <button type="submit" className="po-btn-submit">Abrir Cotação na Rede</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}