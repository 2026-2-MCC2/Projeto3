import { apiRequest } from "./api.js";

export async function autenticar({ email, senha, mfa, admin = false }) {
  const resposta = await apiRequest("/auth/login", {
    method: "POST",
    body: { email: email.trim(), senha, ...(admin ? { admin: true, mfa } : {}) },
  });
  const usuario = resposta.usuario;
  return {
    token: resposta.token,
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil.toLowerCase(),
  };
}
