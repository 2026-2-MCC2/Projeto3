/*
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  TEMPLATE DO PDF — É AQUI QUE VOCÊ MUDA O VISUAL DOS RELATÓRIOS      ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Todo PDF gerado pelo painel (botão "Exportar → PDF" de qualquer tela ou
 * gráfico) passa por este arquivo. A lógica de gerar o arquivo fica em
 * export.js; aqui só existe o DESENHO da página. Você pode personalizar em
 * 3 níveis, do mais simples ao mais livre:
 *
 *  1) AJUSTAR O TEMA  → edite o objeto PDF_TEMA logo abaixo (cores, margens,
 *     textos do cabeçalho/rodapé, logo, imagem de fundo/papel timbrado).
 *
 *  2) MUDAR O LAYOUT  → edite as funções desenhar*() do template padrão
 *     (cabeçalho, título, cartões de resumo, gráfico, tabela, rodapé).
 *
 *  3) TROCAR POR OUTRO TEMPLATE → crie uma função com a mesma assinatura de
 *     `renderizarPadrao` (ou um arquivo novo), coloque-a em PDF_TEMPLATES e
 *     aponte PDF_TEMPLATE_ATIVO para ela. As telas não precisam mudar.
 *
 * O que cada template recebe (objeto único):
 *   doc        instância do jsPDF (https://github.com/parallax/jsPDF)
 *   autoTable  função do jspdf-autotable para desenhar tabelas
 *   opcoes     { title, subtitle, summary: [{label,value}], orientation,
 *                tabelasPreparadas: [{ titulo, cabecalho: [..], linhas: [[..]] }] }
 *              (as tabelas já chegam formatadas como texto, prontas para desenhar)
 *   imagens    gráficos já capturados da tela: [{ dataUrl, width, height }]
 *   contexto   { autor: {nome, cargo}, geradoEm: Date }
 *   tema       o PDF_TEMA (permite sobrescrever por relatório, se quiser)
 *
 * Dica: para usar uma folha de papel timbrado desenhada no Figma/Canva, exporte-a
 * como PNG/JPG do tamanho A4 e informe em PDF_TEMA.fundoPagina.
 */

/* ------------------------------------------------------------------ */
/* 1) TEMA — cores, medidas e textos                                   */
/* ------------------------------------------------------------------ */

export const PDF_TEMA = {
  /** Cores em RGB [r, g, b]. */
  cores: {
    primaria: [23, 50, 92], // faixa do cabeçalho e cabeçalho das tabelas
    destaque: [56, 160, 235], // filete abaixo do cabeçalho
    texto: [30, 38, 60],
    suave: [110, 120, 140], // textos secundários e rodapé
    borda: [220, 226, 236],
    fundoCartao: [246, 248, 252], // cartões de resumo e linhas alternadas
    sobrePrimaria: [255, 255, 255], // texto sobre a faixa do cabeçalho
  },
  fonte: "helvetica", // helvetica | times | courier (fontes padrão do PDF)
  /** Margem em pontos (1 pt ≈ 0,35 mm). A4 retrato = 595 × 842 pt. */
  margem: 40,
  cabecalho: {
    altura: 64,
    filete: 3,
    titulo: "TrocaTicket",
    subtitulo: "Painel administrativo · Relatório gerencial",
    /**
     * LOGO: coloque aqui uma imagem em base64 para aparecer no cabeçalho, ex.:
     *   logo: { dataUrl: "data:image/png;base64,....", largura: 90, altura: 28 }
     * (null = sem logo, usa só o texto acima)
     */
    logo: null,
  },
  rodape: {
    texto: "Documento gerado pelo painel TrocaTicket · uso interno",
  },
  /**
   * IMAGEM DE FUNDO / PAPEL TIMBRADO (opcional). Desenhada atrás de TODAS as páginas.
   *   fundoPagina: { dataUrl: "data:image/png;base64,....", formato: "PNG" }
   * Se usar fundo, considere desligar a faixa do cabeçalho em desenharCabecalho().
   */
  fundoPagina: null,
  tabela: {
    tamanhoFonte: 8.5,
    espacamentoCelula: 5,
  },
};

