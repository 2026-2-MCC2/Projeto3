import React from 'react';
import './MeuPerfilFornecedor.css'; // Importa o CSS normal

export default function MeuPerfilFornecedor() {
  return (
    <div className="mpf-layout">
      {/* Conteúdo Principal */}
      <main className="mpf-main">
        {/* Cabeçalho da Página */}
        <section className="mpf-page-header">
          <div>
            <p className="mpf-page-subtitle">Como os organizadores veem você</p>
            <h1 className="mpf-page-title">Meu perfil</h1>
          </div>
          <a href="#editar" className="mpf-btn-edit">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Editar perfil
          </a>
        </section>

        {/* Grelha de Layout */}
        <div className="mpf-grid">
          {/* Coluna Esquerda */}
          <div className="mpf-col-left">
            
            {/* Card Principal: Casa Aurora */}
            <article className="mpf-card">
              <div className="mpf-hero-banner">
                <div className="mpf-hero-flex">
                  <div className="mpf-hero-avatar">CA</div>
                  <div className="mpf-hero-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <h2>Casa Aurora</h2>
                      <span className="mpf-tag-active">
                        <span className="dot"></span> Ativo
                      </span>
                    </div>
                    <p className="mpf-hero-subtitle">Buffet & mobiliário</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <div className="mpf-stars">
                        <svg viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        <svg viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        <svg viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        <svg viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        <svg className="outline" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#f1f5f9' }}>4.3 <span style={{ opacity: 0.6 }}>·</span> 4 avaliações</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mpf-card-body">
                <div className="mpf-contact-grid">
                  <div>
                    <span className="mpf-label">Cidade</span>
                    <div className="mpf-contact-item">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      São Paulo, SP
                    </div>
                  </div>
                  <div>
                    <span className="mpf-label">Telefone</span>
                    <div className="mpf-contact-item">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                      (11) 98888-1234
                    </div>
                  </div>
                  <div>
                    <span className="mpf-label">E-mail</span>
                    <div className="mpf-contact-item" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                      contato@casaaurora.com.br
                    </div>
                  </div>
                </div>

                <div>
                  <span className="mpf-label">Sobre</span>
                  <p className="mpf-section-text">
                    Há 12 anos criando experiências gastronômicas e ambientações para casamentos e eventos corporativos.
                  </p>
                </div>

                <div>
                  <span className="mpf-label">Serviços</span>
                  <div className="mpf-tags-container">
                    <span className="mpf-tag-service">Buffet</span>
                    <span className="mpf-tag-service">mobiliário</span>
                    <span className="mpf-tag-service">louças</span>
                    <span className="mpf-tag-service">decoração floral</span>
                  </div>
                </div>
              </div>
            </article>

            {/* Avaliações */}
            <section className="mpf-card" style={{ padding: '1.5rem' }}>
              <div className="mpf-reviews-header">
                <h2>Avaliações dos seus serviços</h2>
                <span className="mpf-review-count">4 depoimentos</span>
              </div>
              
              <div>
                {/* Avaliação 1 */}
                <article className="mpf-review-item">
                  <div className="mpf-review-top">
                    <div>
                      <h3 className="mpf-review-author">Marina Braga</h3>
                      <p className="mpf-review-meta">Casamento Helena & Tomás · 02/10/2026</p>
                    </div>
                    <div className="mpf-stars">
                      {[1,2,3,4,5].map(i => <svg key={i} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
                    </div>
                  </div>
                  <span className="mpf-review-tag">Som e iluminação</span>
                  <p className="mpf-review-body">Equipe pontual e extremamente cuidadosa. A pista ficou incrível!</p>
                </article>

                {/* Avaliação 2 */}
                <article className="mpf-review-item">
                  <div className="mpf-review-top">
                    <div>
                      <h3 className="mpf-review-author">Renata Lima</h3>
                      <p className="mpf-review-meta">Festa de Fim de Ano 2025 · 12/01/2026</p>
                    </div>
                    <div className="mpf-stars">
                      {[1,2,3,4].map(i => <svg key={i} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
                      <svg className="outline" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                  </div>
                  <span className="mpf-review-tag">Buffet</span>
                  <p className="mpf-review-body">Comida excelente. Só atrasaram um pouco a reposição da sobremesa.</p>
                </article>
              </div>
            </section>
          </div>

          {/* Coluna Direita */}
          <aside className="mpf-col-right">
            
            {/* Notas */}
            <div className="mpf-sidebar-card">
              <span className="mpf-label">Nota média</span>
              <div className="mpf-score-display">
                <span className="mpf-score-number">4.3</span>
                <div>
                  <div className="mpf-stars" style={{ marginBottom: '0.125rem' }}>
                    {[1,2,3,4].map(i => <svg key={i} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
                    <svg className="outline" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--mpf-slate-500)' }}>Classificação geral</span>
                </div>
              </div>

              <div>
                <div className="mpf-progress-row">
                  <span style={{ width: '0.75rem' }}>5</span>
                  <div className="mpf-progress-bar-bg"><div className="mpf-progress-bar-fill" style={{ width: '60%' }}></div></div>
                  <span className="mpf-progress-count">2</span>
                </div>
                <div className="mpf-progress-row">
                  <span style={{ width: '0.75rem' }}>4</span>
                  <div className="mpf-progress-bar-bg"><div className="mpf-progress-bar-fill" style={{ width: '30%' }}></div></div>
                  <span className="mpf-progress-count">1</span>
                </div>
                <div className="mpf-progress-row">
                  <span style={{ width: '0.75rem' }}>3</span>
                  <div className="mpf-progress-bar-bg"><div className="mpf-progress-bar-fill" style={{ width: '30%' }}></div></div>
                  <span className="mpf-progress-count">1</span>
                </div>
              </div>
            </div>

            {/* Histórico */}
            <div className="mpf-sidebar-card mpf-history-header">
              <h2>Histórico de alterações</h2>
              <p>Toda edição é revisada pela equipe antes de ir ao ar.</p>

              <div className="mpf-history-item approved">
                <div className="mpf-history-item-top">
                  <span className="mpf-status-badge approved">
                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    Aprovada
                  </span>
                  <span className="mpf-history-date">02/09/2026</span>
                </div>
                <div className="mpf-history-field">Telefone</div>
              </div>

              <div className="mpf-history-item rejected">
                <div className="mpf-history-item-top">
                  <span className="mpf-status-badge rejected">
                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    Recusada
                  </span>
                  <span className="mpf-history-date">14/08/2026</span>
                </div>
                <div className="mpf-history-field">Categoria</div>
                <p className="mpf-history-reason"><span style={{ fontWeight: 600 }}>Motivo:</span> Som e iluminação exigem cadastro técnico separado.</p>
              </div>
            </div>

          </aside>
        </div>
      </main>
    </div>
  );
}