import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './TermosDeUso.css';

export default function TermosDeUso() {
  const [activeSection, setActiveSection] = useState('clausula-01');

  // Lógica para detetar o scroll e atualizar o menu lateral
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['clausula-01', 'clausula-02', 'clausula-03', 'clausula-04', 'clausula-05', 'clausula-06', 'clausula-07', 'clausula-08'];
      const scrollPos = window.scrollY + 140; // Offset do header
      
      let current = sections[0];
      for (const sec of sections) {
        const element = document.getElementById(sec);
        if (element && element.offsetTop <= scrollPos) {
          current = sec;
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="term-layout">
      {/* Header Fixo Global */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 shadow-sm" style={{ backgroundColor: 'rgba(250, 248, 255, 0.85)', backdropFilter: 'blur(16px)' }}>
        <div className="term-container" style={{ height: '4rem', display: 'flex', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--term-primary)' }}>TrocaTicket</span>
          </Link>
        </div>
      </header>

      <main className="term-main">
        {/* Top Header do Documento */}
        <section className="term-doc-header">
          <div className="term-container term-doc-header-content">
            <div className="term-title-wrapper">
              <h1 className="term-page-title">Termos de Uso da Plataforma</h1>
              <p className="term-page-desc">
                Diretrizes jurídicas, operacionais e de custódia segura vigentes para titulares, compradores, vendedores e organizadores no ecossistema TrocaTicket.
              </p>
            </div>
            <div className="term-doc-actions">
              <button className="term-btn-secondary" onClick={handlePrint}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>print</span>
                Imprimir
              </button>
              <a href="#download-pdf" className="term-btn-primary">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
                Baixar PDF
              </a>
            </div>
          </div>
        </section>

        {/* Corpo do Documento */}
        <div className="term-container term-body-section">
          <div className="term-grid">
            
            {/* Sidebar (Menu Lateral Sticky) */}
            <aside className="term-sidebar">
              <div className="term-index-box">
                <div className="term-index-header">
                  <span className="term-index-title">Estrutura do Contrato</span>
                  <span className="term-index-badge">8 Cláusulas</span>
                </div>
                <nav className="term-nav">
                  <a href="#clausula-01" className={`term-nav-link ${activeSection === 'clausula-01' ? 'active' : ''}`}>
                    <span className="term-nav-num">01.</span>
                    <span className="term-nav-text">Objeto e Definição da Plataforma</span>
                  </a>
                  <a href="#clausula-02" className={`term-nav-link ${activeSection === 'clausula-02' ? 'active' : ''}`}>
                    <span className="term-nav-num">02.</span>
                    <span className="term-nav-text">Elegibilidade, Cadastro e Homologação</span>
                  </a>
                  <a href="#clausula-03" className={`term-nav-link ${activeSection === 'clausula-03' ? 'active' : ''}`}>
                    <span className="term-nav-num">03.</span>
                    <span className="term-nav-text">Responsabilidades do Organizador</span>
                  </a>
                  <a href="#clausula-04" className={`term-nav-link ${activeSection === 'clausula-04' ? 'active' : ''}`}>
                    <span className="term-nav-num">04.</span>
                    <span className="term-nav-text">Cotações e Relação com Fornecedores</span>
                  </a>
                  <a href="#clausula-05" className={`term-nav-link ${activeSection === 'clausula-05' ? 'active' : ''}`}>
                    <span className="term-nav-num">05.</span>
                    <span className="term-nav-text">Compra, Emissão e Anti-cambismo</span>
                  </a>
                  <a href="#clausula-06" className={`term-nav-link ${activeSection === 'clausula-06' ? 'active' : ''}`}>
                    <span className="term-nav-num">06.</span>
                    <span className="term-nav-text">Taxas, Liquidação e Escrow</span>
                  </a>
                  <a href="#clausula-07" className={`term-nav-link ${activeSection === 'clausula-07' ? 'active' : ''}`}>
                    <span className="term-nav-num">07.</span>
                    <span className="term-nav-text">Cancelamentos e Arrependimento</span>
                  </a>
                  <a href="#clausula-08" className={`term-nav-link ${activeSection === 'clausula-08' ? 'active' : ''}`}>
                    <span className="term-nav-num">08.</span>
                    <span className="term-nav-text">Disposições Finais e Foro (SP)</span>
                  </a>
                </nav>
                
                {/* Ajuda Widget */}
                <div className="term-help-widget">
                  <div className="term-help-title">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>support_agent</span>
                    Dúvida Legal ou Institucional?
                  </div>
                  <p className="term-help-text">Nosso time jurídico e de ouvidoria responde formalmente em até 2 dias úteis.</p>
                  <a href="mailto:juridico@trocaticket.com.br" className="term-help-link">
                    juridico@trocaticket.com.br
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_forward</span>
                  </a>
                </div>
              </div>
            </aside>

            {/* Stream de Cláusulas */}
            <div className="term-content-stream">
              
              {/* Preâmbulo */}
              <article className="term-article">
                <span className="term-preamble-badge">Preâmbulo Vinculante</span>
                <p className="term-text">
                  Bem-vindo à <strong style={{color: 'var(--term-primary)'}}>TrocaTicket</strong>. O presente instrumento estabelece os termos e condições contratuais aplicáveis ao uso dos serviços tecnológicos de intermediação, emissão segura, custódia provisória de valores (<em style={{fontStyle: 'italic'}}>escrow account</em>) e transferência de titularidade de ingressos providos pela TrocaTicket Tecnologia S.A.
                </p>
                <p className="term-text-variant">
                  Ao se cadastrar, navegar, disponibilizar ingressos para revenda oficial, adquirir entradas ou integrar sua operação produtora, o Usuário expressa inequívoca concordância com as disposições aqui constantes e com a Política de Privacidade adjacente.
                </p>
              </article>

              {/* Cláusula 01 */}
              <article id="clausula-01" className="term-article">
                <div className="term-clause-header">
                  <span className="term-clause-badge">Cláusula 01</span>
                  <span className="material-symbols-outlined" style={{ color: 'var(--term-outline-variant)', fontSize: '20px' }}>layers</span>
                </div>
                <h2 className="term-clause-title">Objeto e Definição da Plataforma</h2>
                
                <div className="term-clause-body">
                  <p className="term-text">
                    1.1. A TrocaTicket atua exclusivamente como uma plataforma tecnológica e infraestrutura de rede intermediadora, fornecendo mecanismos computacionais para emissão primária, validação de autenticidade e mercado secundário supervisionado de ingressos e experiências culturais, desportivas e corporativas.
                  </p>
                  <p className="term-text">
                    1.2. A TrocaTicket não é proprietária originária dos eventos ofertados por terceiros nem responde pela organização de logística, estrutura física, curadoria artística ou alvarás de funcionamento dos espetáculos, salvo quando explicitamente identificada como Realizadora Geral.
                  </p>
                </div>

                {/* Box Linguagem Clara */}
                <div className="term-simple-box">
                  <span className="material-symbols-outlined term-simple-icon">lightbulb</span>
                  <div className="term-simple-content">
                    <span className="term-simple-title">Em linguagem clara: O que a TrocaTicket faz</span>
                    <p className="term-simple-text">
                      Nós fornecemos a tecnologia blindada para você comprar, vender ou transferir seu ingresso sem tomar golpes e sem pagar preços abusivos. Não somos a banda, nem os donos do estádio ou do teatro onde o show acontece.
                    </p>
                  </div>
                </div>
              </article>

              {/* Placeholder para as outras cláusulas para manter a estrutura e o scrollspy funcionando */}
              <article id="clausula-02" className="term-article"><h2 className="term-clause-title" style={{color: 'var(--term-on-surface-variant)'}}>02. Elegibilidade, Cadastro e Homologação (Em breve)</h2></article>
              <article id="clausula-03" className="term-article"><h2 className="term-clause-title" style={{color: 'var(--term-on-surface-variant)'}}>03. Responsabilidades do Organizador (Em breve)</h2></article>
              <article id="clausula-04" className="term-article"><h2 className="term-clause-title" style={{color: 'var(--term-on-surface-variant)'}}>04. Cotações e Relação com Fornecedores (Em breve)</h2></article>
              <article id="clausula-05" className="term-article"><h2 className="term-clause-title" style={{color: 'var(--term-on-surface-variant)'}}>05. Compra, Emissão e Anti-cambismo (Em breve)</h2></article>
              <article id="clausula-06" className="term-article"><h2 className="term-clause-title" style={{color: 'var(--term-on-surface-variant)'}}>06. Taxas, Liquidação e Escrow (Em breve)</h2></article>
              <article id="clausula-07" className="term-article"><h2 className="term-clause-title" style={{color: 'var(--term-on-surface-variant)'}}>07. Cancelamentos e Arrependimento (Em breve)</h2></article>
              <article id="clausula-08" className="term-article"><h2 className="term-clause-title" style={{color: 'var(--term-on-surface-variant)'}}>08. Disposições Finais e Foro (SP) (Em breve)</h2></article>

            </div>
          </div>
        </div>
      </main>

      {/* Footer Global (Usando react-router-dom Link) */}
      <footer className="term-footer">
        <div className="term-container">
          <div className="term-footer-grid">
            <div style={{ gridColumn: 'span 2' }}>
              <span className="term-footer-brand">TrocaTicket</span>
              <p className="term-footer-text" style={{ maxWidth: '28rem' }}>Plataforma segura para compra, venda e transferência verificada de ingressos com custódia garantida e transparência operacional total.</p>
              <div style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', borderRadius: '999px', backgroundColor: 'var(--term-surface-container-high)' }}>
                <span className="material-symbols-outlined" style={{fontSize:'16px', color:'var(--term-primary)'}}>verified_user</span>
                <span style={{fontSize:'0.6875rem', fontWeight: 700, color:'var(--term-on-surface-variant)'}}>Conformidade LGPD</span>
              </div>
            </div>
            <div>
              <h4 className="term-footer-nav-title">Governança & Jurídico</h4>
              <ul className="term-footer-nav-list">
                <li><Link to="/termos" className="term-footer-nav-link">Termos de Uso</Link></li>
                <li><Link to="/privacidade" className="term-footer-nav-link">Política de Privacidade</Link></li>
                <li><Link to="/seguranca" className="term-footer-nav-link">Diretrizes de Segurança</Link></li>
                <li><Link to="/cancelamento" className="term-footer-nav-link">Políticas de Cancelamento</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="term-footer-nav-title">Ajuda & Relacionamento</h4>
              <ul className="term-footer-nav-list">
                <li><Link to="/ajuda" className="term-footer-nav-link">Central de Ajuda</Link></li>
                <li><Link to="/suporte" className="term-footer-nav-link">Canais de Suporte</Link></li>
                <li><Link to="/ouvidoria" className="term-footer-nav-link">Ouvidoria Institucional</Link></li>
                <li><button className="term-footer-nav-link" style={{background:'none', border:'none', padding:0, cursor:'pointer'}}>Reportar Fraude</button></li>
              </ul>
            </div>
          </div>
          <div className="term-footer-bottom">
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--term-on-surface-variant)' }}>© 2026 TrocaTicket Tecnologia S.A. CNPJ 00.000.000/0001-00. Todos os direitos reservados.</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--term-on-surface-variant)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span className="material-symbols-outlined" style={{fontSize:'14px', color:'var(--term-primary)'}}>shield</span>Plataforma Auditada</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--term-on-surface-variant)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span className="material-symbols-outlined" style={{fontSize:'14px', color:'var(--term-primary)'}}>lock</span>Transações Criptografadas</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}