import React, { useState } from 'react';
import './PainelFornecedor.css';

export default function PainelFornecedor() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [modalState, setModalState] = useState({ isOpen: false, title: '', tag: '', value: '' });

  const openQuoteModal = (title, tag, value = '') => {
    setModalState({ isOpen: true, title, tag, value });
  };

  const closeQuoteModal = () => {
    setModalState({ isOpen: false, title: '', tag: '', value: '' });
  };

  const handleQuoteSubmit = (e) => {
    e.preventDefault();
    alert('Proposta salva e encaminhada com sucesso para o organizador!');
    closeQuoteModal();
  };

  return (
    <div className="opp-layout">
      {/* Aqui entraria o Header Global (TopNavigationBar) */}

      <main className="opp-main">
        {/* Page Header */}
        <div className="opp-page-header">
          <div>
            <p className="opp-greeting">Bom dia, Casa Aurora</p>
            <h1 className="opp-page-title">Oportunidades abertas</h1>
          </div>
          <div>
            <span className="opp-summary-text"><strong>5 eventos</strong> aguardando sua proposta</span>
          </div>
        </div>

        {/* Onboarding Banner */}
        {showOnboarding && (
          <section className="opp-onboarding">
            <div className="opp-onboarding-header">
              <div>
                <h2 className="opp-onboarding-title"><span className="dot"></span>Como funciona</h2>
                <p className="opp-onboarding-desc">Do evento à proposta aprovada em 4 passos simples.</p>
              </div>
              <button className="opp-btn-dismiss" onClick={() => setShowOnboarding(false)}>
                ✕ Entendi
              </button>
            </div>
            <div className="opp-steps-grid">
              <div className="opp-step-card">
                <div className="opp-step-top">
                  <div className="opp-step-icon" style={{ backgroundColor: '#eff6ff', color: '#00629e' }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <span className="opp-step-num" style={{ color: '#bfdbfe' }}>1</span>
                </div>
                <h3 className="opp-step-title">Encontre um evento</h3>
                <p className="opp-step-text">Na lista à esquerda estão os eventos abertos para cotação. Use a busca ou filtre por tipo.</p>
              </div>
              <div className="opp-step-card">
                <div className="opp-step-top">
                  <div className="opp-step-icon" style={{ backgroundColor: '#eef2ff', color: '#5F5EF0' }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                  </div>
                  <span className="opp-step-num" style={{ color: '#c7d2fe' }}>2</span>
                </div>
                <h3 className="opp-step-title">Veja os itens</h3>
                <p className="opp-step-text">Clique no evento para ver os itens que o organizador precisa (buffet, mobiliário...).</p>
              </div>
              <div className="opp-step-card">
                <div className="opp-step-top">
                  <div className="opp-step-icon" style={{ backgroundColor: '#f0f9ff', color: '#3BA7FC' }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  </div>
                  <span className="opp-step-num" style={{ color: '#bae6fd' }}>3</span>
                </div>
                <h3 className="opp-step-title">Envie sua proposta</h3>
                <p className="opp-step-text">Em cada item, clique em "Cotar item" e informe valor, descrição, validade e observações.</p>
              </div>
              <div className="opp-step-card">
                <div className="opp-step-top">
                  <div className="opp-step-icon" style={{ backgroundColor: '#ecfdf5', color: '#10B981' }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <span className="opp-step-num" style={{ color: '#a7f3d0' }}>4</span>
                </div>
                <h3 className="opp-step-title">Acompanhe</h3>
                <p className="opp-step-text">Em "Minhas propostas" você vê o status. Dá para editar ou cancelar enquanto estiver Enviada ou Em análise.</p>
              </div>
            </div>
          </section>
        )}

        {/* Master Detail Grid */}
        <div className="opp-content-grid">
          
          {/* Coluna Esquerda: Lista */}
          <section className="opp-col-left">
            <div className="opp-search-box">
              <svg className="opp-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" className="opp-search-input" placeholder="Buscar evento ou local" />
            </div>
            
            <div className="opp-filter-chips">
              <button className="opp-chip active">Todos</button>
              <button className="opp-chip">Casamento</button>
              <button className="opp-chip">Corporativo</button>
              <button className="opp-chip">Social</button>
              <button className="opp-chip">Festival</button>
            </div>

            <div className="opp-list">
              {/* Card Ativo */}
              <div className="opp-card active">
                <div className="opp-card-header">
                  <span className="opp-card-tag">Casamento</span>
                  <span className="opp-card-urgency red">fecha em -4d</span>
                </div>
                <h3 className="opp-card-title">Casamento Helena & Tomás</h3>
                <p className="opp-card-meta">Fazenda Boa Vista · 120 convidados</p>
                <div className="opp-progress-row">
                  <div className="opp-progress-bar"><div className="opp-progress-fill gradient" style={{width: '75%'}}></div></div>
                  <span className="opp-progress-text opp-tnum">3/4 cotados</span>
                </div>
              </div>

              {/* Cards Inativos */}
              <div className="opp-card">
                <div className="opp-card-header">
                  <span className="opp-card-tag">Corporativo</span>
                  <span className="opp-card-urgency orange">fecha em 0d</span>
                </div>
                <h3 className="opp-card-title">Convenção Nimbus Tech</h3>
                <p className="opp-card-meta">Centro de Convenções · 400 convidados</p>
                <div className="opp-progress-row">
                  <div className="opp-progress-bar"><div className="opp-progress-fill gradient" style={{width: '50%'}}></div></div>
                  <span className="opp-progress-text opp-tnum">1/2 cotados</span>
                </div>
              </div>

              <div className="opp-card">
                <div className="opp-card-header">
                  <span className="opp-card-tag">Social</span>
                  <span className="opp-card-urgency orange">fecha em 5d</span>
                </div>
                <h3 className="opp-card-title">Aniversário 50 anos Dona Rita</h3>
                <p className="opp-card-meta">Espaço Vila Verde · 80 convidados</p>
                <div className="opp-progress-row">
                  <div className="opp-progress-bar"><div className="opp-progress-fill gradient" style={{width: '50%'}}></div></div>
                  <span className="opp-progress-text opp-tnum">1/2 cotados</span>
                </div>
              </div>

              <div className="opp-card">
                <div className="opp-card-header">
                  <span className="opp-card-tag">Festival</span>
                  <span className="opp-card-urgency normal">22 de nov</span>
                </div>
                <h3 className="opp-card-title">Festival da Primavera & Gastronomia</h3>
                <p className="opp-card-meta">Parque Ibirapuera · 800 convidados</p>
                <div className="opp-progress-row">
                  <div className="opp-progress-bar"><div className="opp-progress-fill empty" style={{width: '100%'}}></div></div>
                  <span className="opp-progress-text opp-tnum">0/2 cotados</span>
                </div>
              </div>

            </div>
          </section>

          {/* Coluna Direita: Detalhes */}
          <section className="opp-col-right">
            <div className="opp-detail-wrapper">
              
              {/* Banner Detalhe Evento */}
              <div className="opp-detail-banner">
                <span className="opp-banner-tag">Casamento</span>
                <h2 className="opp-banner-title">Casamento Helena & Tomás</h2>
                <div className="opp-banner-meta">
                  <span className="opp-banner-meta-item">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> 28/10/2026
                  </span>
                  <span className="opp-banner-meta-item">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> Fazenda Boa Vista
                  </span>
                  <span className="opp-banner-meta-item">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> 120 convidados
                  </span>
                </div>
                
                <div className="opp-banner-stats">
                  <div className="opp-stat-box">
                    <div className="opp-stat-label">Prazo para cotar</div>
                    <div className="opp-stat-val opp-tnum">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> 23/10/2026 · -4d
                    </div>
                  </div>
                  <div className="opp-stat-box">
                    <div className="opp-stat-label">Itens cotados</div>
                    <div className="opp-stat-val opp-tnum"><span style={{color: 'var(--opp-primary)'}}>3</span> de 4</div>
                  </div>
                  <div className="opp-stat-box flex-between">
                    <div>
                      <div className="opp-stat-label">Organizador</div>
                      <div className="opp-stat-val">Marina Braga</div>
                    </div>
                    <button className="opp-btn-chat" title="Conversar">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Composição de Custo (Itens) */}
              <div className="opp-cost-section">
                <div className="opp-cost-header">
                  <h3 className="opp-cost-title">Composição de custo</h3>
                  <span className="opp-cost-subtitle">Cote cada item separadamente</span>
                </div>

                <div className="opp-items-list">
                  
                  {/* Item 1: Não Cotado */}
                  <div className="opp-item-card action-required">
                    <div className="opp-item-top">
                      <div className="opp-item-info">
                        <div className="opp-item-title-row">
                          <h4 className="opp-item-name">Buffet jantar servido</h4>
                          <span className="opp-item-qty">120 pax</span>
                        </div>
                        <p className="opp-item-desc">Entrada, prato principal, sobremesa · serviço à francesa</p>
                      </div>
                      <div className="opp-item-actions">
                        <button className="opp-btn-quote" onClick={() => openQuoteModal('Buffet jantar servido', '120 pax')}>
                          <span>+</span> Cotar item
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Item 2: Enviada */}
                  <div className="opp-item-card">
                    <div className="opp-item-top with-margin">
                      <div className="opp-item-info">
                        <div className="opp-item-title-row">
                          <h4 className="opp-item-name">Mobiliário e louças</h4>
                          <span className="opp-item-qty">12 conj.</span>
                        </div>
                        <p className="opp-item-desc">Mesas redondas, cadeiras Tiffany, louça premium</p>
                      </div>
                      <div className="opp-item-actions">
                        <span className="opp-badge enviada"><span className="dot"></span>Enviada</span>
                        <button className="opp-btn-edit" onClick={() => openQuoteModal('Mobiliário e louças', '12 conj.', '6.200,00')}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> Editar
                        </button>
                      </div>
                    </div>
                    <div className="opp-item-footer">
                      <span className="opp-footer-val opp-tnum">R$ 6.200,00</span>
                      <span className="opp-footer-sep">·</span>
                      <span className="opp-footer-text">Enviada 12/10/2026</span>
                      <span className="opp-footer-sep">·</span>
                      <span className="opp-footer-text">Válida até 12/11/2026</span>
                      <span className="opp-footer-sep">·</span>
                      <span className="opp-footer-obs">"Inclui montagem e desmontagem."</span>
                    </div>
                  </div>

                  {/* Item 3: Em análise */}
                  <div className="opp-item-card">
                    <div className="opp-item-top with-margin">
                      <div className="opp-item-info">
                        <div className="opp-item-title-row">
                          <h4 className="opp-item-name">Decoração floral</h4>
                          <span className="opp-item-qty">1 projeto</span>
                        </div>
                        <p className="opp-item-desc">Centro de mesa, arco de flores, arranjos de altar</p>
                      </div>
                      <div className="opp-item-actions">
                        <span className="opp-badge analise"><span className="dot"></span>Em análise</span>
                        <button className="opp-btn-edit" onClick={() => openQuoteModal('Decoração floral', '1 projeto', '9.850,00')}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> Editar
                        </button>
                      </div>
                    </div>
                    <div className="opp-item-footer">
                      <span className="opp-footer-val opp-tnum">R$ 9.850,00</span>
                      <span className="opp-footer-sep">·</span>
                      <span className="opp-footer-text">Enviada 10/10/2026</span>
                      <span className="opp-footer-sep">·</span>
                      <span className="opp-footer-text">Válida até 10/11/2026</span>
                      <span className="opp-footer-sep">·</span>
                      <span className="opp-footer-obs">"Flores da estação."</span>
                    </div>
                  </div>

                  {/* Item 4: Aprovada */}
                  <div className="opp-item-card">
                    <div className="opp-item-top with-margin">
                      <div className="opp-item-info">
                        <div className="opp-item-title-row">
                          <h4 className="opp-item-name">Som e iluminação</h4>
                          <span className="opp-item-qty">1 kit</span>
                        </div>
                        <p className="opp-item-desc">Palco, pista, DJ e iluminação cênica</p>
                      </div>
                      <div className="opp-item-actions">
                        <span className="opp-badge aprovada"><span className="dot"></span>Aprovada</span>
                      </div>
                    </div>
                    <div className="opp-item-footer">
                      <span className="opp-footer-val opp-tnum">R$ 7.400,00</span>
                      <span className="opp-footer-sep">·</span>
                      <span className="opp-footer-text">Enviada 08/10/2026</span>
                      <span className="opp-footer-sep">·</span>
                      <span className="opp-footer-text">Válida até 14/11/2026</span>
                      <span className="opp-footer-sep">·</span>
                      <span className="opp-footer-obs">"Contrato emitido."</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Modal Cotação */}
      {modalState.isOpen && (
        <div className="opp-modal-overlay">
          <div className="opp-modal-content">
            <div className="opp-modal-header">
              <div>
                <h3 className="opp-modal-title">Cotar item</h3>
                <p className="opp-modal-subtitle">{modalState.title} · {modalState.tag}</p>
              </div>
              <button className="opp-btn-close" onClick={closeQuoteModal}>✕</button>
            </div>
            
            <form onSubmit={handleQuoteSubmit}>
              <div className="opp-form-group">
                <label className="opp-label">Valor da proposta (R$)</label>
                <div className="opp-input-wrapper">
                  <span className="opp-input-prefix">R$</span>
                  <input 
                    type="text" 
                    className="opp-input with-prefix opp-tnum" 
                    placeholder="0,00" 
                    required 
                    defaultValue={modalState.value} 
                  />
                </div>
              </div>
              
              <div className="opp-form-group">
                <label className="opp-label">Validade da proposta</label>
                <input type="date" className="opp-input" required defaultValue="2026-11-20" />
              </div>
              
              <div className="opp-form-group">
                <label className="opp-label">Observações e inclusões</label>
                <textarea className="opp-input" placeholder="Ex: Incluso frete, montagem, desmontagem..." rows="3"></textarea>
              </div>
              
              <div className="opp-modal-actions">
                <button type="button" className="opp-btn-cancel" onClick={closeQuoteModal}>Cancelar</button>
                <button type="submit" className="opp-btn-submit">Enviar Proposta</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}