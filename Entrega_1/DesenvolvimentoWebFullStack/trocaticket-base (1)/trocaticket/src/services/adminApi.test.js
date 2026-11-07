import { test } from "node:test";
import assert from "node:assert/strict";
import { aprovarCadastro, alterarStatusCadastro, atualizarChecklist, buscarGlobal, listarAuditoria, listarCadastros, listarPendentes, obterEvento, rejeitarCadastro, restaurarDadosDemo } from "./adminApi.js";

test("aprovar tira da fila, cria o cadastro ativo e registra a auditoria", async () => {
  restaurarDadosDemo();
  const antes = await listarPendentes();
  const alvo = antes[0];
  await aprovarCadastro(alvo.id, "Tudo certo", "Tester");

  const depois = await listarPendentes();
  assert.equal(depois.length, antes.length - 1);
  assert.ok(!depois.some((p) => p.id === alvo.id));

  const cadastros = await listarCadastros();
  const novo = cadastros.find((c) => c.razao === alvo.nome);
  assert.equal(novo.status, "Ativo");

  const log = await listarAuditoria();
  assert.equal(log[0].acao, "Aprovado");
  assert.equal(log[0].autor, "Tester");
});

test("rejeitar grava o motivo na auditoria e não cria cadastro", async () => {
  restaurarDadosDemo();
  const [alvo] = await listarPendentes();
  const totalCadastros = (await listarCadastros()).length;
  await rejeitarCadastro(alvo.id, "Certidão vencida", "Tester");
  assert.equal((await listarCadastros()).length, totalCadastros);
  const log = await listarAuditoria();
  assert.equal(log[0].acao, "Rejeitado");
  assert.equal(log[0].justificativa, "Certidão vencida");
});

test("analisar o mesmo cadastro duas vezes falha com mensagem clara", async () => {
  restaurarDadosDemo();
  const [alvo] = await listarPendentes();
  await rejeitarCadastro(alvo.id, "Motivo qualquer", "Tester");
  await assert.rejects(() => aprovarCadastro(alvo.id, "", "Tester"), /já foi analisado/);
});

test("suspender e reativar alternam o status e auditam", async () => {
  restaurarDadosDemo();
  const ativo = (await listarCadastros()).find((c) => c.status === "Ativo");
  const r1 = await alterarStatusCadastro(ativo.id, "Pendência documental", "Tester");
  assert.equal(r1.status, "Suspenso");
  const r2 = await alterarStatusCadastro(ativo.id, "Regularizado", "Tester");
  assert.equal(r2.status, "Ativo");
  const log = await listarAuditoria();
  assert.deepEqual(log.slice(0, 2).map((l) => l.acao), ["Reativação", "Suspensão"]);
});

test("checklist é atualizado no cadastro pendente", async () => {
  restaurarDadosDemo();
  const [alvo] = await listarPendentes();
  const item = alvo.checklist.find((c) => c.status !== "valido");
  await atualizarChecklist(alvo.id, item.id, "valido");
  const [depois] = await listarPendentes();
  assert.equal(depois.checklist.find((c) => c.id === item.id).status, "valido");
});

test("obterEvento sinaliza 'não encontrado'", async () => {
  await assert.rejects(() => obterEvento("nao-existe"), (e) => e.naoEncontrado === true);
  assert.equal((await obterEvento("festival-litoral-2026")).nome, "Festival Litoral 2026");
});

test("busca global exige 2+ letras e encontra eventos e cadastros", async () => {
  assert.deepEqual(await buscarGlobal("a"), []);
  const achados = await buscarGlobal("litoral");
  assert.ok(achados.some((r) => r.tipo === "Evento" && r.rota === "/admin/eventos/festival-litoral-2026"));
});
