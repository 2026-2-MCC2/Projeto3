// "API" mockada do painel do administrador: os dados ficam em public/mock/*.json
// e são lidos com fetch, com uma latência simulada para exercitar os estados de
// carregamento. Para trocar por uma API real, basta mudar a URL e o método aqui —
// as páginas que consomem estas funções não precisam mudar.
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
  const dados = await buscarJson("/mock/resumo.json");
  await esperar(LATENCIA_MS);
  return dados;
}

export async function buscarAprovacoes() {
  const dados = await buscarJson("/mock/aprovacoes.json");
  await esperar(LATENCIA_MS);
  return dados;
}

// Ações de auditoria ainda não têm backend: simulam a latência de uma escrita
// real para que a UI (botões em "loading", bloqueio de duplo clique) já nasça
// pronta para quando a API existir.
export async function aprovarCadastro(id) {
  await esperar(LATENCIA_MS);
  return { id, situacao: "aprovado" };
}

export async function rejeitarCadastro(id, motivo) {
  await esperar(LATENCIA_MS);
  return { id, situacao: "rejeitado", motivo };
}

export async function buscarCadastros() {
  const dados = await buscarJson("/mock/cadastros.json");
  await esperar(LATENCIA_MS);
  return dados;
}

export async function alternarSituacaoCadastro(id, situacaoAtual) {
  await esperar(LATENCIA_MS);
  return { id, situacao: situacaoAtual === "Ativo" ? "Suspenso" : "Ativo" };
}

export async function buscarEventos() {
  const dados = await buscarJson("/mock/eventos.json");
  await esperar(LATENCIA_MS);
  return dados;
}

export async function buscarCotacoes() {
  const dados = await buscarJson("/mock/cotacoes.json");
  await esperar(LATENCIA_MS);
  return dados;
}

export async function buscarRelatorios() {
  const dados = await buscarJson("/mock/relatorios.json");
  await esperar(LATENCIA_MS);
  return dados;
}
