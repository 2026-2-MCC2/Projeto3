const URL_USUARIOS = "/mock/usuarios.json";
const LATENCIA_MS = 1000;

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Envia o cadastro para análise. Simula uma API: verifica se o e-mail já
 * existe e, se não, "salva" o cadastro (aqui apenas resolve a promise).
 */
export async function enviarCadastro(dados) {
  let resposta;
  try {
    resposta = await fetch(URL_USUARIOS);
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.");
  }
  if (!resposta.ok) {
    throw new Error(`O servidor respondeu com erro (${resposta.status}). Tente novamente em instantes.`);
  }
  const usuarios = await resposta.json();
  await esperar(LATENCIA_MS);

  const jaExiste = usuarios.some((u) => u.email.toLowerCase() === dados.email.trim().toLowerCase());
  if (jaExiste) {
    throw new Error("Este e-mail já possui cadastro no TrocaTicket.");
  }

  return { protocolo: `TT-${Date.now().toString().slice(-8)}`, status: "em_analise" };
}
