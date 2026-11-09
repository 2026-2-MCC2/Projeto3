const API_URL = ( import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");
const TOKEN_KEY = "trocaticket:token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
}

export function saveToken(token, remember = false) {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest(path, { body, headers, ...options } = {}) {
  const token = getToken();
  let response;
  try {
    response = await fetch(`${API_URL}/api${path}`, {
      ...options,
      headers: {
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch {
    throw new Error("Não foi possível conectar à API. Verifique se o backend está em execução.");
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.erro ?? payload.message ?? `Falha na API (${response.status}).`);
    error.status = response.status;
    error.code = payload.code;
    throw error;
  }
  return payload;
}

export async function getUsuarioAtual() {
  return apiRequest("/auth/me");
}
