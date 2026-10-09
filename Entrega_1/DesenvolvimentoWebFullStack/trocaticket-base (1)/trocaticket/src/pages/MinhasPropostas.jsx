import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MinhasPropostas.css";

export default function MinhasPropostas() {
  const navigate = useNavigate();
  
  // Dados simulados baseados no design do Stitch
  const [propostas, setPropostas] = useState([
    { id: 1, evento: "Casamento Helena & Tomás", dataEnvio: "12/10/2025", item: "Mobiliário e louças", valor: 6200.00, validade: "12/11/2025", status: "ENVIADA" },
    { id: 2, evento: "Casamento Helena & Tomás", dataEnvio: "10/10/2025", item: "Decoração floral", valor: 9850.00, validade: "10/11/2025", status: "EM ANÁLISE" },
    { id: 3, evento: "Casamento Helena & Tomás", dataEnvio: "08/10/2025", item: "Som e iluminação", valor: 11000.00, validade: "14/11/2025", status: "APROVADA" },
    { id: 4, evento: "Convenção Nimbus Tech", dataEnvio: "14/10/2025", item: "Coffee break duplo", valor: 18400.00, validade: "20/11/2025", status: "EM ANÁLISE" },
    { id: 5, evento: "Aniversário 50 anos Dona Rita", dataEnvio: "05/10/2025", item: "Buffet coquetel", valor: 7600.00, validade: "01/12/2025", status: "RECUSADA" },
  ]);

  // Estados de Filtro e Busca
  const [filtroAtivo, setFiltroAtivo] = useState("Todas");
  const [termoBusca, setTermoBusca] = useState("");

  // Estados do Modal e Toast (Notificação)
  const [modalAberto, setModalAberto] = useState(false);
  const [propostaEmEdicao, setPropostaEmEdicao] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  // Lógica de Filtro e Busca combinados
  const propostasFiltradas = propostas.filter(p => {
    const matchFiltro = filtroAtivo === "Todas" || p.status === filtroAtivo;
    const matchBusca = p.evento.toLowerCase().includes(termoBusca.toLowerCase()) || 
                       p.item.toLowerCase().includes(termoBusca.toLowerCase());
    return matchFiltro && matchBusca;
  });

  // Funções de Interação
  const abrirModal = (proposta = null) => {
    setPropostaEmEdicao(proposta);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setPropostaEmEdicao(null);
  };

  const mostrarToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const salvarProposta = (e) => {
    e.preventDefault();
    mostrarToast("Proposta salva e enviada ao organizador com sucesso!");
    fecharModal();
  };

  const cancelarProposta = (id) => {
    if(window.confirm("Deseja realmente cancelar esta proposta?")) {
      setPropostas(propostas.filter(p => p.id !== id));
      mostrarToast("Proposta cancelada.");
    }
  };

  const verMotivoRecusa = () => {
    alert('Motivo registrado pelo organizador: "Optamos por fechar um pacote integrado com outro fornecedor."');
  };

  const contagemPorStatus = (status) => propostas.filter(p => p.status === status).length;

  return (
    <div className="mp-page">
      {/* HEADER DE NAVEGAÇÃO DO FORNECEDOR */}
      <header className="mp-header">
        <div className="mp-header-content">
          <div className="mp-header-spacer"></div>
          <nav className="mp-header-nav">
            <button onClick={() => navigate('/fornecedor/painel')} className="mp-nav-item">
              Oportunidades
            </button>
            <button onClick={() => navigate('/fornecedor/minhas-propostas')} className="mp-nav-item active">
              Minhas propostas
            </button>
            <button onClick={() => navigate('/fornecedor/mensagens')} className="mp-nav-item">
              Mensagens <span className="mp-nav-dot"></span>
            </button>
          </nav>
          <div className="mp-header-profile">
            <div className="mp-profile-info">
              <span className="mp-profile-name">Casa Aurora</span>
              <span className="mp-profile-role">Buffet & mobiliário</span>
            </div>
            <div className="mp-profile-avatar">CA</div>
          </div>
        </div>
      </header>

      <main className="mp-main">
        {/* Título e Botão Nova Proposta */}
        <div className="mp-page-header">
          <h1>Minhas propostas</h1>
          <div className="mp-header-actions">
            <span className="mp-records-count">{propostasFiltradas.length} registros</span>
            <button className="mp-btn-primary" onClick={() => abrirModal()}>
              + Nova Proposta
            </button>
          </div>
        </div>

        {/* Filtros e Barra de Busca */}
        <div className="mp-filters-bar">
          <div className="mp-pills">
            <button className={`mp-pill ${filtroAtivo === "Todas" ? "active" : ""}`} onClick={() => setFiltroAtivo("Todas")}>
              Todas ({propostas.length})
            </button>
            <button className={`mp-pill ${filtroAtivo === "ENVIADA" ? "active" : ""}`} onClick={() => setFiltroAtivo("ENVIADA")}>
              Enviadas ({contagemPorStatus("ENVIADA")})
            </button>
            <button className={`mp-pill ${filtroAtivo === "EM ANÁLISE" ? "active" : ""}`} onClick={() => setFiltroAtivo("EM ANÁLISE")}>
              Em análise ({contagemPorStatus("EM ANÁLISE")})
            </button>
            <button className={`mp-pill ${filtroAtivo === "APROVADA" ? "active" : ""}`} onClick={() => setFiltroAtivo("APROVADA")}>
              Aprovadas ({contagemPorStatus("APROVADA")})
            </button>
            <button className={`mp-pill ${filtroAtivo === "RECUSADA" ? "active" : ""}`} onClick={() => setFiltroAtivo("RECUSADA")}>
              Recusadas ({contagemPorStatus("RECUSADA")})
            </button>
          </div>
          
          <div className="mp-search">
            <span className="mp-search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar por evento ou item..." 
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
            />
          </div>
        </div>

        {/* Tabela de Propostas */}
        <div className="mp-table-container">
          <table className="mp-table">
            <thead>
              <tr>
                <th>EVENTO</th>
                <th>ITEM</th>
                <th>VALOR</th>
                <th>VALIDADE</th>
                <th>STATUS</th>
                <th className="text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {propostasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="mp-empty-state">Nenhuma proposta encontrada.</td>
                </tr>
              ) : (
                propostasFiltradas.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="mp-td-evento">{p.evento}</div>
                      <div className="mp-td-data">enviada {p.dataEnvio}</div>
                    </td>
                    <td className="mp-td-item">{p.item}</td>
                    <td className="mp-td-valor">
                      R$ {p.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="mp-td-validade">{p.validade}</td>
                    <td>
                      <span className={`mp-status-capsule status-${p.status.replace(' ', '').toLowerCase()}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="text-right">
                      {p.status === "APROVADA" && (
                        <span className="mp-action-blocked">🔒 bloqueada</span>
                      )}
                      
                      {p.status === "RECUSADA" && (
                        <div className="mp-action-group">
                          <button className="mp-btn-link" onClick={verMotivoRecusa}>Ver motivo</button>
                          <span className="mp-action-blocked">bloqueada</span>
                        </div>
                      )}
                      
                      {(p.status === "ENVIADA" || p.status === "EM ANÁLISE") && (
                        <div className="mp-action-group">
                          <button className="mp-btn-edit" onClick={() => abrirModal(p)}>Editar</button>
                          <button className="mp-btn-cancel" onClick={() => cancelarProposta(p.id)}>Cancelar</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal de Nova/Editar Proposta */}
      {modalAberto && (
        <div className="mp-modal-overlay">
          <div className="mp-modal-content">
            <div className="mp-modal-header">
              <div>
                <span>{propostaEmEdicao ? "EDITAR PROPOSTA" : "NOVA PROPOSTA"}</span>
                <h3>{propostaEmEdicao ? propostaEmEdicao.item : "Item do Evento"}</h3>
                <p>{propostaEmEdicao ? propostaEmEdicao.evento : "Selecione o evento"}</p>
              </div>
              <button className="mp-modal-close" onClick={fecharModal}>✕</button>
            </div>
            
            <form className="mp-modal-form" onSubmit={salvarProposta}>
              <div className="mp-form-row">
                <div className="mp-form-group">
                  <label>Valor Proposto (R$)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    required 
                    defaultValue={propostaEmEdicao ? propostaEmEdicao.valor : ""}
                  />
                </div>
                <div className="mp-form-group">
                  <label>Validade da Cotação</label>
                  <input 
                    type="text" 
                    placeholder="DD/MM/AAAA" 
                    required 
                    defaultValue={propostaEmEdicao ? propostaEmEdicao.validade : ""}
                  />
                </div>
              </div>

              <div className="mp-form-group">
                <label>Especificações Técnicas e Itens Inclusos</label>
                <textarea rows="3" placeholder="Descreva os itens detalhados..."></textarea>
              </div>

              <div className="mp-alert-box">
                <strong>Aviso TrocaTicket:</strong> Ao reenviar a cotação com novos valores, o prazo de validade é renovado e o organizador será notificado.
              </div>

              <div className="mp-modal-footer">
                <button type="button" className="mp-btn-cancel" onClick={fecharModal}>Cancelar</button>
                <button type="submit" className="mp-btn-save">Salvar alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <div className={`mp-toast ${toastMsg ? "show" : ""}`}>
        ✅ {toastMsg}
      </div>
    </div>
  );
}