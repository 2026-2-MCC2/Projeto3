import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PainelFornecedor.css";

export default function PainelFornecedor() {
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para o Modal de Proposta
  const [modalAberto, setModalAberto] = useState(false);
  const [itemParaCotar, setItemParaCotar] = useState(null);
  const [valorProposta, setValorProposta] = useState("");
  const [validadeProposta, setValidadeProposta] = useState("");
  const [obsProposta, setObsProposta] = useState("");

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        setLoading(true);
        throw new Error("Usando mock para espelhar o design");
      } catch (err) {
        const dadosMock = [
          {
            id: 1,
            titulo: "Casamento Helena & Tomás",
            tipo: "CASAMENTO",
            dataCurta: "28 OUT",
            dataCompleta: "28 de outubro",
            local: "Fazenda Boa Vista",
            publico: 120,
            organizador: "Marina Braga",
            itens: [
              { id: 101, nome: "Buffet jantar servido", desc: "Entrada, prato principal, sobremesa · serviço à francesa", qtd: "120 pax", status: "cotar" },
              { id: 102, nome: "Mobiliário e louças", desc: "Mesas redondas, cadeiras Tiffany, louça premium", qtd: "12 conj.", status: "enviada", valor: "6.200,00", dataEnvio: "12/10/2025", validade: "12/11/2025", obs: "Inclui montagem e desmontagem." },
              { id: 103, nome: "Decoração floral", desc: "Centro de mesa, arco de flores, arranjos de altar", qtd: "1 projeto", status: "em_analise", valor: "9.850,00", dataEnvio: "10/10/2025", validade: "10/11/2025", obs: "Flores da estação." },
              { id: 104, nome: "Som e iluminação", desc: "Palco, pista, DJ e iluminação cênica", qtd: "1 kit", status: "aprovada", valor: "7.400,00", obs: "Contrato emitido." }
            ]
          },
          {
            id: 2,
            titulo: "Convenção Nimbus Tech",
            tipo: "CORPORATIVO",
            dataCurta: "04 NOV",
            dataCompleta: "04 de novembro",
            local: "Centro de Convenções",
            publico: 400,
            organizador: "Carlos Albuquerque",
            itens: [
              { id: 201, nome: "Coffee break duplo", desc: "Manhã e Tarde para todos os participantes", qtd: "400 pax", status: "cotar" }
            ]
          },
          {
            id: 3,
            titulo: "Aniversário 50 anos Dona Rita",
            tipo: "SOCIAL",
            dataCurta: "15 NOV",
            dataCompleta: "15 de novembro",
            local: "Espaço Vila Verde",
            publico: 80,
            organizador: "Rita Valadares",
            itens: []
          }
        ];
        setEventos(dadosMock);
        setEventoSelecionado(dadosMock[0]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchEventos, 600);
    return () => clearTimeout(timer);
  }, []);

  const abrirModal = (item) => {
    setItemParaCotar(item);
    setValorProposta(item.valor ? item.valor.replace(".", "") : "");
    setValidadeProposta(item.validade ? item.validade.split('/').reverse().join('-') : "");
    setObsProposta(item.obs || "");
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setItemParaCotar(null);
  };

  const enviarProposta = (e) => {
    e.preventDefault();
    alert(`Proposta de R$ ${valorProposta} para "${itemParaCotar.nome}" enviada com sucesso!`);
    fecharModal();
  };

  if (loading) {
    return <div className="pf-loading">Carregando painel do fornecedor...</div>;
  }

  return (
    <div className="pf-page">
      
      {/* MENU SUPERIOR (HEADER FORNECEDOR) */}
      <header className="pf-header">
        <div className="pf-header-content">
          <div className="pf-header-spacer"></div>
          
          <nav className="pf-header-nav">
            <button onClick={() => navigate('/fornecedor/painel')} className="pf-nav-item active">
              Oportunidades
            </button>
            <button onClick={() => navigate('/fornecedor/minhas-propostas')} className="pf-nav-item">
              Minhas propostas
            </button>
            <button onClick={() => navigate('/fornecedor/mensagens')} className="pf-nav-item">
              Mensagens <span className="pf-nav-dot"></span>
            </button>
          </nav>
          
          <div className="pf-header-profile">
            <div className="pf-profile-info">
              <span className="pf-profile-name">Casa Aurora</span>
              <span className="pf-profile-role">Buffet & mobiliário</span>
            </div>
            <div className="pf-profile-avatar">CA</div>
          </div>
        </div>
      </header>

      <main className="pf-main">
        {/* Onboarding Steps */}
        <section className="pf-onboarding">
          <div className="pf-onboarding-header">
            <h2>Do convite à proposta em 3 passos</h2>
            <span>{eventos.length} oportunidades abertas · prazo 28 out</span>
          </div>
          
          <div className="pf-steps-grid">
            <div className="pf-step-card">
              <div className="pf-step-top">
                <div className="pf-step-icon">🎯</div>
                <span className="pf-step-number">1</span>
              </div>
              <div className="pf-step-text">
                <h3>Descubra</h3>
                <p>Veja oportunidades abertas e filtre por tipo de evento.</p>
              </div>
            </div>
            
            <div className="pf-step-card">
              <div className="pf-step-top">
                <div className="pf-step-icon">✏️</div>
                <span className="pf-step-number">2</span>
              </div>
              <div className="pf-step-text">
                <h3>Componha</h3>
                <p>Monte a proposta por item com valor, validade e observações.</p>
              </div>
            </div>
            
            <div className="pf-step-card">
              <div className="pf-step-top">
                <div className="pf-step-icon">📤</div>
                <span className="pf-step-number">3</span>
              </div>
              <div className="pf-step-text">
                <h3>Envie</h3>
                <p>Acompanhe status e converse com o organizador.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Workspace: Sidebar & Detail Panel */}
        <div className="pf-workspace">
          
          {/* Left Column: Lista de Oportunidades */}
          <section className="pf-sidebar">
            <div className="pf-sidebar-header">
              <h2>Oportunidades</h2>
              <span>{eventos.length} abertas</span>
            </div>
            
            <div className="pf-event-list">
              {eventos.map((evento) => (
                <article 
                  key={evento.id} 
                  className={`pf-event-card ${eventoSelecionado?.id === evento.id ? 'active' : ''}`}
                  onClick={() => setEventoSelecionado(evento)}
                >
                  <div className="pf-card-meta">
                    <span>{evento.tipo}</span>
                    <span>{evento.dataCurta}</span>
                  </div>
                  <h3>{evento.titulo}</h3>
                  <p>{evento.local} · {evento.publico} pessoas</p>
                </article>
              ))}
            </div>
          </section>

          {/* Right Column: Detalhe do Evento */}
          <section className="pf-detail-panel">
            {eventoSelecionado ? (
              <>
                <div className="pf-detail-header">
                  <span className="pf-detail-label">Detalhe do evento</span>
                  <h2>{eventoSelecionado.titulo}</h2>
                  <p>{eventoSelecionado.publico} convidados · {eventoSelecionado.dataCompleta} · {eventoSelecionado.local}</p>
                  <div className="pf-organizador-info">
                    Organizador: <strong>{eventoSelecionado.organizador}</strong>
                    <span className="pf-dot-divider">·</span>
                    <button onClick={() => navigate('/fornecedor/mensagens')} className="pf-link-btn">enviar mensagem</button>
                  </div>
                </div>

                <div className="pf-custos-section">
                  <div className="pf-custos-header">
                    <h3>Composição de custo</h3>
                    <span>proposta por item</span>
                  </div>
                  
                  <div className="pf-itens-list">
                    {eventoSelecionado.itens.length === 0 && (
                      <p className="pf-empty-items">Nenhum item cadastrado para este evento.</p>
                    )}
                    
                    {eventoSelecionado.itens.map(item => (
                      <div key={item.id} className="pf-item-card">
                        <div className="pf-item-main">
                          <div className="pf-item-info">
                            <h4>{item.nome}</h4>
                            <p>{item.desc}</p>
                            <span className="pf-item-qtd">{item.qtd}</span>
                          </div>
                          
                          <div className="pf-item-actions">
                            {item.status === 'cotar' && (
                              <button className="pf-btn-cotar" onClick={() => abrirModal(item)}>Cotar item</button>
                            )}
                            {item.status === 'enviada' && (
                              <>
                                <span className="pf-badge pf-badge-gray">Enviada</span>
                                <button className="pf-btn-edit" onClick={() => abrirModal(item)}>Editar</button>
                              </>
                            )}
                            {item.status === 'em_analise' && (
                              <>
                                <span className="pf-badge pf-badge-yellow">Em análise</span>
                                <button className="pf-btn-edit" onClick={() => abrirModal(item)}>Editar</button>
                              </>
                            )}
                            {item.status === 'aprovada' && (
                              <span className="pf-badge pf-badge-green">Aprovada</span>
                            )}
                          </div>
                        </div>
                        
                        {/* Rodapé do item se já tiver proposta */}
                        {item.valor && (
                          <div className="pf-item-footer">
                            <strong className={item.status === 'aprovada' ? 'text-green' : 'text-dark'}>
                              R$ {item.valor}
                            </strong> 
                            {item.dataEnvio && ` · enviada ${item.dataEnvio}`}
                            {item.validade && ` · válida até ${item.validade}`}
                            {item.obs && ` · ${item.obs}`}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="pf-empty-state">Selecione um evento para ver os detalhes</div>
            )}
          </section>

        </div>
      </main>

      {/* Modal de Proposta */}
      {modalAberto && (
        <div className="pf-modal-overlay">
          <div className="pf-modal-content">
            <div className="pf-modal-header">
              <div>
                <span>Proposta de Fornecimento</span>
                <h3>{itemParaCotar?.nome} ({itemParaCotar?.qtd})</h3>
              </div>
              <button className="pf-modal-close" onClick={fecharModal}>✕</button>
            </div>
            
            <form className="pf-modal-form" onSubmit={enviarProposta}>
              <div className="pf-form-row">
                <div className="pf-form-group">
                  <label>Valor Total (R$) *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    required 
                    placeholder="0,00"
                    value={valorProposta}
                    onChange={(e) => setValorProposta(e.target.value)}
                  />
                  <small>Valor fechado para a demanda.</small>
                </div>
                <div className="pf-form-group">
                  <label>Validade da Proposta *</label>
                  <input 
                    type="date" 
                    required 
                    value={validadeProposta}
                    onChange={(e) => setValidadeProposta(e.target.value)}
                  />
                  <small>Prazo limite para confirmação.</small>
                </div>
              </div>

              <div className="pf-form-group">
                <label>Observações e Logística</label>
                <textarea 
                  rows="2" 
                  placeholder="Ex: Necessário ponto de água e tomada trifásica."
                  value={obsProposta}
                  onChange={(e) => setObsProposta(e.target.value)}
                ></textarea>
              </div>

              <div className="pf-checkbox-group">
                <input type="checkbox" id="termos" required />
                <label htmlFor="termos">Declaro ter capacidade operacional para atender nas datas estipuladas.</label>
              </div>

              <div className="pf-modal-footer">
                <button type="button" className="pf-btn-cancel" onClick={fecharModal}>Cancelar</button>
                <button type="submit" className="pf-btn-submit">Enviar Proposta</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}