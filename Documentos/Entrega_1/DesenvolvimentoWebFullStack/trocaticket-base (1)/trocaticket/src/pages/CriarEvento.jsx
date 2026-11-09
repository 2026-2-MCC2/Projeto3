import { cloneElement, forwardRef, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  ArrowDownUp,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Camera,
  Check,
  ChevronRight,
  CloudUpload,
  FileText,
  Info,
  MapPin,
  Save,
  ShieldCheck,
  UsersRound,
  X,
} from "lucide-react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  criarEvento,
  getEvento,
  getStoreSnapshot,
  setEvento,
  setEventoAtivo,
  subscribe,
} from "../services/eventoStore.js";
import { ocupacaoMinima } from "../services/calculos.js";
import "./CriarEvento.css";

const CHAVE_RASCUNHO = "trocaticket:rascunho-evento";
const CAPA_PADRAO = "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=900&q=85";
const CATEGORIAS = [
  "Festival",
  "Festa universitária",
  "Show",
  "Formatura",
  "Corporativo",
  "Outro",
];
const formatarInteiro = new Intl.NumberFormat("pt-BR");
const formatarPercentual = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function formularioVazio() {
  return {
    nome: "",
    categoria: "",
    descricao: "",
    dataInicio: "2026-05-15T18:00",
    dataFim: "2026-05-17T02:00",
    localNome: "",
    cidadeUf: "São Paulo, SP",
    publicoMinimo: "",
    capacidadeAlvara: "",
    capa: "",
  };
}

function formularioDoEvento(evento) {
  const normalizarData = (valor) => (
    /^\d{4}-\d{2}-\d{2}$/.test(valor ?? "") ? `${valor}T00:00` : valor ?? ""
  );
  return {
    nome: evento.nome ?? "",
    categoria: evento.categoria ?? "",
    descricao: evento.descricao ?? "",
    dataInicio: normalizarData(evento.dataInicio),
    dataFim: normalizarData(evento.dataFim),
    localNome: evento.local?.nome ?? "",
    cidadeUf: [evento.local?.cidade, evento.local?.uf].filter(Boolean).join(", "),
    publicoMinimo: evento.publico?.minimo ? String(evento.publico.minimo) : "",
    capacidadeAlvara: evento.capacidadeAlvara ? String(evento.capacidadeAlvara) : "",
    capa: evento.capa ?? "",
  };
}

function lerRascunho() {
  try {
    const salvo = localStorage.getItem(CHAVE_RASCUNHO);
    if (!salvo) return formularioVazio();
    return { ...formularioVazio(), ...JSON.parse(salvo) };
  } catch (erro) {
    console.error("Não foi possível restaurar o rascunho do evento.", erro);
    return formularioVazio();
  }
}

function dividirCidadeUf(valor) {
  const partes = valor.split(",");
  return {
    cidade: partes.slice(0, -1).join(",").trim(),
    uf: partes.at(-1)?.trim().toUpperCase() ?? "",
  };
}

function validar(formulario) {
  const erros = {};
  const nome = formulario.nome.trim();
  const cidadeUf = dividirCidadeUf(formulario.cidadeUf);
  const minimo = Number(formulario.publicoMinimo);
  const capacidade = Number(formulario.capacidadeAlvara);
  const inicio = new Date(formulario.dataInicio).getTime();
  const fim = new Date(formulario.dataFim).getTime();

  if (nome.length < 3 || nome.length > 80) {
    erros.nome = "Informe um nome com pelo menos 3 caracteres.";
  }
  if (!formulario.categoria) erros.categoria = "Selecione uma categoria.";
  if (!formulario.dataInicio) erros.dataInicio = "Informe a data e o horário de início.";
  else if (!Number.isFinite(inicio)) erros.dataInicio = "Informe uma data e um horário de início válidos.";
  if (!formulario.dataFim) erros.dataFim = "Informe a data e o horário de término.";
  else if (!Number.isFinite(fim)) erros.dataFim = "Informe uma data e um horário de término válidos.";
  if (Number.isFinite(inicio) && Number.isFinite(fim) && fim <= inicio) {
    erros.dataFim = "O término deve ser posterior ao início.";
  }
  if (dataNoPassado(formulario.dataInicio)) {
    erros.dataInicio = "A data e o horário de início não podem estar no passado.";
  }
  if (!formulario.localNome.trim()) erros.localNome = "Informe o local do evento.";
  if (!cidadeUf.cidade || !/^[A-Z]{2}$/.test(cidadeUf.uf)) {
    erros.cidadeUf = "Informe a cidade e uma UF válida com 2 letras (ex.: São Paulo, SP).";
  }
  if (!Number.isInteger(minimo) || minimo < 1) {
    erros.publicoMinimo = "Informe um público mínimo inteiro maior que zero.";
  }
  if (!Number.isInteger(capacidade) || capacidade < 1) {
    erros.capacidadeAlvara = "Informe uma lotação máxima inteira maior que zero.";
  } else if (Number.isInteger(minimo) && minimo >= capacidade) {
    erros.capacidadeAlvara = "A lotação máxima deve ser maior que o público mínimo.";
  }

  return erros;
}

