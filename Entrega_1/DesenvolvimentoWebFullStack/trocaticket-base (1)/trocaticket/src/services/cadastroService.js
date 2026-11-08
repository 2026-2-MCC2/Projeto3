import { apiRequest } from "./api.js";

export async function enviarCadastro(dados, usuarioId = "") {
  if (usuarioId) {
    throw new Error("A edição de cadastros reprovados ainda não está disponível na API.");
  }
  const documento = dados.documento.replace(/\D/g, "");
  if (documento.length !== 14) {
    throw new Error("A API atual aceita cadastro com CNPJ de 14 dígitos.");
  }
  const anexo = dados.arquivo
    ? {
        nome: dados.arquivo.name,
        tipo: dados.arquivo.type,
        conteudo: await arquivoBase64(dados.arquivo),
      }
    : undefined;
  const usuario = await apiRequest("/auth/register", {
    method: "POST",
    body: {
      nome: dados.nome.trim(),
      email: dados.email.trim(),
      senha: dados.senha,
      perfil: dados.perfil.toUpperCase(),
      cnpj: documento,
      telefone: dados.telefone.replace(/\D/g, ""),
      categoria: dados.perfil === "fornecedor" ? dados.area : undefined,
      descricao: "",
      documento: anexo,
    },
  });
  return { protocolo: `TT-${usuario.id}`, status: "em_analise", usuario };
}

async function arquivoBase64(arquivo) {
  const bytes = new Uint8Array(await arquivo.arrayBuffer());
  let binario = "";
  const tamanhoBloco = 0x8000;
  for (let inicio = 0; inicio < bytes.length; inicio += tamanhoBloco) {
    binario += String.fromCharCode(...bytes.subarray(inicio, inicio + tamanhoBloco));
  }
  return btoa(binario);
}
