import { apiRequest } from "./api.js";

const STORAGE_KEY = "trocaticket:eventos:v2";

const usuarioPadrao = {
  id: "",
  perfil: "organizador",
  nome: "",
  iniciais: "",
  plano: "",
  email: "",
  telefone: "",
  documento: "",
  tipoDocumento: "cpf",
  areaAtuacao: "",
  tipoOrganizacao: "",
  anexo: null,
  status: "",
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
    dataInicio: "2026-11-14T18:00",
    dataFim: "2026-11-16T02:00",
    local: { nome: "Pedreira Paulo Leminski", cidade: "Curitiba", uf: "PR" },
    capacidadeAlvara: 8500,
    publico: { minimo: 3000, maximo: 8500 },
    custos: {
      fornecedores: [
        {
          id: "custo-som-001",
          categoriaId: "som",
          grupoGrafico: "som",
          titulo: "Sistema de Som & PA",
          qtd: "1 sistema completo",
          especificacao: "Sistema de som e PA do evento.",
          valor: 80000,
          tags: ["RF06"],
          alocacao: "cotacao",
        },
        {
          id: "custo-palco-001",
          categoriaId: "palco",
          grupoGrafico: "palco",
          titulo: "Palco e Cobertura Geodésica",
          qtd: "1 estrutura modular",
          especificacao: "Estrutura em alumínio Q30/Q50, piso naval com acabamento antiderrapante, torres de delay e laudo ART de montagem.",
          valor: 62500,
          tags: ["RF12"],
          alocacao: "cotacao",
        },
        {
          id: "custo-seguranca-001",
          categoriaId: "seguranca",
          grupoGrafico: "seguranca",
          titulo: "Vigilância e Controle de Acesso",
          qtd: "77 profissionais (turno 12h)",
          especificacao: "Escala de segurança interna/perimetral homologada pela Polícia Federal e brigada com plano de evacuação médica.",
          valor: 25500,
          tags: [],
          alocacao: "cotacao",
        },
        {
          id: "custo-limpeza-001",
          categoriaId: "limpeza",
          grupoGrafico: "seguranca",
          titulo: "Limpeza e coleta seletiva",
          qtd: "44 cabines + equipe pós-evento",
          especificacao: "Higienização e descarte certificado de resíduos.",
          valor: 20000,
          tags: [],
          alocacao: "cotacao",
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
          categoriaId: "iss",
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
          categoriaId: "uti",
          grupoGrafico: "variaveis",
          origem: "Fundo de segurança",
          titulo: "UTI Móvel + Grupo Gerador Reserva + Reserva Técnica",
          observacao: "Exigência do Corpo de Bombeiros Militar para lotação máxima",
          calculo: { tipo: "fixo" },
          valor: 26800,
        },
      ],
      propostasAceitas: [],
    },
    precificacao: { margem: 0.2, taxaPlataforma: 0.08, impostos: 0.05, publicoEsperado: null, cenarioEscolhido: "esperado" },
    status: "planejamento",
    etapaAtual: "resumo",
    tetoOrcamento: 210000,
    propostas: [
      { id: "prop-001", fornecedorId: "fornecedor-acustica-prime", itemCustoId: "custo-som-001", valor: 48500, validade: "2026-11-30", destaque: "Melhor Custo-Benefício", recomendada: true, status: "confirmada" },
      { id: "prop-002", fornecedorId: "fornecedor-soundwave", itemCustoId: "custo-som-001", valor: 52000, validade: "2026-11-28", status: "em_analise" },
      { id: "prop-003", fornecedorId: "fornecedor-luz-arte", itemCustoId: "custo-som-001", valor: 39800, validade: "2026-12-05", destaque: "Iluminação Eficiente", status: "em_analise" },
      { id: "prop-004", fornecedorId: "fornecedor-stagepro", itemCustoId: "custo-palco-001", valor: 64000, validade: "2026-12-01", destaque: "Alta Capacidade", status: "confirmada" },
      { id: "prop-005", fornecedorId: "fornecedor-sentinela", itemCustoId: "custo-seguranca-001", valor: 31000, validade: "2026-12-15", status: "confirmada" },
      { id: "prop-006", fornecedorId: "fornecedor-audio-sul", itemCustoId: "custo-som-001", valor: 48500, validade: "2026-12-10", status: "em_analise" },
      { id: "prop-007", fornecedorId: "fornecedor-lumen", itemCustoId: "custo-limpeza-001", valor: 36800, validade: "2026-12-08", status: "em_analise" },
      { id: "prop-008", fornecedorId: "fornecedor-estrutural", itemCustoId: "custo-palco-001", valor: 55880, validade: "2026-12-12", status: "em_analise" },
    ],
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
    precificacao: {
      margem: 0.2,
      taxaPlataforma: 0.08,
      impostos: 0.05,
      publicoEsperado: null,
      cenarioEscolhido: "esperado",
      ...(evento.precificacao ?? {}),
    },
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
    eventos: [],
    eventoAtivoId: "",
    notificacoes: { fornecedores: 0, mensagens: 0 },
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
    const inicial = criarStoreInicial();
    const idsEventosDemo = new Set(eventosIniciais.map(({ id }) => id));
    const eventos = storeSalvo.eventos
      .filter((eventoSalvo) => !idsEventosDemo.has(eventoSalvo.id))
      .map(normalizarEvento);
    const carregado = {
      ...inicial,
      ...storeSalvo,
      eventos,
      usuario: { ...usuarioPadrao, ...storeSalvo.usuario },
      usuarios: Array.isArray(storeSalvo.usuarios) ? storeSalvo.usuarios : [],
    };
    return carregado;
  } catch (erro) {
    console.error("Não foi possível carregar os eventos salvos do TrocaTicket.", erro);
    const inicial = criarStoreInicial();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inicial));
    return inicial;
  }
}

