import { test } from "node:test";
import assert from "node:assert/strict";
import { economia, melhorProposta, prazoLabel } from "./adminCalculos.js";

const cotacao = (valores, extra = {}) => ({
  situacao: "Aberta",
  prazo: "2026-11-09",
  propostas: valores.map((valor, i) => ({ id: `P${i}`, fornecedor: `F${i}`, valor })),
  ...extra,
});

test("melhor proposta é a de menor valor", () => {
  assert.equal(melhorProposta(cotacao([300, 100, 200])).valor, 100);
});

test("economia = (média − menor) / média", () => {
  const e = economia(cotacao([100, 200, 300]));
  assert.equal(e.valor, 100); // média 200 − menor 100
  assert.equal(Math.round(e.pct), 50);
});

test("sem propostas não há economia nem erro", () => {
  assert.deepEqual(economia(cotacao([])), { pct: 0, valor: 0 });
  assert.equal(melhorProposta(cotacao([])), undefined);
});

test("prazoLabel descreve vencimentos relativos à data de referência", () => {
  const hoje = new Date("2026-11-04T12:00:00");
  const fmt = (iso) => iso;
  assert.equal(prazoLabel(cotacao([1], { prazo: "2026-11-05" }), hoje, fmt), "Vence amanhã");
  assert.equal(prazoLabel(cotacao([1], { prazo: "2026-11-04" }), hoje, fmt), "Vence hoje");
  assert.equal(prazoLabel(cotacao([1], { prazo: "2026-11-03" }), hoje, fmt), "Venceu ontem");
  assert.equal(prazoLabel(cotacao([1], { prazo: "2026-11-09" }), hoje, fmt), "Vence em 5 dias");
  assert.equal(prazoLabel(cotacao([1], { prazo: "2026-10-30" }), hoje, fmt), "Venceu há 5 dias");
  assert.equal(prazoLabel(cotacao([1], { situacao: "Encerrada", prazo: "2026-03-12" }), hoje, fmt), "Concluída em 2026-03-12");
});