/* ------------------------------------------------------------------ */
/* 2) TEMPLATE PADRÃO — funções de desenho                             */
/* ------------------------------------------------------------------ */

function medidas(doc, tema) {
  return {
    W: doc.internal.pageSize.getWidth(),
    H: doc.internal.pageSize.getHeight(),
    M: tema.margem,
  };
}

/** Desenha a imagem de fundo na página atual (uma vez por página). */
function pintarFundo(doc, tema, paginasPintadas) {
  if (!tema.fundoPagina) return;
  const n = doc.internal.getCurrentPageInfo().pageNumber;
  if (paginasPintadas.has(n)) return;
  paginasPintadas.add(n);
  const { W, H } = medidas(doc, tema);
  doc.addImage(tema.fundoPagina.dataUrl, tema.fundoPagina.formato ?? "PNG", 0, 0, W, H);
}

function desenharCabecalho({ doc, tema, contexto }) {
  const { W, M } = medidas(doc, tema);
  const c = tema.cores;
  const cab = tema.cabecalho;

  doc.setFillColor(...c.primaria);
  doc.rect(0, 0, W, cab.altura, "F");
  doc.setFillColor(...c.destaque);
  doc.rect(0, cab.altura, W, cab.filete, "F");

  doc.setTextColor(...c.sobrePrimaria);
  doc.setFont(tema.fonte, "bold");
  doc.setFontSize(14);
  if (cab.logo) {
    doc.addImage(cab.logo.dataUrl, "PNG", M, 18, cab.logo.largura, cab.logo.altura);
  } else {
    doc.text(cab.titulo, M, 30);
  }
  doc.setFont(tema.fonte, "normal");
  doc.setFontSize(9);
  doc.text(cab.subtitulo, M, 46);
  doc.text(`Gerado em ${contexto.geradoEm.toLocaleString("pt-BR")}`, W - M, 30, { align: "right" });
  doc.text(`${contexto.autor.nome} · ${contexto.autor.cargo}`, W - M, 46, { align: "right" });
}

/** Título + subtítulo do relatório. Devolve o novo `y` (posição vertical). */
function desenharTitulo({ doc, tema, opcoes }, y) {
  const { W, M } = medidas(doc, tema);
  const c = tema.cores;
  doc.setTextColor(...c.texto);
  doc.setFont(tema.fonte, "bold");
  doc.setFontSize(18);
  doc.text(opcoes.title, M, y);
  y += 18;
  if (opcoes.subtitle) {
    doc.setFont(tema.fonte, "normal");
    doc.setFontSize(10);
    doc.setTextColor(...c.suave);
    const linhas = doc.splitTextToSize(opcoes.subtitle, W - M * 2);
    doc.text(linhas, M, y);
    y += linhas.length * 12 + 6;
  }
  return y;
}

/** Cartões de indicadores (até 4 por linha). */
function desenharResumo({ doc, tema, opcoes }, y) {
  if (!opcoes.summary?.length) return y;
  const { W, M } = medidas(doc, tema);
  const c = tema.cores;
  const colunas = Math.min(4, opcoes.summary.length);
  const vao = 10;
  const largura = (W - M * 2 - vao * (colunas - 1)) / colunas;

  opcoes.summary.forEach((item, i) => {
    const x = M + (i % colunas) * (largura + vao);
    const topo = y + Math.floor(i / colunas) * 58;
    doc.setDrawColor(...c.borda);
    doc.setFillColor(...c.fundoCartao);
    doc.roundedRect(x, topo, largura, 50, 6, 6, "FD");
    doc.setFontSize(7.5);
    doc.setFont(tema.fonte, "normal");
    doc.setTextColor(...c.suave);
    doc.text(item.label.toUpperCase(), x + 10, topo + 17);
    doc.setFontSize(13);
    doc.setFont(tema.fonte, "bold");
    doc.setTextColor(...c.texto);
    doc.text(item.value, x + 10, topo + 37);
  });
  doc.setFont(tema.fonte, "normal");
  return y + Math.ceil(opcoes.summary.length / colunas) * 58 + 10;
}

