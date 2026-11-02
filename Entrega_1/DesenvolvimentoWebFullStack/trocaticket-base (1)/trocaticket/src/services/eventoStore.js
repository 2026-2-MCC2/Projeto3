const STORAGE_KEY = "trocaticket:eventos";

const usuarioPadrao = {
  nome: "Orlando Ramos",
  iniciais: "OR",
  plano: "Produtor Pro",
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
    capacidadeAlvara: 700,
    publico: { minimo: 487, maximo: 687 },
    custos: {
      fornecedores: [{ fornecedorId: "fornecedor-calourada", valor: 72860 }],
      fiscais: 0,
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

function criarStoreInicial() {
  return {
    usuario: usuarioPadrao,
    eventos: eventosIniciais,
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
      usuario: { ...usuarioPadrao, ...storeSalvo.usuario },
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
      fiscais: 0,
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
      store = { ...criarStoreInicial(), ...storeExterno };
      notificar();
    } catch (erro) {
      console.error("Não foi possível sincronizar os eventos do TrocaTicket.", erro);
    }
  });
}
