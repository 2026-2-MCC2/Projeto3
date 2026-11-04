const STORAGE_KEY = "trocaticket:eventos";

const usuarioPadrao = {
  id: "usuario-demo",
  perfil: "organizador",
  nome: "Orlando Ramos",
  iniciais: "OR",
  plano: "Produtor Pro",
  email: "",
  telefone: "",
  documento: "",
  tipoDocumento: "cpf",
  areaAtuacao: "",
  tipoOrganizacao: "",
  anexo: null,
  status: "aprovado",
  aceiteTermosEm: "",
  criadoEm: "",
};

const eventosIniciais = [
  {
    id: "calourada-fecap-2026",
    nome: "Calourada FECAP 2026",
    categoria: "Festa universitária",
    descricao: "",
    capa: "",
    dataInicio: "2026-11-21",
    dataFim: "",
    local: { nome: "Espaço Liberdade", cidade: "São Paulo", uf: "SP" },
    capacidadeAlvara: 8500,
    publico: { minimo: 3000, maximo: 8500 },
    custos: {
      fornecedores: [
        {
          id: "custo-som-001",
          categoriaId: "som",
          grupoGrafico: "som",
          titulo: "Sistema Line Array K2 + Rider Técnico de Palco",
          qtd: "1 sistema completo",
          especificacao: "PA L-Acoustics K2 com subs KS28, consoles digitais Avid S6L, monitores de palco e microfonação técnica.",
          valor: 80000,
          tags: ["RF06"],
          alocacao: "direta",
        },
        {
          id: "custo-palco-001",
          categoriaId: "palco",
          grupoGrafico: "palco",
          titulo: "Palco Geodésico 24×18m com Cobertura Cristal & House Mix",
          qtd: "1 estrutura modular",
          especificacao: "Estrutura em alumínio Q30/Q50, piso naval com acabamento antiderrapante, torres de delay e laudo ART de montagem.",
          valor: 62500,
          tags: ["RF12"],
          alocacao: "direta",
        },
        {
          id: "custo-seguranca-001",
          categoriaId: "seguranca",
          grupoGrafico: "seguranca",
          titulo: "Contingente de 65 Vigilantes Patrimoniais + 12 Bombeiros Civis",
          qtd: "77 profissionais (turno 12h)",
          especificacao: "Escala de segurança interna/perimetral homologada pela Polícia Federal e brigada com plano de evacuação médica.",
          valor: 25500,
          tags: [],
          alocacao: "direta",
        },
        {
          id: "custo-limpeza-001",
          categoriaId: "limpeza",
          grupoGrafico: "seguranca",
          titulo: "40 Cabines Químicas Standard + 4 Cabines PCD + Coleta Seletiva",
          qtd: "44 cabines + equipe pós-evento",
          especificacao: "Manutenção contínua e higienização durante o evento, caminhão limpa-fossa e descarte certificado de resíduos.",
          valor: 20000,
          tags: ["Sustentável"],
          alocacao: "direta",
        },
      ],
      fiscais: [
        {
          id: "fiscal-ecad-001",
          categoriaId: "ecad",
          grupoGrafico: "fiscais",
          origem: "Alíquota padrão sobre bilheteria bruta",
          titulo: "ECAD Show Musical ao Vivo (Provisão 10%)",
          observacao: "Calculado dinamicamente com base no teto de arrecadação",
          calculo: { tipo: "percentual", taxa: 0.1, base: 380000 },
          valor: 38000,
        },
        {
          id: "fiscal-iss-001",
          categoriaId: "municipal",
          grupoGrafico: "fiscais",
          origem: "Prefeitura Municipal de São Paulo",
          titulo: "ISSQN sobre Ingressos e Serviços Culturais (5%)",
          observacao: "Guia de recolhimento emitida pós-evento com retenção",
          calculo: { tipo: "percentual", taxa: 0.05, base: 264000 },
          valor: 13200,
        },
        {
          id: "fiscal-gateway-001",
          categoriaId: "gateway",
          grupoGrafico: "variaveis",
          origem: "Tarifa negociada",
          titulo: "Taxa de Meios de Pagamento (PIX & Cartão Parcelado)",
          observacao: "Estimativa de mix 60% PIX (0,99%) e 40% Crédito (3,4%)",
          calculo: { tipo: "taxa_media", taxa: 0.024 },
          valor: 18500,
        },
        {
          id: "fiscal-operacao-001",
          categoriaId: "operacao",
          grupoGrafico: "variaveis",
          origem: "Fundo de segurança",
          titulo: "UTI Móvel + Grupo Gerador Reserva + Reserva Técnica",
          observacao: "Exigência do Corpo de Bombeiros Militar para lotação máxima",
          calculo: { tipo: "fixo" },
          valor: 26800,
        },
      ],
      propostasAceitas: [{ fornecedorId: "fornecedor-calourada", valor: 32787 }],
    },
    precificacao: { margem: 0.10088621817515, taxaPlataforma: 0.08, impostos: 0.05 },
    status: "planejamento",
    etapaAtual: "resumo",
    propostas: Array.from({ length: 3 }, (_, indice) => ({
      fornecedorId: `calourada-${indice}`,
      status: "em_analise",
    })),
  },
  {
    id: "sunset-engenharia",
    nome: "Sunset Engenharia",
    categoria: "Festa universitária",
    descricao: "",
    capa: "",
    dataInicio: "2026-12-12",
    dataFim: "",
    local: { nome: "Rooftop Paulista", cidade: "São Paulo", uf: "SP" },
    capacidadeAlvara: 300,
    publico: { minimo: 79, maximo: 279 },
    custos: {
      fornecedores: [{ fornecedorId: "fornecedor-sunset", valor: 13505 }],
      fiscais: 0,
      propostasAceitas: [{ fornecedorId: "fornecedor-sunset", valor: 5942.2 }],
    },
    precificacao: { margem: 0.09774064369407, taxaPlataforma: 0.08, impostos: 0.05 },
    status: "planejamento",
    etapaAtual: "calculo",
    propostas: [],
  },
  {
    id: "festival-primavera-universitaria",
    nome: "Festival Primavera Universitária",
    categoria: "Festival",
    descricao: "",
    capa: "",
    dataInicio: "2026-10-18",
    dataFim: "",
    local: { nome: "Arena Anhembi", cidade: "São Paulo", uf: "SP" },
    capacidadeAlvara: 1500,
    publico: { minimo: 1031, maximo: 1231 },
    custos: {
      fornecedores: [{ fornecedorId: "fornecedor-primavera", valor: 189500 }],
      fiscais: 0,
      propostasAceitas: [{ fornecedorId: "fornecedor-primavera", valor: 164865 }],
    },
    precificacao: { margem: 0.10005994218158, taxaPlataforma: 0.08, impostos: 0.05 },
    status: "planejamento",
    etapaAtual: "resumo",
    propostas: Array.from({ length: 5 }, (_, indice) => ({
      fornecedorId: `primavera-${indice}`,
      status: "em_analise",
    })),
  },
];

