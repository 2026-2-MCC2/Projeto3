/*
 * MOTOR DE CONSULTAS DO "GERADOR DE RELATÓRIOS"
 * ---------------------------------------------
 * Funções puras: recebem um `dataset` ({ cadastros, eventos, cotacoes }) e uma
 * `consulta` e devolvem as linhas agrupadas/agregadas. Não dependem de React
 * nem da API, então funcionam igual com dados mockados ou vindos do servidor.
 *
 * Para criar uma nova "fonte" de dados (ex.: ingressos), basta acrescentar um
 * item em FONTES com suas dimensões, métricas, filtros e a função `linhas`.
 */
import { economia } from "./adminCalculos.js";

export const FONTES = [
  {
    id: "usuarios",
    label: "Usuários",
    descricao: "Organizadores e fornecedores homologados",
    dimensoes: [
      { id: "tipo", label: "Tipo" },
      { id: "categoria", label: "Categoria" },
      { id: "uf", label: "UF" },
      { id: "status", label: "Status" },
    ],
    metricas: [
      { id: "quantidade", label: "Quantidade de cadastros", agregacao: "contagem" },
      { id: "eventos", label: "Eventos vinculados", agregacao: "soma" },
      { id: "eventos_media", label: "Média de eventos por cadastro", agregacao: "media" },
    ],
    filtros: [
      { id: "tipo", label: "Tipo" },
      { id: "status", label: "Status" },
      { id: "uf", label: "UF" },
    ],
    linhas: ({ cadastros }) =>
      cadastros.map((c) => ({
        tipo: c.tipo,
        categoria: c.categoria,
        uf: c.uf,
        status: c.status,
        quantidade: 1,
        eventos: c.eventos,
        eventos_media: c.eventos,
      })),
  },
  {
    id: "eventos",
    label: "Eventos",
    descricao: "Eventos cadastrados, público e vendas",
    dimensoes: [
      { id: "status", label: "Status" },
      { id: "organizador", label: "Organizador" },
      { id: "uf", label: "UF" },
      { id: "evento", label: "Evento" },
    ],
    metricas: [
      { id: "quantidade", label: "Quantidade de eventos", agregacao: "contagem" },
      { id: "publico", label: "Público esperado", agregacao: "soma" },
      { id: "ingressos", label: "Ingressos vendidos", agregacao: "soma" },
      { id: "revenda", label: "Ingressos em revenda", agregacao: "soma" },
    ],
    filtros: [
      { id: "status", label: "Status" },
      { id: "uf", label: "UF" },
    ],
    linhas: ({ eventos }) =>
      eventos.map((e) => ({
        status: e.status,
        organizador: e.organizador,
        uf: e.uf,
        evento: e.nome,
        quantidade: 1,
        publico: e.publico,
        ingressos: e.ingressosVendidos,
        revenda: e.ingressosRevenda,
      })),
  },
  {
    id: "propostas",
    label: "Propostas",
    descricao: "Propostas enviadas pelos fornecedores nas cotações",
    dimensoes: [
      { id: "categoria", label: "Categoria de serviço" },
      { id: "fornecedor", label: "Fornecedor" },
      { id: "situacao", label: "Situação da cotação" },
      { id: "evento", label: "Evento" },
    ],
    metricas: [
      { id: "quantidade", label: "Quantidade de propostas", agregacao: "contagem" },
      { id: "valor", label: "Valor total proposto", agregacao: "soma", moeda: true },
      { id: "valor_medio", label: "Valor médio", agregacao: "media", moeda: true },
      { id: "nota", label: "Nota técnica média", agregacao: "media" },
    ],
    filtros: [
      { id: "situacao", label: "Situação" },
      { id: "categoria", label: "Categoria" },
    ],
    linhas: ({ cotacoes, eventos }) =>
      cotacoes.flatMap((c) =>
        c.propostas.map((p) => ({
          categoria: c.categoria,
          fornecedor: p.fornecedor,
          situacao: c.situacao,
          evento: eventos.find((e) => e.id === c.eventoId)?.nome ?? c.eventoId,
          quantidade: 1,
          valor: p.valor,
          valor_medio: p.valor,
          nota: p.notaTecnica,
          economia: economia(c).pct,
        })),
      ),
  },
  {
    id: "planejamento",
    label: "Valores do planejamento",
    descricao: "Orçamento previsto × realizado por categoria de custo",
    dimensoes: [
      { id: "categoria", label: "Categoria de custo" },
      { id: "evento", label: "Evento" },
      { id: "organizador", label: "Organizador" },
      { id: "status", label: "Status do evento" },
    ],
    metricas: [
      { id: "previsto", label: "Previsto", agregacao: "soma", moeda: true },
      { id: "realizado", label: "Realizado", agregacao: "soma", moeda: true },
      { id: "saldo", label: "Saldo a executar", agregacao: "soma", moeda: true },
    ],
    filtros: [
      { id: "status", label: "Status do evento" },
      { id: "categoria", label: "Categoria" },
    ],
    linhas: ({ eventos }) =>
      eventos.flatMap((e) =>
        e.planejamento.map((l) => ({
          categoria: l.categoria,
          evento: e.nome,
          organizador: e.organizador,
          status: e.status,
          previsto: l.previsto,
          realizado: l.realizado,
          saldo: l.previsto - l.realizado,
        })),
      ),
  },
];

