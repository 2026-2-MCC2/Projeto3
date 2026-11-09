import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { apiRequest, clearToken, getToken, saveToken } from "./api.js";
import { autenticar } from "./authService.js";
import { enviarCadastro } from "./cadastroService.js";
import { consultarStatusCadastro } from "./statusCadastroService.js";

function criarStorage() {
  const valores = new Map();
  return {
    getItem: (chave) => valores.get(chave) ?? null,
    setItem: (chave, valor) => valores.set(chave, String(valor)),
    removeItem: (chave) => valores.delete(chave),
  };
}

globalThis.localStorage = criarStorage();
globalThis.sessionStorage = criarStorage();
const fetchOriginal = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = fetchOriginal;
  clearToken();
});

describe("cliente da API", () => {
  it("armazena o token conforme a preferência de sessão", () => {
    saveToken("sessao");
    assert.equal(getToken(), "sessao");
    saveToken("lembrar", true);
    assert.equal(getToken(), "lembrar");
    clearToken();
    assert.equal(getToken(), null);
  });

  it("envia JSON e o token Bearer", async () => {
    saveToken("jwt-teste");
    let request;
    globalThis.fetch = async (url, options) => {
      request = { url, options };
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    };

    const resultado = await apiRequest("/auth/login", {
      method: "POST",
      body: { email: "teste@example.com", senha: "segredo" },
    });

    assert.deepEqual(resultado, { ok: true });
    assert.equal(request.url, "/api/auth/login");
    assert.equal(request.options.headers.Authorization, "Bearer jwt-teste");
    assert.deepEqual(JSON.parse(request.options.body), { email: "teste@example.com", senha: "segredo" });
  });

  it("propaga a mensagem de erro da API", async () => {
    globalThis.fetch = async () => new Response(JSON.stringify({ erro: "Credenciais inválidas." }), { status: 401 });
    await assert.rejects(apiRequest("/auth/login"), { message: "Credenciais inválidas.", status: 401 });
  });

  it("converte o perfil do login para o formato usado nas rotas do frontend", async () => {
    globalThis.fetch = async () => new Response(JSON.stringify({
      token: "jwt",
      usuario: { id: 7, nome: "Ana", email: "ana@example.com", perfil: "ORGANIZADOR" },
    }), { status: 200 });

    assert.deepEqual(await autenticar({ email: "ana@example.com", senha: "segredo" }), {
      token: "jwt",
      id: 7,
      nome: "Ana",
      email: "ana@example.com",
      perfil: "organizador",
    });
  });

  it("envia MFA para autenticação administrativa e converte o perfil", async () => {
    let payload;
    globalThis.fetch = async (_url, options) => {
      payload = JSON.parse(options.body);
      return new Response(JSON.stringify({
        token: "jwt-admin",
        usuario: { id: 9, nome: "Admin", email: "admin@example.com", perfil: "ADMIN" },
      }), { status: 200 });
    };

    assert.deepEqual(await autenticar({
      email: "admin@example.com",
      senha: "segredo",
      mfa: "123456",
      admin: true,
    }), {
      token: "jwt-admin",
      id: 9,
      nome: "Admin",
      email: "admin@example.com",
      perfil: "admin",
    });
    assert.deepEqual(payload, { email: "admin@example.com", senha: "segredo", admin: true, mfa: "123456" });
  });

  it("mapeia o cadastro e envia o documento em base64", async () => {
    let payload;
    globalThis.fetch = async (_url, options) => {
      payload = JSON.parse(options.body);
      return new Response(JSON.stringify({
        id: 8,
        nome: "Empresa",
        email: "empresa@example.com",
        perfil: "ORGANIZADOR",
      }), { status: 201 });
    };

    await enviarCadastro({
      nome: "Empresa",
      email: "empresa@example.com",
      senha: "Senha@2026",
      perfil: "organizador",
      documento: "12.345.678/0001-95",
      telefone: "(11) 99999-1234",
      area: "Produtora de Eventos",
      arquivo: new File(["doc"], "contrato.pdf", { type: "application/pdf" }),
    });

    assert.equal(payload.perfil, "ORGANIZADOR");
    assert.equal(payload.cnpj, "12345678000195");
    assert.deepEqual(payload.documento, {
      nome: "contrato.pdf",
      tipo: "application/pdf",
      conteudo: "ZG9j",
    });

    it("consulta o próprio status usando somente o token de acompanhamento", async () => {
      sessionStorage.setItem("trocaticket:cadastro-pendente", JSON.stringify({
        usuarioId: "8",
        perfil: "fornecedor",
        statusToken: "status-jwt",
      }));
      let request;
      globalThis.fetch = async (url, options) => {
        request = { url, options };
        return new Response(JSON.stringify({ status: "em_analise", motivo: "" }), { status: 200 });
      };

      assert.deepEqual(await consultarStatusCadastro("8"), { status: "em_analise", motivo: "" });
      assert.equal(request.url, "/api/auth/registration-status");
      assert.equal(request.options.headers.Authorization, "Bearer status-jwt");
      await assert.rejects(consultarStatusCadastro("9"), /Token de acompanhamento não encontrado/);
    });
  });
});
