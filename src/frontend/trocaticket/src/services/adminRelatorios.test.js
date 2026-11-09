import { test } from "node:test";
import assert from "node:assert/strict";
import { FONTES, MODELOS, executarConsulta, opcoesFiltro } from "./adminRelatorios.js";
import { cadastrosSeed, cotacoesSeed, eventosSeed } from "./adminSeed.js";

const dataset = { cadastros: cadastrosSeed, eventos: eventosSeed, cotacoes: cotacoesSeed };

test("usuários por UF soma exatamente todos os cadastros", () => {
  const linhas = executarConsulta({ fonte: "usuarios", dimensao: "uf", metricas: ["quantidade"], filtros: {} }, dataset);
  assert.equal(linhas.reduce((s, l) => s + l.quantidade, 0), cadastrosSeed.length);
});

test("filtro restringe as linhas antes de agrupar", () => {
  const linhas = executarConsulta({ fonte: "usuarios", dimensao: "tipo", metricas: ["quantidade"], filtros: { status: "Suspenso" } }, dataset);
  const suspensos = cadastrosSeed.filter((c) => c.status === "Suspenso").length;
  assert.equal(linhas.reduce((s, l) => s + l.quantidade, 0), suspensos);
});

test("filtro 'todos' não filtra nada", () => {
  const a = executarConsulta({ fonte: "eventos", dimensao: "status", metricas: ["quantidade"], filtros: { uf: "todos" } }, dataset);
  assert.equal(a.reduce((s, l) => s + l.quantidade, 0), eventosSeed.length);
});

test("planejamento: previsto total por categoria bate com a soma dos eventos", () => {
  const linhas = executarConsulta({ fonte: "planejamento", dimensao: "categoria", metricas: ["previsto", "realizado"], filtros: {} }, dataset);
  const previstoTabela = linhas.reduce((s, l) => s + l.previsto, 0);
  const previstoEventos = eventosSeed.flatMap((e) => e.planejamento).reduce((s, l) => s + l.previsto, 0);
  assert.equal(previstoTabela, previstoEventos);
});

test("planejamento: realizado de cada evento fecha com o total informado", () => {
  for (const e of eventosSeed) {
    const soma = e.planejamento.reduce((s, l) => s + l.realizado, 0);
    assert.equal(soma, e.realizado, `${e.nome}: o planejamento deve fechar com o realizado`);
  }
});

test("ordenação padrão é pela primeira métrica, decrescente; limite corta o ranking", () => {
  const linhas = executarConsulta({ fonte: "propostas", dimensao: "fornecedor", metricas: ["valor"], filtros: {}, ordenar: "valor-desc", limite: 3 }, dataset);
  assert.equal(linhas.length, 3);
  assert.ok(linhas[0].valor >= linhas[1].valor && linhas[1].valor >= linhas[2].valor);
});

test("ordenar por rótulo respeita a ordem alfabética", () => {
  const linhas = executarConsulta({ fonte: "usuarios", dimensao: "uf", metricas: ["quantidade"], filtros: {}, ordenar: "rotulo" }, dataset);
  const rotulos = linhas.map((l) => l.rotulo);
  assert.deepEqual(rotulos, [...rotulos].sort((a, b) => a.localeCompare(b)));
});

test("média agrega por média, não por soma", () => {
  const linhas = executarConsulta({ fonte: "propostas", dimensao: "situacao", metricas: ["nota"], filtros: {} }, dataset);
  for (const l of linhas) assert.ok(l.nota <= 100, "nota técnica média nunca passa de 100");
});

test("opcoesFiltro devolve valores únicos e ordenados", () => {
  const ufs = opcoesFiltro("usuarios", "uf", dataset);
  assert.equal(new Set(ufs).size, ufs.length);
  assert.deepEqual(ufs, [...ufs].sort((a, b) => a.localeCompare(b)));
});

test("todo modelo pronto referencia fonte, dimensão e métricas que existem", () => {
  for (const m of MODELOS) {
    const fonte = FONTES.find((f) => f.id === m.consulta.fonte);
    assert.ok(fonte, `${m.id}: fonte`);
    assert.ok(fonte.dimensoes.some((d) => d.id === m.consulta.dimensao), `${m.id}: dimensão`);
    for (const id of m.consulta.metricas) assert.ok(fonte.metricas.some((x) => x.id === id), `${m.id}: métrica ${id}`);
    assert.ok(executarConsulta(m.consulta, dataset).length > 0, `${m.id}: deve retornar linhas`);
  }
});