const gruposPorCategoria = {
  som: "som",
  palco: "palco",
  seguranca: "seguranca",
  limpeza: "seguranca",
  alimentacao: "variaveis",
  transporte: "variaveis",
  outro: "variaveis",
  ecad: "fiscais",
  municipal: "fiscais",
  gateway: "variaveis",
  operacao: "variaveis",
};

function normalizarEvento(evento) {
  const custos = evento.custos ?? {};
  const fornecedores = Array.isArray(custos.fornecedores) ? custos.fornecedores : [];
  const fiscais = Array.isArray(custos.fiscais)
    ? custos.fiscais
    : Number(custos.fiscais) > 0
      ? [{
          id: "fiscal-legado",
          categoriaId: "outro",
          grupoGrafico: "fiscais",
          origem: "Custo fiscal legado",
          titulo: "Custos fiscais e operacionais",
          observacao: "Migrado do orçamento anterior",
          calculo: { tipo: "fixo" },
          valor: Number(custos.fiscais),
        }]
      : [];

  return {
    ...evento,
    custos: {
      ...custos,
      fornecedores: fornecedores.map((item, indice) => {
        const categoriaId = item.categoriaId ?? item.categoryId ?? "outro";
        return {
          ...item,
          id: item.id ?? item.itemId ?? item.fornecedorId ?? `producao-${indice}`,
          categoriaId,
          grupoGrafico: item.grupoGrafico ?? gruposPorCategoria[categoriaId] ?? "",
          titulo: item.titulo ?? item.title ?? "Custo de fornecedor cadastrado",
          qtd: item.qtd ?? item.quantity ?? "Item de fornecedor",
          especificacao: item.especificacao ?? item.specification ?? "",
          valor: Number(item.valor) || 0,
          tags: Array.isArray(item.tags) ? item.tags : [],
          alocacao: item.alocacao ?? "direta",
        };
      }),
      fiscais: fiscais.map((item, indice) => ({
        ...item,
        id: item.id ?? `fiscal-${indice}`,
        categoriaId: item.categoriaId ?? "outro",
        grupoGrafico: item.grupoGrafico ?? "",
        origem: item.origem ?? "Custo fiscal",
        titulo: item.titulo ?? item.title ?? "Custo fiscal e operacional",
        observacao: item.observacao ?? item.specification ?? "",
        calculo: item.calculo ?? { tipo: "fixo" },
        valor: Number(item.valor) || 0,
      })),
      propostasAceitas: Array.isArray(custos.propostasAceitas) ? custos.propostasAceitas : [],
    },
  };
}

