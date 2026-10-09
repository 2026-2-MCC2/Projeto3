import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Mensagens.css";

export default function Mensagens({ perfil = "fornecedor" }) {
  const navigate = useNavigate();
  const mensagensFimRef = useRef(null);
  const arquivoInputRef = useRef(null);
  const ehOrganizador = perfil === "organizador";
  const rotaPainel = ehOrganizador ? "/organizador" : "/fornecedor/painel";
  const rotaPropostas = ehOrganizador ? "/organizador/eventos/novo/proposta" : "/fornecedor/minhas-propostas";
  const rotaMensagens = ehOrganizador ? "/organizador/mensagens" : "/fornecedor/mensagens";
  
  // Dados simulados baseados no design do Stitch
  const [conversas, setConversas] = useState(() => ehOrganizador ? [
    {
      id: 11,
      nome: "Casa Aurora",
      iniciais: "CA",
      papel: "Fornecedor",
      evento: "Festival Aurora Sound 2026",
      hora: "10:42",
      online: true,
      mensagens: [
        { id: 1, remetente: "outro", texto: "A proposta revisada para o buffet está disponível.", hora: "10:38" },
        { id: 2, remetente: "eu", texto: "Obrigado. Vou conferir as condições e a validade.", hora: "10:42" },
      ],
    },
    {
      id: 12,
      nome: "SomPro Áudio",
      iniciais: "SA",
      papel: "Fornecedor",
      evento: "Festival Aurora Sound 2026",
      hora: "Ontem",
      online: false,
      mensagens: [
        { id: 1, remetente: "outro", texto: "Confirmamos a disponibilidade do sistema Line Array.", hora: "Ontem" },
      ],
    },
    {
      id: 13,
      nome: "StagePro Brasil",
      iniciais: "SP",
      papel: "Fornecedor",
      evento: "Conferência Tech & Beats SP",
      hora: "Seg",
      online: false,
      mensagens: [],
    },
  ] : [
    {
      id: 1,
      nome: "Marina Braga",
      iniciais: "MB",
      papel: "Organizadora",
      evento: "Casamento Helena & Tomás",
      hora: "14:31",
      online: true,
      mensagens: [
        { id: 1, remetente: "outro", texto: "Pode confirmar a disponibilidade do buffet para 120 pessoas?", hora: "14:20" },
        { id: 2, remetente: "eu", texto: "Confirmado! Já enviei a proposta com o valor por item.", hora: "14:24" },
        { id: 3, remetente: "outro", texto: "Perfeito. E a decoração floral, consegue incluir orquídeas brancas?", hora: "14:31" }
      ]
    },
    {
      id: 2,
      nome: "Diego Ramos",
      iniciais: "DR",
      papel: "Organizador",
      evento: "Convenção Nimbus Tech",
      hora: "11:05",
      online: false,
      mensagens: [
        { id: 1, remetente: "outro", texto: "O coffee break precisa cobrir também a equipa de produção, 20 pessoas.", hora: "11:05" }
      ]
    },
    {
      id: 3,
      nome: "Paula Nunes",
      iniciais: "PN",
      papel: "Organizadora",
      evento: "Aniversário 50 anos Dona Rita",
      hora: "Ontem",
      online: false,
      mensagens: []
    }
  ]);

  const [conversaAtivaId, setConversaAtivaId] = useState(ehOrganizador ? 11 : 1);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [arquivoAnexo, setArquivoAnexo] = useState(null);
  const [erroAnexo, setErroAnexo] = useState("");
  const [menuOpcoesAberto, setMenuOpcoesAberto] = useState(false);

  const conversaAtiva = conversas.find(c => c.id === conversaAtivaId);

  // Fazer scroll automático para o fundo do chat sempre que a conversa muda ou há nova mensagem
  useEffect(() => {
    if (mensagensFimRef.current) {
      mensagensFimRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversaAtiva?.mensagens]);

  const enviarMensagem = (e) => {
    e.preventDefault();
    if (!novaMensagem.trim() && !arquivoAnexo) return;

    const horaAtual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const novaMsgObj = {
      id: Date.now(),
      remetente: "eu",
      texto: novaMensagem.trim(),
      hora: horaAtual,
      anexo: arquivoAnexo,
    };

    setConversas(prevConversas => 
      prevConversas.map(conv => {
        if (conv.id === conversaAtivaId) {
          return { ...conv, mensagens: [...conv.mensagens, novaMsgObj], hora: horaAtual };
        }
        return conv;
      })
    );

    setNovaMensagem("");
    setArquivoAnexo(null);
  };

  const selecionarAnexo = (event) => {
    const arquivo = event.target.files?.[0];
    event.target.value = "";
    if (!arquivo) return;
    if (arquivo.size > 10 * 1024 * 1024) {
      setErroAnexo("O arquivo deve ter no máximo 10 MB.");
      return;
    }

    const leitor = new FileReader();
    leitor.onload = () => {
      if (typeof leitor.result === "string") {
        setArquivoAnexo({ nome: arquivo.name, dataUrl: leitor.result });
        setErroAnexo("");
      }
    };
    leitor.onerror = () => setErroAnexo("Não foi possível carregar o arquivo.");
    leitor.readAsDataURL(arquivo);
  };

  const marcarComoNaoLida = () => {
    setConversas((atuais) => atuais.map((conversa) => (
      conversa.id === conversaAtivaId ? { ...conversa, naoLida: true } : conversa
    )));
    setMenuOpcoesAberto(false);
  };

  return (
    <div className="msg-page">
      {/* HEADER DE NAVEGAÇÃO DO FORNECEDOR */}
      <header className="msg-header">
        <div className="msg-header-content">
          <div className="msg-header-spacer"></div>
          <nav className="msg-header-nav">
            <button onClick={() => navigate(rotaPainel)} className="msg-nav-item">
              {ehOrganizador ? "Meus eventos" : "Oportunidades"}
            </button>
            <button onClick={() => navigate(rotaPropostas)} className="msg-nav-item">
              {ehOrganizador ? "Propostas recebidas" : "Minhas propostas"}
            </button>
            <button onClick={() => navigate(rotaMensagens)} className="msg-nav-item active">
              Mensagens <span className="msg-nav-dot"></span>
            </button>
          </nav>
          <div className="msg-header-profile">
            <div className="msg-profile-info">
              <span className="msg-profile-name">{ehOrganizador ? "Aurora Sound Produções" : "Casa Aurora"}</span>
              <span className="msg-profile-role">{ehOrganizador ? "Organizador de Eventos" : "Buffet & mobiliário"}</span>
            </div>
            <div className="msg-profile-avatar">{ehOrganizador ? "AS" : "CA"}</div>
          </div>
        </div>
      </header>

      <main className="msg-main">
        {/* Título da Página */}
        <div className="msg-page-header">
          <h1>Mensagens</h1>
          <span className="msg-subtitle">{conversas.length} conversas</span>
        </div>

        <div className="msg-workspace">
          
          {/* BARRA LATERAL: Lista de Organizadores */}
          <section className="msg-sidebar">
            <div className="msg-sidebar-header">
              <h2>{ehOrganizador ? "Fornecedores" : "Organizadores"}</h2>
              <span>Recentes</span>
            </div>
            
            <div className="msg-contact-list">
              {conversas.map((conv) => {
                const isAtiva = conv.id === conversaAtivaId;
                const ultimaMsg = conv.mensagens.length > 0 
                  ? conv.mensagens[conv.mensagens.length - 1].texto 
                  : "Sem mensagens ainda";

                return (
                  <article 
                    key={conv.id} 
                    className={`msg-contact-card ${isAtiva ? 'active' : ''} ${conv.naoLida ? 'unread' : ''}`}
                    onClick={() => {
                      setConversaAtivaId(conv.id);
                      setConversas((atuais) => atuais.map((conversa) => (
                        conversa.id === conv.id ? { ...conversa, naoLida: false } : conversa
                      )));
                    }}
                  >
                    <div className="msg-card-top">
                      <h3>{conv.nome}</h3>
                      {conv.naoLida && <span className="msg-unread-label">Não lida</span>}
                      <span className="msg-time">{conv.hora}</span>
                    </div>
                    <p className="msg-event">{conv.evento}</p>
                    <p className={`msg-preview ${conv.mensagens.length === 0 ? 'italic' : ''}`}>
                      {ultimaMsg}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>

          {/* JANELA DE CHAT */}
          <section className="msg-chat-panel">
            {conversaAtiva ? (
              <>
                {/* Chat Header */}
                <div className="msg-chat-header">
                  <div className="msg-chat-user-info">
                    <div className="msg-avatar">{conversaAtiva.iniciais}</div>
                    <div>
                      <div className="msg-user-title">
                        <h2>{conversaAtiva.nome}</h2>
                        {conversaAtiva.online && <span className="msg-status-dot"></span>}
                      </div>
                      <p className="msg-user-meta">
                        {conversaAtiva.papel} · <strong>{conversaAtiva.evento}</strong>
                      </p>
                    </div>
                  </div>
                  <div className="msg-chat-actions">
                    <button className="msg-btn-proposta" onClick={() => navigate(rotaPropostas)}>{ehOrganizador ? "Ver Propostas Recebidas" : "Ver Proposta #2084"}</button>
                    <button className="msg-btn-options" aria-label="Opções da conversa" aria-expanded={menuOpcoesAberto} onClick={() => setMenuOpcoesAberto((aberto) => !aberto)}>⋮</button>
                    {menuOpcoesAberto && (
                      <div className="msg-options-menu" role="menu">
                        <button type="button" role="menuitem" onClick={marcarComoNaoLida}>Marcar como não lida</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stream de Mensagens */}
                <div className="msg-stream custom-scrollbar">
                  {conversaAtiva.mensagens.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`msg-wrapper ${msg.remetente === 'eu' ? 'msg-outgoing' : 'msg-incoming'}`}
                    >
                      <span className="msg-meta">
                        {msg.remetente === 'eu' ? 'Casa Aurora' : conversaAtiva.nome} · {msg.hora}
                      </span>
                      <div className="msg-bubble">
                        {msg.texto}
                        {msg.anexo && <a className="msg-attachment-link" href={msg.anexo.dataUrl} download={msg.anexo.nome}>📎 {msg.anexo.nome}</a>}
                      </div>
                    </div>
                  ))}
                  <div ref={mensagensFimRef} />
                </div>

                {/* Barra de Input */}
                <div className="msg-input-area">
                  <form onSubmit={enviarMensagem} className="msg-input-form">
                    <input ref={arquivoInputRef} type="file" hidden onChange={selecionarAnexo} />
                    <button type="button" className="msg-btn-attach" title="Anexar arquivo" aria-label="Anexar arquivo" onClick={() => arquivoInputRef.current?.click()}>
                      📎
                    </button>
                    <div className="msg-input-container">
                      <input 
                        type="text" 
                        placeholder="Escreva uma mensagem..." 
                        value={novaMensagem}
                        onChange={(e) => setNovaMensagem(e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                    <button type="submit" className="msg-btn-send">
                      Enviar
                    </button>
                  </form>
                  {arquivoAnexo && (
                    <div className="msg-attachment-pending">
                      <span>Arquivo anexado: {arquivoAnexo.nome}</span>
                      <button type="button" aria-label="Remover anexo" onClick={() => setArquivoAnexo(null)}>×</button>
                    </div>
                  )}
                  {erroAnexo && <p className="msg-attachment-error" role="alert">{erroAnexo}</p>}
                </div>
              </>
            ) : (
              <div className="msg-empty-state">Selecione uma conversa para começar</div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}