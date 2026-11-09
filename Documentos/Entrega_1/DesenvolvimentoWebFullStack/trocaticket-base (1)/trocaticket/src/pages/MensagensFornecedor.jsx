import React from 'react';
import './MensagensFornecedor.css'; // Importa o CSS normal

export default function MensagensFornecedor() {
  return (
    <div className="msg-layout">
      {/* Opcional: Aqui entraria o teu componente <TopNavigationBar /> que já deves ter globalmente */}
      
      <main className="msg-main">
        {/* Cabeçalho da Página */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h1 className="msg-page-title">Mensagens</h1>
        </div>

        {/* Master-Detail Chat Card Container */}
        <div className="msg-chat-container">
          
          {/* BARRA LATERAL (Lista de Conversas) */}
          <section className="msg-sidebar" aria-label="Lista de conversas">
            {/* Search Input */}
            <div className="msg-search-box">
              <svg className="msg-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                className="msg-search-input" 
                placeholder="Buscar conversa..." 
              />
            </div>

            {/* Scroll List */}
            <div className="msg-contact-list msg-chat-scroll">
              
              {/* Item 1: Marina Braga (Ativa) */}
              <article className="msg-contact-item active">
                <div className="msg-avatar-wrapper">
                  <div className="msg-avatar blue">MB</div>
                  <span className="msg-status-dot"></span>
                </div>
                <div className="msg-contact-content">
                  <div className="msg-contact-header">
                    <h2 className="msg-contact-name">Marina Braga</h2>
                    <span className="msg-contact-time">14:31</span>
                  </div>
                  <p className="msg-contact-event">Casamento Helena & Tomás</p>
                  <div className="msg-contact-preview-row">
                    <p className="msg-contact-preview">Perfeito. E a decoração floral, cons...</p>
                    <span className="msg-unread-badge">1</span>
                  </div>
                </div>
              </article>

              {/* Item 2: Diego Ramos */}
              <article className="msg-contact-item">
                <div className="msg-avatar-wrapper">
                  <div className="msg-avatar gray">DR</div>
                </div>
                <div className="msg-contact-content">
                  <div className="msg-contact-header">
                    <h2 className="msg-contact-name" style={{ color: 'var(--msg-text-dark)' }}>Diego Ramos</h2>
                    <span className="msg-contact-time">11:05</span>
                  </div>
                  <p className="msg-contact-event">Convenção Nimbus Tech</p>
                  <div className="msg-contact-preview-row">
                    <p className="msg-contact-preview">O coffee break precisa cobrir tamb...</p>
                    <span className="msg-unread-badge blue">1</span>
                  </div>
                </div>
              </article>

              {/* Item 3: Paula Nunes */}
              <article className="msg-contact-item">
                <div className="msg-avatar-wrapper">
                  <div className="msg-avatar gray">PN</div>
                </div>
                <div className="msg-contact-content">
                  <div className="msg-contact-header">
                    <h2 className="msg-contact-name" style={{ color: 'var(--msg-text-dark)' }}>Paula Nunes</h2>
                  </div>
                  <p className="msg-contact-event">Aniversário 50 anos Dona Rita</p>
                  <p className="msg-contact-preview" style={{ fontStyle: 'italic' }}>Inicie a conversa</p>
                </div>
              </article>

            </div>
          </section>

          {/* PAINEL PRINCIPAL (Conversa Ativa) */}
          <section className="msg-chat-pane" aria-label="Conversa com Marina Braga">
            
            {/* Chat Header */}
            <header className="msg-chat-header">
              <div className="msg-chat-user-info">
                <div className="msg-avatar-wrapper">
                  <div className="msg-avatar blue">MB</div>
                  <span className="msg-status-dot"></span>
                </div>
                <div>
                  <h2 className="msg-chat-user-name">Marina Braga</h2>
                  <div className="msg-chat-user-meta">
                    <span className="msg-online-text"><span className="msg-online-dot"></span>Online agora</span>
                    <span>•</span>
                    <span>Casamento Helena & Tomás</span>
                  </div>
                </div>
              </div>
              <button className="msg-btn-proposta" type="button">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Proposta #2084
              </button>
            </header>

            {/* Chat Messages Flow */}
            <div className="msg-chat-messages msg-chat-scroll">
              
              {/* Mensagem 1 (Recebida) */}
              <div className="msg-bubble-wrapper received">
                <div className="msg-bubble">
                  Pode confirmar a disponibilidade do buffet para 120 pessoas?
                </div>
                <span className="msg-bubble-time">14:20</span>
              </div>

              {/* Mensagem 2 (Enviada) */}
              <div className="msg-bubble-wrapper sent">
                <div className="msg-bubble">
                  Confirmado! Já enviei a proposta com o valor por item.
                </div>
                <div className="msg-bubble-time">
                  14:24
                  <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" style={{ color: '#3BA7FC' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              {/* Mensagem 3 (Recebida) */}
              <div className="msg-bubble-wrapper received">
                <div className="msg-bubble">
                  Perfeito. E a decoração floral, consegue incluir orquídeas brancas?
                </div>
                <span className="msg-bubble-time">14:31</span>
              </div>
            </div>

            {/* Chat Footer & Input */}
            <div className="msg-chat-footer">
              <div className="msg-quick-replies">
                <button className="msg-chip" type="button">Consigo sim, vou atualizar a proposta.</button>
                <button className="msg-chip" type="button">Posso enviar fotos de referência?</button>
                <button className="msg-chip" type="button">Qual o horário de montagem?</button>
              </div>
              
              <form className="msg-input-form" onSubmit={(e) => e.preventDefault()}>
                <button className="msg-btn-attach" type="button" title="Anexar arquivo">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: 'rotate(45deg)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                
                <div className="msg-input-wrapper">
                  <input 
                    type="text" 
                    className="msg-input-field" 
                    placeholder="Escreva uma mensagem..." 
                  />
                </div>
                
                <button className="msg-btn-send" type="submit" title="Enviar mensagem">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </form>
            </div>

          </section>
        </div>
      </main>
    </div>
  );
}