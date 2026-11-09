import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowLeftRight,
  Building2,
  CalendarDays,
  ChevronDown,
  Check,
  CircleDollarSign,
  Lightbulb,
  MapPin,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsUp,
  TrendingUp,
  Volume2,
  X,
} from "lucide-react";
import Breadcrumb from "../components/Breadcrumb.jsx";
import {
  contagemPropostasPorCategoria,
  custoTotal,
  diferencaVsOrcado,
  economiaTotalProjetada,
  itensPendentes,
  mediaPropostas,
  menorPropostaAtiva,
  propostaAtiva,
  propostasAceitas,
  propostasAtivas,
  tetoOrcamento,
} from "../services/calculos.js";
import { obterCategoria } from "../services/categorias.js";
import { getStoreSnapshot, setEvento, setEventoAtivo, subscribe } from "../services/eventoStore.js";
import "./PropostasRecebidas.css";

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const inteiro = new Intl.NumberFormat("pt-BR");
const percentual = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const listaVazia = Object.freeze([]);
const categorias = [
  { ...obterCategoria("som_pa"), id: "som_pa", icon: Volume2 },
  { ...obterCategoria("iluminacao"), id: "iluminacao", icon: Lightbulb },
  { ...obterCategoria("estruturas"), id: "estruturas", icon: Building2 },
  { ...obterCategoria("seguranca"), id: "seguranca", icon: Shield },
  { ...obterCategoria("limpeza"), icon: Shield },
];
function chaveCategoria(categoriaId) {
  if (categoriaId === "som") return "som_pa";
  if (categoriaId === "palco") return "estruturas";
  return categoriaId;
}
const rotuloOrdenacao = {
  menor: "Menor Valor",
  maior: "Maior Valor",
  avaliacao: "Melhor Avaliação",
  validade: "Validade mais próxima",
  economia: "Maior economia vs. orçado",
  nome: "Nome (A–Z)",
};

