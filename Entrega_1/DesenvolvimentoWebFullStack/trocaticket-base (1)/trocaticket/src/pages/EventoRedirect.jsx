import { useEffect } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { getEvento, setEventoAtivo } from "../services/eventoStore.js";

const etapasComAlias = {
  cadastro: "cadastro",
  custos: "custos",
  custo: "custos",
  proposta: "propostas",
  propostas: "propostas",
  resumo: "resumo",
  precificacao: "precificacao",
  calculo: "precificacao",
};

export default function EventoRedirect() {
  const { id } = useParams();
  const evento = getEvento(id);
  const navigate = useNavigate();

  useEffect(() => {
    if (!evento) return;
    setEventoAtivo(id);
    const eventoId = encodeURIComponent(id);
    const etapa = etapasComAlias[evento.etapaAtual] ?? "precificacao";
    const rota = etapa === "cadastro"
      ? `/organizador/eventos/novo?id=${eventoId}`
      : `/eventos/${eventoId}/${etapa}`;
    navigate(rota, { replace: true });
  }, [evento, id, navigate]);

  if (!evento) return <Navigate to="/organizador" replace />;
  return null;
}
