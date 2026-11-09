/*
 * "BANCO DE DADOS" MOCK DO PAINEL DO ADMINISTRADOR
 * ------------------------------------------------
 * Tudo que o painel /admin mostra hoje vem daqui. Quando o servidor existir,
 * estes dados deixam de ser usados: basta trocar as funções de
 * src/services/adminApi.js por chamadas fetch() reais (o formato dos objetos
 * abaixo é o contrato que a API precisa devolver).
 *
 * Os valores são fictícios e estáveis (nada aleatório) para que gráficos,
 * relatórios e PDFs sempre mostrem os mesmos números durante a demonstração.
 */

/** Data "de hoje" usada nos rótulos de prazo (ex.: "Vence amanhã") das cotações demo. */
export const DATA_REFERENCIA = "2026-11-04T12:00:00";

/* ------------------------------------------------------------------ */
/* Cadastros homologados (organizadores e fornecedores)               */
/* ------------------------------------------------------------------ */

export const cadastrosSeed = [
  { id: "c1", nome: "Alvorada Eventos", razao: "Alvorada Eventos Ltda", cnpj: "12.345.678/0001-90", tipo: "Organizador", categoria: "Corporativo", uf: "PR", cidade: "Curitiba", aprovadoEm: "2025-02-04", eventos: 14, status: "Ativo", responsavel: "Mariana Braga", email: "financeiro@alvoradaeventos.com.br" },
  { id: "c2", nome: "SomPro Áudio", razao: "SomPro Soluções em Áudio Ltda", cnpj: "45.678.901/0001-33", tipo: "Fornecedor", categoria: "Som & Iluminação", uf: "SP", cidade: "São Paulo", aprovadoEm: "2025-01-11", eventos: 22, status: "Ativo", responsavel: "Renato Lima", email: "contato@sompro.com.br" },
  { id: "c3", nome: "Sabor Real Buffet", razao: "Sabor Real Gastronomia ME", cnpj: "56.789.012/0001-44", tipo: "Fornecedor", categoria: "Alimentação", uf: "MG", cidade: "Belo Horizonte", aprovadoEm: "2025-04-09", eventos: 17, status: "Suspenso", responsavel: "Clara Mendes", email: "eventos@saborreal.com.br" },
  { id: "c4", nome: "Norte Eventos", razao: "Norte Feiras & Congressos SA", cnpj: "23.456.789/0001-11", tipo: "Organizador", categoria: "Feiras e Congressos", uf: "RS", cidade: "Porto Alegre", aprovadoEm: "2025-03-18", eventos: 9, status: "Ativo", responsavel: "Eduardo Prado", email: "adm@norteeventos.com.br" },
  { id: "c5", nome: "Estrutura Sul Montagens", razao: "Estrutura Sul Montagens Ltda", cnpj: "67.890.123/0001-55", tipo: "Fornecedor", categoria: "Estruturas", uf: "PR", cidade: "Londrina", aprovadoEm: "2025-08-02", eventos: 31, status: "Ativo", responsavel: "Paulo Teixeira", email: "orcamento@estruturasul.com.br" },
  { id: "c6", nome: "Guardião Segurança", razao: "Guardião Segurança Privada Ltda", cnpj: "78.901.234/0001-66", tipo: "Fornecedor", categoria: "Segurança", uf: "SP", cidade: "Campinas", aprovadoEm: "2025-09-15", eventos: 12, status: "Ativo", responsavel: "Sílvia Rocha", email: "comercial@guardiao.com.br" },
  { id: "c7", nome: "Aurora Cultural", razao: "Aurora Produções Culturais Ltda", cnpj: "11.222.333/0001-81", tipo: "Organizador", categoria: "Shows e Festivais", uf: "SP", cidade: "Santos", aprovadoEm: "2024-11-20", eventos: 19, status: "Ativo", responsavel: "Tiago Alves", email: "producao@auroracultural.com.br" },
  { id: "c8", nome: "Planalto Eventos", razao: "Planalto Eventos e Turismo Ltda", cnpj: "22.333.444/0001-72", tipo: "Organizador", categoria: "Corporativo", uf: "PR", cidade: "Curitiba", aprovadoEm: "2024-12-03", eventos: 11, status: "Ativo", responsavel: "Fernanda Luz", email: "contato@planaltoeventos.com.br" },
  { id: "c9", nome: "Pulso Eventos", razao: "Pulso Entretenimento Ltda", cnpj: "33.444.555/0001-63", tipo: "Organizador", categoria: "Gastronomia", uf: "MG", cidade: "Belo Horizonte", aprovadoEm: "2025-05-21", eventos: 6, status: "Ativo", responsavel: "Gustavo Reis", email: "ola@pulsoeventos.com.br" },
  { id: "c10", nome: "CulturaViva", razao: "Instituto CulturaViva", cnpj: "44.555.666/0001-54", tipo: "Organizador", categoria: "Beneficente", uf: "SP", cidade: "São Paulo", aprovadoEm: "2025-06-10", eventos: 4, status: "Ativo", responsavel: "Helena Duarte", email: "projetos@culturaviva.org.br" },
  { id: "c11", nome: "Norte RJ Produções", razao: "Norte RJ Entretenimento Ltda", cnpj: "55.666.777/0001-45", tipo: "Organizador", categoria: "Tecnologia", uf: "PE", cidade: "Recife", aprovadoEm: "2025-07-07", eventos: 5, status: "Ativo", responsavel: "Igor Nunes", email: "producao@nortenrj.com.br" },
  { id: "c12", nome: "Lume Produções", razao: "Lume Produções Artísticas Ltda", cnpj: "66.777.888/0001-36", tipo: "Organizador", categoria: "Shows e Festivais", uf: "RS", cidade: "Gramado", aprovadoEm: "2025-01-28", eventos: 8, status: "Suspenso", responsavel: "Júlia Campos", email: "contato@lumeproducoes.com.br" },
  { id: "c13", nome: "Rota Transportes", razao: "Rota Transportes & Logística Ltda", cnpj: "77.888.999/0001-27", tipo: "Fornecedor", categoria: "Transporte", uf: "SC", cidade: "Florianópolis", aprovadoEm: "2025-03-02", eventos: 19, status: "Ativo", responsavel: "Marcos Vieira", email: "frota@rotatransportes.com.br" },
  { id: "c14", nome: "Luz & Foco", razao: "Luz e Foco Iluminação Cênica Ltda", cnpj: "88.999.000/0001-18", tipo: "Fornecedor", categoria: "Som & Iluminação", uf: "PR", cidade: "Curitiba", aprovadoEm: "2025-02-17", eventos: 15, status: "Ativo", responsavel: "Natália Souza", email: "orcamentos@luzefoco.com.br" },
  { id: "c15", nome: "TotemPass Tech", razao: "TotemPass Tecnologia Ltda", cnpj: "99.000.111/0001-09", tipo: "Fornecedor", categoria: "Credenciamento", uf: "SP", cidade: "São Paulo", aprovadoEm: "2025-04-30", eventos: 27, status: "Ativo", responsavel: "Otávio Pires", email: "vendas@totempass.com.br" },
  { id: "c16", nome: "Palcos Brasil", razao: "Palcos Brasil Estruturas SA", cnpj: "10.111.222/0001-90", tipo: "Fornecedor", categoria: "Estruturas", uf: "SP", cidade: "Guarulhos", aprovadoEm: "2024-10-14", eventos: 24, status: "Ativo", responsavel: "Priscila Melo", email: "comercial@palcosbrasil.com.br" },
  { id: "c17", nome: "Grand Gourmet", razao: "Grand Gourmet Buffet Ltda", cnpj: "20.222.333/0001-81", tipo: "Fornecedor", categoria: "Alimentação", uf: "RJ", cidade: "Rio de Janeiro", aprovadoEm: "2025-05-05", eventos: 13, status: "Ativo", responsavel: "Rafael Costa", email: "eventos@grandgourmet.com.br" },
  { id: "c18", nome: "Vigilância Shield", razao: "Shield Vigilância Patrimonial Ltda", cnpj: "30.333.444/0001-72", tipo: "Fornecedor", categoria: "Segurança", uf: "PE", cidade: "Recife", aprovadoEm: "2025-06-22", eventos: 10, status: "Ativo", responsavel: "Sandra Lopes", email: "operacoes@shield.com.br" },
];

