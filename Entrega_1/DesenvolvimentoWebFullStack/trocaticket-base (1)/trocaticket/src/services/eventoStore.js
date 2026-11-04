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
    usuarios: [],
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
      store = {
        ...criarStoreInicial(),
        ...storeExterno,
        usuario: { ...usuarioPadrao, ...storeExterno.usuario },
        usuarios: Array.isArray(storeExterno.usuarios) ? storeExterno.usuarios : [],
      };
      notificar();
    } catch (erro) {
      console.error("Não foi possível sincronizar os eventos do TrocaTicket.", erro);
    }
  });
}
