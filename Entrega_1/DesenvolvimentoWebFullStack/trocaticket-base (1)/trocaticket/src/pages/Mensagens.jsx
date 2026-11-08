import "./Mensagens.css";

export default function Mensagens({ perfil = "fornecedor" }) {
  const contraparte = perfil === "organizador" ? "fornecedores" : "organizadores";
  return (
    <div className="msg-page">
      <main className="msg-main">
        <div className="msg-page-header">
          <h1>Mensagens</h1>
          <span className="msg-subtitle">Indisponível</span>
        </div>
        <div className="msg-workspace">
          <section className="msg-chat-panel msg-empty-state" role="status">
            <p>
              A API ainda não oferece conversas ou mensagens entre {contraparte}.
              Nenhuma conversa de demonstração está sendo exibida.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