function criarStoreInicial() {
  return {
    usuario: usuarioPadrao,
    usuarios: [],
    eventos: eventosIniciais.map(normalizarEvento),
    eventoAtivoId: eventosIniciais[0].id,
    notificacoes: { fornecedores: 1, mensagens: 2 },
  };
}

function lerStore() {
  const salvo = localStorage.getItem(STORAGE_KEY);
  if (!salvo) {
    const inicial = criarStoreInicial();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inicial));
    return inicial;
  }

  try {
    const storeSalvo = JSON.parse(salvo);
    if (!storeSalvo || !Array.isArray(storeSalvo.eventos)) {
      throw new TypeError("O formato armazenado de eventos é inválido.");
    }
    return {
      ...criarStoreInicial(),
      ...storeSalvo,
      eventos: storeSalvo.eventos.map(normalizarEvento),
      usuario: { ...usuarioPadrao, ...storeSalvo.usuario },
      usuarios: Array.isArray(storeSalvo.usuarios) ? storeSalvo.usuarios : [],
    };
  } catch (erro) {
    console.error("Não foi possível carregar os eventos salvos do TrocaTicket.", erro);
    const inicial = criarStoreInicial();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inicial));
    return inicial;
  }
}

let store = lerStore();
const listeners = new Set();

function notificar() {
  listeners.forEach((listener) => listener());
}

function persistir(proximoStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(proximoStore));
  store = proximoStore;
  notificar();
}

export function listarEventos() {
  return store.eventos;
}

export function getEvento(id) {
  return store.eventos.find((evento) => evento.id === id) ?? null;
}

export function setEvento(id, parcial) {
  const indice = store.eventos.findIndex((evento) => evento.id === id);
  if (indice === -1) throw new Error(`Evento "${id}" não encontrado.`);

  const eventoAtualizado = Object.entries(parcial).reduce(
    (evento, [chave, valor]) => ({
      ...evento,
      [chave]:
        valor && typeof valor === "object" && !Array.isArray(valor)
          ? { ...evento[chave], ...valor }
          : valor,
    }),
    store.eventos[indice],
  );
  const eventos = [...store.eventos];
  eventos[indice] = eventoAtualizado;
  persistir({ ...store, eventos });
  return eventoAtualizado;
}