/* ------------------------------------------------------------------ */
/* Aprovações pendentes (fila de análise documental)                  */
/* ------------------------------------------------------------------ */

const checklistBase = (sobrescritas = {}) => [
  { id: "receita", titulo: "Consulta Receita Federal", descricao: "CNPJ ativo, situação cadastral regular sem restrições impeditivas.", status: sobrescritas.receita ?? "valido" },
  { id: "cnd", titulo: "Certidão Negativa de Débitos (CND)", descricao: "CND Federal e CNDT Trabalhista emitidas sem pendências fiscais em aberto.", status: sobrescritas.cnd ?? "valido" },
  { id: "contrato", titulo: "Contrato Social e Última Alteração", descricao: "Conferência do quadro societário (QSA) com documento do sócio administrador.", status: sobrescritas.contrato ?? "verificacao" },
  { id: "endereco", titulo: "Comprovante de Endereço Operacional", descricao: "Fatura recente (últimos 60 dias) correspondente à matriz.", status: sobrescritas.endereco ?? "valido" },
];

/*
 * DOCUMENTOS SUBMETIDOS = PLACEHOLDERS
 * Cada documento tem { id, nome, tamanho, info, url }. Hoje `url` é sempre
 * null (não existe arquivo de verdade) e a tela mostra uma pré-visualização
 * de exemplo. Quando o servidor guardar os arquivos, é só preencher `url`
 * (ou implementar src/services/adminDocumentos.js) — a tela já trata os dois casos.
 */
