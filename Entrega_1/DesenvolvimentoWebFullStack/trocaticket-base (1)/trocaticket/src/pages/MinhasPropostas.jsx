import "./MinhasPropostas.css";

export default function MinhasPropostasFornecedor() {
  return (
    <div className="mprop-layout">
      <main className="mprop-main">
        <div className="mprop-header-bar">
          <div>
            <p className="mprop-subtitle">Integração indisponível</p>
            <h1 className="mprop-title">Minhas propostas</h1>
          </div>
        </div>
        <section className="mprop-toolbar" role="status">
          <p>
            A API ainda não oferece endpoints para consultar, enviar ou atualizar propostas de fornecedores.
            Nenhum dado de demonstração está sendo exibido.
          </p>
        </section>
      </main>
    </div>
  );
}