function valorEvento(formulario, status) {
  const { cidade, uf } = dividirCidadeUf(formulario.cidadeUf);
  const minimo = Number(formulario.publicoMinimo) || 0;
  const capacidade = Number(formulario.capacidadeAlvara) || 0;
  return {
    nome: formulario.nome.trim(),
    categoria: formulario.categoria,
    descricao: formulario.descricao,
    dataInicio: formulario.dataInicio,
    dataFim: formulario.dataFim,
    local: { nome: formulario.localNome.trim(), cidade, uf },
    capacidadeAlvara: capacidade,
    publico: { minimo, maximo: capacidade },
    capa: formulario.capa,
    status,
    etapaAtual: status === "rascunho" ? "cadastro" : "custo",
  };
}

function dataNoPassado(data) {
  if (!data) return false;
  const instante = new Date(data).getTime();
  return Number.isFinite(instante) && instante < Date.now();
}

export default function CriarEvento() {
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const eventoId = searchParams.get("id") ?? id;
  return <FormularioEvento key={eventoId ?? "novo"} eventoId={eventoId} />;
}

function FormularioEvento({ eventoId }) {
  const store = useSyncExternalStore(subscribe, getStoreSnapshot, getStoreSnapshot);
  const navigate = useNavigate();
  const evento = eventoId ? store.eventos.find((item) => item.id === eventoId) : null;
  const [idSalvo, setIdSalvo] = useState(evento?.id ?? "");
  const [formulario, setFormulario] = useState(() => (
    evento ? formularioDoEvento(evento) : lerRascunho()
  ));
  const [tocados, setTocados] = useState({});
  const [enviado, setEnviado] = useState(false);
  const [erroImagem, setErroImagem] = useState("");
  const [toast, setToast] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [alterado, setAlterado] = useState(false);
  const [arquivoPreview, setArquivoPreview] = useState("");
  const imagemInputRef = useRef(null);
  const refs = useRef({});
  const erros = validar(formulario);
  const validacaoLotacao =
    Number.isInteger(Number(formulario.publicoMinimo))
    && Number(formulario.publicoMinimo) > 0
    && Number.isInteger(Number(formulario.capacidadeAlvara))
    && Number(formulario.capacidadeAlvara) > 0;
  const lotacaoValida = validacaoLotacao
    && Number(formulario.publicoMinimo) < Number(formulario.capacidadeAlvara);
  const percentualOcupacaoMinima = lotacaoValida
    ? ocupacaoMinima({
        capacidadeAlvara: Number(formulario.capacidadeAlvara),
        publico: { minimo: Number(formulario.publicoMinimo) },
      })
    : 0;
  const dataPassada = dataNoPassado(formulario.dataInicio);
  useEffect(() => {
    if (!eventoId) return;
    if (!getEvento(eventoId)) {
      navigate("/organizador", { replace: true });
      return;
    }
    setEventoAtivo(eventoId);
  }, [eventoId, navigate]);

  useEffect(() => {
    if (eventoId || idSalvo) return undefined;
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(formulario));
      } catch (erro) {
        console.error("Não foi possível salvar automaticamente o rascunho do evento.", erro);
      }
    }, 10000);
    return () => window.clearTimeout(timer);
  }, [eventoId, formulario, idSalvo]);

  useEffect(() => () => {
    if (arquivoPreview) URL.revokeObjectURL(arquivoPreview);
  }, [arquivoPreview]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  if (eventoId && !evento) return null;

  function atualizar(campo, valor) {
    setFormulario((atual) => ({ ...atual, [campo]: valor }));
    setAlterado(true);
  }

  function erroVisivel(campo) {
    return (tocados[campo] || enviado) ? erros[campo] : "";
  }

  function registrarBlur(campo) {
    setTocados((atual) => ({ ...atual, [campo]: true }));
  }

  function propsCampo(campo) {
    const mensagem = erroVisivel(campo);
    return {
      "aria-invalid": Boolean(mensagem),
      "aria-describedby": mensagem ? `erro-${campo}` : undefined,
      ref: (elemento) => { refs.current[campo] = elemento; },
      onBlur: () => registrarBlur(campo),
    };
  }

  async function salvarEvento(status) {
    const dados = valorEvento(formulario, status);
    let id = idSalvo;
    if (id) {
      setEvento(id, dados);
      setEventoAtivo(id);
    } else {
      const novoEvento = await criarEvento(dados);
      id = novoEvento.id;
      setIdSalvo(id);
    }
    if (!eventoId) localStorage.removeItem(CHAVE_RASCUNHO);
    setAlterado(false);
    return id;
  }

  async function salvarRascunho() {
    if (!formulario.nome.trim()) {
      setEnviado(false);
      setTocados((atual) => ({ ...atual, nome: true }));
      refs.current.nome?.focus();
      return;
    }
    try {
      await salvarEvento("rascunho");
      setToast("Rascunho salvo");
    } catch (erro) {
      setToast(erro.message);
    }
  }

  async function avancar() {
    setEnviado(true);
    const primeiroCampoInvalido = [
      "nome",
      "categoria",
      "dataInicio",
      "dataFim",
      "localNome",
      "cidadeUf",
      "publicoMinimo",
      "capacidadeAlvara",
    ].find((campo) => erros[campo]);
    if (primeiroCampoInvalido) {
      refs.current[primeiroCampoInvalido]?.scrollIntoView({ behavior: "smooth", block: "center" });
      refs.current[primeiroCampoInvalido]?.focus({ preventScroll: true });
      return;
    }
    try {
      const id = await salvarEvento("planejamento");
      navigate(`/organizador/eventos/${id}/custos`);
    } catch (erro) {
      setToast(erro.message);
    }
  }

  function cancelar() {
    if (alterado) {
      setModalAberto(true);
      return;
    }
    navigate("/organizador");
  }

  function descartar() {
    if (!eventoId) localStorage.removeItem(CHAVE_RASCUNHO);
    setModalAberto(false);
    navigate("/organizador");
  }

  function selecionarImagem(event) {
    const arquivo = event.target.files?.[0];
    event.target.value = "";
    if (!arquivo) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(arquivo.type)) {
      setErroImagem("Use uma imagem JPG, PNG ou WEBP.");
      return;
    }
    if (arquivo.size > 5 * 1024 * 1024) {
      setErroImagem("A imagem deve ter no máximo 5 MB.");
      return;
    }

    const urlPreview = URL.createObjectURL(arquivo);
    setArquivoPreview(urlPreview);
    setErroImagem("");
    const leitor = new FileReader();
    leitor.onload = () => {
      if (typeof leitor.result === "string") {
        atualizar("capa", leitor.result);
      }
    };
    leitor.onerror = () => setErroImagem("Não foi possível carregar a imagem.");
    leitor.readAsDataURL(arquivo);
  }

  const localPreview = formulario.localNome.trim()
    ? `${formulario.localNome.trim()} • ${formulario.cidadeUf.trim()}`
    : "Anhembi • São Paulo, SP";

  return (
    <div className="ce-page">
      <nav className="ce-breadcrumb" aria-label="Etapas do evento">
        <Link to="/organizador">Meus Eventos</Link>
        <ChevronRight aria-hidden="true" />
        <span className="is-current" aria-current="step">Criar Evento</span>
        <ChevronRight aria-hidden="true" />
        <span>Custos &amp; Orçamento</span>
        <ChevronRight aria-hidden="true" />
        <span>Propostas</span>
        <ChevronRight aria-hidden="true" />
        <span>Precificação</span>
        <ChevronRight aria-hidden="true" />
        <span>Resumo &amp; Publicação</span>
      </nav>

      <header className="ce-heading">
        <span className="ce-step-pill">Etapa 1 de 5</span>
        <h1>Criar Evento</h1>
        <p>Preencha as informações basilares e volumetria de público para desbloquear a composição analítica de custos e orçamentos técnicos com fornecedores homologados.</p>
      </header>

      <form className="ce-form" noValidate onSubmit={(event) => { event.preventDefault(); avancar(); }}>
        <div className="ce-columns">
          <div className="ce-main-column">
            <FormCard icon={FileText} title="Informações Básicas" badge="Obrigatório" badgeClass="is-blue">
              <div className="ce-field">
                <div className="ce-label-row">
                  <label htmlFor="ce-nome">Nome do Evento <Required /></label>
                  <span>{formulario.nome.length}/80</span>
                </div>
                <input
                  {...propsCampo("nome")}
                  id="ce-nome"
                  maxLength={80}
                  placeholder="Ex.: Festival Aurora Sound 2026 - Edição Arena"
                  value={formulario.nome}
                  onChange={(event) => atualizar("nome", event.target.value)}
                />
                <ErrorMessage id="erro-nome" message={erroVisivel("nome")} />
              </div>

              <div className="ce-field-grid ce-field-grid--category">
                <div className="ce-field">
                  <div className="ce-label-row"><label htmlFor="ce-categoria">Categoria / Tipo de Evento <Required /></label></div>
                  <div className="ce-select-wrap">
                    <select
                      {...propsCampo("categoria")}
                      id="ce-categoria"
                      value={formulario.categoria}
                      onChange={(event) => atualizar("categoria", event.target.value)}
                    >
                      <option value="">Selecione uma categoria...</option>
                      {CATEGORIAS.map((categoria) => <option key={categoria}>{categoria}</option>)}
                    </select>
                    <ArrowDownUp size={12} aria-hidden="true" />
                  </div>
                  <ErrorMessage id="erro-categoria" message={erroVisivel("categoria")} />
                </div>
                <div className="ce-field">
                  <div className="ce-label-row"><span>Status Operacional Inicial</span></div>
                  <div className="ce-status-readonly"><i /> Em planejamento</div>
                </div>
              </div>

              <div className="ce-field">
                <div className="ce-label-row"><label htmlFor="ce-descricao">Síntese &amp; Descrição Geral do Evento</label></div>
                <textarea
                  id="ce-descricao"
                  placeholder="Descreva o escopo executivo, público-alvo prioritário, line-up previsto e objetivos de infraestrutura técnica."
                  rows={3}
                  value={formulario.descricao}
                  onChange={(event) => atualizar("descricao", event.target.value)}
                />
              </div>
            </FormCard>

            <FormCard icon={CalendarDays} title="Período e Localização Técnica">
              <div className="ce-field-grid">
                <Field
                  id="ce-data-inicio"
                  label="Data & Início"
                  required
                  error={erroVisivel("dataInicio")}
                  errorId="erro-dataInicio"
                  {...propsCampo("dataInicio")}
                >
                  <input
                    id="ce-data-inicio"
                    type="datetime-local"
                    lang="pt-BR"
                    value={formulario.dataInicio}
                    onChange={(event) => atualizar("dataInicio", event.target.value)}
                  />
                </Field>
                <Field
                  id="ce-data-fim"
                  label="Data & Término Previsto"
                  required
                  error={erroVisivel("dataFim")}
                  errorId="erro-dataFim"
                  {...propsCampo("dataFim")}
                >
                  <input
                    id="ce-data-fim"
                    type="datetime-local"
                    lang="pt-BR"
                    value={formulario.dataFim}
                    onChange={(event) => atualizar("dataFim", event.target.value)}
                  />
                </Field>
              </div>
              <div className="ce-field-grid ce-field-grid--location">
                <Field
                  id="ce-local"
                  label="Local / Espaço do Evento"
                  required
                  error={erroVisivel("localNome")}
                  errorId="erro-localNome"
                  {...propsCampo("localNome")}
                >
                  <input
                    id="ce-local"
                    placeholder="Ex.: Arena Sambódromo Anhembi - Pavilhão Oeste"
                    value={formulario.localNome}
                    onChange={(event) => atualizar("localNome", event.target.value)}
                  />
                </Field>
                <Field
                  id="ce-cidade"
                  label="Cidade & UF"
                  required
                  error={erroVisivel("cidadeUf")}
                  errorId="erro-cidadeUf"
                  {...propsCampo("cidadeUf")}
                >
                  <input
                    id="ce-cidade"
                    placeholder="São Paulo, SP"
                    value={formulario.cidadeUf}
                    onChange={(event) => atualizar("cidadeUf", event.target.value)}
                  />
                </Field>
              </div>
              {dataPassada && (
                <p className="ce-date-warning" role="status">
                  A data de início está no passado. Você pode salvar como rascunho e atualizar depois.
                </p>
              )}
            </FormCard>

            <FormCard icon={UsersRound} title="Capacidade e Audiência Prevista" badge="Regra RF05" badgeClass="is-purple">
              <p className="ce-description">
                A parametrização correta da audiência é mandatória para a estimativa de custos de segurança por metro quadrado, controle de brigadistas e proporção de banheiros químicos.
              </p>
              <div className="ce-field-grid">
                <Field
                  id="ce-publico-minimo"
                  label="Público Mínimo Viável"
                  required
                  hint="Break-even operacional"
                  error={erroVisivel("publicoMinimo")}
                  errorId="erro-publicoMinimo"
                  {...propsCampo("publicoMinimo")}
                >
                  <NumberInput
                    id="ce-publico-minimo"
                    placeholder="Ex.: 3000"
                    value={formulario.publicoMinimo}
                    onChange={(event) => atualizar("publicoMinimo", event.target.value)}
                  />
                </Field>
                <Field
                  id="ce-capacidade"
                  label="Lotação Máxima / Alvará"
                  required
                  hint="Capacidade do local"
                  error={erroVisivel("capacidadeAlvara")}
                  errorId="erro-capacidadeAlvara"
                  {...propsCampo("capacidadeAlvara")}
                >
                  <NumberInput
                    id="ce-capacidade"
                    placeholder="Ex.: 8500"
                    value={formulario.capacidadeAlvara}
                    onChange={(event) => atualizar("capacidadeAlvara", event.target.value)}
                  />
                </Field>
              </div>
              <div className={`ce-capacity-check${validacaoLotacao ? (lotacaoValida ? " is-valid" : " is-invalid") : ""}`}>
                <span className="ce-capacity-check__icon">
                  {validacaoLotacao && !lotacaoValida ? <X size={12} aria-hidden="true" /> : <Check size={12} aria-hidden="true" />}
                </span>
                <div>
                  {!validacaoLotacao ? (
                    <>
                      <strong>Validação de Lotação</strong>
                      <p>Informe o público mínimo e a lotação máxima para validar a consistência.</p>
                    </>
                  ) : lotacaoValida ? (
                    <>
                      <strong>Consistência de Lotação Válida</strong>
                      <p>O público mínimo configurado ({formatarInteiro.format(Number(formulario.publicoMinimo))}) atinge {formatarPercentual.format(percentualOcupacaoMinima * 100)}% da capacidade estrutural máxima permitida ({formatarInteiro.format(Number(formulario.capacidadeAlvara))}).</p>
                    </>
                  ) : (
                    <>
                      <strong>Lotação Inconsistente</strong>
                      <p>O público mínimo deve ser menor que a lotação máxima do alvará.</p>
                    </>
                  )}
                </div>
              </div>
            </FormCard>
          </div>

          <aside className="ce-side-column">
            <FormCard icon={Camera} title="Identidade Visual do Evento" badge="Banner" badgeClass="is-pink">
              <div className="ce-preview">
                <img
                  src={arquivoPreview || formulario.capa || CAPA_PADRAO}
                  alt=""
                />
                <div className="ce-preview__shade" />
                <input
                  ref={imagemInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  onChange={selecionarImagem}
                />
                <button
                  className="ce-preview__replace"
                  type="button"
                  onClick={() => imagemInputRef.current?.click()}
                >
                  <CloudUpload size={11} aria-hidden="true" /> Substituir
                </button>
                <div className="ce-preview__caption">
                  <small>PREVIEW OFICIAL</small>
                  <strong>{formulario.nome.trim() || "Festival Aurora Sound 2026"}</strong>
                  <span><MapPin size={11} aria-hidden="true" />{localPreview}</span>
                </div>
              </div>
              {erroImagem && <p className="ce-image-error" role="alert">{erroImagem}</p>}
            </FormCard>

            <div className="ce-privacy">
              <span><ShieldCheck size={14} aria-hidden="true" /></span>
              <p>Seus dados preliminares são criptografados e nenhuma informação de bilheteria é tornada pública sem sua autorização expressa.</p>
            </div>
          </aside>
        </div>

        <div className="ce-actions">
          <p><Info size={13} aria-hidden="true" /> Campos marcados com * são de preenchimento obrigatório.</p>
          <div className="ce-actions__buttons">
            <button className="ce-button is-back" type="button" onClick={cancelar}>
              <ArrowLeft size={12} aria-hidden="true" /> Cancelar &amp; Voltar
            </button>
            <button className="ce-button is-draft" type="button" onClick={salvarRascunho}>
              <Save size={12} aria-hidden="true" /> Salvar Rascunho
            </button>
            <button
              className={`ce-button is-next${Object.keys(erros).length ? " is-disabled" : ""}`}
              type="submit"
            >
              Avançar <ArrowRight size={12} aria-hidden="true" />
            </button>
          </div>
        </div>
      </form>

      <footer className="ce-footer">
        <span>© 2026 TrocaTicket. Todos os direitos reservados.</span>
        <nav aria-label="Links institucionais">
          <Link to="/termos">Termos de Uso</Link>
          <Link to="/privacidade">Privacidade</Link>
          <Link to="/seguranca">Segurança</Link>
        </nav>
      </footer>

      {toast && <div className="ce-toast" role="status">{toast}</div>}

      {modalAberto && (
        <div className="ce-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setModalAberto(false);
        }}>
          <section className="ce-modal" role="alertdialog" aria-modal="true" aria-labelledby="ce-modal-title">
            <h2 id="ce-modal-title">Descartar alterações?</h2>
            <p>As alterações ainda não salvas serão perdidas.</p>
            <div>
              <button type="button" className="ce-button is-back" onClick={() => setModalAberto(false)}>
                Continuar editando
              </button>
              <button type="button" className="ce-button is-next" onClick={descartar}>
                Descartar
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function FormCard({ icon: Icon, title, badge, badgeClass, children }) {
  return (
    <section className="ce-card">
      <header className="ce-card__heading">
        <span className="ce-card__icon"><Icon size={13} aria-hidden="true" /></span>
        <h2>{title}</h2>
        {badge && <span className={`ce-card__badge ${badgeClass}`}>{badge}</span>}
      </header>
      <div className="ce-card__content">{children}</div>
    </section>
  );
}

function Field({ id, label, required, hint, error, errorId, children, ...inputProps }) {
  const control = cloneElement(children, {
    ...inputProps,
    ...children.props,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? errorId : undefined,
  });
  return (
    <div className="ce-field">
      <div className="ce-label-row">
        <label htmlFor={id}>{label} {required && <Required />}</label>
        {hint && <span>{hint}</span>}
      </div>
      <div className="ce-field__control">{control}</div>
      <ErrorMessage id={errorId} message={error} />
    </div>
  );
}

const NumberInput = forwardRef(function NumberInput({ id, ...props }, ref) {
  return (
    <div className="ce-number-input">
      <input ref={ref} id={id} type="number" min="1" step="1" {...props} />
      <span>pax</span>
    </div>
  );
});

function ErrorMessage({ id, message }) {
  return message ? <span className="ce-error" id={id}>{message}</span> : null;
}

function Required() {
  return <span className="ce-required" aria-hidden="true">*</span>;
}
