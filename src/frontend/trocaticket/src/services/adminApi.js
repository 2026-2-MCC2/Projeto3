/*
 * Camada de dados do painel administrativo. Aprovações, cadastros e auditoria
 * usam o backend; eventos, cotações e relatórios ainda consomem dados demo.
 */
import {
  auditoriaSeed,
  cadastrosSeed,
  cotacoesSeed,
  eventosSeed,
  pendentesSeed,
  seriePorPeriodoSeed,
} from "./adminSeed.js";
import { apiRequest } from "./api.js";

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

export const listarPendentes = () => apiRequest("/admin/aprovacoes");
export const listarCadastros = () => apiRequest("/admin/cadastros");
export const listarEventos = () => ler(() => eventosSeed);
export const listarCotacoes = () => ler(() => cotacoesSeed);
export const listarAuditoria = () => apiRequest("/admin/auditoria");
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

/** Aprova o cadastro no servidor e registra a ação na auditoria. */
export async function aprovarCadastro(id, observacao) {
  await apiRequest(`/admin/aprovacoes/${encodeURIComponent(id)}/aprovar`, {
    method: "POST",
    body: { observacao },
  });
  notificarMudanca();
  return id;
}

/** Rejeita o cadastro e registra o motivo para consulta no acompanhamento. */
export async function rejeitarCadastro(id, motivo) {
  await apiRequest(`/admin/aprovacoes/${encodeURIComponent(id)}/rejeitar`, {
    method: "POST",
    body: { motivo },
  });
  notificarMudanca();
  return id;
}

/** Altera a situação de uma checagem do checklist: "valido" | "verificacao" | "pendente". */
export async function atualizarChecklist(id, itemId, status) {
  await apiRequest(`/admin/aprovacoes/${encodeURIComponent(id)}/checklist/${encodeURIComponent(itemId)}`, {
    method: "PUT",
    body: { status },
  });
  notificarMudanca();
}

/** Suspende ou reativa um cadastro no servidor, com justificativa obrigatória. */
export async function alterarStatusCadastro(cadastroId, motivo) {
  const resultado = await apiRequest(`/admin/cadastros/${encodeURIComponent(cadastroId)}/status`, {
    method: "PATCH",
    body: { motivo },
  });
  notificarMudanca();
  return resultado;
}
