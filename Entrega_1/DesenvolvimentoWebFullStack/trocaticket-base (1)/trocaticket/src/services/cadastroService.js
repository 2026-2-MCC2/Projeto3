import { cadastrarUsuario } from "./eventoStore.js";

const URL_USUARIOS = "/mock/usuarios.json";
const LATENCIA_MS = 1000;

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Simula a validação do backend e guarda somente os dados cadastrais permitidos.
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

  const jaExiste = usuarios.some(
    (u) => u.email.toLowerCase() === dados.email.trim().toLowerCase(),
  );
  if (jaExiste) {
    throw new Error("Este e-mail já está cadastrado.");
  }

  const usuario = cadastrarUsuario(dados);
  return {
    protocolo: `TT-${Date.now().toString().slice(-8)}`,
    status: usuario.status,
    usuario,
  };
}
