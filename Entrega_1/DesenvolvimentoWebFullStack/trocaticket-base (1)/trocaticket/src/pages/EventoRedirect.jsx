import { useEffect } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { getEvento, setEventoAtivo } from "../services/eventoStore.js";

const rotasPorEtapa = {
  cadastro: "novo",
  custo: "novo/custo",
  proposta: "novo/proposta",
  calculo: "novo/calculo",
  resumo: "novo/resumo",
  publicar: "novo/publicar",
};

export default function EventoRedirect() {
  const { id } = useParams();
  const evento = getEvento(id);
  const navigate = useNavigate();

  useEffect(() => {
    if (!evento) return;
    setEventoAtivo(id);
    const etapa = rotasPorEtapa[evento.etapaAtual] ?? rotasPorEtapa.calculo;
    const rota = etapa === "novo"
      ? `/organizador/eventos/novo?id=${encodeURIComponent(id)}`
      : `/organizador/eventos/${etapa}`;
    navigate(rota, { replace: true });
  }, [evento, id, navigate]);

  if (!evento) return <Navigate to="/organizador" replace />;
  return null;
}
