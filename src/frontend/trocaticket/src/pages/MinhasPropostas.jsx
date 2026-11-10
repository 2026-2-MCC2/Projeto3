import React, { useEffect, useState } from 'react';
import { apiRequest } from '../services/api.js';
import './MinhasPropostas.css'; // Importa o CSS

export default function MinhasPropostasFornecedor() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [propostasRemotas, setPropostasRemotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/fornecedor/propostas')
      .then((rows) => setPropostasRemotas(rows.map((p) => ({
        id: `#${p.id}`,
        date: p.criadoEm ? new Date(p.criadoEm).toLocaleDateString('pt-BR') : '',
        event: p.evento || `Evento ${p.eventoId}`,
        item: p.itemId,
        value: `R$ ${Number(p.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        valid: p.validade ? new Date(p.validade).toLocaleDateString('pt-BR') : '',
        status: ({ ENVIADA: 'Enviada', EM_ANALISE: 'Em análise', APROVADA: 'Aprovada', RECUSADA: 'Recusada' }[p.situacao] || 'Enviada'),
      }))))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Estrutura visual mantida; os registros são carregados da API.
  const allProposalsDemo = [
    { id: '#2081', date: '12/10/2026', event: 'Casamento Helena & Tomás', item: 'Mobiliário e louças', value: 'R$ 6.200,00', valid: '12/11/2026', status: 'Enviada' },
    { id: '#2084', date: '10/10/2026', event: 'Casamento Helena & Tomás', item: 'Decoração floral', value: 'R$ 9.850,00', valid: '10/11/2026', status: 'Em análise' },
    { id: '#2076', date: '08/10/2026', event: 'Casamento Helena & Tomás', item: 'Som e iluminação', value: 'R$ 7.400,00', valid: '14/11/2026', status: 'Aprovada' },
    { id: '#2090', date: '14/10/2026', event: 'Convenção Nimbus Tech', item: 'Coffee break duplo', value: 'R$ 18.400,00', valid: '20/11/2026', status: 'Em análise' },
    { id: '#2069', date: '05/10/2026', event: 'Aniversário 50 anos Dona Rita', item: 'Buffet coquetel', value: 'R$ 7.600,00', valid: '01/12/2026', status: 'Recusada' },
  ];
  const allProposals = propostasRemotas;

  // Lógica de Filtro e Busca
  const filteredProposals = allProposals.filter(prop => {
    const matchesFilter = activeFilter === 'all' || prop.status === activeFilter;
    const matchesSearch = prop.event.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prop.item.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Contagem para as abas
  const counts = {
    all: allProposals.length,
    Enviada: allProposals.filter(p => p.status === 'Enviada').length,
    'Em análise': allProposals.filter(p => p.status === 'Em análise').length,
    Aprovada: allProposals.filter(p => p.status === 'Aprovada').length,
    Recusada: allProposals.filter(p => p.status === 'Recusada').length,
    Cancelada: allProposals.filter(p => p.status === 'Cancelada').length,
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Enviada': return <span className="mprop-badge enviada"><span className="dot"></span>Enviada</span>;
      case 'Em análise': return <span className="mprop-badge analise"><span className="dot"></span>Em análise</span>;
      case 'Aprovada': return <span className="mprop-badge aprovada"><span className="dot"></span>Aprovada</span>;
      case 'Recusada': return <span className="mprop-badge recusada"><span className="dot"></span>Recusada</span>;
      default: return null;
    }
  };

  const renderActions = (status) => {
    if (status === 'Enviada' || status === 'Em análise') {
      return (
        <div className="mprop-actions">
          <button className="mprop-btn-edit">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg> Editar
          </button>
          <button className="mprop-btn-delete" title="Cancelar Proposta">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      );
    }
    if (status === 'Aprovada') {
      return (
        <span className="mprop-btn-blocked">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> Bloqueada
        </span>
      );
    }
    if (status === 'Recusada') {
      return <button className="mprop-btn-link">Ver motivo</button>;
    }
  };

  if (loading) return <main className="mprop-main"><p>Carregando propostas...</p></main>;
  if (error) return <main className="mprop-main"><p role="alert">{error}</p></main>;

  return (
    <div className="mprop-layout">
      {/* Componente Global de Header Entraria Aqui */}

      <main className="mprop-main">
        {/* Título e Botão de Ação */}
        <div className="mprop-header-bar">
          <div>
            <p className="mprop-subtitle">Histórico e status</p>
            <h1 className="mprop-title">Minhas propostas</h1>
          </div>
          <button className="mprop-btn-new">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            Nova proposta
          </button>
        </div>

        {/* Cartões de KPI */}
        <section className="mprop-kpi-grid">
          <div className="mprop-kpi-card">
            <div className="mprop-kpi-border blue"></div>
            <div className="mprop-kpi-top">
              <span className="mprop-kpi-label">Em aberto</span>
              <div className="mprop-kpi-icon blue">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
            <div className="mprop-kpi-value">R$ 34.450,00</div>
            <div className="mprop-kpi-desc">3 propostas aguardando</div>
          </div>

          <div className="mprop-kpi-card">
            <div className="mprop-kpi-border green"></div>
            <div className="mprop-kpi-top">
              <span className="mprop-kpi-label">Aprovado</span>
              <div className="mprop-kpi-icon green">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
            <div className="mprop-kpi-value">R$ 7.400,00</div>
            <div className="mprop-kpi-desc">1 contrato</div>
          </div>

          <div className="mprop-kpi-card">
            <div className="mprop-kpi-border orange"></div>
            <div className="mprop-kpi-top">
              <span className="mprop-kpi-label">Taxa de aprovação</span>
              <div className="mprop-kpi-icon orange">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
            </div>
            <div className="mprop-kpi-value">50%</div>
            <div className="mprop-kpi-desc">2 decididas</div>
          </div>
        </section>

        {/* Filtros e Busca */}
        <div className="mprop-toolbar">
          <div className="mprop-filters">
            <button className={`mprop-pill ${activeFilter === 'all' ? 'active' : 'inactive'}`} onClick={() => setActiveFilter('all')}>
              Todas <span style={{ opacity: activeFilter === 'all' ? 0.8 : 0.6 }}>{counts.all}</span>
            </button>
            <button className={`mprop-pill ${activeFilter === 'Enviada' ? 'active' : 'inactive'}`} onClick={() => setActiveFilter('Enviada')}>
              Enviada <span style={{ opacity: activeFilter === 'Enviada' ? 0.8 : 0.6 }}>{counts.Enviada}</span>
            </button>
            <button className={`mprop-pill ${activeFilter === 'Em análise' ? 'active' : 'inactive'}`} onClick={() => setActiveFilter('Em análise')}>
              Em análise <span style={{ opacity: activeFilter === 'Em análise' ? 0.8 : 0.6 }}>{counts['Em análise']}</span>
            </button>
            <button className={`mprop-pill ${activeFilter === 'Aprovada' ? 'active' : 'inactive'}`} onClick={() => setActiveFilter('Aprovada')}>
              Aprovada <span style={{ opacity: activeFilter === 'Aprovada' ? 0.8 : 0.6 }}>{counts.Aprovada}</span>
            </button>
            <button className={`mprop-pill ${activeFilter === 'Recusada' ? 'active' : 'inactive'}`} onClick={() => setActiveFilter('Recusada')}>
              Recusada <span style={{ opacity: activeFilter === 'Recusada' ? 0.8 : 0.6 }}>{counts.Recusada}</span>
            </button>
            <button className={`mprop-pill ${activeFilter === 'Cancelada' ? 'active' : 'inactive'}`} onClick={() => setActiveFilter('Cancelada')}>
              Cancelada <span style={{ opacity: activeFilter === 'Cancelada' ? 0.8 : 0.6 }}>{counts.Cancelada}</span>
            </button>
          </div>

          <div className="mprop-search-box">
            <svg className="mprop-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              className="mprop-search-input" 
              placeholder="Buscar por evento ou item" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tabela de Propostas */}
        <div className="mprop-table-wrapper">
          <table className="mprop-table">
            <thead>
              <tr>
                <th>Evento</th>
                <th>Item</th>
                <th>Valor</th>
                <th>Validade</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProposals.map((prop, index) => (
                <tr key={index}>
                  <td>
                    <div className="mprop-td-event-title">{prop.event}</div>
                    <div className="mprop-td-event-meta">{prop.id} · enviada {prop.date}</div>
                  </td>
                  <td className="mprop-td-item">{prop.item}</td>
                  <td className="mprop-td-value">{prop.value}</td>
                  <td className="mprop-td-date">{prop.valid}</td>
                  <td style={{ textAlign: 'center' }}>{getStatusBadge(prop.status)}</td>
                  <td style={{ textAlign: 'right' }}>{renderActions(prop.status)}</td>
                </tr>
              ))}
              {filteredProposals.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--mprop-slate-500)' }}>
                    Nenhuma proposta encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Disclaimer */}
        <div className="mprop-disclaimer">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Só é possível editar ou cancelar propostas com status Enviada ou Em análise.
        </div>
      </main>
    </div>
  );
}