const doc = (idCadastro, n, nome, tamanho, info) => ({ id: `${idCadastro}-doc${n}`, nome, tamanho, info, url: null });

export const pendentesSeed = [
  {
    id: "TK-ORG-9042", nome: "Alvorada Eventos Ltda", fantasia: "Alvorada Live Experience Curitiba", cnpj: "12.345.678/0001-90", tipo: "Organizador", categoria: "Corporativo", porte: "EPP", uf: "PR", cidade: "Curitiba", submetidoEm: "2026-11-04T10:14:00", horasNaFila: 4, ie: "908.71234-55", responsavel: "Mariana Braga", telefone: "(41) 3244-8890", email: "financeiro@alvoradaeventos.com.br", cnae: "82.30-0-01 (Organização de feiras, congressos e festas)", endereco: "Av. Cândido de Abreu, 526 - Conj. 1402, Centro Cívico - Curitiba / PR",
    checklist: checklistBase(),
    documentos: [
      doc("TK-ORG-9042", 1, "Contrato_Social_Consolidado.pdf", "3,4 MB", "Pág. 1-12"),
      doc("TK-ORG-9042", 2, "Cartao_CNPJ_Emitido_Receita.pdf", "1,1 MB", "Autenticado"),
      doc("TK-ORG-9042", 3, "Comprovante_Sede_Endereco.pdf", "2,8 MB", "Venc. set/26"),
    ],
  },
  {
    id: "TK-FOR-3318", nome: "SomPro Soluções em Áudio", fantasia: "SomPro Sul", cnpj: "45.678.901/0002-14", tipo: "Fornecedor", categoria: "Som & Luz", porte: "ME", uf: "SP", cidade: "São Paulo", submetidoEm: "2026-11-04T02:40:00", horasNaFila: 12, ie: "114.556.120.118", responsavel: "Renato Lima", telefone: "(11) 3021-4455", email: "contato@sompro.com.br", cnae: "77.39-0-99 (Aluguel de equipamentos)", endereco: "R. Vergueiro, 1880 - Vila Mariana - São Paulo / SP",
    checklist: checklistBase({ contrato: "valido", endereco: "pendente" }),
    documentos: [
      doc("TK-FOR-3318", 1, "Contrato_Social_SomPro.pdf", "2,1 MB", "Pág. 1-8"),
      doc("TK-FOR-3318", 2, "CND_Federal_2026.pdf", "0,4 MB", "Válida até jan/27"),
    ],
  },
  {
    id: "TK-FOR-3321", nome: "Sabor Real Gastronomia", fantasia: "Sabor Real Buffet", cnpj: "56.789.012/0002-25", tipo: "Fornecedor", categoria: "Alimentação & Buffet", porte: "ME", uf: "MG", cidade: "Belo Horizonte", submetidoEm: "2026-11-03T20:55:00", horasNaFila: 18, ie: "062.334.556.0012", responsavel: "Clara Mendes", telefone: "(31) 3555-1200", email: "eventos@saborreal.com.br", cnae: "56.20-1-02 (Serviços de buffet)", endereco: "Av. do Contorno, 4120 - Funcionários - Belo Horizonte / MG",
    checklist: checklistBase({ cnd: "verificacao", contrato: "valido" }),
    documentos: [
      doc("TK-FOR-3321", 1, "Alvara_Sanitario_2026.pdf", "1,7 MB", "Protocolo 8812"),
      doc("TK-FOR-3321", 2, "Contrato_Social.pdf", "2,9 MB", "Pág. 1-10"),
      doc("TK-FOR-3321", 3, "CND_Federal.pdf", "0,3 MB", "Em renovação"),
    ],
  },
  {
    id: "TK-ORG-9047", nome: "Norte Feiras & Congressos", fantasia: "Norte Expo", cnpj: "23.456.789/0002-01", tipo: "Organizador", categoria: "Feiras & Expos", porte: "Médio", uf: "RS", cidade: "Porto Alegre", submetidoEm: "2026-11-03T12:30:00", horasNaFila: 26, ie: "096.221.334-0", responsavel: "Eduardo Prado", telefone: "(51) 3299-7788", email: "adm@norteeventos.com.br", cnae: "82.30-0-01 (Organização de feiras, congressos e festas)", endereco: "Av. Borges de Medeiros, 2105 - Praia de Belas - Porto Alegre / RS",
    checklist: checklistBase({ receita: "valido", cnd: "pendente", contrato: "verificacao", endereco: "verificacao" }),
    documentos: [
      doc("TK-ORG-9047", 1, "Contrato_Social_Norte.pdf", "4,2 MB", "Pág. 1-15"),
      doc("TK-ORG-9047", 2, "Procuracao_Socio.pdf", "0,8 MB", "Reconhecida"),
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Eventos + planejamento de custos                                   */
/* ------------------------------------------------------------------ */

const CATEGORIAS_PLANEJAMENTO = [
  { categoria: "Estrutura & palco", peso: 0.28 },
  { categoria: "Som & iluminação", peso: 0.18 },
  { categoria: "Alimentação", peso: 0.14 },
  { categoria: "Segurança", peso: 0.11 },
  { categoria: "Marketing", peso: 0.12 },
  { categoria: "Transporte", peso: 0.07 },
  { categoria: "Credenciamento", peso: 0.05 },
  { categoria: "Taxas & licenças", peso: 0.05 },
];

/** Quebra o orçamento por categoria de forma determinística (mesmos números a cada render). */
function planejar(previsto, realizado, semente) {
  const razao = previsto === 0 ? 0 : realizado / previsto;
  let restante = realizado;
  return CATEGORIAS_PLANEJAMENTO.map((c, i) => {
    const prev = Math.round(previsto * c.peso);
    const oscilacao = 1 + (((semente * (i + 3)) % 7) - 3) * 0.06;
    let real = Math.round(Math.min(prev * 1.15, prev * razao * oscilacao));
    if (i === CATEGORIAS_PLANEJAMENTO.length - 1) real = Math.max(0, restante);
    restante -= real;
    return { categoria: c.categoria, previsto: prev, realizado: Math.max(0, real) };
  });
}

const ev = (e, semente) => ({ ...e, planejamento: planejar(e.previsto, e.realizado, semente) });

export const STATUS_EVENTO = ["Em produção", "Em cotação", "Planejamento", "Concluído", "Suspenso"];

export const eventosSeed = [
  ev({ id: "festival-litoral-2026", nome: "Festival Litoral 2026", cidade: "Santos", uf: "SP", publico: 35000, status: "Em produção", organizador: "Aurora Cultural", data: "2026-03-18", previsto: 480000, realizado: 290000, ingressosVendidos: 24800, ingressosRevenda: 3120 }, 1),
  ev({ id: "congresso-tech-sul", nome: "Congresso Tech Sul", cidade: "Curitiba", uf: "PR", publico: 12000, status: "Em cotação", organizador: "Planalto Eventos", data: "2026-04-24", previsto: 320000, realizado: 180000, ingressosVendidos: 7400, ingressosRevenda: 860 }, 2),
  ev({ id: "feira-gastronomica", nome: "Feira Gastronômica", cidade: "Belo Horizonte", uf: "MG", publico: 8500, status: "Planejamento", organizador: "Pulso Eventos", data: "2026-05-05", previsto: 150000, realizado: 45000, ingressosVendidos: 2100, ingressosRevenda: 140 }, 3),
  ev({ id: "gala-beneficente-estrela", nome: "Gala Beneficente Estrela", cidade: "São Paulo", uf: "SP", publico: 3800, status: "Em cotação", organizador: "CulturaViva", data: "2026-06-19", previsto: 260000, realizado: 130000, ingressosVendidos: 2950, ingressosRevenda: 410 }, 4),
  ev({ id: "semana-de-inovacao", nome: "Semana de Inovação", cidade: "Recife", uf: "PE", publico: 16000, status: "Planejamento", organizador: "Norte RJ Produções", data: "2026-07-12", previsto: 240000, realizado: 110000, ingressosVendidos: 5200, ingressosRevenda: 380 }, 5),
  ev({ id: "encontro-de-liderancas", nome: "Encontro de Lideranças", cidade: "Brasília", uf: "DF", publico: 4000, status: "Concluído", organizador: "Aurora Cultural", data: "2026-01-15", previsto: 130000, realizado: 130000, ingressosVendidos: 4000, ingressosRevenda: 520 }, 6),
  ev({ id: "circuito-jazz-vinho", nome: "Circuito Jazz & Vinho", cidade: "Gramado", uf: "RS", publico: 5000, status: "Concluído", organizador: "Lume Produções", data: "2026-02-02", previsto: 70000, realizado: 70000, ingressosVendidos: 4870, ingressosRevenda: 690 }, 7),
  ev({ id: "expo-agro-nordeste", nome: "Expo Agro Nordeste", cidade: "Petrolina", uf: "PE", publico: 15000, status: "Suspenso", organizador: "Lume Produções", data: "2026-08-30", previsto: 210000, realizado: 90000, ingressosVendidos: 3300, ingressosRevenda: 95 }, 8),
];

/* ------------------------------------------------------------------ */
/* Cotações e propostas dos fornecedores                              */
/* ------------------------------------------------------------------ */

const p = (id, fornecedor, valor, prazoEntregaDias, notaTecnica, enviadaEm) => ({ id, fornecedor, valor, prazoEntregaDias, notaTecnica, enviadaEm });

export const SITUACOES_COTACAO = ["Aberta", "Vencendo", "Vencida", "Encerrada"];

export const cotacoesSeed = [
  { id: "CT-3081", servico: "Montagem de palco", categoria: "Estruturas", eventoId: "festival-litoral-2026", situacao: "Aberta", convidados: 6, prazo: "2026-11-09", propostas: [p("P1", "Palcos Brasil", 38500, 12, 92, "2026-10-28"), p("P2", "Estrutura Sul Montagens", 41200, 10, 94, "2026-10-29"), p("P3", "Arena Estruturas", 43900, 14, 81, "2026-10-30"), p("P4", "Mega Palcos", 44600, 9, 77, "2026-11-01")] },
  { id: "CT-3082", servico: "Iluminação e som", categoria: "Som & Iluminação", eventoId: "semana-de-inovacao", situacao: "Vencendo", convidados: 5, prazo: "2026-11-05", propostas: [p("P1", "Luz & Foco", 21200, 7, 89, "2026-10-25"), p("P2", "SomPro Áudio", 22100, 6, 88, "2026-10-26"), p("P3", "Audio Max", 24300, 8, 74, "2026-10-30")] },
  { id: "CT-3078", servico: "Buffet e serviço", categoria: "Alimentação", eventoId: "gala-beneficente-estrela", situacao: "Encerrada", convidados: 6, prazo: "2026-03-12", propostas: [p("P1", "Grand Gourmet", 54000, 5, 91, "2026-03-02"), p("P2", "Sabor Real Buffet", 57200, 5, 62, "2026-03-03"), p("P3", "Chef & Cia", 59800, 6, 80, "2026-03-04"), p("P4", "Banquete Real", 61000, 4, 76, "2026-03-06"), p("P5", "Mesa Posta", 65100, 7, 70, "2026-03-08")] },
  { id: "CT-3085", servico: "Transporte de equipe", categoria: "Transporte", eventoId: "congresso-tech-sul", situacao: "Vencendo", convidados: 5, prazo: "2026-11-06", propostas: [p("P1", "Vans & Transfer Sul", 14800, 3, 79, "2026-10-29"), p("P2", "Rota Transportes", 15600, 2, 74, "2026-10-31")] },
  { id: "CT-3088", servico: "Credenciamento digital", categoria: "Credenciamento", eventoId: "feira-gastronomica", situacao: "Aberta", convidados: 4, prazo: "2026-11-08", propostas: [p("P1", "TotemPass Tech", 9600, 4, 90, "2026-10-30"), p("P2", "CredFácil", 10100, 5, 72, "2026-10-31"), p("P3", "Acesso Já", 11300, 6, 68, "2026-11-02")] },
  { id: "CT-3079", servico: "Segurança e brigada", categoria: "Segurança", eventoId: "semana-de-inovacao", situacao: "Vencida", convidados: 6, prazo: "2026-11-03", propostas: [p("P1", "Vigilância Shield", 16900, 2, 83, "2026-10-22"), p("P2", "Guardião Segurança", 17400, 2, 81, "2026-10-24"), p("P3", "Força Alerta", 18200, 3, 66, "2026-10-26")] },
  { id: "CT-3091", servico: "Tendas e estruturas", categoria: "Estruturas", eventoId: "circuito-jazz-vinho", situacao: "Aberta", convidados: 6, prazo: "2026-11-10", propostas: [p("P1", "Tendas Brasil Sul", 27400, 8, 85, "2026-11-01"), p("P2", "Estrutura Sul Montagens", 28900, 7, 94, "2026-11-02")] },
  { id: "CT-3093", servico: "Marketing digital", categoria: "Marketing", eventoId: "festival-litoral-2026", situacao: "Aberta", convidados: 5, prazo: "2026-11-12", propostas: [p("P1", "Agência Onda", 32000, 20, 87, "2026-10-31"), p("P2", "Clique Mídia", 34500, 18, 82, "2026-11-01"), p("P3", "Hype Studio", 36800, 15, 79, "2026-11-02"), p("P4", "Viral Co.", 39000, 21, 71, "2026-11-03")] },
  { id: "CT-3074", servico: "Gerador e energia", categoria: "Estruturas", eventoId: "encontro-de-liderancas", situacao: "Encerrada", convidados: 4, prazo: "2026-01-05", propostas: [p("P1", "Energia Já", 12400, 2, 88, "2025-12-20"), p("P2", "PowerGen", 13100, 2, 84, "2025-12-21"), p("P3", "Volt Eventos", 14000, 3, 75, "2025-12-22")] },
  { id: "CT-3076", servico: "Bar e bebidas", categoria: "Alimentação", eventoId: "circuito-jazz-vinho", situacao: "Encerrada", convidados: 5, prazo: "2026-01-20", propostas: [p("P1", "Adega Serrana", 18900, 3, 90, "2026-01-10"), p("P2", "Bar Móvel RS", 19700, 4, 82, "2026-01-11"), p("P3", "Drinks & Co", 21300, 3, 77, "2026-01-12")] },
];

/* ------------------------------------------------------------------ */
/* Séries históricas do dashboard                                     */
/* ------------------------------------------------------------------ */

export const seriePorPeriodoSeed = {
  "30d": [
    { periodo: "Sem 1", previsto: 118000, realizado: 96000, eventos: 2, gmv: 512000 },
    { periodo: "Sem 2", previsto: 142000, realizado: 121000, eventos: 3, gmv: 588000 },
    { periodo: "Sem 3", previsto: 131000, realizado: 125000, eventos: 2, gmv: 604000 },
    { periodo: "Sem 4", previsto: 166000, realizado: 139000, eventos: 4, gmv: 637850 },
  ],
  trimestre: [
    { periodo: "Ago", previsto: 410000, realizado: 352000, eventos: 9, gmv: 1980000 },
    { periodo: "Set", previsto: 455000, realizado: 401000, eventos: 11, gmv: 2120000 },
    { periodo: "Out", previsto: 520000, realizado: 448000, eventos: 13, gmv: 2341850 },
  ],
  ano: [
    { periodo: "Jan", previsto: 210000, realizado: 200000, eventos: 4, gmv: 860000 },
    { periodo: "Fev", previsto: 190000, realizado: 182000, eventos: 4, gmv: 910000 },
    { periodo: "Mar", previsto: 260000, realizado: 231000, eventos: 6, gmv: 1120000 },
    { periodo: "Abr", previsto: 280000, realizado: 240000, eventos: 6, gmv: 1240000 },
    { periodo: "Mai", previsto: 240000, realizado: 228000, eventos: 7, gmv: 1310000 },
    { periodo: "Jun", previsto: 310000, realizado: 285000, eventos: 9, gmv: 1490000 },
    { periodo: "Jul", previsto: 295000, realizado: 262000, eventos: 8, gmv: 1560000 },
    { periodo: "Ago", previsto: 410000, realizado: 352000, eventos: 9, gmv: 1980000 },
    { periodo: "Set", previsto: 455000, realizado: 401000, eventos: 11, gmv: 2120000 },
    { periodo: "Out", previsto: 520000, realizado: 448000, eventos: 13, gmv: 2341850 },
  ],
};

/** Aprovados × rejeitados por mês (série usada no relatório de decisões). */
export const decisoesMensaisSeed = [
  { mes: "Mai", aprovados: 31, rejeitados: 7 },
  { mes: "Jun", aprovados: 37, rejeitados: 5 },
  { mes: "Jul", aprovados: 26, rejeitados: 7 },
  { mes: "Ago", aprovados: 42, rejeitados: 4 },
  { mes: "Set", aprovados: 45, rejeitados: 8 },
  { mes: "Out", aprovados: 50, rejeitados: 6 },
];

/* ------------------------------------------------------------------ */
/* Auditoria (log de ações do administrador)                          */
/* ------------------------------------------------------------------ */

export const auditoriaSeed = [
  { id: "a1", data: "2026-11-04T09:12:00", entidade: "Cotação", acao: "Prazo estendido", alvo: "CT-3082 · Iluminação e som", justificativa: "Fornecedor solicitou 24h para revisão técnica.", autor: "Mariana Costa" },
  { id: "a2", data: "2026-11-03T16:40:00", entidade: "Evento", acao: "Suspensão", alvo: "Expo Agro Nordeste", justificativa: "Pendência de alvará municipal de Petrolina.", autor: "Rodrigo Faria" },
  { id: "a3", data: "2026-10-30T11:20:00", entidade: "Cadastro", acao: "Atualização", alvo: "Norte Eventos", justificativa: "Troca de responsável legal no contrato social autenticado.", autor: "Mariana Costa" },
  { id: "a4", data: "2026-10-28T14:32:00", entidade: "Cadastro", acao: "Suspensão", alvo: "Sabor Real Buffet", justificativa: "Não conformidade com o alvará sanitário protocolado para evento em BH.", autor: "Mariana Costa" },
  { id: "a5", data: "2026-10-22T09:15:00", entidade: "Cadastro", acao: "Revisão de ART", alvo: "Estrutura Sul Montagens", justificativa: "Homologação de novos laudos técnicos de engenharia mecânica.", autor: "Rodrigo Faria" },
  { id: "a6", data: "2026-10-18T10:05:00", entidade: "Aprovação", acao: "Aprovado", alvo: "Vigilância Shield", justificativa: "Documentação completa e checklist validado.", autor: "Mariana Costa" },
  { id: "a7", data: "2026-10-12T17:48:00", entidade: "Aprovação", acao: "Rejeitado", alvo: "Fogos & Festa ME", justificativa: "Certidão negativa vencida. Solicitada nova emissão.", autor: "Rodrigo Faria" },
  { id: "a8", data: "2026-10-05T08:30:00", entidade: "Cadastro", acao: "Suspensão", alvo: "Lume Produções", justificativa: "Inadimplência com fornecedores no evento Circuito Jazz & Vinho.", autor: "Mariana Costa" },
];
