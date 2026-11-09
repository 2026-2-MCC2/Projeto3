import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // <-- Isto evita recarregar a página!
import './SegurancaInstitucional.css';

export default function SegurancaInstitucional() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleReportSubmit = (e) => {
    e.preventDefault();
    alert('Reporte protocolado sob sigilo criptográfico com sucesso. Código de rastreio enviado para triagem.');
    setIsModalOpen(false);
  };

  return (
    <div className="sec-layout">
      {/* Header Fixo Global - Usa Links em vez de <a> */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface/85 backdrop-blur-xl shadow-sm" style={{ backgroundColor: 'rgba(250, 248, 255, 0.85)' }}>
        <div className="sec-container" style={{ height: '4rem', display: 'flex', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--sec-primary)' }}>TrocaTicket</span>
          </Link>
        </div>
      </header>

      <main className="sec-main">
        {/* Hero Section */}
        <section className="sec-hero-section sec-container">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '60%' }}>
            <h1 className="sec-hero-title">
              Segurança e Integridade <span style={{ color: 'var(--sec-primary)' }}>TrocaTicket</span>
            </h1>
            <p className="sec-hero-desc">
              Infraestrutura criptográfica de auditoria contínua, cofre de custódia patrimonial (escrow) e autenticação de identidade em várias camadas. Proteção incondicional tanto para produtores de grandes eventos quanto para adquirentes finais.
            </p>
            <div className="sec-hero-actions">
              {/* Botão abre o Modal React em vez de usar href="#" */}
              <button className="sec-btn-primary" onClick={() => setIsModalOpen(true)}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>report_problem</span>
                Reportar Incidente ou Fraude
              </button>
              {/* Ancora interna funciona na mesma página */}
              <a href="#boas-praticas" className="sec-btn-secondary">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>menu_book</span>
                Manual de Boas Práticas
              </a>
            </div>
          </div>
        </section>

        {/* Banner Imagem (Catraca) */}
        <section className="sec-banner-section sec-container">
          <div className="sec-banner-card">
            <img 
              className="sec-banner-img" 
              alt="Catracas de acesso" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBq4xkYhMPnZUXXvLIFShLl7xJXAAJW14reMaqTWBb_e53uviRkqTpdbFGSkKOsuQ4uUG8Cbvu5I8vey9wEfrvVnVE9aRFfxylFxjAvhVqSQ50oiS8_3tdVpjrXX8QZJVWLQWI_rPY0ZwcKFOwySTEuV0DBugh-Ngz0OSSFgf9Pi_Ikw-xvdxfJ94XyxOP0XqacJjJVlvdTAI66WuagY5B_tJO8nTSoKDeOOGuWuEv2" 
            />
            <div className="sec-banner-overlay">
              <div className="sec-banner-content">
                <span className="sec-banner-tag">Controle Físico e Lógico</span>
                <h2 className="sec-banner-title">A catraca do evento conecta-se à nossa nuvem em milissegundos</h2>
                <p className="sec-banner-text">
                  Nenhuma cópia estática ou captura de tela ultrapassa o portal de entrada. O algoritmo de rotação só aceita tickets validados pela chave assimétrica emitida pelo aplicativo oficial.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pilares */}
        <section className="sec-pillars-section sec-container">
          <h2 className="sec-section-title">Pilares de Segurança Tecnológica</h2>
          <div className="sec-pillars-grid">
            <div className="sec-pillar-card">
              <div className="sec-pillar-icon-box blue">
                <span className="material-symbols-outlined">qr_code_scanner</span>
              </div>
              <h3 className="sec-pillar-title">Dynamic QR Code®</h3>
              <p className="sec-pillar-text">Códigos rotativos de alta frequência gerados via algoritmo TOTP com criptografia local. Prints, fotos de tela e encaminhamentos tornam-se nulos em menos de 15 segundos.</p>
            </div>
            <div className="sec-pillar-card">
              <div className="sec-pillar-icon-box red">
                <span className="material-symbols-outlined">account_balance</span>
              </div>
              <h3 className="sec-pillar-title">Proteção & Escrow</h3>
              <p className="sec-pillar-text">O valor financeiro transacionado fica retido em câmara de liquidação segura e só é liberado mediante o acesso homologado ou comprovação integral do evento contratado.</p>
            </div>
            <div className="sec-pillar-card">
              <div className="sec-pillar-icon-box blue">
                <span className="material-symbols-outlined">domain_verification</span>
              </div>
              <h3 className="sec-pillar-title">Compliance Documental</h3>
              <p className="sec-pillar-text">Auditoria imediata de CNPJ na Receita Federal, certidões negativas tributárias e cruzamento do quadro societário (QSA) antes de habilitar qualquer conta arrecadadora.</p>
            </div>
            <div className="sec-pillar-card">
              <div className="sec-pillar-icon-box orange">
                <span className="material-symbols-outlined">sensors</span>
              </div>
              <h3 className="sec-pillar-title">Monitoramento 24/7</h3>
              <p className="sec-pillar-text">Motores de inteligência detectam acessos atípicos, padrões de scraping e tentativas de spoofing de IP em frações de segundo, com túnel TLS 1.3 de ponta a ponta.</p>
            </div>
          </div>
        </section>

        {/* Guia Boas Práticas */}
        <section id="boas-praticas" className="sec-guide-section sec-container">
          <div className="sec-guide-header">
            <h2 className="sec-section-title" style={{ marginBottom: '0.5rem' }}>Guia Prático: Boas Práticas de Segurança</h2>
            <p className="sec-guide-subtitle">A segurança cibernética opera no seu ápice quando cada elo do ecossistema aplica regras rigorosas de controle e verificação mútua.</p>
          </div>
          <div className="sec-guide-grid">
            {/* Org */}
            <div className="sec-guide-card">
              <div className="sec-guide-card-header">
                <div className="sec-guide-card-icon blue"><span className="material-symbols-outlined">corporate_fare</span></div>
                <h3 className="sec-guide-card-title">Organizadores</h3>
              </div>
              <p className="sec-guide-card-desc">Mantenha a governança da bilheteria e proteja as receitas brutas de sua produção contra acessos indevidos.</p>
              <ul className="sec-guide-list">
                <li className="sec-guide-item">
                  <span className="material-symbols-outlined sec-guide-item-icon">lock_person</span>
                  <span className="sec-guide-item-text"><strong>Autenticação em Duas Etapas (2FA):</strong> Obrigatoriedade do uso de app autenticador.</span>
                </li>
                <li className="sec-guide-item">
                  <span className="material-symbols-outlined sec-guide-item-icon">manage_accounts</span>
                  <span className="sec-guide-item-text"><strong>Controle Granular de Permissões:</strong> Conceda níveis estritos por função.</span>
                </li>
                <li className="sec-guide-item">
                  <span className="material-symbols-outlined sec-guide-item-icon">devices</span>
                  <span className="sec-guide-item-text"><strong>Hardware Homologado na Portaria:</strong> Empregue apenas coletores certificados.</span>
                </li>
              </ul>
            </div>
            {/* Fornec */}
            <div className="sec-guide-card">
              <div className="sec-guide-card-header">
                <div className="sec-guide-card-icon gray"><span className="material-symbols-outlined">handshake</span></div>
                <h3 className="sec-guide-card-title">Fornecedores</h3>
              </div>
              <p className="sec-guide-card-desc">Garantia de recebimento pontual e proteção contra cancelamentos unilaterais de compras e cotas de serviço.</p>
              <ul className="sec-guide-list">
                <li className="sec-guide-item">
                  <span className="material-symbols-outlined sec-guide-item-icon">draw</span>
                  <span className="sec-guide-item-text"><strong>Assinatura Digital de Propostas:</strong> Formalize acordos com certificados ICP-Brasil.</span>
                </li>
                <li className="sec-guide-item">
                  <span className="material-symbols-outlined sec-guide-item-icon">account_balance_wallet</span>
                  <span className="sec-guide-item-text"><strong>Conta Vinculada Estritamente ao CNPJ:</strong> Não efetuamos liquidações em contas PF.</span>
                </li>
                <li className="sec-guide-item">
                  <span className="material-symbols-outlined sec-guide-item-icon">history_edu</span>
                  <span className="sec-guide-item-text"><strong>Relatório de Medição Compartilhado:</strong> Submeta fotos para destrava do escrow.</span>
                </li>
              </ul>
            </div>
            {/* Compr */}
            <div className="sec-guide-card">
              <div className="sec-guide-card-header">
                <div className="sec-guide-card-icon red"><span className="material-symbols-outlined">confirmation_number</span></div>
                <h3 className="sec-guide-card-title">Compradores</h3>
              </div>
              <p className="sec-guide-card-desc">Assegure que seu ingresso é 100% autêntico e desfrute do evento sem surpresas desagradáveis na fila.</p>
              <ul className="sec-guide-list">
                <li className="sec-guide-item">
                  <span className="material-symbols-outlined sec-guide-item-icon">storefront</span>
                  <span className="sec-guide-item-text"><strong>Compra Exclusiva em Canais Oficiais:</strong> Jamais compre ingressos via links de WhatsApp.</span>
                </li>
                <li className="sec-guide-item">
                  <span className="material-symbols-outlined sec-guide-item-icon">install_mobile</span>
                  <span className="sec-guide-item-text"><strong>Validação Direta no Aplicativo:</strong> O ingresso original só é exibido com o selo animado.</span>
                </li>
                <li className="sec-guide-item">
                  <span className="material-symbols-outlined sec-guide-item-icon">no_photography</span>
                  <span className="sec-guide-item-text"><strong>Nunca Publique Fotos do QR Code:</strong> Evite exibir seu bilhete em redes sociais.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Global (Usando react-router-dom Link) */}
      <footer className="sec-footer">
        <div className="sec-container">
          <div className="sec-footer-grid">
            <div style={{ gridColumn: 'span 2' }}>
              <span className="sec-footer-brand">TrocaTicket</span>
              <p className="sec-footer-text" style={{ maxWidth: '28rem' }}>Plataforma segura para compra, venda e transferência verificada de ingressos com custódia garantida e transparência operacional total.</p>
            </div>
            <div>
              <h4 className="sec-footer-nav-title">Governança & Jurídico</h4>
              <ul className="sec-footer-nav-list">
                <li><Link to="/termos" className="sec-footer-nav-link">Termos de Uso</Link></li>
                <li><Link to="/privacidade" className="sec-footer-nav-link">Política de Privacidade</Link></li>
                <li><Link to="/seguranca" className="sec-footer-nav-link">Diretrizes de Segurança</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="sec-footer-nav-title">Ajuda & Relacionamento</h4>
              <ul className="sec-footer-nav-list">
                <li><Link to="/ajuda" className="sec-footer-nav-link">Central de Ajuda</Link></li>
                <li><Link to="/suporte" className="sec-footer-nav-link">Canais de Suporte</Link></li>
                <li><button onClick={() => setIsModalOpen(true)} className="sec-footer-nav-link" style={{background:'none', border:'none', padding:0, cursor:'pointer'}}>Reportar Fraude</button></li>
              </ul>
            </div>
          </div>
          <div className="sec-footer-bottom">
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--sec-on-surface-variant)' }}>© 2026 TrocaTicket Tecnologia S.A. CNPJ 00.000.000/0001-00.</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--sec-on-surface-variant)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span className="material-symbols-outlined" style={{fontSize:'14px', color:'var(--sec-primary)'}}>shield</span>Plataforma Auditada</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal React Nativo */}
      {isModalOpen && (
        <div className="sec-modal-overlay" role="dialog" aria-modal="true">
          <div className="sec-modal-content">
            <div className="sec-modal-header">
              <h3 className="sec-modal-title">
                <span className="material-symbols-outlined" style={{color: 'var(--sec-secondary)'}}>crisis_alert</span>
                Abertura de Reporte Sigiloso
              </h3>
              <button className="sec-modal-close" onClick={() => setIsModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleReportSubmit}>
              <div className="sec-form-group">
                <label className="sec-label">Categoria do Incidente</label>
                <select className="sec-input">
                  <option>Tentativa de Venda Paralela / Cambismo</option>
                  <option>Site ou Perfil Falso (Phishing)</option>
                  <option>Vulnerabilidade Técnica de Software (Bug Bounty)</option>
                  <option>Irregularidade Cadastral / Fraude Documental</option>
                  <option>Outro Incidente Crítico</option>
                </select>
              </div>
              <div className="sec-form-group">
                <label className="sec-label">E-mail para Retorno (Opcional caso deseje sigilo completo)</label>
                <input className="sec-input" placeholder="seu-email@dominio.com.br" type="email" />
              </div>
              <div className="sec-form-group">
                <label className="sec-label">Detalhamento dos Fatos ou URL Suspeita</label>
                <textarea className="sec-input" placeholder="Insira o link, prints ou evidências técnicas do ocorrido..." required rows="4"></textarea>
              </div>
              <div className="sec-modal-actions">
                <button type="button" className="sec-btn-cancel" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="sec-btn-primary">Transmitir Denúncia</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}