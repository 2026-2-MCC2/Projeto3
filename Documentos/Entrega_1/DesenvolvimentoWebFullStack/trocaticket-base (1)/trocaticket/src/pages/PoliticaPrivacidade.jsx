import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './PoliticaPrivacidade.css';

export default function PoliticaPrivacidade() {
  const [activeAccordion, setActiveAccordion] = useState(1); // O primeiro abre por defeito

  const toggleAccordion = (id) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  // Garante que o scroll inicia no topo ao entrar na página
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="priv-layout">
      {/* Header Fixo Global */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 shadow-sm" style={{ backgroundColor: 'rgba(250, 248, 255, 0.85)', backdropFilter: 'blur(16px)' }}>
        <div className="priv-container" style={{ height: '4rem', display: 'flex', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--priv-primary)' }}>Troca<span style={{fontWeight: 800}}>Ticket</span></span>
          </Link>
        </div>
      </header>

      <main className="priv-main">
        {/* Hero Section */}
        <section className="priv-hero-section">
          <div className="priv-hero-bg-glow-1"></div>
          <div className="priv-hero-bg-glow-2"></div>
          <div className="priv-container priv-hero-content">
            <div>
              <h1 className="priv-hero-title">
                Política de Privacidade e <span>Proteção de Dados</span>
              </h1>
              <p className="priv-hero-desc">
                No TrocaTicket, levamos a segurança, transparência e privacidade dos seus dados cadastrais, financeiros e de bilheteria com o mais alto rigor técnico e jurídico. Conheça detalhadamente como custodiamos seus ativos digitais.
              </p>
            </div>
          </div>
        </section>

        {/* Pilares */}
        <section className="priv-pillars-section priv-container">
          <h2 className="priv-section-title">Nossos 4 Pilares de Integridade</h2>
          <div className="priv-pillars-grid">
            <div className="priv-pillar-card">
              <div className="priv-pillar-icon blue"><span className="material-symbols-outlined">visibility</span></div>
              <h3 className="priv-pillar-title">Coleta Transparente</h3>
              <p className="priv-pillar-desc">Apenas os dados estritamente necessários para viabilizar cotações, orçamentos, bilheteria e liquidação regulamentar.</p>
            </div>
            <div className="priv-pillar-card">
              <div className="priv-pillar-icon red"><span className="material-symbols-outlined">block</span></div>
              <h3 className="priv-pillar-title">Sem Venda de Dados</h3>
              <p className="priv-pillar-desc">Não comercializamos, alugamos nem cedemos bases cadastrais para corretores de dados, parceiros de marketing ou terceiros.</p>
            </div>
            <div className="priv-pillar-card">
              <div className="priv-pillar-icon blue"><span className="material-symbols-outlined">enhanced_encryption</span></div>
              <h3 className="priv-pillar-title">Criptografia Ponta a Ponta</h3>
              <p className="priv-pillar-desc">Dados bancários, CNPJ e informações fiscais resguardados com chaves TLS 1.3 em trânsito e cifras AES-256 em repouso.</p>
            </div>
            <div className="priv-pillar-card">
              <div className="priv-pillar-icon orange"><span className="material-symbols-outlined">manage_accounts</span></div>
              <h3 className="priv-pillar-title">Controle do Usuário</h3>
              <p className="priv-pillar-desc">Direito garantido de acesso irrestrito, retificação cadastral, portabilidade, anonimização e revogação imediata de consentimento.</p>
            </div>
          </div>
        </section>

        {/* Normas e Accordions */}
        <section className="priv-policy-section priv-container">
          <h2 className="priv-section-title" style={{marginBottom: '1rem'}}>Normas e Especificações de Tratamento</h2>
          
          <div className="priv-accordion-container">
            
            {/* Accordion 1 */}
            <div className={`priv-accordion-item ${activeAccordion === 1 ? 'active' : ''}`}>
              <button className="priv-accordion-btn" onClick={() => toggleAccordion(1)}>
                <div className="priv-acc-btn-content">
                  <span className="priv-acc-num">01</span>
                  <div className="priv-acc-titles">
                    <h3 className="priv-acc-title">Dados Pessoais e Corporativos Coletados</h3>
                    <span className="priv-acc-subtitle">Dados de organizadores, fornecedores, promotores e compradores</span>
                  </div>
                </div>
                <span className="material-symbols-outlined priv-acc-icon">expand_more</span>
              </button>
              <div className="priv-accordion-content">
                <div className="priv-acc-body">
                  <p className="priv-acc-text">Para viabilizar transações seguras de bilheteria e conexões diretas de orçamentos, o TrocaTicket coleta os seguintes grupos de dados segundo a natureza do cadastro:</p>
                  <div className="priv-inner-grid-2">
                    <div className="priv-info-box">
                      <span className="priv-info-box-title">Organizadores & Fornecedores (PJ)</span>
                      <ul className="priv-info-list">
                        <li>Razão Social, Nome Fantasia, Inscrição Estadual e CNPJ;</li>
                        <li>Dados do Responsável Legal (Nome completo, CPF, e-mail corporativo e telefone);</li>
                        <li>Documentos societários constitutivos e certidões negativas regulatórias;</li>
                        <li>Histórico completo de propostas emitidas, cotações recebidas e termos de aceitação.</li>
                      </ul>
                    </div>
                    <div className="priv-info-box">
                      <span className="priv-info-box-title">Usuários Compradores e Operadores</span>
                      <ul className="priv-info-list">
                        <li>Identificação básica: Nome civil, CPF e data de nascimento;</li>
                        <li>Dados de contato: E-mail ativo, número de telefone verificado via OTP;</li>
                        <li>Metadados técnicos: Endereço IP, geolocalização aproximada e identificador de dispositivo;</li>
                        <li>Informações de transação: Chave Pix (mascarada) e tokenização segura de cartões.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Accordion 2 */}
            <div className={`priv-accordion-item ${activeAccordion === 2 ? 'active' : ''}`}>
              <button className="priv-accordion-btn" onClick={() => toggleAccordion(2)}>
                <div className="priv-acc-btn-content">
                  <span className="priv-acc-num">02</span>
                  <div className="priv-acc-titles">
                    <h3 className="priv-acc-title">Finalidade e Hipóteses Legais (LGPD)</h3>
                    <span className="priv-acc-subtitle">Fundamentação nos Artigos 7º e 11 da Lei Federal 13.709/18</span>
                  </div>
                </div>
                <span className="material-symbols-outlined priv-acc-icon">expand_more</span>
              </button>
              <div className="priv-accordion-content">
                <div className="priv-acc-body">
                  <p className="priv-acc-text">Cada operação de tratamento de dados realizada pela plataforma TrocaTicket está vinculada a uma base legal expressa:</p>
                  <div className="priv-table-container">
                    <table className="priv-table">
                      <thead>
                        <tr>
                          <th>Categoria de Finalidade</th>
                          <th>Base Legal Primária</th>
                          <th>Aplicação Prática</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><strong style={{color: 'var(--priv-on-surface)'}}>Execução de Contrato (Art. 7º, V)</strong></td>
                          <td>Obrigação Contratual</td>
                          <td>Processamento de ingressos, geração de QR codes válidos e repasses aos organizadores.</td>
                        </tr>
                        <tr>
                          <td><strong style={{color: 'var(--priv-on-surface)'}}>Prevenção a Fraudes (Art. 11, II, g)</strong></td>
                          <td>Segurança Cibernética</td>
                          <td>Validação biométrica facultativa, checagem em listas restritivas e score anti-cambismo.</td>
                        </tr>
                        <tr>
                          <td><strong style={{color: 'var(--priv-on-surface)'}}>Cumprimento Legal (Art. 7º, II)</strong></td>
                          <td>Dever Normativo Fiscal</td>
                          <td>Emissão regular de Notas Fiscais Eletrônicas (NFS-e) e guarda de registros do Marco Civil.</td>
                        </tr>
                        <tr>
                          <td><strong style={{color: 'var(--priv-on-surface)'}}>Legítimo Interesse (Art. 7º, IX)</strong></td>
                          <td>Aprimoramento do Serviço</td>
                          <td>Envio de comunicações operacionais críticas do evento e resolução de incidentes.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Accordion 3 */}
            <div className={`priv-accordion-item ${activeAccordion === 3 ? 'active' : ''}`}>
              <button className="priv-accordion-btn" onClick={() => toggleAccordion(3)}>
                <div className="priv-acc-btn-content">
                  <span className="priv-acc-num">03</span>
                  <div className="priv-acc-titles">
                    <h3 className="priv-acc-title">Compartilhamento Controlado e Seguro</h3>
                    <span className="priv-acc-subtitle">Restrição operacional estrita a parceiros homologados</span>
                  </div>
                </div>
                <span className="material-symbols-outlined priv-acc-icon">expand_more</span>
              </button>
              <div className="priv-accordion-content">
                <div className="priv-acc-body">
                  <p className="priv-acc-text">O TrocaTicket <strong>não pratica a venda</strong> nem o aluguel de cadastros. O compartilhamento ocorre exclusivamente nos limites indispensáveis para a continuidade do serviço:</p>
                  <div className="priv-inner-grid-3">
                    <div className="priv-info-box">
                      <div className="priv-info-icon-title">
                        <span className="material-symbols-outlined" style={{color: 'var(--priv-primary)', fontSize: '20px'}}>handshake</span>
                        <span className="priv-info-box-title" style={{margin: 0}}>Entre as Partes</span>
                      </div>
                      <p className="priv-acc-text" style={{fontSize: '0.8125rem'}}>Somente os dados fiscais e cadastrais estritamente necessários são exibidos ao organizador do evento no voucher do ingresso.</p>
                    </div>
                    <div className="priv-info-box">
                      <div className="priv-info-icon-title">
                        <span className="material-symbols-outlined" style={{color: 'var(--priv-primary)', fontSize: '20px'}}>account_balance</span>
                        <span className="priv-info-box-title" style={{margin: 0}}>Gateways de Pagamento</span>
                      </div>
                      <p className="priv-acc-text" style={{fontSize: '0.8125rem'}}>Instituições autorizadas pelo BACEN e certificadas PCI-DSS Nível 1 para processamento de cartões e liquidações Pix.</p>
                    </div>
                    <div className="priv-info-box">
                      <div className="priv-info-icon-title">
                        <span className="material-symbols-outlined" style={{color: 'var(--priv-primary)', fontSize: '20px'}}>gavel</span>
                        <span className="priv-info-box-title" style={{margin: 0}}>Autoridades</span>
                      </div>
                      <p className="priv-acc-text" style={{fontSize: '0.8125rem'}}>Atendimento de ordens judiciais formais, auditorias fiscais da Receita Federal e investigações de fraude pela polícia civil.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Accordion 4, 5 e 6 Omitidos para poupar espaço, mas a estrutura segue exatamente a mesma lógica! */}
            <div className={`priv-accordion-item ${activeAccordion === 4 ? 'active' : ''}`}>
              <button className="priv-accordion-btn" onClick={() => toggleAccordion(4)}>
                <div className="priv-acc-btn-content">
                  <span className="priv-acc-num">04</span>
                  <div className="priv-acc-titles">
                    <h3 className="priv-acc-title">Armazenamento, Retenção e Descarte</h3>
                    <span className="priv-acc-subtitle">Prazos de custódia e política de expurgo periódico</span>
                  </div>
                </div>
                <span className="material-symbols-outlined priv-acc-icon">expand_more</span>
              </button>
              <div className="priv-accordion-content">
                <div className="priv-acc-body">
                  <p className="priv-acc-text">Os dados são hospedados em infraestrutura de nuvem segura com datacenters no território brasileiro.</p>
                  <ul className="priv-info-list" style={{listStyleType: 'none', padding: 0, gap: '0.5rem'}}>
                    <li style={{display: 'flex', gap: '0.5rem', background: 'var(--priv-surface-container-low)', padding: '0.75rem', borderRadius: '0.5rem'}}>
                      <span className="material-symbols-outlined" style={{color: 'var(--priv-secondary)', fontSize: '20px'}}>timer</span>
                      <div><strong style={{color:'var(--priv-on-surface)'}}>Registros de Acesso:</strong> Retidos pelo prazo mínimo de 6 meses.</div>
                    </li>
                    <li style={{display: 'flex', gap: '0.5rem', background: 'var(--priv-surface-container-low)', padding: '0.75rem', borderRadius: '0.5rem'}}>
                      <span className="material-symbols-outlined" style={{color: 'var(--priv-primary)', fontSize: '20px'}}>delete_sweep</span>
                      <div><strong style={{color:'var(--priv-on-surface)'}}>Expurgo Programado:</strong> Dados anonimizados após prazos legais.</div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className={`priv-accordion-item ${activeAccordion === 5 ? 'active' : ''}`}>
              <button className="priv-accordion-btn" onClick={() => toggleAccordion(5)}>
                <div className="priv-acc-btn-content">
                  <span className="priv-acc-num">05</span>
                  <div className="priv-acc-titles">
                    <h3 className="priv-acc-title">Cookies e Tecnologias de Sessão</h3>
                    <span className="priv-acc-subtitle">Políticas de tokenização e controle de consentimento</span>
                  </div>
                </div>
                <span className="material-symbols-outlined priv-acc-icon">expand_more</span>
              </button>
              <div className="priv-accordion-content">
                <div className="priv-acc-body">
                  <p className="priv-acc-text">Utilizamos ferramentas de rastreamento estritamente essenciais para a navegabilidade e proteção do seu login no TrocaTicket.</p>
                </div>
              </div>
            </div>

            <div className={`priv-accordion-item ${activeAccordion === 6 ? 'active' : ''}`}>
              <button className="priv-accordion-btn" onClick={() => toggleAccordion(6)}>
                <div className="priv-acc-btn-content">
                  <span className="priv-acc-num">06</span>
                  <div className="priv-acc-titles">
                    <h3 className="priv-acc-title">Exercício dos Seus Direitos (Art. 18 LGPD)</h3>
                    <span className="priv-acc-subtitle">Autonomia total para solicitar acesso, retificação ou exclusão</span>
                  </div>
                </div>
                <span className="material-symbols-outlined priv-acc-icon">expand_more</span>
              </button>
              <div className="priv-accordion-content">
                <div className="priv-acc-body">
                  <p className="priv-acc-text">Como titular dos dados pessoais cadastrados, a legislação assegura que você requisite formalmente acesso, anonimização, portabilidade ou eliminação definitiva.</p>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* Footer Simples da Página */}
      <footer className="priv-footer">
        <div className="priv-container priv-footer-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="priv-footer-copy">© 2026 TrocaTicket. Todos os direitos reservados.</span>
          </div>
          <nav className="priv-footer-nav">
            <Link to="/termos" className="priv-footer-link">Termos de Uso</Link>
            <Link to="/privacidade" className="priv-footer-link" style={{color: 'var(--priv-primary)', fontWeight: '700'}}>Política de Privacidade</Link>
            <Link to="/seguranca" className="priv-footer-link">Segurança</Link>
            <Link to="/ajuda" className="priv-footer-link">Central de Ajuda</Link>
            <Link to="/suporte" className="priv-footer-link">Suporte</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}