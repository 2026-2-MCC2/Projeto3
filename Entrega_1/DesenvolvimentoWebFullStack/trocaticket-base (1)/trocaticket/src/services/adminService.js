import { alterarStatusCadastro, listarAuditoria, listarCadastros, listarEventos } from "./adminApi.js";

export async function buscarCadastros() {
  const [cadastros, auditoria] = await Promise.all([listarCadastros(), listarAuditoria()]);
  return {
    cadastros: cadastros.map((cadastro) => ({ ...cadastro, situacao: cadastro.status })),
    historico: auditoria
      .filter((registro) => registro.entidade === "Cadastro" || registro.entidade === "Aprovação")
      .map((registro) => ({
        id: registro.id,
        cadastroNome: registro.alvo,
        descricao: [registro.acao, registro.justificativa].filter(Boolean).join(" · "),
        autor: registro.autor,
        data: registro.data,
      })),
  };
}

export async function alternarSituacaoCadastro(id, _situacaoAtual, motivo) {
  const resultado = await alterarStatusCadastro(id, motivo);
  return { id, situacao: resultado.status };
}

export async function buscarRelatorios() {
  const [eventos, auditoria] = await Promise.all([listarEventos(), listarAuditoria()]);
  const agora = new Date();
  const periodos = Array.from({ length: 12 }, (_, indice) => {
    const data = new Date(agora.getFullYear(), agora.getMonth() - 11 + indice, 1);
    return {
      chave: `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`,
      mes: data.toLocaleDateString("pt-BR", { month: "short" }),
      eventos: 0,
      custo: 0,
    };
  });
  const porPeriodo = new Map(periodos.map((periodo) => [periodo.chave, periodo]));
  const custosPorOrganizador = new Map();
  eventos.forEach((evento) => {
    const periodo = porPeriodo.get(String(evento.data).slice(0, 7));
    if (periodo) {
      periodo.eventos += 1;
      periodo.custo += evento.previsto;
    }
    custosPorOrganizador.set(
      evento.organizador,
      (custosPorOrganizador.get(evento.organizador) ?? 0) + evento.previsto,
    );
  });
  return {
    eventosPorPeriodo: periodos,
    custoPorOrganizador: [...custosPorOrganizador].map(([nome, valor]) => ({ nome, valor })),
    desempenhoFornecedores: [],
    auditoria: auditoria.map((registro) => ({
      ...registro,
      detalhe: [registro.alvo, registro.justificativa].filter(Boolean).join(" · "),
    })),
    kpis: { tempoMedioAprovacaoDias: null, economiaCotacoes: null },
  };
}
