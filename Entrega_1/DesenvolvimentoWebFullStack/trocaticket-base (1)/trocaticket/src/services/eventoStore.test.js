import { afterEach, test } from "node:test";
import assert from "node:assert/strict";

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
const { criarEvento, getStoreSnapshot, setEvento } = await import("./eventoStore.js");
const fetchOriginal = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = fetchOriginal;
});

test("inicia sem eventos ou fornecedores fictícios", () => {
  assert.deepEqual(getStoreSnapshot().eventos, []);
  assert.deepEqual(getStoreSnapshot().usuarios, []);
});

test("serializa atualizações do evento e só publica o estado após confirmação da API", async () => {
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    const body = options.body ? JSON.parse(options.body) : {};
    return new Response(JSON.stringify({ ...body, id: "31" }), { status: options.method === "POST" ? 201 : 200 });
  };

  const evento = await criarEvento({ nome: "Evento real" });
  const primeira = setEvento(evento.id, { descricao: "Descrição persistida" });
  const segunda = setEvento(evento.id, { local: { cidade: "São Paulo" } });
  await Promise.all([primeira, segunda]);

  assert.deepEqual(requests.map(({ options }) => options.method), ["POST", "PUT", "PUT"]);
  const ultimaAtualizacao = JSON.parse(requests[2].options.body);
  assert.equal(ultimaAtualizacao.descricao, "Descrição persistida");
  assert.equal(ultimaAtualizacao.local.cidade, "São Paulo");
  assert.equal(getStoreSnapshot().eventos[0].local.cidade, "São Paulo");
});
