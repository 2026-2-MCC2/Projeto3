/** Cor da pílula conforme o texto do status (um lugar só para manter a paleta consistente). */
export function statusTone(status) {
  switch (status) {
    case "Ativo":
    case "Em produção":
    case "Aberta":
    case "Aprovado":
    case "Reativação":
      return "brand";
    case "Em cotação":
    case "Vencendo":
    case "Atualização":
    case "Prazo estendido":
    case "Revisão de ART":
      return "warning";
    case "Suspenso":
    case "Vencida":
    case "Suspensão":
    case "Rejeitado":
      return "danger";
    case "Concluído":
    case "Encerrada":
      return "success";
    default:
      return "neutral";
  }
}
