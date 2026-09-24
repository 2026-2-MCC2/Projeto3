const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validarEmail(valor) {
  const email = valor.trim();
  if (!email) return "Informe seu e-mail.";
  if (!EMAIL_REGEX.test(email)) return "Informe um e-mail válido (ex.: nome@empresa.com.br).";
  return "";
}

export function validarSenha(valor) {
  if (!valor) return "Informe sua senha.";
  if (valor.length < 8) return "A senha deve ter pelo menos 8 caracteres.";
  return "";
}

export function validarMfa(valor) {
  if (valor.length !== 6) return "Informe os 6 dígitos do token.";
  return "";
}
