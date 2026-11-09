import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Suporte.css';

export default function Suporte() {
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  return (
    <div className="sup-layout">
      {/* Header Fixo Global */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 shadow-sm" style={{ backgroundColor: 'rgba(250, 248, 255, 0.85)', backdropFilter: 'blur(16px)' }}>
        <div className="sup-container" style={{ height: '4rem', display: 'flex', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--sup-primary)' }}>TrocaTicket</span>
          </Link>
        </div>
      </header>

      <main className="sup-main">
        {/* Hero Section */}
        <section className="sup-hero-section sup-container">
          <div className="sup-hero-card">
            <div className="sup-hero-bg-glow"></div>
            <div className="sup-hero-content">
              <h1 className="sup-hero-title">
                Suporte e Atendimento <span>TrocaTicket</span>
              </h1>
              <p className="sup-hero-desc">
                Canais centralizados para compradores, organizadores de festivais e fornecedores credenciados. Resolução transparente com custódia protegida, validação antifraude e suporte em dias de evento.
              </p>
            </div>
          </div>
        </section>

        {/* Canais de Atendimento */}
        <section className="sup-channels-section sup-container">
          <div className="sup-channels-grid">
            
            {/* Card 1: Chat */}
            <div className="sup-channel-card">
              <div>
                <div className="sup-channel-icon-wrapper">
                  <div className="sup-channel-icon">
                    <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>forum</span>
                  </div>
                </div>
                <h2 className="sup-channel-title">Chat Online em Tempo Real</h2>
                <p className="sup-channel-desc">Interação imediata com analistas de suporte para dúvidas de ingressos, estornos e liberação de acesso instantâneo.</p>
              </div>
              <div className="sup-channel-action">
                <button type="button" className="sup-btn-solid" onClick={() => setIsChatModalOpen(true)}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chat</span>
                  Iniciar Chat Agora
                </button>
              </div>
            </div>

            {/* Card 2: Ticket */}
            <div className="sup-channel-card">
              <div>
                <div className="sup-channel-icon-wrapper">
                  <div className="sup-channel-icon">
                    <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>confirmation_number</span>
                  </div>
                </div>
                <h2 className="sup-channel-title">Abertura de Chamado por Ticket</h2>
                <p className="sup-channel-desc">Ideal para envio de comprovantes de titularidade, divergências de liquidação ou auditoria de revenda assistida.</p>
              </div>
              <div className="sup-channel-action">
                {/* O link aponta para o ID de uma secção de formulário (caso exista) ou leva a outra página */}
                <Link to="/abrir-chamado" className="sup-btn-light">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit_document</span>
                  Abrir Novo Ticket
                </Link>
              </div>
            </div>

            {/* Card 3: Telefone */}
            <div className="sup-channel-card">
              <div>
                <div className="sup-channel-icon-wrapper">
                  <div className="sup-channel-icon">
                    <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>phone_in_talk</span>
                  </div>
                </div>
                <h2 className="sup-channel-title">Central Telefônica & Ouvidoria</h2>
                <p className="sup-channel-desc">Canal por voz gratuito para questões emergenciais durante o show e contato direto com a corregedoria de conformidade.</p>
              </div>
              <div className="sup-channel-action">
                <a href="tel:08008821040" className="sup-btn-light">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>call</span>
                  Ligar para 0800
                </a>
              </div>
            </div>

          </div>
        </section>

        {/* Compromisso e Transparência */}
        <section className="sup-commitment-section sup-container">
          <div className="sup-commitment-box">
            <div className="sup-feature-item">
              <span className="material-symbols-outlined sup-feature-icon">security_update_good</span>
              <div className="sup-feature-content">
                <h4 className="sup-feature-title">Custódia Financeira Retida</h4>
                <p className="sup-feature-desc">O valor do ingresso só é transferido ao vendedor após a validação bem-sucedida do comprador no evento.</p>
              </div>
            </div>
            <div className="sup-feature-item">
              <span className="material-symbols-outlined sup-feature-icon">policy</span>
              <div className="sup-feature-content">
                <h4 className="sup-feature-title">Ouvidoria Independente</h4>
                <p className="sup-feature-desc">Caso seu chamado não seja concluído dentro do prazo esperado, a ouvidoria assume o caso com reanálise em 24h.</p>
              </div>
            </div>
            <div className="sup-feature-item">
              <span className="material-symbols-outlined sup-feature-icon">task_alt</span>
              <div className="sup-feature-content">
                <h4 className="sup-feature-title">Protocolos Auditáveis</h4>
                <p className="sup-feature-desc">Todas as conversas, anexos e solicitações geram histórico imutável para segurança jurídica de todas as partes.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modal Simulado de Chat */}
      {isChatModalOpen && (
        <div className="sup-modal-overlay" role="dialog" aria-modal="true">
          <div className="sup-modal-content">
            <div className="sup-modal-icon">
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>support_agent</span>
            </div>
            <h3 className="sup-modal-title">Atendimento Online</h3>
            <p className="sup-modal-text">Conectando você a um de nossos analistas de suporte especializado. Aguarde um momento...</p>
            <button className="sup-modal-close-btn" onClick={() => setIsChatModalOpen(false)}>Cancelar Busca</button>
          </div>
        </div>
      )}

      {/* Footer Global */}
      <footer className="sup-footer">
        <div className="sup-container">
          <div className="sup-footer-grid">
            <div style={{ gridColumn: 'span 2' }}>
              <span className="sup-footer-brand">TrocaTicket</span>
              <p className="sup-footer-text" style={{ maxWidth: '28rem' }}>Plataforma segura para compra, venda e transferência verificada de ingressos com custódia garantida e transparência operacional total.</p>
              <div style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', borderRadius: '999px', backgroundColor: 'var(--sup-surface-container-high)' }}>
                <span className="material-symbols-outlined" style={{fontSize:'16px', color:'var(--sup-primary)'}}>verified_user</span>
                <span style={{fontSize:'0.6875rem', fontWeight: 700, color:'var(--sup-on-surface-variant)'}}>Conformidade LGPD</span>
              </div>
            </div>
            <div>
              <h4 className="sup-footer-nav-title">Governança & Jurídico</h4>
              <ul className="sup-footer-nav-list">
                <li><Link to="/termos" className="sup-footer-nav-link">Termos de Uso</Link></li>
                <li><Link to="/privacidade" className="sup-footer-nav-link">Política de Privacidade</Link></li>
                <li><Link to="/seguranca" className="sup-footer-nav-link">Diretrizes de Segurança</Link></li>
                <li><Link to="/cancelamento" className="sup-footer-nav-link">Políticas de Cancelamento</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="sup-footer-nav-title">Ajuda & Relacionamento</h4>
              <ul className="sup-footer-nav-list">
                <li><Link to="/ajuda" className="sup-footer-nav-link">Central de Ajuda</Link></li>
                <li><Link to="/suporte" className="sup-footer-nav-link">Canais de Suporte</Link></li>
                <li><Link to="/ouvidoria" className="sup-footer-nav-link">Ouvidoria Institucional</Link></li>
                <li><button className="sup-footer-nav-link" style={{background:'none', border:'none', padding:0, cursor:'pointer'}}>Reportar Fraude</button></li>
              </ul>
            </div>
          </div>
          <div className="sup-footer-bottom">
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--sup-on-surface-variant)' }}>© 2026 TrocaTicket Tecnologia S.A. CNPJ 00.000.000/0001-00. Todos os direitos reservados.</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--sup-on-surface-variant)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span className="material-symbols-outlined" style={{fontSize:'14px', color:'var(--sup-primary)'}}>shield</span>Plataforma Auditada</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--sup-on-surface-variant)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span className="material-symbols-outlined" style={{fontSize:'14px', color:'var(--sup-primary)'}}>lock</span>Transações Criptografadas</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}