export const fonteById = (id) => FONTES.find((f) => f.id === id);

/** Valores distintos de um campo (para montar as opções dos filtros). */
export function opcoesFiltro(fonteId, filtroId, dataset) {
  const linhas = fonteById(fonteId).linhas(dataset);
  return [...new Set(linhas.map((r) => String(r[filtroId])))].sort((a, b) => a.localeCompare(b));
}

/**
 * Agrupa as linhas da fonte pela dimensão escolhida e agrega cada métrica.
 * consulta = { fonte, dimensao, metricas: [ids], filtros: {campo: valor|"todos"},
 *              ordenar?: "valor-desc"|"valor-asc"|"rotulo", limite?: number }
 */
export function executarConsulta(consulta, dataset) {
  const def = fonteById(consulta.fonte);
  const linhas = def
    .linhas(dataset)
    .filter((r) => Object.entries(consulta.filtros ?? {}).every(([k, v]) => !v || v === "todos" || String(r[k]) === v));

  const grupos = new Map();
  for (const r of linhas) {
    const chave = String(r[consulta.dimensao]);
    grupos.set(chave, [...(grupos.get(chave) ?? []), r]);
  }

  const metricas = def.metricas.filter((m) => consulta.metricas.includes(m.id));
  let saida = [...grupos.entries()].map(([rotulo, grupo]) => {
    const linha = { rotulo };
    for (const m of metricas) {
      const valores = grupo.map((g) => Number(g[m.id] ?? 0));
      const soma = valores.reduce((a, b) => a + b, 0);
      linha[m.id] =
        m.agregacao === "contagem"
          ? grupo.length
          : m.agregacao === "media"
            ? Math.round((soma / grupo.length) * 10) / 10
            : soma;
    }
    return linha;
  });

  const primeira = metricas[0]?.id;
  if (consulta.ordenar === "rotulo") {
    saida.sort((a, b) => String(a.rotulo).localeCompare(String(b.rotulo)));
  } else if (primeira) {
    saida.sort((a, b) =>
      consulta.ordenar === "valor-asc" ? a[primeira] - b[primeira] : b[primeira] - a[primeira],
    );
  }
  if (consulta.limite && consulta.limite > 0) saida = saida.slice(0, consulta.limite);
  return saida;
}

/** Consultas prontas exibidas como atalhos na tela. */
export const MODELOS = [
  {
    id: "orcamento-categoria",
    titulo: "Orçamento por categoria",
    descricao: "Previsto × realizado somado de todos os eventos",
    consulta: { fonte: "planejamento", dimensao: "categoria", metricas: ["previsto", "realizado"], filtros: {} },
  },
  {
    id: "usuarios-uf",
    titulo: "Usuários por estado",
    descricao: "Quantos parceiros homologados existem em cada UF",
    consulta: { fonte: "usuarios", dimensao: "uf", metricas: ["quantidade"], filtros: {} },
  },
  {
    id: "propostas-fornecedor",
    titulo: "Ranking de fornecedores",
    descricao: "Valor proposto e nota técnica média",
    consulta: { fonte: "propostas", dimensao: "fornecedor", metricas: ["valor", "nota"], filtros: {}, limite: 10 },
  },
  {
    id: "vendas-evento",
    titulo: "Vendas por evento",
    descricao: "Ingressos vendidos e em revenda",
    consulta: { fonte: "eventos", dimensao: "evento", metricas: ["ingressos", "revenda"], filtros: {} },
  },
];
