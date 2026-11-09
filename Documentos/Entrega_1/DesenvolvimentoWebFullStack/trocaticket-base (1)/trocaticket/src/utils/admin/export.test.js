import { test } from "node:test";
import assert from "node:assert/strict";
import { slug, toCSV } from "./export.js";
import { validarChecklistCompleto, validarJustificativa } from "./validacoes.js";
import { formatBRL, formatBRLCompact, iniciais } from "./format.js";

test("CSV usa ';' e CRLF, escapa aspas/ponto-e-vírgula e aplica formatação de coluna", () => {
  const colunas = [
    { key: "nome", label: "Nome" },
    { key: "valor", label: "Valor", format: (v) => `R$ ${v}` },
  ];
  const csv = toCSV(colunas, [{ nome: 'Ana; "Sol"', valor: 10 }, { nome: "Beto", valor: 20 }]);
  assert.equal(csv, 'Nome;Valor\r\n"Ana; ""Sol""";R$ 10\r\nBeto;R$ 20');
});

test("CSV trata valores vazios sem escrever 'undefined'", () => {
  assert.equal(toCSV([{ key: "a", label: "A" }], [{ a: null }, {}]), "A\r\n\r\n");
});

test("slug remove acentos e símbolos (nome de arquivo seguro)", () => {
  assert.equal(slug("Relatório: Usuários por UF!"), "relatorio-usuarios-por-uf");
});

test("justificativa exige texto e tamanho mínimo", () => {
  assert.notEqual(validarJustificativa(""), "");
  assert.notEqual(validarJustificativa("   curto "), "");
  assert.equal(validarJustificativa("Documento vencido há meses"), "");
});

test("aprovar exige checklist 100% válido", () => {
  const ok = [{ status: "valido" }, { status: "valido" }];
  const nok = [{ status: "valido" }, { status: "pendente" }, { status: "verificacao" }];
  assert.equal(validarChecklistCompleto(ok), "");
  assert.match(validarChecklistCompleto(nok), /2 restantes/);
});

test("formatadores pt-BR", () => {
  assert.match(formatBRL(1500), /R\$\s?1\.500/);
  assert.match(formatBRLCompact(2_341_850), /2,34 mi/);
  assert.equal(iniciais("Mariana Costa"), "MC");
});
