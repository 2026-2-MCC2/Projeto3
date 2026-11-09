import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import { assinarMudancas, aprovarCadastro, atualizarChecklist, listarPendentes, rejeitarCadastro } from "./adminApi.js";
import { clearToken, getToken, saveToken } from "./api.js";

function storage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}

globalThis.localStorage = storage();
globalThis.sessionStorage = storage();
const fetchOriginal = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = fetchOriginal;
  clearToken();
});

test("lê a fila de aprovações protegida pelo token administrativo", async () => {
  saveToken("jwt-admin");
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url, options };
    return new Response(JSON.stringify([]), { status: 200 });
  };

  assert.deepEqual(await listarPendentes(), []);
  assert.equal(request.url, "/api/admin/aprovacoes");
  assert.equal(request.options.headers.Authorization, `Bearer ${getToken()}`);
});

test("persiste checklist, aprovação e rejeição no backend e revalida consultas", async () => {
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  };
  let changes = 0;
  const unsubscribe = assinarMudancas(() => { changes += 1; });

  await atualizarChecklist("12", "cnd", "valido");
  await aprovarCadastro("12", "Documentos conferidos");
  await rejeitarCadastro("13", "Documento vencido");
  unsubscribe();

  assert.deepEqual(requests.map(({ url, options }) => [url, options.method]), [
    ["/api/admin/aprovacoes/12/checklist/cnd", "PUT"],
    ["/api/admin/aprovacoes/12/aprovar", "POST"],
    ["/api/admin/aprovacoes/13/rejeitar", "POST"],
  ]);
  assert.deepEqual(JSON.parse(requests[0].options.body), { status: "valido" });
  assert.deepEqual(JSON.parse(requests[1].options.body), { observacao: "Documentos conferidos" });
  assert.deepEqual(JSON.parse(requests[2].options.body), { motivo: "Documento vencido" });
  assert.equal(changes, 3);
});
