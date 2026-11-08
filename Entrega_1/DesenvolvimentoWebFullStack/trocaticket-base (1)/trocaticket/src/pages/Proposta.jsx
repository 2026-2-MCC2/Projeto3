import { Link, useParams } from "react-router-dom";
import { useSyncExternalStore } from "react";
import { getStoreSnapshot, subscribe } from "../services/eventoStore.js";

export default function Proposta() {
  const store = useSyncExternalStore(subscribe, getStoreSnapshot, getStoreSnapshot);
  const { id } = useParams();
  const evento = store.eventos.find((item) => item.id === (id ?? store.eventoAtivoId));

  return (
    <section className="propostas-page">
      <header className="propostas-page__heading">
        <h1>Propostas recebidas</h1>
        {evento && <p>{evento.nome || "Evento sem título"}</p>}
      </header>
      <p className="proposal-empty" role="status">
        A API ainda não oferece endpoints para receber ou comparar propostas de fornecedores.
        Nenhum dado de demonstração está sendo exibido.
      </p>
      <Link to="/organizador">Voltar aos eventos</Link>
    </section>
  );
}