export function setEventoAtivo(id) {
  if (!getEvento(id)) throw new Error(`Evento "${id}" não encontrado.`);
  persistir({ ...store, eventoAtivoId: id });
}

export function cadastrarUsuario(dados) {
  const email = dados.email.trim().toLowerCase();
  const documento = dados.documento.replace(/\D/g, "");
  const duplicado = store.usuarios.some(
    (usuario) => (usuario.email ?? "").toLowerCase() === email || usuario.documento === documento,
  );
  if (duplicado) {
    throw new Error(
      store.usuarios.some((usuario) => (usuario.email ?? "").toLowerCase() === email)
        ? "Este e-mail já está cadastrado."
        : "Este CPF ou CNPJ já está cadastrado.",
    );
  }

  const palavrasNome = dados.nome.trim().split(/\s+/);
  const iniciais = palavrasNome.slice(0, 2).map((palavra) => palavra[0]).join("").toUpperCase();
  const agora = new Date().toISOString();
  const usuario = {
    id: globalThis.crypto?.randomUUID?.() ?? `usuario-${Date.now()}`,
    perfil: dados.perfil,
    nome: dados.nome.trim(),
    iniciais,
    plano: dados.perfil === "organizador" ? "Produtor Pro" : "Fornecedor",
    email,
    telefone: dados.telefone.replace(/\D/g, ""),
    documento,
    tipoDocumento: documento.length === 11 ? "cpf" : "cnpj",
    areaAtuacao: dados.perfil === "fornecedor" ? dados.area : "",
    tipoOrganizacao: dados.perfil === "organizador" ? dados.area : "",
    anexo: dados.arquivo
      ? { nome: dados.arquivo.name, tipo: dados.arquivo.type, tamanho: dados.arquivo.size }
      : null,
    status: "em_analise",
    aceiteTermosEm: agora,
    criadoEm: agora,
  };
  persistir({ ...store, usuario, usuarios: [...store.usuarios, usuario] });
  return usuario;
}

export function criarEvento(dados = {}) {
  const id = globalThis.crypto?.randomUUID?.() ?? `evento-${Date.now()}`;
  const {
    local,
    publico,
    custos,
    precificacao,
    ...campos
  } = dados;
  const evento = {
    id,
    nome: "",
    categoria: "",
    descricao: "",
    capa: "",
    dataInicio: "",
    dataFim: "",
    capacidadeAlvara: 0,
    status: "planejamento",
    etapaAtual: "cadastro",
    propostas: [],
    ...campos,
    local: { nome: "", cidade: "", uf: "", ...local },
    publico: { minimo: 0, maximo: 0, ...publico },
    custos: {
      fornecedores: [],
      fiscais: [],
      propostasAceitas: [],
      ...custos,
    },
    precificacao: {
      margem: 0.2,
      taxaPlataforma: 0.08,
      impostos: 0.05,
      ...precificacao,
    },
  };
  const proximoStore = {
    ...store,
    eventos: [...store.eventos, evento],
    eventoAtivoId: id,
  };
  persistir(proximoStore);
  return evento;
}

export function subscribe(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function getStoreSnapshot() {
  return store;
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (evento) => {
    if (evento.key !== STORAGE_KEY || !evento.newValue) return;
    try {
      const storeExterno = JSON.parse(evento.newValue);
      if (!Array.isArray(storeExterno.eventos)) {
        throw new TypeError("O formato sincronizado de eventos é inválido.");
      }
      store = {
        ...criarStoreInicial(),
        ...storeExterno,
        eventos: storeExterno.eventos.map(normalizarEvento),
        usuario: { ...usuarioPadrao, ...storeExterno.usuario },
        usuarios: Array.isArray(storeExterno.usuarios) ? storeExterno.usuarios : [],
      };
      notificar();
    } catch (erro) {
      console.error("Não foi possível sincronizar os eventos do TrocaTicket.", erro);
    }
  });
}
