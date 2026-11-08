import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import { assinarMudancas, aprovarCadastro, atualizarChecklist, listarCotacoes, listarEventos, listarPendentes, rejeitarCadastro } from "./adminApi.js";
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

test("carrega e normaliza eventos administrativos reais", async () => {
  saveToken("jwt-admin");
  let requestUrl;
  globalThis.fetch = async (url) => {
    requestUrl = url;
    return new Response(JSON.stringify([{
      id: "18",
      status: "planejamento",
      dataInicio: "2026-09-10",
      publico: { maximo: 500 },
      local: { cidade: "São Paulo", uf: "SP" },
      custos: { fornecedores: [{ valor: 1200 }], fiscais: [{ valor: 300 }] },
    }]), { status: 200 });
  };

  const [evento] = await listarEventos();
  assert.equal(requestUrl, "/api/admin/eventos");
  assert.equal(evento.status, "Planejamento");
  assert.equal(evento.previsto, 1500);
  assert.equal(evento.realizado, null);
  assert.equal(evento.publico, 500);
  assert.equal(evento.cidade, "São Paulo");
  assert.equal(evento.planejamento.length, 2);
});

test("não apresenta cotações como dados reais quando a API não oferece esse recurso", async () => {
  await assert.rejects(listarCotacoes(), /API ainda não disponibiliza/);
});