/** Gráfico capturado da tela (imagem). Quebra de página automática. */
function desenharGrafico({ doc, tema, novaPagina }, imagem, y) {
  const { W, H, M } = medidas(doc, tema);
  const larguraMax = W - M * 2;
  let w = larguraMax;
  let h = imagem.height * (larguraMax / imagem.width);
  const alturaMax = H * 0.55;
  if (h > alturaMax) {
    w *= alturaMax / h;
    h = alturaMax;
  }
  if (y + h > H - M) {
    novaPagina();
    y = M;
  }
  doc.addImage(imagem.dataUrl, "PNG", M, y, w, h);
  return y + h + 16;
}

/** Tabela de dados (jspdf-autotable). Os valores já chegam formatados como texto. */
function desenharTabela({ doc, autoTable, tema, novaPagina, paginasPintadas }, tabela, y) {
  const { H, M } = medidas(doc, tema);
  const c = tema.cores;
  if (y > H - 120) {
    novaPagina();
    y = M;
  }
  if (tabela.titulo) {
    doc.setFont(tema.fonte, "bold");
    doc.setFontSize(11);
    doc.setTextColor(...c.texto);
    doc.text(tabela.titulo, M, y);
    y += 8;
  }
  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M, top: M },
    head: [tabela.cabecalho],
    body: tabela.linhas,
    styles: { font: tema.fonte, fontSize: tema.tabela.tamanhoFonte, cellPadding: tema.tabela.espacamentoCelula, textColor: c.texto },
    headStyles: { fillColor: c.primaria, textColor: c.sobrePrimaria, fontStyle: "bold" },
    alternateRowStyles: { fillColor: c.fundoCartao },
    willDrawPage: () => pintarFundo(doc, tema, paginasPintadas),
  });
  return (doc.lastAutoTable?.finalY ?? y) + 24;
}

function desenharRodape({ doc, tema }) {
  const { W, H, M } = medidas(doc, tema);
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFont(tema.fonte, "normal");
    doc.setFontSize(8);
    doc.setTextColor(...tema.cores.suave);
    doc.text(tema.rodape.texto, M, H - 20);
    doc.text(`${i} / ${total}`, W - M, H - 20, { align: "right" });
  }
}

/** Template padrão: monta o documento inteiro na ordem cabeçalho → título → resumo → gráficos → tabelas → rodapé. */
export function renderizarPadrao({ doc, autoTable, opcoes, imagens, contexto, tema = PDF_TEMA }) {
  const paginasPintadas = new Set();
  const novaPagina = () => {
    doc.addPage();
    pintarFundo(doc, tema, paginasPintadas);
  };
  const ctx = { doc, autoTable, opcoes, contexto, tema, novaPagina, paginasPintadas };

  pintarFundo(doc, tema, paginasPintadas);
  desenharCabecalho(ctx);

  let y = 100;
  y = desenharTitulo(ctx, y);
  y = desenharResumo(ctx, y);
  for (const imagem of imagens) y = desenharGrafico(ctx, imagem, y);
  for (const tabela of opcoes.tabelasPreparadas) y = desenharTabela(ctx, tabela, y);

  desenharRodape(ctx);
}

/* ------------------------------------------------------------------ */
/* 3) REGISTRO DE TEMPLATES                                            */
/* ------------------------------------------------------------------ */

/**
 * Para criar o seu template: escreva uma função `renderizarMeuTemplate({ doc,
 * autoTable, opcoes, imagens, contexto, tema })`, adicione abaixo e mude
 * PDF_TEMPLATE_ATIVO para o nome escolhido.
 */
export const PDF_TEMPLATES = {
  padrao: renderizarPadrao,
  // meu: renderizarMeuTemplate,
};

export const PDF_TEMPLATE_ATIVO = "padrao";
