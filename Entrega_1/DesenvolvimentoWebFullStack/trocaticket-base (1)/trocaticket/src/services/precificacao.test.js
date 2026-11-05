import assert from "node:assert/strict";
import test from "node:test";
import {
  calcularPontosSensibilidade,
  calcularPrecificacao,
  componentesTicket,
} from "./precificacao.js";

function criarEvento(minimo, maximo, publicoEsperado = null) {
  return {
    custos: {
      fornecedores: [{ valor: 188000 }],
      fiscais: [{ valor: 96500 }],
    },
    capacidadeAlvara: 8500,
    publico: { minimo, maximo },
    precificacao: {
      margem: 0.2,
      taxaPlataforma: 0.08,
      impostos: 0.05,
      publicoEsperado,
      cenarioEscolhido: "esperado",
    },
  };
}

test("calcula os cenários do Caso A usando o público esperado padrão", () => {
  const resultado = calcularPrecificacao(criarEvento(3000, 8500));

  assert.equal(resultado.publicoEsperado, 5750);
  assert.deepEqual(
    ["conservador", "esperado", "otimista"].map((id) => resultado.cenarios[id].base),
    [118.54, 61.85, 41.84],
  );
  assert.deepEqual(
    ["conservador", "esperado", "otimista"].map((id) => resultado.cenarios[id].final),
    [133.95, 69.89, 47.28],
  );
  assert.equal(resultado.cenarios.esperado.breakEvenIngressos, 4600);
});

test("calcula os componentes arredondados e break-even do Caso B", () => {
  const resultado = calcularPrecificacao(criarEvento(3500, 8500));
  const cenarios = resultado.cenarios;

  assert.equal(resultado.publicoEsperado, 6000);
  assert.deepEqual(
    ["conservador", "esperado", "otimista"].map((id) => cenarios[id].base),
    [101.61, 59.27, 41.84],
  );
  assert.deepEqual(
    ["conservador", "esperado", "otimista"].map((id) => cenarios[id].taxaValor),
    [8.13, 4.74, 3.35],
  );
  assert.deepEqual(
    ["conservador", "esperado", "otimista"].map((id) => cenarios[id].impostoValor),
    [5.08, 2.96, 2.09],
  );
  assert.deepEqual(
    ["conservador", "esperado", "otimista"].map((id) => cenarios[id].final),
    [114.82, 66.97, 47.28],
  );
  assert.deepEqual(
    ["conservador", "esperado", "otimista"].map((id) => cenarios[id].breakEvenIngressos),
    [2800, 4800, 6800],
  );
  assert.equal(cenarios.esperado.receitaBruta, 355625);
  assert.equal(cenarios.esperado.lucroLiquido, 71125);
  assert.equal(resultado.breakEvenPorIngressoMin, 81.28571428571429);
  assert.equal(resultado.nivelRisco, "Baixo");
  assert.equal(Math.round(resultado.margemSeguranca * 1000) / 10, 29.4);
});

test("matches the specified comparison at five ticket margins", () => {
  const values = [0, 0.1, 0.2, 0.3, 0.4].map((margin) => (
    componentesTicket(284500, 6000, margin, 0.08, 0.05)
  ));

  assert.deepEqual(values.map(({ base }) => base), [47.42, 52.69, 59.27, 67.74, 79.03]);
  assert.deepEqual(values.map(({ final }) => final), [53.58, 59.54, 66.97, 76.55, 89.3]);
});

test("provides finite ticket, revenue, and profit values across sensitivity points", () => {
  const event = criarEvento(3500, 8500);
  const result = calcularPrecificacao(event);
  const points = calcularPontosSensibilidade(result, "esperado", event.precificacao);

  assert.equal(points.length, 71);
  assert.deepEqual(
    [points[0].occupancy, points.at(-1).occupancy, points[40].publicCount],
    [0.3, 1, 5950],
  );
  for (const point of points) {
    assert.ok(Number.isFinite(point.ticket));
    assert.ok(Number.isFinite(point.revenue));
    assert.ok(Number.isFinite(point.profit));
  }
  assert.ok(points[0].profit < 0);
  assert.ok(points.at(-1).profit > 0);
});
