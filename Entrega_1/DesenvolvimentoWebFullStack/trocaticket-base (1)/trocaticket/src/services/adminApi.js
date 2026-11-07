/*
 * API DO PAINEL DO ADMINISTRADOR (MOCK)
 * =====================================
 * Este é o ÚNICO arquivo que as telas /admin usam para ler e gravar dados.
 * Hoje ele simula um servidor: guarda tudo em memória (e na sessionStorage,
 * para sobreviver a um F5), com latência artificial para exercitar os estados
 * de "carregando" e "erro" das telas.
 *
 * COMO LIGAR O SERVIDOR REAL
 *   Troque o corpo de cada função por um fetch(), mantendo o nome, os
 *   parâmetros e o formato do retorno. Exemplo:
 *
 *     export async function listarEventos() {
 *       const r = await fetch("/api/admin/eventos", { headers: authHeaders() });
 *       if (!r.ok) throw new Error("Não foi possível carregar os eventos.");
 *       return r.json();
 *     }
 *
 *   As funções de ESCRITA (aprovar, rejeitar, alterar status...) devem gravar
 *   também o log de auditoria no servidor. Depois de uma escrita, chame
 *   `notificarMudanca()` para as telas abertas recarregarem sozinhas.
 *
 * DEMONSTRAR O ESTADO DE ERRO
 *   Abra qualquer tela do painel com `?simularErro=1` na URL
 *   (ex.: /admin/eventos?simularErro=1) — as leituras passam a falhar.
 */
import {
  auditoriaSeed,
  cadastrosSeed,
  cotacoesSeed,
  eventosSeed,
  pendentesSeed,
  seriePorPeriodoSeed,
} from "./adminSeed.js";

const LATENCIA_MS = 450;
const CHAVE_SESSAO = "trocaticket:admin:db:v1";

/* ---------------------------- estado em memória --------------------------- */

const clonar = (valor) => JSON.parse(JSON.stringify(valor));

function estadoInicial() {
  return {
    pendentes: clonar(pendentesSeed),
    cadastros: clonar(cadastrosSeed),
    auditoria: clonar(auditoriaSeed),
  };
}

function carregarSessao() {
  try {
    const bruto = sessionStorage.getItem(CHAVE_SESSAO);
    return bruto ? JSON.parse(bruto) : null;
  } catch {
    return null;
  }
}

let db = carregarSessao() ?? estadoInicial();
const ouvintes = new Set();
let pularLatenciaAte = 0;

function persistir() {
  try {
    sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(db));
  } catch {
    /* storage indisponível: segue só em memória */
  }
}

/** Avisa as telas abertas que os dados mudaram (elas recarregam sozinhas). */
export function notificarMudanca() {
  persistir();
  pularLatenciaAte = Date.now() + 800; // só do mock: a releitura pós-escrita não "viaja" de novo
  ouvintes.forEach((fn) => fn());
}

/** Usado pelo hook useAdminQuery para revalidar após escritas. */
export function assinarMudancas(fn) {
  ouvintes.add(fn);
  return () => ouvintes.delete(fn);
}

/** Volta todos os dados para o estado de demonstração original. */
export function restaurarDadosDemo() {
  db = estadoInicial();
  notificarMudanca();
}

/* ------------------------------ infraestrutura ---------------------------- */

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function simularRede() {
  // Com um servidor real esta função some: a latência vem da rede de verdade.
  if (Date.now() >= pularLatenciaAte) await esperar(LATENCIA_MS);
  if (typeof window !== "undefined" && new URLSearchParams(window.location.search).has("simularErro")) {
    throw new Error("Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.");
  }
}

async function ler(obter) {
  await simularRede();
  return clonar(obter());
}

/* --------------------------------- LEITURAS -------------------------------- */

export const listarPendentes = () => ler(() => db.pendentes);
export const listarCadastros = () => ler(() => db.cadastros);
export const listarEventos = () => ler(() => eventosSeed);
export const listarCotacoes = () => ler(() => cotacoesSeed);
export const listarAuditoria = () => ler(() => db.auditoria);
export const obterSerie = (periodo) => ler(() => seriePorPeriodoSeed[periodo] ?? []);

export async function obterEvento(id) {
  const evento = await ler(() => eventosSeed.find((e) => e.id === id) ?? null);
  if (!evento) throw Object.assign(new Error("Evento não encontrado."), { naoEncontrado: true });
  return evento;
}

/** Conjunto de dados que alimenta o gerador de relatórios. */
export const obterDatasetRelatorios = () =>
  ler(() => ({ cadastros: db.cadastros, eventos: eventosSeed, cotacoes: cotacoesSeed }));

