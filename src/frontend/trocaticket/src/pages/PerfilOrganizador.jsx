import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { apiRequest } from "../services/api.js";
import { useState } from "react";

function valor(value) {
  return value || "Não informado";
}

export default function PerfilOrganizador() {
  const { user } = useAuth();
  const [nome, setNome] = useState(user?.nome || "");
  const [telefone, setTelefone] = useState(user?.telefone || "");
  const [editando, setEditando] = useState(false);
  const [status, setStatus] = useState("");
  const iniciais = user?.nome
    ?.split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase() || "OR";

  return (
    <section style={{ maxWidth: 960, margin: "0 auto", padding: "32px 0" }}>
      <Link to="/organizador" style={{ color: "#2589e8", textDecoration: "none" }}>
        ← Voltar para meus eventos
      </Link>
      <div style={{ marginTop: 24, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", display: "grid", placeItems: "center", background: "#172033", color: "#fff", fontWeight: 700, fontSize: 22 }}>
            {iniciais}
          </div>
          <div>
            <h1 style={{ margin: 0, color: "#172033" }}>Meu perfil</h1>
            <p style={{ margin: "6px 0 0", color: "#64748b" }}>Dados carregados da conta autenticada.</p>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          <div><strong>Nome</strong>{editando ? <input value={nome} onChange={(e) => setNome(e.target.value)} /> : <p>{valor(user?.nome)}</p>}</div>
          <div><strong>E-mail</strong><p>{valor(user?.email)}</p></div>
          <div><strong>Perfil</strong><p>{valor(user?.perfil)}</p></div>
          <div><strong>Plano</strong><p>{valor(user?.plano)}</p></div>
          <div><strong>Organizador</strong><p>{valor(user?.idOrganizador)}</p></div>
          <div><strong>Status</strong><p>{valor(user?.status || "Aprovado")}</p></div>
          <div><strong>Telefone</strong>{editando ? <input value={telefone} onChange={(e) => setTelefone(e.target.value)} /> : <p>{valor(user?.telefone)}</p>}</div>
        </div>
        <div style={{ marginTop: 24, display: "flex", gap: 12, alignItems: "center" }}>
          {editando ? <><button type="button" onClick={async () => { try { const atualizado = await apiRequest("/auth/me", { method: "PUT", body: { nome, telefone } }); Object.assign(user, atualizado); setEditando(false); setStatus("Perfil atualizado com sucesso."); } catch (e) { setStatus(e.message); } }}>Salvar</button><button type="button" onClick={() => setEditando(false)}>Cancelar</button></> : <button type="button" onClick={() => setEditando(true)}>Editar perfil</button>}
          {status && <span role="status">{status}</span>}
        </div>
      </div>
    </section>
  );
}
