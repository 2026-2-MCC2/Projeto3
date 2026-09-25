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

export function validarNome(valor) {
  if (!valor.trim()) return "Informe a razão social ou o nome comercial.";
  if (valor.trim().length < 3) return "Informe um nome com pelo menos 3 caracteres.";
  return "";
}

export function validarTelefone(valor) {
  const digitos = valor.replace(/\D/g, "");
  if (!digitos) return "Informe um telefone com DDD.";
  if (digitos.length < 10) return "Informe um telefone válido com DDD.";
  return "";
}

function digitosVerificadoresCpf(base) {
  const calc = (fatorInicial) =>
    base
      .slice(0, fatorInicial - 1)
      .split("")
      .reduce((soma, d, i) => soma + Number(d) * (fatorInicial - i), 0);
  const d1 = ((calc(10) * 10) % 11) % 10;
  const d2 = ((calc(11) * 10) % 11) % 10;
  return `${d1}${d2}`;
}

function validoCpf(d) {
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  return d.slice(9) === digitosVerificadoresCpf(d);
}

function validoCnpj(d) {
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;
  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const calc = (base, pesos) =>
    ((base
      .split("")
      .reduce((soma, dig, i) => soma + Number(dig) * pesos[i], 0) *
      10) %
      11) %
    10;
  return `${calc(d.slice(0, 12), pesos1)}${calc(d.slice(0, 12) + calc(d.slice(0, 12), pesos1), pesos2)}` === d.slice(-2);
}

export function validarDocumento(valor) {
  const d = valor.replace(/\D/g, "");
  if (!d) return "Informe o CPF ou CNPJ.";
  if (d.length !== 11 && d.length !== 14) return "CPF deve ter 11 dígitos ou CNPJ 14 dígitos.";
  if (d.length === 11 && !validoCpf(d)) return "Este CPF não é válido.";
  if (d.length === 14 && !validoCnpj(d)) return "Este CNPJ não é válido.";
  return "";
}

export function validarArea(valor) {
  if (!valor) return "Selecione sua área de atuação principal.";
  return "";
}

const TIPOS_ARQUIVO_ACEITOS = ["application/pdf", "image/jpeg", "image/png"];
const TAMANHO_MAX_ARQUIVO = 10 * 1024 * 1024;

export function validarArquivo(arquivo) {
  if (!arquivo) return "Envie um documento (contrato social ou identificação).";
  if (!TIPOS_ARQUIVO_ACEITOS.includes(arquivo.type)) return "Envie um arquivo em PDF, JPG ou PNG.";
  if (arquivo.size > TAMANHO_MAX_ARQUIVO) return "O arquivo deve ter até 10MB.";
  return "";
}

export function validarTermos(valor) {
  if (!valor) return "É necessário aceitar os termos para continuar.";
  return "";
}

export function forcaSenha(valor) {
  let pontos = 0;
  if (valor.length >= 8) pontos++;
  if (/[A-Z]/.test(valor) && /[a-z]/.test(valor)) pontos++;
  if (/\d/.test(valor)) pontos++;
  if (/[^A-Za-z0-9]/.test(valor)) pontos++;
  return pontos; // 0 a 4
}
