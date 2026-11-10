// Compatibilidade das telas administrativas com a API real.
// e são lidos com fetch, com uma latência simulada para exercitar os estados de
// carregamento. Para trocar por uma API real, basta mudar a URL e o método aqui —
// as páginas que consomem estas funções não precisam mudar.
import { apiRequest } from "./api.js";
const LATENCIA_MS = 700;

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function buscarJson(url) {
  let resposta;
  try {
    resposta = await fetch(url);
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.");
  }
  if (!resposta.ok) {
    throw new Error(`O servidor respondeu com erro (${resposta.status}). Tente novamente em instantes.`);
  }
  return resposta.json();
}

export async function buscarResumo() {
  const dados = await apiRequest("/admin/relatorios/dataset");
  await esperar(LATENCIA_MS);
  return dados;
}

export async function buscarAprovacoes() {
  const dados = await apiRequest("/admin/aprovacoes");
  await esperar(LATENCIA_MS);
  return dados;
}

// Ações de auditoria ainda não têm backend: simulam a latência de uma escrita
// real para que a UI (botões em "loading", bloqueio de duplo clique) já nasça
// pronta para quando a API existir.
export async function aprovarCadastro(id) {
  return apiRequest(`/admin/aprovacoes/${encodeURIComponent(id)}/aprovar`, { method: "POST", body: {} });
}

export async function rejeitarCadastro(id, motivo) {
  return apiRequest(`/admin/aprovacoes/${encodeURIComponent(id)}/rejeitar`, { method: "POST", body: { motivo } });
}

export async function buscarCadastros() {
  const dados = await apiRequest("/admin/cadastros");
  await esperar(LATENCIA_MS);
  return dados;
}

export async function alternarSituacaoCadastro(id, situacaoAtual) {
  return apiRequest(`/admin/cadastros/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: { motivo: `Alteração solicitada a partir de ${situacaoAtual}.` },
  });
}

export async function buscarEventos() {
  const dados = await apiRequest("/admin/eventos");
  await esperar(LATENCIA_MS);
  return dados;
}

export async function buscarCotacoes() {
  const dados = await apiRequest("/admin/cotacoes");
  await esperar(LATENCIA_MS);
  return dados;
}

export async function buscarRelatorios() {
  const dados = await apiRequest("/admin/relatorios/dataset");
  await esperar(LATENCIA_MS);
  return dados;
}
