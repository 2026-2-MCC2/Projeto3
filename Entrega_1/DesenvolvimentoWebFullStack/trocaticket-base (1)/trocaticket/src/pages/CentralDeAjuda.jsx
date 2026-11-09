import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './CentralDeAjuda.css';

export default function CentralDeAjuda() {
  const [searchValue, setSearchValue] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);

  // Lista de FAQs baseada no documento original
  const faqs = [
    {
      id: 1,
      question: "Como funciona o prazo de repasse D+2 após a conclusão do evento?",
      answer: "O valor total líquido das vendas permanece em custódia na conta Escrow da plataforma até o encerramento seguro do evento. Exatamente 2 dias úteis após a confirmação da realização, o repasse é disparado automaticamente para a conta bancária ou chave Pix cadastrada e verificada pelo titular."
    },
    {
      id: 2,
      question: "O que é o QR Code dinâmico e como ele impede fraudes ou cambismo?",
      answer: "Nosso QR Code se atualiza a cada 30 segundos no aplicativo oficial do comprador, impossibilitando prints de tela, cópias fotográficas ou vendas duplicadas. A validação na portaria é instantânea mesmo com instabilidade de sinal de internet."
    },
    {
      id: 3,
      question: "Quanto tempo leva a aprovação do cadastro de fornecedor ou organizador?",
      answer: "Para garantir a integridade do ecossistema, analisamos dados cadastrais, CNPJ e histórico em até 4 horas úteis. Assim que aprovado, você recebe um aviso por e-mail e push notification com liberação imediata para publicar ou responder cotações."
    },
    {
      id: 4,
      question: "Posso transferir a titularidade de um ingresso para outra pessoa?",
      answer: "Sim! A transferência nominal é feita de maneira 100% digital diretamente pelo painel 'Meus Ingressos'. O ingresso original é invalidado e uma nova credencial criptografada é gerada para o CPF do novo titular, garantindo procedência limpa."
    },
    {
      id: 5,
      question: "Como emitir notas fiscais sobre as taxas cobradas na plataforma?",
      answer: "No primeiro dia de cada mês, emitimos e disponibilizamos no painel 'Financeiro > Documentos Fiscais' a NF-e consolidada de todas as tarifas de serviço intermediadas, com arquivo XML e PDF prontos para integração contábil."
    }
  ];

  const handleFaqToggle = (id) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  const handleSearchSubmit = () => {
    if(searchValue.trim() !== '') {
      alert(`Pesquisando por: ${searchValue}`);
      // Lógica real de busca aqui
    }
  };

  return (
    <div className="hlp-layout">
      {/* Header Fixo Global */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 shadow-sm" style={{ backgroundColor: 'rgba(250, 248, 255, 0.85)', backdropFilter: 'blur(16px)' }}>
        <div className="hlp-container" style={{ height: '4rem', display: 'flex', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--hlp-primary)' }}>TrocaTicket</span>
          </Link>
        </div>
      </header>

      <main className="hlp-main">
        {/* Search Hero Section */}
        <section className="hlp-hero-section">
          <div className="hlp-container hlp-hero-content">
            <h1 className="hlp-hero-title">Como podemos ajudar você hoje?</h1>
            <p className="hlp-hero-desc">Respostas imediatas, documentação de segurança e guias passo a passo para sua operação sem atritos.</p>
            
            <div className="hlp-search-wrapper">
              <div className="hlp-search-box">
                <span className="material-symbols-outlined hlp-search-icon">search</span>
                <input 
                  type="text" 
                  className="hlp-search-input" 
                  placeholder="Busque por artigos, tutoriais ou dúvidas..." 
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                />
                <button className="hlp-search-btn" onClick={handleSearchSubmit}>Buscar</button>
              </div>
              
              <div className="hlp-chips-container">
                <span className="hlp-chips-label">Sugestões:</span>
                <button className="hlp-chip" onClick={() => setSearchValue('Aprovação de cadastro')}>
                  <span className="material-symbols-outlined" style={{fontSize: '14px'}}>how_to_reg</span> Aprovação de cadastro
                </button>
                <button className="hlp-chip" onClick={() => setSearchValue('Taxas e repasses')}>
                  <span className="material-symbols-outlined" style={{fontSize: '14px'}}>payments</span> Taxas e repasses
                </button>
                <button className="hlp-chip" onClick={() => setSearchValue('Cotações de fornecedores')}>
                  <span className="material-symbols-outlined" style={{fontSize: '14px'}}>request_quote</span> Cotações de fornecedores
                </button>
                <button className="hlp-chip" onClick={() => setSearchValue('Ingresso digital')}>
                  <span className="material-symbols-outlined" style={{fontSize: '14px'}}>qr_code_2</span> Ingresso digital
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Categorias Grid */}
        <section className="hlp-categories-section hlp-container">
          <div className="hlp-categories-grid">
            
            {/* Categoria 1 */}
            <Link to="/ajuda/organizadores" className="hlp-category-card">
              <div className="hlp-cat-content">
                <div className="hlp-cat-icon"><span className="material-symbols-outlined" style={{fontSize: '26px'}}>celebration</span></div>
                <h3 className="hlp-cat-title">Para Organizadores</h3>
                <p className="hlp-cat-desc">Cadastros completos de eventos, composição de custos operacionais, lotes e estratégias de precificação dinâmica.</p>
              </div>
              <div className="hlp-cat-action">
                <span>Ver 18 artigos</span>
                <span className="material-symbols-outlined hlp-cat-action-icon">arrow_forward</span>
              </div>
            </Link>

            {/* Categoria 2 */}
            <Link to="/ajuda/fornecedores" className="hlp-category-card">
              <div className="hlp-cat-content">
                <div className="hlp-cat-icon"><span className="material-symbols-outlined" style={{fontSize: '26px'}}>storefront</span></div>
                <h3 className="hlp-cat-title">Para Fornecedores</h3>
                <p className="hlp-cat-desc">Envio de propostas comerciais, painel de cotações abertas, prazos de liquidação e repasses operacionais.</p>
              </div>
              <div className="hlp-cat-action">
                <span>Ver 14 artigos</span>
                <span className="material-symbols-outlined hlp-cat-action-icon">arrow_forward</span>
              </div>
            </Link>

            {/* Categoria 3 */}
            <Link to="/ajuda/conta" className="hlp-category-card">
              <div className="hlp-cat-content">
                <div className="hlp-cat-icon"><span className="material-symbols-outlined" style={{fontSize: '26px'}}>manage_accounts</span></div>
                <h3 className="hlp-cat-title">Conta e Acesso</h3>
                <p className="hlp-cat-desc">Recuperação de credenciais, autenticação em duas etapas (2FA), edição de dados cadastrais e permissões de time.</p>
              </div>
              <div className="hlp-cat-action">
                <span>Ver 11 artigos</span>
                <span className="material-symbols-outlined hlp-cat-action-icon">arrow_forward</span>
              </div>
            </Link>

            {/* Categoria 4 */}
            <Link to="/ajuda/pagamentos" className="hlp-category-card">
              <div className="hlp-cat-content">
                <div className="hlp-cat-icon"><span className="material-symbols-outlined" style={{fontSize: '26px'}}>account_balance_wallet</span></div>
                <h3 className="hlp-cat-title">Pagamentos e Repasses</h3>
                <p className="hlp-cat-desc">Entenda o cronograma de repasse D+2, emissão automática de notas fiscais e custódia segura por conta Escrow.</p>
              </div>
              <div className="hlp-cat-action">
                <span>Ver 16 artigos</span>
                <span className="material-symbols-outlined hlp-cat-action-icon">arrow_forward</span>
              </div>
            </Link>

            {/* Categoria 5 */}
            <Link to="/ajuda/ingressos" className="hlp-category-card">
              <div className="hlp-cat-content">
                <div className="hlp-cat-icon"><span className="material-symbols-outlined" style={{fontSize: '26px'}}>shield_with_heart</span></div>
                <h3 className="hlp-cat-title">Ingressos e Validação</h3>
                <p className="hlp-cat-desc">Tecnologia anti-cambismo patenteada, QR Code criptografado dinâmico e app de portaria para conferência ágil.</p>
              </div>
              <div className="hlp-cat-action">
                <span>Ver 20 artigos</span>
                <span className="material-symbols-outlined hlp-cat-action-icon">arrow_forward</span>
              </div>
            </Link>

            {/* Categoria 6 */}
            <Link to="/ajuda/politicas" className="hlp-category-card">
              <div className="hlp-cat-content">
                <div className="hlp-cat-icon"><span className="material-symbols-outlined" style={{fontSize: '26px'}}>verified</span></div>
                <h3 className="hlp-cat-title">Políticas & Resolução</h3>
                <p className="hlp-cat-desc">Garantia de reembolso ao comprador, cancelamentos regulamentados pelo CDC e mediação transparente de disputas.</p>
              </div>
              <div className="hlp-cat-action">
                <span>Ver 12 artigos</span>
                <span className="material-symbols-outlined hlp-cat-action-icon">arrow_forward</span>
              </div>
            </Link>

          </div>
        </section>

        {/* FAQ Section */}
        <section className="hlp-faq-section hlp-container">
          <div className="hlp-faq-header">
            <h2 className="hlp-faq-title">Perguntas Mais Frequentes</h2>
            <p className="hlp-faq-subtitle">As respostas mais procuradas por organizadores, fornecedores e compradores na plataforma.</p>
          </div>
          <div className="hlp-faq-list">
            {faqs.map((faq) => (
              <div key={faq.id} className={`hlp-faq-item ${activeFaq === faq.id ? 'active' : ''}`}>
                <button className="hlp-faq-btn" onClick={() => handleFaqToggle(faq.id)}>
                  <span className="hlp-faq-btn-text">{faq.question}</span>
                  <span className="material-symbols-outlined hlp-faq-btn-icon">expand_more</span>
                </button>
                <div className="hlp-faq-content">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer Global */}
      <footer className="hlp-footer">
        <div className="hlp-container">
          <div className="hlp-footer-grid">
            <div style={{ gridColumn: 'span 2' }}>
              <span className="hlp-footer-brand">TrocaTicket</span>
              <p className="hlp-footer-text" style={{ maxWidth: '28rem' }}>Plataforma segura para compra, venda e transferência verificada de ingressos com custódia garantida e transparência operacional total.</p>
              <div style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', borderRadius: '999px', backgroundColor: 'var(--hlp-surface-container-high)' }}>
                <span className="material-symbols-outlined" style={{fontSize:'16px', color:'var(--hlp-primary)'}}>verified_user</span>
                <span style={{fontSize:'0.6875rem', fontWeight: 700, color:'var(--hlp-on-surface-variant)'}}>Conformidade LGPD</span>
              </div>
            </div>
            <div>
              <h4 className="hlp-footer-nav-title">Governança & Jurídico</h4>
              <ul className="hlp-footer-nav-list">
                <li><Link to="/termos" className="hlp-footer-nav-link">Termos de Uso</Link></li>
                <li><Link to="/privacidade" className="hlp-footer-nav-link">Política de Privacidade</Link></li>
                <li><Link to="/seguranca" className="hlp-footer-nav-link">Diretrizes de Segurança</Link></li>
                <li><Link to="/cancelamento" className="hlp-footer-nav-link">Políticas de Cancelamento</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="hlp-footer-nav-title">Ajuda & Relacionamento</h4>
              <ul className="hlp-footer-nav-list">
                <li><Link to="/ajuda" className="hlp-footer-nav-link">Central de Ajuda</Link></li>
                <li><Link to="/suporte" className="hlp-footer-nav-link">Canais de Suporte</Link></li>
                <li><Link to="/ouvidoria" className="hlp-footer-nav-link">Ouvidoria Institucional</Link></li>
                <li><button className="hlp-footer-nav-link" style={{background:'none', border:'none', padding:0, cursor:'pointer'}}>Reportar Fraude</button></li>
              </ul>
            </div>
          </div>
          <div className="hlp-footer-bottom">
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--hlp-on-surface-variant)' }}>© 2026 TrocaTicket Tecnologia S.A. CNPJ 00.000.000/0001-00. Todos os direitos reservados.</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--hlp-on-surface-variant)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span className="material-symbols-outlined" style={{fontSize:'14px', color:'var(--hlp-primary)'}}>shield</span>Plataforma Auditada</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--hlp-on-surface-variant)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><span className="material-symbols-outlined" style={{fontSize:'14px', color:'var(--hlp-primary)'}}>lock</span>Transações Criptografadas</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}