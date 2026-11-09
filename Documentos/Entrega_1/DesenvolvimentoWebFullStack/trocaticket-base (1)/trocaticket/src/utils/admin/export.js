/*
 * EXPORTAÇÃO CSV / PNG / PDF
 * --------------------------
 * - CSV: pronto para o Excel em pt-BR (separador ";" e BOM para acentos).
 * - PNG: captura um elemento da tela (ex.: um gráfico).
 * - PDF: orquestra a geração (captura gráficos, formata tabelas) e entrega o
 *   desenho ao template ativo — para mudar o VISUAL do PDF edite pdfTemplate.js.
 *
 * As bibliotecas pesadas (jspdf, html-to-image) são carregadas só no momento
 * da exportação, para não pesar o carregamento do painel.
 */
import { PDF_TEMA, PDF_TEMPLATES, PDF_TEMPLATE_ATIVO } from "./pdfTemplate.js";

function valorCelula(coluna, linha) {
  const bruto = linha[coluna.key];
  if (coluna.format) return coluna.format(bruto, linha);
  if (bruto === null || bruto === undefined) return "";
  if (typeof bruto === "number") return bruto.toLocaleString("pt-BR");
  return String(bruto);
}

/**
 * Gera o texto CSV: separador ";", aspas quando preciso, quebra de linha CRLF.
 * colunas = [{ key, label, format?(valor, linha) }]
 */
export function toCSV(colunas, linhas) {
  const esc = (v) => (/[;"\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const cabecalho = colunas.map((c) => esc(c.label)).join(";");
  const corpo = linhas.map((l) => colunas.map((c) => esc(valorCelula(c, l))).join(";"));
  return [cabecalho, ...corpo].join("\r\n");
}

export function slug(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function carimbo() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}

function baixar(blob, nomeArquivo) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadCSV(nome, colunas, linhas) {
  // BOM para o Excel abrir os acentos corretamente
  const blob = new Blob(["\ufeff" + toCSV(colunas, linhas)], { type: "text/csv;charset=utf-8" });
  baixar(blob, `trocaticket-${slug(nome)}-${carimbo()}.csv`);
}

async function capturar(elemento) {
  const { toPng } = await import("html-to-image");
  const dataUrl = await toPng(elemento, {
    pixelRatio: 2,
    backgroundColor: "#ffffff",
    skipFonts: true,
    // elementos com data-export-ignore="true" (botões, menus) ficam de fora da imagem
    filter: (el) => {
      if (!(el instanceof Element)) return true;
      if (el instanceof HTMLElement && el.dataset.exportIgnore === "true") return false;
      // tooltip e cursor do Recharts (aparecem se o mouse estiver sobre o gráfico) ficam fora da imagem
      return !el.classList.contains("recharts-tooltip-wrapper") && !el.classList.contains("recharts-tooltip-cursor");
    },
  });
  const img = new Image();
  img.src = dataUrl;
  await img.decode();
  return { dataUrl, width: img.width, height: img.height };
}

export async function downloadPNG(nome, elemento) {
  const { dataUrl } = await capturar(elemento);
  const blob = await (await fetch(dataUrl)).blob();
  baixar(blob, `trocaticket-${slug(nome)}-${carimbo()}.png`);
}

/**
 * Gera e baixa o PDF.
 * opcoes = {
 *   title, subtitle?, orientation?: "portrait"|"landscape",
 *   summary?: [{ label, value }],          // cartões de indicadores
 *   charts?: HTMLElement[],                // elementos da tela capturados como imagem
 *   tables?: [{ title?, columns, rows }],  // columns como em toCSV
 *   autor?: { nome, cargo },               // vem do useExporter()
 * }
 */
export async function downloadPDF(opcoes) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const doc = new jsPDF({ orientation: opcoes.orientation ?? "portrait", unit: "pt", format: "a4" });

  const imagens = [];
  for (const el of opcoes.charts ?? []) imagens.push(await capturar(el));

  const tabelasPreparadas = (opcoes.tables ?? []).map((t) => ({
    titulo: t.title,
    cabecalho: t.columns.map((c) => c.label),
    linhas: t.rows.map((r) => t.columns.map((c) => valorCelula(c, r))),
  }));

  const template = PDF_TEMPLATES[PDF_TEMPLATE_ATIVO] ?? PDF_TEMPLATES.padrao;
  template({
    doc,
    autoTable,
    opcoes: { ...opcoes, tabelasPreparadas },
    imagens,
    contexto: { autor: opcoes.autor ?? { nome: "Administrador", cargo: "Administrador(a)" }, geradoEm: new Date() },
    tema: PDF_TEMA,
  });

  doc.save(`trocaticket-${slug(opcoes.title)}-${carimbo()}.pdf`);
}
