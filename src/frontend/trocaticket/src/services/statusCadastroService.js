import { apiRequest } from "./api.js";

export async function consultarStatusCadastro(usuarioId) {
  const cadastro = JSON.parse(sessionStorage.getItem("trocaticket:cadastro-pendente") ?? "null");
  if (!cadastro || String(cadastro.usuarioId) !== String(usuarioId) || !cadastro.statusToken) {
    throw new Error("Token de acompanhamento não encontrado. Envie o cadastro novamente ou fale com o suporte.");
  }
  return apiRequest("/auth/registration-status", {
    headers: { Authorization: `Bearer ${cadastro.statusToken}` },
  });
}