let store = lerStore();
const listeners = new Set();
const atualizacoesPendentes = new Map();

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

export async function carregarEventosRemotos() {
  persistir({ ...store, eventos: [], eventoAtivoId: "" });
  const eventos = await apiRequest("/eventos");
  if (!Array.isArray(eventos)) throw new Error("A API retornou uma lista de eventos inválida.");
  const normalizados = eventos.map(normalizarEvento);
  persistir({ ...store, eventos: normalizados, eventoAtivoId: normalizados[0]?.id ?? "" });
  return normalizados;
}

export function substituirEventos(eventos) {
  persistir({ ...store, eventos: eventos.map(normalizarEvento) });
}

export function getUsuario(id) {
  return store.usuarios.find((usuario) => usuario.id === id) ?? null;
}

export function getUsuarioPorEmail(email) {
  const normalizado = email.trim().toLowerCase();
  return store.usuarios.find((usuario) => usuario.email?.toLowerCase() === normalizado) ?? null;
}

export function atualizarStatusUsuario(id, status, motivo = "") {
  const indice = store.usuarios.findIndex((usuario) => usuario.id === id);
  if (indice === -1) throw new Error(`Usuário "${id}" não encontrado.`);
  if (!["em_analise", "aprovado", "reprovado"].includes(status)) {
    throw new TypeError(`Status de cadastro inválido: "${status}".`);
  }

  const usuarios = [...store.usuarios];
  usuarios[indice] = { ...usuarios[indice], status, motivo };
  persistir({ ...store, usuarios });
  return usuarios[indice];
}

export function getEvento(id) {
  return store.eventos.find((evento) => evento.id === id) ?? null;
}

export function setEvento(id, parcial) {
  const chave = String(id);
  const anterior = atualizacoesPendentes.get(chave) ?? Promise.resolve();
  const tarefa = anterior.catch(() => {}).then(async () => {
    const indice = store.eventos.findIndex((evento) => evento.id === id);
    if (indice === -1) throw new Error(`Evento "${id}" não encontrado.`);

    const eventoAtualizado = Object.entries(parcial).reduce(
      (evento, [campo, valor]) => ({
        ...evento,
        [campo]:
          valor && typeof valor === "object" && !Array.isArray(valor)
            ? { ...evento[campo], ...valor }
            : valor,
      }),
      store.eventos[indice],
    );
    if (/^\d+$/.test(chave)) {
      await apiRequest(`/eventos/${encodeURIComponent(chave)}`, { method: "PUT", body: eventoAtualizado });
    }
    const eventos = [...store.eventos];
    eventos[indice] = eventoAtualizado;
    persistir({ ...store, eventos });
    return eventoAtualizado;
  });
  let operacao;
  operacao = tarefa.catch((erro) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("trocaticket:api-error", { detail: erro.message }));
    } else {
      console.error("Não foi possível salvar o evento.", erro);
    }
    return null;
  }).finally(() => {
    if (atualizacoesPendentes.get(chave) === operacao) atualizacoesPendentes.delete(chave);
  });
  atualizacoesPendentes.set(chave, operacao);
  return operacao;
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

export function atualizarCadastroReprovado(id, dados) {
  const indice = store.usuarios.findIndex((usuario) => usuario.id === id);
  if (indice === -1) throw new Error(`Usuário "${id}" não encontrado.`);

  const email = dados.email.trim().toLowerCase();
  const documento = dados.documento.replace(/\D/g, "");
  const duplicado = store.usuarios.some(
    (usuario, indiceUsuario) => indiceUsuario !== indice
      && ((usuario.email ?? "").toLowerCase() === email || usuario.documento === documento),
  );
  if (duplicado) {
    throw new Error("Este e-mail ou CPF/CNPJ já está cadastrado em outra conta.");
  }

  const anterior = store.usuarios[indice];
  const palavrasNome = dados.nome.trim().split(/\s+/);
  const usuario = {
    ...anterior,
    perfil: dados.perfil,
    nome: dados.nome.trim(),
    iniciais: palavrasNome.slice(0, 2).map((palavra) => palavra[0]).join("").toUpperCase(),
    email,
    telefone: dados.telefone.replace(/\D/g, ""),
    documento,
    tipoDocumento: documento.length === 11 ? "cpf" : "cnpj",
    areaAtuacao: dados.perfil === "fornecedor" ? dados.area : "",
    tipoOrganizacao: dados.perfil === "organizador" ? dados.area : "",
    anexo: dados.arquivo
      ? { nome: dados.arquivo.name, tipo: dados.arquivo.type, tamanho: dados.arquivo.size }
      : anterior.anexo,
    status: "em_analise",
    motivo: "",
    aceiteTermosEm: new Date().toISOString(),
    criadoEm: new Date().toISOString(),
  };
  const usuarios = [...store.usuarios];
  usuarios[indice] = usuario;
  persistir({ ...store, usuarios });
  return usuario;
}

export async function criarEvento(dados = {}) {
  const {
    local,
    publico,
    custos,
    precificacao,
    ...campos
  } = dados;
  const dadosEvento = {
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
      publicoEsperado: null,
      cenarioEscolhido: "esperado",
      ...precificacao,
    },
  };
  const eventoRemoto = await apiRequest("/eventos", { method: "POST", body: dadosEvento });
  const evento = normalizarEvento(eventoRemoto);
  const proximoStore = {
    ...store,
    eventos: [...store.eventos, evento],
    eventoAtivoId: evento.id,
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
