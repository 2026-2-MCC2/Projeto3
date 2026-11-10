import { useEffect, useState } from "react";
import { apiRequest } from "../services/api.js";
import { useAuth } from "../hooks/useAuth.js";

export default function MensagensConectadas() {
  const { user } = useAuth();
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState("");
  const [estado, setEstado] = useState("carregando");
  const [erro, setErro] = useState("");

  async function carregar() {
    try { setMensagens(await apiRequest("/mensagens")); setEstado("pronto"); }
    catch (e) { setErro(e.message); setEstado("erro"); }
  }
  useEffect(() => { carregar(); }, []);

  async function enviar(event) {
    event.preventDefault();
    if (!texto.trim()) return;
    try {
      const nova = await apiRequest("/mensagens", { method: "POST", body: { texto } });
      setMensagens((lista) => [...lista, nova]);
      setTexto("");
    } catch (e) { setErro(e.message); }
  }

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "32px 0" }}>
      <h1>Mensagens</h1>
      <p style={{ color: "#64748b" }}>Comunicação registrada na API para a conta {user?.email}.</p>
      {estado === "carregando" && <p>Carregando mensagens...</p>}
      {erro && <p role="alert" style={{ color: "#b42318" }}>{erro}</p>}
      {estado === "pronto" && !mensagens.length && <p>Nenhuma conversa iniciada. Envie a primeira mensagem.</p>}
      <div style={{ display: "grid", gap: 12, margin: "24px 0" }}>
        {mensagens.map((mensagem) => (
          <article key={mensagem.id} style={{ padding: 16, borderRadius: 12, background: "#f8fafc" }}>
            <strong>{mensagem.remetenteId === user?.id ? "Você" : "Outro usuário"}</strong>
            <p>{mensagem.texto}</p>
          </article>
        ))}
      </div>
      <form onSubmit={enviar} style={{ display: "flex", gap: 12 }}>
        <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Digite uma mensagem" style={{ flex: 1, padding: 12 }} />
        <button type="submit">Enviar</button>
      </form>
    </main>
  );
}
