import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export default function PerfilConectado() {
  const { user } = useAuth();
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "32px 0" }}>
      <Link to={user?.perfil === "fornecedor" ? "/fornecedor" : "/organizador"}>← Voltar</Link>
      <section style={{ marginTop: 24, padding: 32, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16 }}>
        <h1>Meu perfil</h1>
        <p>Dados da conta carregados diretamente do backend.</p>
        <dl style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          <div><dt>Nome</dt><dd>{user?.nome || "Não informado"}</dd></div>
          <div><dt>E-mail</dt><dd>{user?.email || "Não informado"}</dd></div>
          <div><dt>Perfil</dt><dd>{user?.perfil || "Não informado"}</dd></div>
          <div><dt>ID do cadastro</dt><dd>{user?.idFornecedor || user?.idOrganizador || "Não informado"}</dd></div>
        </dl>
      </section>
    </main>
  );
}
