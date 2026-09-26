import { useNavigate } from "react-router-dom";
import "./ResumoePublicar.css";

export default function ResumoePublicar() {
  const navigate = useNavigate();

  return (
    <div className="re-page">
      <main className="re-main">
        <div className="re-container">
          
          {/* Header Title Section */}
          <div className="re-page-header">
            <h1>Resumo do Evento & Dashboard Financeiro</h1>
          </div>

          {/* Section 1: Dados Gerais do Evento */}
          <section className="re-card re-mb-xl">
            <div className="re-card-top">
              <div className="re-event-title-group">
                <div className="re-icon-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <div>
                  <span className="re-label-small">Evento Cadastrado</span>
                  <h2>Festival Aurora Sound 2026</h2>
                </div>
              </div>
              <button className="re-btn-edit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Editar
              </button>
            </div>

            <div className="re-info-grid">
              <div className="re-info-box">
                <span className="re-label">Data & Duração</span>
                <span className="re-value">14 a 16 Nov 2026</span>
                <span className="re-sub">3 dias de festival</span>
              </div>
              <div className="re-info-box">
                <span className="re-label">Localização</span>
                <span className="re-value truncate">Pedreira Paulo Leminski</span>
                <span className="re-sub">Curitiba, PR</span>
              </div>
              <div className="re-info-box">
                <span className="re-label">Capacidade de Público</span>
                <span className="re-value">3.500 mín / 8.500 máx</span>
                <span className="re-sub">Capacidade do Alvará</span>
              </div>
              <div className="re-info-box space-between">
                <span className="re-label">Validação Técnica</span>
                <div className="re-status-ok">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Lotação Aprovada
                </div>
                <span className="re-sub">Mínimo &lt; Máximo respeitado</span>
              </div>
            </div>
          </section>

          {/* Section 2: KPI Cards */}
          <section className="re-kpi-grid re-mb-xl">
            <div className="re-kpi-card">
              <div className="re-kpi-header">
                <span>Orçamento</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>
              </div>
              <div className="re-kpi-body">
                <div className="re-kpi-value">R$ 256.000<span>,00</span></div>
                <span className="re-kpi-sub">7 itens orçados para concorrência</span>
              </div>
            </div>

            <div className="re-kpi-card">
              <div className="re-kpi-header">
                <span>Custos Fiscais & Operacionais</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18"></path><path d="M3 10h18"></path><path d="M5 6l7-3 7 3"></path><path d="M4 10v11"></path><path d="M20 10v11"></path><path d="M8 14v3"></path><path d="M12 14v3"></path><path d="M16 14v3"></path></svg>
              </div>
              <div className="re-kpi-body">
                <div className="re-kpi-value">R$ 96.500<span>,00</span></div>
                <span className="re-kpi-sub">Taxas, ECAD, UTI e impostos</span>
              </div>
            </div>

            <div className="re-kpi-card">
              <div className="re-kpi-header">
                <span>Custo Total Projetado</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16.01" y2="14"></line><line x1="12" y1="14" x2="12.01" y2="14"></line><line x1="8" y1="14" x2="8.01" y2="14"></line><line x1="16" y1="18" x2="16.01" y2="18"></line><line x1="12" y1="18" x2="12.01" y2="18"></line><line x1="8" y1="18" x2="8.01" y2="18"></line></svg>
              </div>
              <div className="re-kpi-body">
                <div className="re-kpi-value">R$ 352.500<span>,00</span></div>
                <span className="re-kpi-sub">Total Consolidado</span>
              </div>
            </div>

            <div className="re-kpi-card">
              <div className="re-kpi-header">
                <span>Break-Even</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path></svg>
              </div>
              <div className="re-kpi-body">
                <div className="re-kpi-value">R$ 100<span>,71</span></div>
                <span className="re-kpi-sub">Preço mínimo de equilíbrio p/ cota</span>
              </div>
            </div>
          </section>

          {/* Section 3: Charts and Simulation */}
          <div className="re-charts-grid">
            
            {/* Chart: Origem dos Custos */}
            <section className="re-card flex-center">
              <div className="re-chart-header">
                <h2>Origem dos Custos</h2>
              </div>
              
              <div className="re-donut-container">
                <svg viewBox="0 0 100 100" className="re-donut-svg">
                  <circle className="re-donut-track" cx="50" cy="50" r="38"></circle>
                  <circle className="re-donut-primary" cx="50" cy="50" r="38" strokeDasharray="173.3 238.76" strokeDashoffset="0"></circle>
                  <circle className="re-donut-secondary" cx="50" cy="50" r="38" strokeDasharray="65.4 238.76" strokeDashoffset="-173.3"></circle>
                </svg>
                <div className="re-donut-center">
                  <span className="re-donut-label">Total Geral</span>
                  <span className="re-donut-value">352,5k</span>
                </div>
              </div>

              <div className="re-chart-legend">
                <div className="re-legend-item">
                  <div className="re-legend-color-group">
                    <span className="re-dot primary"></span>
                    <span className="re-legend-title primary-text">Itens de Fornecedores</span>
                  </div>
                  <span className="re-legend-value">72,6% <span className="re-legend-sub">(256k)</span></span>
                </div>
                
                <div className="re-legend-item">
                  <div className="re-legend-color-group">
                    <span className="re-dot secondary"></span>
                    <span className="re-legend-title primary-text">Custos Fiscais / Fixos</span>
                  </div>
                  <span className="re-legend-value">27,4% <span className="re-legend-sub">(96,5k)</span></span>
                </div>

                <div className="re-legend-item opacity-60">
                  <div className="re-legend-color-group">
                    <span className="re-dot outline"></span>
                    <span className="re-legend-title">Propostas Aceitas</span>
                  </div>
                  <span className="re-legend-value variant">0% <span className="re-legend-sub">(Fase inicial)</span></span>
                </div>
              </div>
            </section>

            {/* Chart: Simulação de Ticket */}
            <section className="re-card flex-col-between">
              <div className="re-chart-header flex-center-row">
                <h2>Simulação de Ticket</h2>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="re-icon-insights"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              </div>

              <div className="re-simulation-list">
                <div className="re-sim-box">
                  <div>
                    <span className="re-sim-badge error">Cenário Conservador</span>
                    <span className="re-sim-desc">Público Mínimo (3.500)</span>
                  </div>
                  <div className="re-sim-price-group">
                    <span className="re-sim-price">R$ 100,71</span>
                    <span className="re-sim-unit">p/ ingresso</span>
                  </div>
                </div>

                <div className="re-sim-box">
                  <div>
                    <span className="re-sim-badge secondary">Cenário Equilibrado</span>
                    <span className="re-sim-desc">Médio (6.000 pessoas)</span>
                  </div>
                  <div className="re-sim-price-group">
                    <span className="re-sim-price">R$ 58,75</span>
                    <span className="re-sim-unit">p/ ingresso</span>
                  </div>
                </div>

                <div className="re-sim-box">
                  <div>
                    <span className="re-sim-badge primary">Lotação Máxima</span>
                    <span className="re-sim-desc">Capacidade Total (8.500)</span>
                  </div>
                  <div className="re-sim-price-group">
                    <span className="re-sim-price">R$ 41,47</span>
                    <span className="re-sim-unit">p/ ingresso</span>
                  </div>
                </div>
              </div>
            </section>

          </div>

          {/* Section 4: Rodapé / Barra de Ações */}
          <div className="re-action-bar">
            <div className="re-action-left">
              <button className="re-btn-back" onClick={() => navigate('/organizador')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Voltar ao Painel
              </button>
            </div>
            
            <div className="re-action-right">
              <button className="re-btn-save">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                Salvar Resumo
              </button>
              
              <button className="re-btn-publish" onClick={() => alert("Publicado com sucesso!")}>
                Publicar
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}