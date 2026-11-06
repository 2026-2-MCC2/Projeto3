import { getUsuario } from "./eventoStore.js";

const REENVIOS_KEY = "trocaticket:cadastro-reenvios";
const UMA_HORA_MS = 60 * 60 * 1000;
const COOLDOWN_MS = 60 * 1000;
const LIMITE_REENVIOS = 3;

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function lerReenvios(usuarioId) {
  const reenvios = JSON.parse(sessionStorage.getItem(REENVIOS_KEY) ?? "{}");
  const agora = Date.now();
  const recentes = (reenvios[usuarioId] ?? []).filter((data) => agora - data < UMA_HORA_MS);
  return { reenvios, recentes };
}

export async function consultarStatusCadastro(usuarioId) {
  await esperar(100);
  const usuario = getUsuario(usuarioId);
  if (!usuario) throw new Error("Não foi possível localizar o cadastro para consultar o status.");

  return { status: usuario.status, motivo: usuario.motivo ?? "" };
}

export function obterLimiteReenvios(usuarioId) {
  const { recentes } = lerReenvios(usuarioId);
  const restante = Math.max(0, LIMITE_REENVIOS - recentes.length);
  const cooldownAte = recentes.length ? recentes[recentes.length - 1] + COOLDOWN_MS : 0;
  return { restante, cooldownAte };
}

export async function reenviarConfirmacao(usuarioId) {
  const { reenvios, recentes } = lerReenvios(usuarioId);
  if (recentes.length >= LIMITE_REENVIOS) {
    const erro = new Error("Limite de reenvios atingido. Tente novamente mais tarde.");
    erro.code = "LIMITE_REENVIO";
    throw erro;
  }

  const usuario = getUsuario(usuarioId);
  if (!usuario) throw new Error("Não foi possível localizar o cadastro para reenviar o e-mail.");

  await esperar(500);
  const agora = Date.now();
  sessionStorage.setItem(REENVIOS_KEY, JSON.stringify({
    ...reenvios,
    [usuarioId]: [...recentes, agora],
  }));
}
