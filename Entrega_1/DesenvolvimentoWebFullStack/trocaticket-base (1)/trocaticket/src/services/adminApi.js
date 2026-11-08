/* Camada de dados do painel administrativo. */
import { apiRequest } from "./api.js";

const ouvintes = new Set();

/** Avisa as telas abertas que os dados mudaram (elas recarregam sozinhas). */
export function notificarMudanca() {
  ouvintes.forEach((fn) => fn());
}

/** Usado pelo hook useAdminQuery para revalidar após escritas. */
export function assinarMudancas(fn) {
  ouvintes.add(fn);
  return () => ouvintes.delete(fn);
}

/* --------------------------------- LEITURAS -------------------------------- */

export const listarPendentes = () => apiRequest("/admin/aprovacoes");
export const listarCadastros = () => apiRequest("/admin/cadastros");
function normalizarEventoAdmin(evento) {
  const status = {
    planejamento: "Planejamento",
    rascunho: "Planejamento",
    em_cotacao: "Em cotação",
    cotacao: "Em cotação",
    publicado: "Em produção",
    concluido: "Concluído",
    suspenso: "Suspenso",
  }[String(evento.status).toLowerCase()] ?? evento.status;
  const custos = evento.custos ?? {};
  const previsto = [
    ...(Array.isArray(custos.fornecedores) ? custos.fornecedores : []),
    ...(Array.isArray(custos.fiscais) ? custos.fiscais : []),
  ].reduce((total, item) => total + (Number(item.valor) || 0), 0);
  const planejamento = Array.isArray(evento.planejamento)
    ? evento.planejamento
    : [
        ...(Array.isArray(custos.fornecedores) ? custos.fornecedores : []),
        ...(Array.isArray(custos.fiscais) ? custos.fiscais : []),
      ].map((item) => ({
        categoria: item.titulo ?? item.categoriaId ?? "Outro",
        previsto: Number(item.valor) || 0,
        realizado: null,
      }));
  return {
    ...evento,
    status,
    cidade: evento.local?.cidade ?? "",
    uf: evento.local?.uf ?? "",
    data: evento.dataInicio ?? "",
    publico: Number(evento.publico?.maximo) || 0,
    previsto,
    realizado: custos.realizado == null ? null : Number(custos.realizado),
    planejamento,
  };
}

export async function listarEventos() {
  const eventos = await apiRequest("/admin/eventos");
  if (!Array.isArray(eventos)) throw new Error("A API retornou uma lista de eventos inválida.");
  return eventos.map(normalizarEventoAdmin);
}
export async function listarCotacoes() {
  throw new Error("A API ainda não disponibiliza endpoints de cotações e propostas.");
}
export const listarAuditoria = () => apiRequest("/admin/auditoria");
export async function obterSerie(periodo) {
  const eventos = await listarEventos();
  const hoje = new Date();
  const inicio = periodo === "30d"
    ? new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 30)
    : periodo === "ano"
      ? new Date(hoje.getFullYear(), 0, 1)
      : new Date(hoje.getFullYear(), Math.floor(hoje.getMonth() / 3) * 3, 1);
  const fim = periodo === "30d"
    ? new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1)
    : periodo === "ano"
      ? new Date(hoje.getFullYear() + 1, 0, 1)
      : new Date(inicio.getFullYear(), inicio.getMonth() + 3, 1);
  const filtrados = eventos.filter((evento) => {
    const data = new Date(evento.data).getTime();
    return Number.isFinite(data) && data >= inicio.getTime() && data < fim.getTime();
  });
  if (periodo === "30d") {
    return filtrados.length
      ? [{
          periodo: "Últimos 30 dias",
          previsto: filtrados.reduce((total, evento) => total + evento.previsto, 0),
          realizado: filtrados.some((evento) => evento.realizado != null)
            ? filtrados.reduce((total, evento) => total + (evento.realizado ?? 0), 0)
            : null,
          eventos: filtrados.length,
        }]
      : [];
  }
  const agrupados = new Map();
  filtrados.forEach((evento) => {
    const data = new Date(evento.data);
    const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
    const grupo = agrupados.get(chave) ?? {
      periodo: data.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
      previsto: 0,
      realizado: 0,
      eventos: 0,
      eventosComRealizado: 0,
    };
    grupo.previsto += evento.previsto;
    grupo.eventos += 1;
    if (evento.realizado != null) {
      grupo.realizado += evento.realizado;
      grupo.eventosComRealizado += 1;
    }
    agrupados.set(chave, grupo);
  });
  return [...agrupados.values()].map(({ eventosComRealizado, ...grupo }) => ({
    ...grupo,
    realizado: eventosComRealizado ? grupo.realizado : null,
  }));
}

export async function obterEvento(id) {
  const eventos = await listarEventos();
  const evento = eventos.find((item) => item.id === String(id));
  if (!evento) throw Object.assign(new Error("Evento não encontrado."), { naoEncontrado: true });
  return evento;
}

/** Conjunto de dados que alimenta o gerador de relatórios. */
export async function obterDatasetRelatorios() {
  const [cadastros, eventos, auditoria] = await Promise.all([
    listarCadastros(),
    listarEventos(),
    listarAuditoria(),
  ]);
  return { cadastros, eventos, cotacoes: [], auditoria };
}

/** Busca global da barra superior (cadastros, pendentes, eventos e cotações). */
export async function buscarGlobal(termo) {
  const t = termo.trim().toLowerCase();
  if (t.length < 2) return [];
  const tem = (...campos) => campos.join(" ").toLowerCase().includes(t);
  const [pendentes, cadastros, eventos] = await Promise.all([
    listarPendentes(),
    listarCadastros(),
    listarEventos(),
  ]);
  return [
    ...pendentes
      .filter((p) => tem(p.nome, p.fantasia, p.cnpj, p.id))
      .map((p) => ({ tipo: "Aprovação", titulo: p.nome, detalhe: `${p.tipo} · ${p.cidade}/${p.uf}`, rota: `/admin/aprovacoes?id=${p.id}` })),
    ...cadastros
      .filter((c) => tem(c.nome, c.razao, c.cnpj))
      .map((c) => ({ tipo: "Cadastro", titulo: c.nome, detalhe: `${c.tipo} · ${c.cidade}/${c.uf}`, rota: `/admin/usuarios?busca=${encodeURIComponent(c.nome)}` })),
    ...eventos
      .filter((e) => tem(e.nome, e.organizador, e.cidade))
      .map((e) => ({ tipo: "Evento", titulo: e.nome, detalhe: `${e.organizador} · ${e.status}`, rota: `/admin/eventos/${e.id}` })),
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