function formatarCnpj(valor = "") {
  const cnpj = String(valor).replace(/\D/g, "").slice(0, 14);
  if (cnpj.length !== 14) return valor || "—";
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

function formatarData(valor) {
  if (!valor) return "Data não informada";
  const data = new Date(`${valor.slice(0, 10)}T00:00:00`);
  return Number.isNaN(data.getTime()) ? "Data não informada" : data.toLocaleDateString("pt-BR");
}

function diasAte(valor) {
  if (!valor) return Infinity;
  const validade = new Date(`${valor.slice(0, 10)}T00:00:00`);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return Math.ceil((validade - hoje) / 86400000);
}

function getDestaque(proposta, propostas, item) {
  const daCategoria = propostas.filter(
    (outra) => outra.itemCustoId === proposta.itemCustoId && propostaAtiva(outra),
  );
  const menor = Math.min(...daCategoria.map((outra) => Number(outra.valor)));
  if (Number(proposta.valor) === menor && proposta.recomendada) {
    return { texto: "Melhor Custo-Benefício", classe: "is-pink" };
  }
  if (Number(proposta.valor) === menor) {
    return { texto: "Menor Preço da Categoria", classe: "is-blue" };
  }
  if (proposta.destaque) return { texto: proposta.destaque, classe: "is-purple" };
  if (item?.valor > proposta.valor) {
    return {
      texto: `${percentual.format(diferencaVsOrcado(proposta, item) * 100)}% vs. Orçado (${moeda.format(item.valor)})`,
      classe: "is-green",
    };
  }
  return null;
}

function Dialog({ children, title, onClose, dialogRef }) {
  return (
    <div className="pr-modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section
        aria-labelledby="pr-modal-title"
        aria-modal="true"
        className="pr-modal"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="pr-modal__header">
          <h2 id="pr-modal-title">{title}</h2>
          <button type="button" className="pr-icon-button" aria-label="Fechar" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

export default function PropostasRecebidas() {
  const store = useSyncExternalStore(subscribe, getStoreSnapshot, getStoreSnapshot);
  const { id } = useParams();
  const navigate = useNavigate();
  const evento = store.eventos.find((item) => item.id === (id ?? store.eventoAtivoId));
  const fornecedores = store.usuarios.filter(
    (usuario) => usuario.perfil === "fornecedor" && usuario.status === "aprovado",
  );
  const itens = evento?.custos?.fornecedores ?? listaVazia;
  const propostas = evento?.propostas ?? listaVazia;
  const propostasValidas = useMemo(() => propostasAtivas({ propostas }), [propostas]);
  const mapaFornecedor = useMemo(
    () => new Map(fornecedores.map((fornecedor) => [fornecedor.id, fornecedor])),
    [fornecedores],
  );
  const mapaItem = useMemo(() => new Map(itens.map((item) => [item.id, item])), [itens]);
  const [categoriaAtiva, setCategoriaAtiva] = useState("todos");
  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [ordenacao, setOrdenacao] = useState("menor");
  const [ordenacaoAlterada, setOrdenacaoAlterada] = useState(false);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const [imagemFalhou, setImagemFalhou] = useState(false);
  const disparadorRef = useRef(null);
  const dialogRef = useRef(null);
  const timerToastRef = useRef(null);
  const modalAberto = Boolean(modal);

  useEffect(() => {
    if (evento && store.eventoAtivoId !== evento.id) setEventoAtivo(evento.id);
    if (evento && evento.etapaAtual !== "proposta") setEvento(evento.id, { etapaAtual: "proposta" });
  }, [evento, store.eventoAtivoId]);

  useEffect(() => {
    const timer = window.setTimeout(() => setBuscaAplicada(busca.trim().toLocaleLowerCase("pt-BR")), 200);
    return () => window.clearTimeout(timer);
  }, [busca]);

  useEffect(() => () => window.clearTimeout(timerToastRef.current), []);

  useEffect(() => {
    if (!modalAberto) return undefined;
    const disparador = disparadorRef.current ?? document.activeElement;
    const dialog = dialogRef.current;
    dialog?.querySelector("button, input, select, [tabindex]:not([tabindex='-1'])")?.focus();
    function manterFoco(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        setModal(null);
      }
      if (event.key !== "Tab" || !dialog) return;
      const focaveis = [...dialog.querySelectorAll("button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])")];
      if (!focaveis.length) return;
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      if (event.shiftKey && document.activeElement === primeiro) {
        event.preventDefault();
        ultimo.focus();
      } else if (!event.shiftKey && document.activeElement === ultimo) {
        event.preventDefault();
        primeiro.focus();
      }
    }
    document.addEventListener("keydown", manterFoco);
    return () => {
      document.removeEventListener("keydown", manterFoco);
      disparador?.focus?.();
    };
  }, [modalAberto]);

  const propostasElegiveis = useMemo(
    () => propostas.filter((proposta) => proposta.status !== "recusada" && mapaFornecedor.has(proposta.fornecedorId) && mapaItem.has(proposta.itemCustoId)),
    [propostas, mapaFornecedor, mapaItem],
  );
  const contagens = useMemo(() => {
    const porCategoria = contagemPropostasPorCategoria(evento ?? { propostas: [], custos: { fornecedores: [] } });
    const disponiveis = propostasValidas.filter(
      (proposta) => mapaFornecedor.has(proposta.fornecedorId) && mapaItem.has(proposta.itemCustoId),
    );
    const contagensFornecedor = disponiveis.reduce((resultado, proposta) => {
      const categoriaId = chaveCategoria(mapaItem.get(proposta.itemCustoId)?.categoriaId);
      resultado[categoriaId] = (resultado[categoriaId] ?? 0) + 1;
      return resultado;
    }, {});
    return categorias.reduce((resultado, categoria) => {
      resultado[categoria.id] = contagensFornecedor[categoria.id] ?? porCategoria[categoria.id] ?? 0;
      return resultado;
    }, {});
  }, [evento, mapaFornecedor, mapaItem, propostasValidas]);
  const totalPropostas = Object.values(contagens).reduce((total, quantidade) => total + quantidade, 0);
  const linhasVisiveis = useMemo(() => {
    const linhas = propostasElegiveis.filter((proposta) => {
      const item = mapaItem.get(proposta.itemCustoId);
      const fornecedor = mapaFornecedor.get(proposta.fornecedorId);
      const categoriaOk = categoriaAtiva === "todos" || chaveCategoria(item.categoriaId) === categoriaAtiva;
      const texto = [
        fornecedor.nome,
        fornecedor.documento,
        formatarCnpj(fornecedor.documento),
        item.titulo,
      ].join(" ").toLocaleLowerCase("pt-BR");
      return categoriaOk && (!buscaAplicada || texto.includes(buscaAplicada));
    });
    if (!ordenacaoAlterada) return linhas;
    const itemDa = (proposta) => mapaItem.get(proposta.itemCustoId);
    const fornecedorDa = (proposta) => mapaFornecedor.get(proposta.fornecedorId);
    return [...linhas].sort((a, b) => {
      if (ordenacao === "menor") return a.valor - b.valor;
      if (ordenacao === "maior") return b.valor - a.valor;
      if (ordenacao === "avaliacao") return (fornecedorDa(b).rating ?? 0) - (fornecedorDa(a).rating ?? 0);
      if (ordenacao === "validade") return (diasAte(a.validade) - diasAte(b.validade));
      if (ordenacao === "economia") return diferencaVsOrcado(a, itemDa(a)) - diferencaVsOrcado(b, itemDa(b));
      return fornecedorDa(a).nome.localeCompare(fornecedorDa(b).nome, "pt-BR");
    });
  }, [propostasElegiveis, mapaItem, mapaFornecedor, categoriaAtiva, buscaAplicada, ordenacao, ordenacaoAlterada]);
  const selecionadas = propostas.filter((proposta) => proposta.status === "selecionada" && propostaAtiva(proposta));
  const pendentes = itensPendentes(evento ?? { propostas: [], custos: { fornecedores: [] } });
  const economia = evento ? economiaTotalProjetada(evento) : 0;
  const propostasConfirmadas = evento ? propostasAceitas(evento) : [];
  const fornecedoresConfirmados = new Set(propostasConfirmadas.map((proposta) => proposta.itemCustoId));
  const projetoTotal = selecionadas.reduce((total, proposta) => total + Number(proposta.valor || 0), 0);
  const anuncioResultados = `${linhasVisiveis.length} ${linhasVisiveis.length === 1 ? "proposta encontrada" : "propostas encontradas"}`;
  const itemSelecionado = selecionadas[0] ? mapaItem.get(selecionadas[0].itemCustoId) : null;
  const categoriaComparacao = categoriaAtiva === "todos"
    ? itemSelecionado ? chaveCategoria(itemSelecionado.categoriaId) : undefined
    : categoriaAtiva;

  function exibirToast(mensagem) {
    window.clearTimeout(timerToastRef.current);
    setToast(mensagem);
    timerToastRef.current = window.setTimeout(() => setToast(""), 3500);
  }

  function salvarPropostas(atualizadas) {
    setEvento(evento.id, { propostas: atualizadas });
  }

  function selecionarProposta(proposta) {
    if (proposta.status === "confirmada") {
      disparadorRef.current = document.activeElement;
      setModal({ tipo: "reabrir", proposta });
      return;
    }
    const confirmada = propostas.find(
      (outra) => outra.itemCustoId === proposta.itemCustoId && outra.status === "confirmada",
    );
    if (confirmada) {
      disparadorRef.current = document.activeElement;
      setModal({ tipo: "reabrir", proposta, confirmada });
      return;
    }
    salvarPropostas(propostas.map((outra) => {
      if (outra.itemCustoId !== proposta.itemCustoId) return outra;
      return { ...outra, status: outra.id === proposta.id ? "selecionada" : outra.status === "selecionada" ? "em_analise" : outra.status };
    }));
  }

  function confirmarSelecao() {
    const ids = new Set(selecionadas.map((proposta) => proposta.id));
    salvarPropostas(propostas.map((proposta) => (
      ids.has(proposta.id) ? { ...proposta, status: "confirmada" } : proposta
    )));
    setModal(null);
    exibirToast("Propostas confirmadas");
    const itensRestantes = pendentes.length - selecionadas.filter(
      (proposta) => !fornecedoresConfirmados.has(proposta.itemCustoId),
    ).length;
    if (itensRestantes <= 0) navigate(`/eventos/${encodeURIComponent(evento.id)}/resumo`);
  }

  function confirmarReabertura() {
    const alvo = modal.proposta;
    const confirmada = modal.confirmada
      ?? propostas.find((proposta) => proposta.itemCustoId === alvo.itemCustoId && proposta.status === "confirmada");
    salvarPropostas(propostas.map((proposta) => {
      if (confirmada && proposta.id === confirmada.id) return { ...proposta, status: "em_analise" };
      if (proposta.id === alvo.id) return { ...proposta, status: "selecionada" };
      return proposta;
    }));
    setModal(null);
    exibirToast("Item reaberto e proposta selecionada");
  }

  function abrirComparacao() {
    if (!categoriaComparacao) {
      exibirToast("Escolha uma categoria para comparar");
      return;
    }
    disparadorRef.current = document.activeElement;
    setModal({ tipo: "comparar", categoriaId: categoriaComparacao });
  }

  function limparFiltros() {
    setCategoriaAtiva("todos");
    setBusca("");
    setBuscaAplicada("");
  }

  if (!evento) {
    return <div className="pr-page"><div className="pr-container"><p className="pr-not-found">Evento não encontrado.</p></div></div>;
  }

  const distribuicao = categorias.map((categoria) => ({ ...categoria, quantidade: contagens[categoria.id] ?? 0 }));
  const fornecedoresComparacao = modal?.tipo === "comparar"
    ? propostasElegiveis.filter((proposta) => propostaAtiva(proposta) && chaveCategoria(mapaItem.get(proposta.itemCustoId)?.categoriaId) === modal.categoriaId)
    : [];
  const selecionadasConfirmacao = selecionadas.map((proposta) => ({
    proposta,
    fornecedor: mapaFornecedor.get(proposta.fornecedorId),
    item: mapaItem.get(proposta.itemCustoId),
  }));
  const modalTotal = selecionadas.reduce((total, proposta) => total + Number(proposta.valor || 0), 0);
  const economiaConfirmacao = selecionadas.reduce((total, proposta) => {
    const item = mapaItem.get(proposta.itemCustoId);
    return total + (item ? item.valor - proposta.valor : 0);
  }, 0);
  const gruposVisiveis = linhasVisiveis.reduce((grupos, proposta) => {
    let grupo = grupos.find((item) => item.item.id === proposta.itemCustoId);
    if (!grupo) {
      grupo = { item: mapaItem.get(proposta.itemCustoId), propostas: [] };
      grupos.push(grupo);
    }
    grupo.propostas.push(proposta);
    return grupos;
  }, []);

  return (
    <div className="pr-page">
      <div className="pr-container">
        <Breadcrumb etapaAtual={3} eventoId={evento.id} />
        <header className="pr-heading">
          <h1>Propostas Recebidas</h1>
        </header>

        <section className="pr-filters" aria-label="Filtros de propostas">
          <div className="pr-chips" role="group" aria-label="Filtrar por categoria">
            <button type="button" className={`pr-chip${categoriaAtiva === "todos" ? " is-active" : ""}`} onClick={() => setCategoriaAtiva("todos")}>
              Todos os Itens <span className="pr-chip__count">{totalPropostas}</span>
            </button>
            {categorias.map((categoria) => (
              <button
                type="button"
                key={categoria.id}
                className={`pr-chip${categoriaAtiva === categoria.id ? " is-active" : ""}`}
                onClick={() => setCategoriaAtiva(categoria.id)}
              >
                {categoria.nome} <span className="pr-chip__count">{contagens[categoria.id] ?? 0}</span>
              </button>
            ))}
          </div>
          <div className="pr-filter-controls">
            <label className="pr-search">
              <Search size={16} aria-hidden="true" />
              <span className="sr-only">Filtrar fornecedor ou item</span>
              <input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Filtrar fornecedor ou item..." />
              {busca && <button type="button" aria-label="Limpar busca" onClick={() => setBusca("")}><X size={14} aria-hidden="true" /></button>}
            </label>
            <label className="pr-sort">
              <span className="sr-only">Ordenar propostas</span>
              <select value={ordenacao} onChange={(event) => { setOrdenacao(event.target.value); setOrdenacaoAlterada(true); }}>
                {Object.entries(rotuloOrdenacao).map(([valor, rotulo]) => <option value={valor} key={valor}>Ordenar por: {rotulo}</option>)}
              </select>
              <ChevronDown size={15} aria-hidden="true" />
            </label>
          </div>
        </section>

        <div className="pr-grid">
          <section className="pr-card pr-matrix" aria-labelledby="pr-matrix-title">
            <header className="pr-matrix__header">
              <h2 id="pr-matrix-title"><ArrowLeftRight size={18} aria-hidden="true" /> Matriz Comparativa de Fornecedores</h2>
              <div className="pr-matrix__legend">
                <span><i className="pr-legend-dot" /> Opção Selecionada</span>
                <span className={`pr-status-pill${pendentes.length ? " is-orange" : " is-green"}`}>
                  <i /> {pendentes.length ? "Em Análise" : "Fechada"}
                </span>
              </div>
            </header>
            <p className="sr-only" aria-live="polite">{anuncioResultados}</p>
            <div className="pr-matrix__list" aria-live="off">
              {linhasVisiveis.length === 0 ? (
                <div className="pr-empty">
                  <p>Nenhuma proposta encontrada para este filtro.</p>
                  <button type="button" onClick={limparFiltros}>Limpar filtros</button>
                </div>
              ) : gruposVisiveis.map(({ item: itemGrupo, propostas: propostasDoItem }) => (
                <div className="pr-proposal-group" role="radiogroup" aria-labelledby={`pr-item-${itemGrupo.id}`} key={itemGrupo.id}>
                  <h3 className="sr-only" id={`pr-item-${itemGrupo.id}`}>{itemGrupo.titulo}</h3>
                  {propostasDoItem.map((proposta) => {
                const fornecedor = mapaFornecedor.get(proposta.fornecedorId);
                const item = mapaItem.get(proposta.itemCustoId);
                const categoria = categorias.find((opcao) => opcao.id === chaveCategoria(item.categoriaId));
                const Icon = categoria?.icon ?? CircleDollarSign;
                const destaque = getDestaque(proposta, propostasValidas, item);
                const selecionada = proposta.status === "selecionada" || proposta.status === "confirmada";
                const expirada = !propostaAtiva(proposta);
                const diasRestantes = diasAte(proposta.validade);
                const vencendo = !expirada && diasRestantes >= 0 && diasRestantes <= 3;
                const cnpj = formatarCnpj(fornecedor.documento);
                const cidadeUf = [fornecedor.cidade, fornecedor.uf].filter(Boolean).join("/");
                return (
                  <div
                    className={`pr-proposal${selecionada ? " is-selected" : ""}${expirada ? " is-expired" : ""}`}
                    key={proposta.id}
                    onClick={() => !expirada && selecionarProposta(proposta)}
                  >
                    <div className={`pr-proposal__radio${selecionada ? " is-checked" : ""}`} aria-hidden="true"><i /></div>
                    <span className={`pr-provider-icon${selecionada ? " is-selected" : ""}`}><Icon size={22} aria-hidden="true" /></span>
                    <div className="pr-proposal__body">
                      <div className="pr-proposal__identity">
                        <strong className="pr-proposal__name">{fornecedor.nome}</strong>
                        {fornecedor.auditada && <span className="pr-pill is-lavender"><ShieldCheck size={12} aria-hidden="true" /> Auditada</span>}
                        {categoria && <span className="pr-pill is-lavender">{categoria.nome}</span>}
                        {proposta.recomendada && <span className="pr-pill is-pink"><Sparkles size={12} aria-hidden="true" /> Recomendada</span>}
                        {(fornecedor.selos ?? []).map((selo) => <span className="pr-pill is-seal" key={selo}>{selo}</span>)}
                        {Number(fornecedor.rating) > 0 && (
                          <span className="pr-pill is-rating"><Star size={11} fill="currentColor" aria-hidden="true" /> {Number(fornecedor.rating).toFixed(1)} ({inteiro.format(fornecedor.eventosRealizados ?? 0)} eventos)</span>
                        )}
                      </div>
                      <div className="pr-proposal__meta">
                        <span className="pr-meta-cnpj">CNPJ: {cnpj}</span>
                        <span className="pr-meta-city" title={cidadeUf}>{cidadeUf}</span>
                        <span className="pr-meta-item">• Item: {item.titulo}</span>
                      </div>
                      {proposta.status === "confirmada" && <span className="pr-confirmed-label"><Check size={12} aria-hidden="true" /> Confirmada</span>}
                    </div>
                    <div className="pr-proposal__price">
                      <strong>{moeda.format(Number(proposta.valor) || 0)}</strong>
                      {expirada ? (
                        <span className="pr-highlight is-red">Expirada</span>
                      ) : destaque && (
                        <span className={`pr-highlight ${destaque.classe}`}>{destaque.texto}</span>
                      )}
                      <span className="pr-proposal__validity">
                        <CalendarDays size={13} aria-hidden="true" /> Válida até {formatarData(proposta.validade)}
                        {vencendo && <b>Vence em {diasRestantes} {diasRestantes === 1 ? "dia" : "dias"}</b>}
                      </span>
                    </div>
                    <input
                      className="pr-native-radio"
                      type="radio"
                      name={`proposta-${item.id}`}
                      aria-label={`${fornecedor.nome}, ${item.titulo}, ${moeda.format(proposta.valor)}`}
                      checked={selecionada}
                      disabled={expirada || proposta.status === "confirmada"}
                      onChange={() => selecionarProposta(proposta)}
                      onClick={(event) => event.stopPropagation()}
                    />
                  </div>
                  );
                })}
                </div>
              ))}
            </div>
          </section>

          <aside className="pr-side">
            <section className="pr-card pr-status-card" aria-labelledby="pr-status-title">
              <div className="pr-side-heading">
                <h2 id="pr-status-title">FAIXA DE ESTADO</h2>
                <span className={`pr-status-pill${pendentes.length ? " is-orange" : " is-green"}`}>
                  <i /> {pendentes.length ? `${pendentes.length} Pendentes` : "Concluído"}
                </span>
              </div>
              <div className="pr-status-summary">
                <div className="pr-status-summary__top">
                  <strong>{inteiro.format(totalPropostas)} Propostas</strong>
                  <TrendingUp size={19} aria-hidden="true" />
                </div>
                <p>{pendentes.length} {pendentes.length === 1 ? "item de custo aguardando fechamento definitivo" : "itens de custo aguardando fechamento definitivo"}</p>
              </div>
              <div className="pr-section-title"><h3>Distribuição por Categoria</h3><span>{inteiro.format(totalPropostas)} totais</span></div>
              <div className="pr-stacked-bar" aria-label="Distribuição das propostas por categoria">
                {distribuicao.filter((item) => item.quantidade > 0).map((categoria) => (
                  <span key={categoria.id} style={{ width: `${(categoria.quantidade / (totalPropostas || 1)) * 100}%`, backgroundColor: categoria.cor }} title={`${categoria.nome}: ${categoria.quantidade}`} />
                ))}
              </div>
              <div className="pr-category-legend">
                {distribuicao.map((categoria) => (
                  <span key={categoria.id}><i style={{ backgroundColor: categoria.cor }} /> {categoria.nome.replace(" Cênica", "").replace(" & Palco", "")} ({categoria.quantidade})</span>
                ))}
              </div>
              <div className="pr-divider" />
              <h3 className="pr-budget-title">Resumo Orçamentário Projetado</h3>
              <dl className="pr-budget-list">
                <div>
                  <dt>{economia < 0 ? "Acima do orçado:" : "Economia Total Projetada:"}</dt>
                  <dd><span className={`pr-budget-pill${economia < 0 ? " is-orange" : ""}`}>{moeda.format(Math.abs(economia))}</span></dd>
                </div>
                <div><dt>Menor Proposta Ativa:</dt><dd className="is-blue">{moeda.format(menorPropostaAtiva(evento))}</dd></div>
                <div><dt>Média das Propostas:</dt><dd>{moeda.format(mediaPropostas(evento))}</dd></div>
                <div><dt>Teto Orçado do Evento:</dt><dd>{moeda.format(tetoOrcamento(evento) || custoTotal(evento))}</dd></div>
              </dl>
            </section>

            <section className="pr-card pr-cover-card" aria-label="Local do evento">
              <div className="pr-cover" role="img" aria-label={`Capa do evento ${evento.nome}`}>
                {!imagemFalhou && evento.capa && (
                  <img src={evento.capa} alt={`Capa do evento ${evento.nome}`} onError={() => setImagemFalhou(true)} />
                )}
                <div className="pr-cover__shade" />
                <span><MapPin size={13} aria-hidden="true" /> Palco Principal • {evento.local?.nome || "Local do evento"}</span>
              </div>
            </section>
          </aside>
        </div>

        <section className="pr-actions" aria-label="Ações das propostas">
          <div className="pr-actions__left">
            <button type="button" className="pr-button pr-button--back" onClick={() => navigate(`/eventos/${encodeURIComponent(evento.id)}/custos`)}>
              <ArrowLeft size={15} aria-hidden="true" /> Voltar
            </button>
            <p>{selecionadas.length
              ? `${selecionadas.length} ${selecionadas.length === 1 ? "proposta selecionada" : "propostas selecionadas"} • Total ${moeda.format(projetoTotal)}`
              : "Selecione o fornecedor desejado e confirme para prosseguir."}</p>
          </div>
          <div className="pr-actions__right">
            <button type="button" className="pr-button pr-button--compare" onClick={abrirComparacao}>
              <Sparkles size={15} aria-hidden="true" /> Comparar em Lado a Lado
            </button>
            <button
              type="button"
              className="pr-button pr-button--confirm"
              disabled={!selecionadas.length}
              onClick={(event) => {
                disparadorRef.current = event.currentTarget;
                setModal({ tipo: "confirmar" });
              }}
            >
              <ThumbsUp size={15} aria-hidden="true" /> Confirmar
            </button>
          </div>
        </section>
      </div>

      {toast && <div className="pr-toast" role="status">{toast}</div>}

      {modal?.tipo === "comparar" && (
        <Dialog title="Comparar propostas" onClose={() => setModal(null)} dialogRef={dialogRef}>
          <div className="pr-compare-scroll">
            <table className="pr-compare-table">
              <thead>
                <tr>
                  <th scope="col">Critério</th>
                  {fornecedoresComparacao.map((proposta) => (
                    <th scope="col" key={proposta.id}>{mapaFornecedor.get(proposta.fornecedorId)?.nome}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Valor", (proposta) => moeda.format(proposta.valor)],
                  ["Diferença vs. Orçado", (proposta) => `${percentual.format(diferencaVsOrcado(proposta, mapaItem.get(proposta.itemCustoId)) * 100)}%`],
                  ["Avaliação", (proposta) => {
                    const fornecedor = mapaFornecedor.get(proposta.fornecedorId);
                    return `${fornecedor.rating ?? "—"} (${fornecedor.eventosRealizados ?? 0} eventos)`;
                  }],
                  ["Eventos realizados", (proposta) => mapaFornecedor.get(proposta.fornecedorId).eventosRealizados ?? "—"],
                  ["Auditada", (proposta) => mapaFornecedor.get(proposta.fornecedorId).auditada ? "Sim" : "Não"],
                  ["Selos", (proposta) => mapaFornecedor.get(proposta.fornecedorId).selos?.join(", ") || "—"],
                  ["Validade", (proposta) => formatarData(proposta.validade)],
                  ["CNPJ", (proposta) => formatarCnpj(mapaFornecedor.get(proposta.fornecedorId).documento)],
                  ["Cidade/UF", (proposta) => `${mapaFornecedor.get(proposta.fornecedorId).cidade ?? "—"}/${mapaFornecedor.get(proposta.fornecedorId).uf ?? ""}`],
                ].map(([label, valor]) => (
                  <tr key={label}>
                    <th scope="row">{label}</th>
                    {fornecedoresComparacao.map((proposta) => {
                      const menorValor = Math.min(...fornecedoresComparacao.map((opcao) => opcao.valor));
                      return <td className={label === "Valor" && proposta.valor === menorValor ? "is-best" : ""} key={proposta.id}>{valor(proposta)}</td>;
                    })}
                  </tr>
                ))}
                <tr>
                  <th scope="row">Ação</th>
                  {fornecedoresComparacao.map((proposta) => (
                    <td key={proposta.id}>
                      <button type="button" className="pr-button pr-button--small" onClick={() => { selecionarProposta(proposta); if (proposta.status !== "confirmada") setModal(null); }}>
                        Selecionar
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Dialog>
      )}

      {modal?.tipo === "confirmar" && (
        <Dialog title="Confirmar propostas selecionadas" onClose={() => setModal(null)} dialogRef={dialogRef}>
          <div className="pr-modal__content">
            <ul className="pr-confirm-list">
              {selecionadasConfirmacao.map(({ proposta, fornecedor, item }) => (
                <li key={proposta.id}><span><strong>{fornecedor?.nome}</strong><small>{item?.titulo}</small></span><b>{moeda.format(proposta.valor)}</b></li>
              ))}
            </ul>
            <div className="pr-confirm-summary">
              <p><span>Total das propostas</span><strong>{moeda.format(modalTotal)}</strong></p>
              <p><span>Economia projetada vs. orçado</span><strong className={economiaConfirmacao < 0 ? "is-loss" : "is-gain"}>{moeda.format(economiaConfirmacao)}</strong></p>
            </div>
            <div className="pr-modal__actions">
              <button type="button" className="pr-button pr-button--back" onClick={() => setModal(null)}>Voltar</button>
              <button type="button" className="pr-button pr-button--confirm" onClick={confirmarSelecao}><Check size={15} aria-hidden="true" /> Confirmar propostas</button>
            </div>
          </div>
        </Dialog>
      )}

      {modal?.tipo === "reabrir" && (
        <Dialog title="Reabrir item confirmado?" onClose={() => setModal(null)} dialogRef={dialogRef}>
          <div className="pr-modal__content">
            <p className="pr-reopen-copy">Este item já tem uma proposta confirmada. Ao reabrir, a confirmação será removida e a proposta escolhida ficará selecionada para nova confirmação.</p>
            <div className="pr-modal__actions">
              <button type="button" className="pr-button pr-button--back" onClick={() => setModal(null)}>Cancelar</button>
              <button type="button" className="pr-button pr-button--confirm" onClick={confirmarReabertura}>Reabrir item</button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
