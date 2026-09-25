const URL_USUARIOS = "/mock/usuarios.json";
const LATENCIA_MS = 800;

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function buscarUsuarios() {
  let resposta;
  try {
    resposta = await fetch(URL_USUARIOS);
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.");
  }
  if (!resposta.ok) {
    throw new Error(`O servidor respondeu com erro (${resposta.status}). Tente novamente em instantes.`);
  }
  return resposta.json();
}

export async function autenticar({ email, senha, mfa, admin = false }) {
  const usuarios = await buscarUsuarios();
  await esperar(LATENCIA_MS);

  const usuario = usuarios.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.senha === senha
  );
  if (!usuario) throw new Error("E-mail ou senha incorretos.");

  const ehAdmin = usuario.perfil === "admin";
  if (ehAdmin && !admin) {
    throw new Error("Este acesso é exclusivo do portal administrativo.");
  }
  if (admin && !ehAdmin) {
    throw new Error("Esta conta não possui privilégio administrativo.");
  }
  if (admin && usuario.mfa !== mfa) {
    throw new Error("Token MFA inválido ou expirado.");
  }

  const { id, nome, perfil } = usuario;
  return { id, nome, email: usuario.email, perfil };
}
