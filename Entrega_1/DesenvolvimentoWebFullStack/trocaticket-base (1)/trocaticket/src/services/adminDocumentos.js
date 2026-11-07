/*
 * DOCUMENTOS SUBMETIDOS (PLACEHOLDER)
 * ===================================
 * Na tela de Aprovações, cada cadastro tem uma lista de documentos
 * (contrato social, CND, comprovante de endereço...). Como ainda não existe
 * servidor de arquivos, estes documentos são APENAS PLACEHOLDERS: a tela
 * mostra nome, tamanho e uma pré-visualização de exemplo.
 *
 * Formato de cada documento (vem em `pendente.documentos`):
 *   { id: string, nome: string, tamanho: string, info: string, url: string | null }
 *
 * COMO LIGAR AO SERVIDOR
 *   1. Faça a API devolver `url` em cada documento (ex.: URL assinada do
 *      armazenamento) — a pré-visualização passa a exibir o PDF de verdade
 *      num <iframe> e o botão "Baixar" faz o download real. Nada mais precisa mudar.
 *   2. Se preferir buscar a URL só quando o admin clicar, implemente
 *      `obterUrlDocumento` abaixo com um fetch() ao servidor.
 */

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** true enquanto não existe servidor de arquivos. Pode ser removido na integração. */
export const MODO_PLACEHOLDER = true;

/**
 * Devolve a URL do arquivo ou null quando o documento ainda é placeholder.
 * TODO(servidor): substituir por algo como
 *   const r = await fetch(`/api/admin/documentos/${doc.id}/url`);
 *   return (await r.json()).url;
 */
export async function obterUrlDocumento(doc) {
  await esperar(250);
  return doc.url ?? null;
}

/**
 * Inicia o download do documento. Retorna false quando não há arquivo real
 * (modo placeholder), para a tela avisar o usuário.
 */
export async function baixarDocumento(doc) {
  const url = await obterUrlDocumento(doc);
  if (!url) return false;
  const a = document.createElement("a");
  a.href = url;
  a.download = doc.nome;
  a.rel = "noreferrer";
  document.body.appendChild(a);
  a.click();
  a.remove();
  return true;
}
