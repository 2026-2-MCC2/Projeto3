import { apiRequest } from "./api.js";

const urls = new Map();
export const MODO_PLACEHOLDER = false;

/**
 * Busca o arquivo do servidor com o token administrativo e cria uma URL local
 * para pré-visualização e download.
 */
export async function obterUrlDocumento(doc) {
  if (urls.has(doc.id)) return urls.get(doc.id);
  const documento = await apiRequest(
    `/admin/aprovacoes/${encodeURIComponent(doc.usuarioId)}/documentos/${encodeURIComponent(doc.id)}`,
  );
  const bytes = Uint8Array.from(atob(documento.conteudo), (character) => character.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: documento.tipo }));
  urls.set(doc.id, url);
  return url;
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
