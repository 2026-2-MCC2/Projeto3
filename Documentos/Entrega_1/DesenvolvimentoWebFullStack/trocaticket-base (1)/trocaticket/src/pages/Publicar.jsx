import { CheckCircle2, Send } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useSyncExternalStore } from "react";
import { getStoreSnapshot, setEvento, subscribe } from "../services/eventoStore.js";

export default function Publicar() {
  const navigate = useNavigate();
  const store = useSyncExternalStore(subscribe, getStoreSnapshot, getStoreSnapshot);
  const evento = store.eventos.find((item) => item.id === store.eventoAtivoId);
  useEffect(() => {
    if (evento && evento.etapaAtual !== "publicar") {
      setEvento(evento.id, { etapaAtual: "publicar" });
    }
  }, [evento]);

  function publicarEvento() {
    if (!evento) return;
    setEvento(evento.id, { status: "publicado", etapaAtual: "publicar" });
    navigate("/organizador");
  }

  if (!evento) return <p className="event-empty">Selecione ou cadastre um evento para publicar.</p>;

  return (
    <div className="organizador-page">
      <header className="organizador-page__header">
        <div>
          <p className="eyebrow">Novo evento · Etapa final</p>
          <h1>Publicar evento</h1>
          <p>Está tudo pronto? Confirme para tornar seu evento visível.</p>
        </div>
      </header>

      <section className="publicar-box">
        <Send size={32} aria-hidden="true" />
        <h2>Pronto para publicar</h2>
        <p><strong>{evento.nome || "Novo evento"}</strong> ficará disponível para divulgação e venda de ingressos.</p>
        <button className="button button--primary publicar-box__confirm" onClick={publicarEvento} type="button">
          <CheckCircle2 size={17} aria-hidden="true" />
          Confirmar e voltar ao painel
        </button>
        <Link to="/organizador/eventos/novo/resumo">Revisar resumo</Link>
        <Link to="/organizador">Voltar ao painel</Link>
      </section>
    </div>
  );
}