/** Busca global da barra superior (cadastros, pendentes, eventos e cotações). */
export async function buscarGlobal(termo) {
  const t = termo.trim().toLowerCase();
  if (t.length < 2) return [];
  await esperar(120); // busca "ao digitar": latência curta
  const tem = (...campos) => campos.join(" ").toLowerCase().includes(t);
  return [
    ...db.pendentes
      .filter((p) => tem(p.nome, p.fantasia, p.cnpj, p.id))
      .map((p) => ({ tipo: "Aprovação", titulo: p.nome, detalhe: `${p.tipo} · ${p.cidade}/${p.uf}`, rota: `/admin/aprovacoes?id=${p.id}` })),
    ...db.cadastros
      .filter((c) => tem(c.nome, c.razao, c.cnpj))
      .map((c) => ({ tipo: "Cadastro", titulo: c.nome, detalhe: `${c.tipo} · ${c.cidade}/${c.uf}`, rota: `/admin/usuarios?busca=${encodeURIComponent(c.nome)}` })),
    ...eventosSeed
      .filter((e) => tem(e.nome, e.organizador, e.cidade))
      .map((e) => ({ tipo: "Evento", titulo: e.nome, detalhe: `${e.organizador} · ${e.status}`, rota: `/admin/eventos/${e.id}` })),
    ...cotacoesSeed
      .filter((c) => tem(c.servico, c.id))
      .map((c) => ({ tipo: "Cotação", titulo: c.servico, detalhe: `${c.id} · ${c.situacao}`, rota: `/admin/cotacoes?id=${c.id}` })),
  ].slice(0, 12);
}

/* --------------------------------- ESCRITAS -------------------------------- */

function registrarAuditoria(entrada, autor) {
  return {
    ...entrada,
    id: `a${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
    data: new Date().toISOString(),
    autor,
  };
}

function exigirPendente(id) {
  const p = db.pendentes.find((x) => x.id === id);
  if (!p) throw new Error("Este cadastro já foi analisado por outra pessoa.");
  return p;
}

/** Aprova o cadastro: sai da fila, entra em "cadastros" e é registrado na auditoria. */
export async function aprovarCadastro(id, observacao, autor) {
  await esperar(LATENCIA_MS);
  const p = exigirPendente(id);
  const novo = {
    id: `c-${p.id}`,
    nome: p.fantasia,
    razao: p.nome,
    cnpj: p.cnpj,
    tipo: p.tipo,
    categoria: p.categoria,
    uf: p.uf,
    cidade: p.cidade,
    aprovadoEm: new Date().toISOString().slice(0, 10),
    eventos: 0,
    status: "Ativo",
    responsavel: p.responsavel,
    email: p.email,
  };
  db = {
    pendentes: db.pendentes.filter((x) => x.id !== id),
    cadastros: [novo, ...db.cadastros],
    auditoria: [
      registrarAuditoria(
        {
          entidade: "Aprovação",
          acao: "Aprovado",
          alvo: p.nome,
          justificativa: observacao || "Documentação completa e checklist validado.",
        },
        autor,
      ),
      ...db.auditoria,
    ],
  };
  notificarMudanca();
  return p.nome;
}

/** Rejeita o cadastro (o motivo é enviado por e-mail ao solicitante pelo servidor). */
export async function rejeitarCadastro(id, motivo, autor) {
  await esperar(LATENCIA_MS);
  const p = exigirPendente(id);
  db = {
    ...db,
    pendentes: db.pendentes.filter((x) => x.id !== id),
    auditoria: [
      registrarAuditoria({ entidade: "Aprovação", acao: "Rejeitado", alvo: p.nome, justificativa: motivo }, autor),
      ...db.auditoria,
    ],
  };
  notificarMudanca();
  return p.nome;
}

/** Altera a situação de uma checagem do checklist: "valido" | "verificacao" | "pendente". */
export async function atualizarChecklist(id, itemId, status) {
  await esperar(150);
  db = {
    ...db,
    pendentes: db.pendentes.map((p) =>
      p.id === id
        ? { ...p, checklist: p.checklist.map((c) => (c.id === itemId ? { ...c, status } : c)) }
        : p,
    ),
  };
  notificarMudanca();
}

/** Suspende (se ativo) ou reativa (se suspenso) um cadastro, com justificativa obrigatória. */
export async function alterarStatusCadastro(cadastroId, motivo, autor) {
  await esperar(LATENCIA_MS);
  const c = db.cadastros.find((x) => x.id === cadastroId);
  if (!c) throw new Error("Cadastro não encontrado.");
  const novoStatus = c.status === "Ativo" ? "Suspenso" : "Ativo";
  db = {
    ...db,
    cadastros: db.cadastros.map((x) => (x.id === cadastroId ? { ...x, status: novoStatus } : x)),
    auditoria: [
      registrarAuditoria(
        {
          entidade: "Cadastro",
          acao: novoStatus === "Suspenso" ? "Suspensão" : "Reativação",
          alvo: c.nome,
          justificativa: motivo,
        },
        autor,
      ),
      ...db.auditoria,
    ],
  };
  notificarMudanca();
  return { nome: c.nome, status: novoStatus };
}
