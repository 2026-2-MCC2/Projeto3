export const etapas = [
  { n: 1, id: "cadastro", rotulo: "Criar Evento", rota: "/organizador/eventos/novo" },
  { n: 2, id: "custos", rotulo: "Composição de Custos & Orçamentos", rota: "/eventos/:id/custos" },
  { n: 3, id: "propostas", rotulo: "Propostas Recebidas", rota: "/eventos/:id/propostas" },
  { n: 4, id: "resumo", rotulo: "Resumo & Consolidação Financeira", rota: "/eventos/:id/resumo" },
  { n: 5, id: "precificacao", rotulo: "Cálculo e Precificação de Ticket", rota: "/eventos/:id/precificacao" },
];

export const etapaAtual = (id) => etapas.find((etapa) => etapa.id === id);
