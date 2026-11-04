import { useId, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  BriefcaseBusiness,
  ChevronDown,
  Eye,
  EyeOff,
  FileCheck2,
  Fingerprint,
  Lock,
  LoaderCircle,
  Mail,
  Phone,
  ShieldCheck,
  UploadCloud,
  Wrench,
  X,
} from "lucide-react";
import { mascararDocumento, mascararTelefone } from "../utils/masks.js";
import {
  forcaSenha,
  validarArquivo,
  validarDocumento,
  validarEmail,
  validarNome,
  validarSenha,
  validarTelefone,
  validarTermos,
  validarArea,
} from "../utils/validators.js";
import { enviarCadastro } from "../services/cadastroService.js";
import "./Cadastro.css";

const AREAS_FORNECEDOR = [
  "Som, Iluminação & Audiovisual",
  "Estrutura, Palco & Tendas",
  "Segurança & Brigada",
  "Saúde & UTI Móvel",
  "Banheiros Químicos & Limpeza",
  "Alimentação & Bebidas",
  "Transporte & Logística",
  "Outro",
];

const TIPOS_ORGANIZACAO = [
  "Produtora de Eventos",
  "Atlética / Centro Acadêmico",
  "Empresa / Corporativo",
  "Pessoa Física",
  "Outro",
];

const VALIDADORES = {
  nome: validarNome,
  email: validarEmail,
  telefone: validarTelefone,
  documento: validarDocumento,
  area: validarArea,
  senha: validarSenha,
  arquivo: validarArquivo,
  termos: validarTermos,
};

function perfilValido(perfil) {
  return perfil === "organizador" || perfil === "fornecedor";
}

function formatarTamanho(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Cadastro({ perfilInicial }) {
  const location = useLocation();
  const navigate = useNavigate();
  const formId = useId();
  const perfilDaRota = location.state?.perfil
    ?? new URLSearchParams(location.search).get("perfil")
    ?? perfilInicial
    ?? "fornecedor";
  const perfilInicialValido = perfilValido(perfilDaRota) ? perfilDaRota : "fornecedor";
  const [valores, setValores] = useState(() => ({
    perfil: perfilInicialValido,
    nome: "",
    email: "",
    telefone: "",
    documento: "",
    area: perfilInicialValido === "fornecedor" ? AREAS_FORNECEDOR[0] : "",
    senha: "",
    arquivo: null,
    termos: false,
  }));
  const [erros, setErros] = useState({});
  const [resumoErros, setResumoErros] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erroApi, setErroApi] = useState("");
  const [arrastando, setArrastando] = useState(false);
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const arquivoRef = useRef(null);
  const perfilRefs = useRef({});
  const strength = forcaSenha(valores.senha);
  const areas = valores.perfil === "fornecedor" ? AREAS_FORNECEDOR : TIPOS_ORGANIZACAO;
  const labelArea = valores.perfil === "fornecedor" ? "Área de Atuação Principal" : "Tipo de Organização";
  const labels = {
    organizador: {
      nome: "Nome ou Razão Social do Organizador",
      placeholder: "Ex: Atlética de Engenharia FECAP",
      documento: "Documentação aceita RG/CNH, Estatuto ou Cartão CNPJ.",
    },
    fornecedor: {
      nome: "Razão Social ou Nome Comercial",
      placeholder: "Ex: Produções Culturais Aurora Ltda.",
      documento: "Contrato Social, Cartão CNPJ ou Documento de Identificação com foto",
    },
  }[valores.perfil];

  function id(campo) {
    return `${formId}-${campo}`;
  }

  function atualizar(campo, valor) {
    setValores((atuais) => ({ ...atuais, [campo]: valor }));
    setErroApi("");
    setResumoErros("");
    if (erros[campo]) setErros((atuais) => ({ ...atuais, [campo]: VALIDADORES[campo](valor) }));
  }

  function trocarPerfil(perfil) {
    setValores((atuais) => ({ ...atuais, perfil, area: "" }));
    setErros((atuais) => ({ ...atuais, area: "" }));
    perfilRefs.current[perfil]?.focus();
  }

  function validarCampo(evento) {
    const { name, value } = evento.target;
    if (VALIDADORES[name]) {
      const valor = name === "arquivo"
        ? valores.arquivo
        : name === "termos"
          ? valores.termos
          : value;
      setErros((atuais) => ({ ...atuais, [name]: VALIDADORES[name](valor) }));
    }
  }

  function aceitarArquivo(file) {
    if (!file) return;
    atualizar("arquivo", file);
    setErros((atuais) => ({ ...atuais, arquivo: validarArquivo(file) }));
  }

  async function handleSubmit(evento) {
    evento.preventDefault();
    const form = evento.currentTarget;
    const novosErros = Object.fromEntries(
      Object.entries(VALIDADORES).map(([campo, validar]) => [
        campo,
        validar(campo === "arquivo" ? valores.arquivo : campo === "termos" ? valores.termos : valores[campo]),
      ]),
    );
    setErros(novosErros);
    setErroApi("");

    const primeiroInvalido = Object.keys(novosErros).find((campo) => novosErros[campo]);
    if (primeiroInvalido) {
      const alvo = form.querySelector(`[data-field="${primeiroInvalido}"]`)
        ?? form.elements.namedItem(primeiroInvalido);
      alvo?.focus();
      setResumoErros("Revise os campos indicados antes de enviar o cadastro.");
      return;
    }

    setCarregando(true);
    try {
      const resultado = await enviarCadastro(valores);
      setValores((atuais) => ({ ...atuais, senha: "" }));
      navigate("/cadastro/status", {
        state: {
          protocolo: resultado.protocolo,
          email: valores.email,
          mensagem: "Cadastro enviado para análise",
        },
      });
    } catch (erro) {
      if (erro.message.includes("e-mail")) {
        setErros((atuais) => ({ ...atuais, email: erro.message }));
      } else if (erro.message.includes("CPF ou CNPJ")) {
        setErros((atuais) => ({ ...atuais, documento: erro.message }));
      }
      setErroApi(erro.message);
      setCarregando(false);
    }
  }

  function handlePerfilKeyDown(evento, perfil) {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(evento.key)) return;
    evento.preventDefault();
    trocarPerfil(perfil === "organizador" ? "fornecedor" : "organizador");
  }

  return (
    <div className="cadastro-page">
      <div className="cadastro__container">
        <Link to="/" className="cadastro__voltar">
          <ArrowLeft size={16} aria-hidden="true" />
          Voltar à seleção
        </Link>

        <div className="cadastro__card">
          <aside className="cadastro__editorial" aria-label="Ecossistema TrocaTicket">
            <div className="cadastro__brand-pill">
              <span aria-hidden="true" />
              Ecossistema Corporativo de Eventos
            </div>
            <div className="cadastro__editorial-copy">
              <span className="cadastro__editorial-divider" aria-hidden="true" />
              <blockquote>
                “Conecte produções, gerencie ingressos e realize as melhores negociações para criação de eventos.”
              </blockquote>
              <p>
                Homologação rápida para organizadores e fornecedores técnicos com segurança contratual e liquidação garantida.
              </p>
            </div>
            <div className="cadastro__assurance">
              <ShieldCheck size={18} aria-hidden="true" />
              <span>Conformidade com a LGPD e auditoria de segurança criptografada</span>
            </div>
          </aside>

          <section className="cadastro__form-side" aria-labelledby={id("titulo")}>
            <header className="cadastro__header">
              <h1 id={id("titulo")}>Cadastro</h1>
              <p>
                Preencha seus dados para solicitar acesso à plataforma. Seu cadastro passará por análise cadastral prévia.
              </p>
            </header>

            <form className="cadastro__form" onSubmit={handleSubmit} noValidate>
              <div className="cadastro__messages" aria-live="polite" aria-atomic="true">
                {resumoErros && <p className="cadastro__error-summary">{resumoErros}</p>}
                {erroApi && <p className="cadastro__error-summary">{erroApi}</p>}
              </div>

              <fieldset className="cadastro__switcher">
                <legend>Tipo de perfil</legend>
                <div className="cadastro__pills" role="radiogroup" aria-label="Tipo de perfil">
                  {[
                    ["organizador", "Organizador", Building2],
                    ["fornecedor", "Fornecedor", Wrench],
                  ].map(([perfil, titulo, Icon]) => (
                    <button
                      key={perfil}
                      ref={(elemento) => { perfilRefs.current[perfil] = elemento; }}
                      type="button"
                      role="radio"
                      aria-checked={valores.perfil === perfil}
                      tabIndex={valores.perfil === perfil ? 0 : -1}
                      className={`cadastro__pill${valores.perfil === perfil ? " cadastro__pill--active" : ""}`}
                      onClick={() => trocarPerfil(perfil)}
                      onKeyDown={(evento) => handlePerfilKeyDown(evento, perfil)}
                    >
                      <Icon size={18} aria-hidden="true" />
                      {titulo}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="cadastro__field">
                <label htmlFor={id("nome")}>{labels.nome}</label>
                <div className={`cadastro__control${erros.nome ? " is-invalid" : ""}`}>
                  <Building2 size={18} aria-hidden="true" />
                  <input
                    id={id("nome")}
                    name="nome"
                    data-field="nome"
                    autoComplete="organization"
                    maxLength={120}
                    placeholder={labels.placeholder}
                    value={valores.nome}
                    onChange={(evento) => atualizar("nome", evento.target.value)}
                    onBlur={validarCampo}
                    aria-invalid={Boolean(erros.nome)}
                    aria-describedby={erros.nome ? id("nome-erro") : undefined}
                  />
                </div>
                {erros.nome && <p id={id("nome-erro")} className="cadastro__field-error">{erros.nome}</p>}
              </div>

              <div className="cadastro__row">
                <div className="cadastro__field">
                  <label htmlFor={id("email")}>E-mail Corporativo</label>
                  <div className={`cadastro__control${erros.email ? " is-invalid" : ""}`}>
                    <Mail size={18} aria-hidden="true" />
                    <input
                      id={id("email")}
                      name="email"
                      data-field="email"
                      type="email"
                      autoComplete="email"
                      placeholder="contato@empresa.com.br"
                      value={valores.email}
                      onChange={(evento) => atualizar("email", evento.target.value)}
                      onBlur={validarCampo}
                      aria-invalid={Boolean(erros.email)}
                      aria-describedby={erros.email ? id("email-erro") : undefined}
                    />
                  </div>
                  {erros.email && <p id={id("email-erro")} className="cadastro__field-error">{erros.email}</p>}
                </div>

                <div className="cadastro__field">
                  <label htmlFor={id("telefone")}>Telefone / WhatsApp</label>
                  <div className={`cadastro__control${erros.telefone ? " is-invalid" : ""}`}>
                    <Phone size={18} aria-hidden="true" />
                    <input
                      id={id("telefone")}
                      name="telefone"
                      data-field="telefone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="(11) 98765-4321"
                      value={valores.telefone}
                      onChange={(evento) => atualizar("telefone", mascararTelefone(evento.target.value))}
                      onBlur={validarCampo}
                      aria-invalid={Boolean(erros.telefone)}
                      aria-describedby={erros.telefone ? id("telefone-erro") : undefined}
                    />
                  </div>
                  {erros.telefone && <p id={id("telefone-erro")} className="cadastro__field-error">{erros.telefone}</p>}
                </div>
              </div>

              <div className="cadastro__row">
                <div className="cadastro__field">
                  <label htmlFor={id("documento")}>CPF ou CNPJ</label>
                  <div className={`cadastro__control${erros.documento ? " is-invalid" : ""}`}>
                    <Fingerprint size={18} aria-hidden="true" />
                    <input
                      id={id("documento")}
                      name="documento"
                      data-field="documento"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="00.000.000/0001-00"
                      value={valores.documento}
                      onChange={(evento) => atualizar("documento", mascararDocumento(evento.target.value))}
                      onBlur={validarCampo}
                      aria-invalid={Boolean(erros.documento)}
                      aria-describedby={erros.documento ? id("documento-erro") : undefined}
                    />
                  </div>
                  {erros.documento && <p id={id("documento-erro")} className="cadastro__field-error">{erros.documento}</p>}
                </div>

                <div className="cadastro__field">
                  <label htmlFor={id("area")}>{labelArea}</label>
                  <div className={`cadastro__control cadastro__select${erros.area ? " is-invalid" : ""}`}>
                    <BriefcaseBusiness size={18} aria-hidden="true" />
                    <select
                      id={id("area")}
                      name="area"
                      data-field="area"
                      value={valores.area}
                      onChange={(evento) => atualizar("area", evento.target.value)}
                      onBlur={validarCampo}
                      aria-invalid={Boolean(erros.area)}
                      aria-describedby={erros.area ? id("area-erro") : undefined}
                    >
                      <option value="">Selecione uma opção</option>
                      {areas.map((area) => <option key={area} value={area}>{area}</option>)}
                    </select>
                    <ChevronDown size={16} aria-hidden="true" />
                  </div>
                  {erros.area && <p id={id("area-erro")} className="cadastro__field-error">{erros.area}</p>}
                </div>
              </div>

              <div className="cadastro__field">
                <div className="cadastro__field-heading">
                  <label htmlFor={id("senha")}>Senha de Acesso</label>
                  <span>Mínimo 8 caracteres</span>
                </div>
                <div className={`cadastro__control${erros.senha ? " is-invalid" : ""}`}>
                  <Lock size={18} aria-hidden="true" />
                  <input
                    id={id("senha")}
                    name="senha"
                    data-field="senha"
                    type={senhaVisivel ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Crie uma senha forte"
                    value={valores.senha}
                    onChange={(evento) => atualizar("senha", evento.target.value)}
                    onBlur={validarCampo}
                    aria-invalid={Boolean(erros.senha)}
                    aria-describedby={erros.senha ? id("senha-erro") : `${id("senha-forca")} ${id("senha-criterio")}`}
                  />
                  <button
                    type="button"
                    className="cadastro__password-toggle"
                    aria-label={senhaVisivel ? "Ocultar senha" : "Mostrar senha"}
                    aria-pressed={senhaVisivel}
                    onClick={() => setSenhaVisivel((visivel) => !visivel)}
                  >
                    {senhaVisivel ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                  </button>
                </div>
                {erros.senha && <p id={id("senha-erro")} className="cadastro__field-error">{erros.senha}</p>}
                <div className="cadastro__strength" id={id("senha-forca")}>
                  <div className="cadastro__strength-bars" aria-hidden="true">
                    {[1, 2, 3, 4].map((nivel) => (
                      <span key={nivel} className={strength >= nivel ? `strength-${strength}` : ""} />
                    ))}
                  </div>
                  <span id={id("senha-criterio")} aria-live="polite">
                    {strength ? ["", "Fraca", "Razoável", "Boa", "Forte"][strength] : "A força da senha aparecerá aqui"}
                  </span>
                </div>
              </div>

              <div className="cadastro__field">
                <div className="cadastro__field-heading">
                  <label htmlFor={id("arquivo-picker")}>Documentação</label>
                  <span>PDF, JPG ou PNG (até 10MB)</span>
                </div>
                <input
                  ref={arquivoRef}
                  id={id("arquivo-picker")}
                  className="cadastro__file-input"
                  type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  aria-describedby={erros.arquivo ? id("arquivo-erro") : undefined}
                  onChange={(evento) => {
                    aceitarArquivo(evento.target.files?.[0] ?? null);
                    evento.target.value = "";
                  }}
                />
                <div
                  className={`cadastro__dropzone${arrastando ? " is-dragging" : ""}${erros.arquivo ? " is-invalid" : ""}${valores.arquivo ? " has-file" : ""}`}
                  role={valores.arquivo ? undefined : "button"}
                  tabIndex={valores.arquivo ? undefined : 0}
                  data-field="arquivo"
                  aria-label={valores.arquivo ? undefined : "Selecionar documento para cadastro"}
                  aria-invalid={Boolean(erros.arquivo)}
                  aria-describedby={erros.arquivo ? id("arquivo-erro") : undefined}
                  onClick={() => { if (!valores.arquivo) arquivoRef.current?.click(); }}
                  onKeyDown={(evento) => {
                    if (!valores.arquivo && (evento.key === "Enter" || evento.key === " ")) {
                      evento.preventDefault();
                      arquivoRef.current?.click();
                    }
                  }}
                  onDragOver={(evento) => { evento.preventDefault(); setArrastando(true); }}
                  onDragLeave={() => setArrastando(false)}
                  onDrop={(evento) => {
                    evento.preventDefault();
                    setArrastando(false);
                    aceitarArquivo(evento.dataTransfer.files?.[0] ?? null);
                  }}
                >
                  {valores.arquivo ? (
                    <div className="cadastro__file-chip">
                      <FileCheck2 size={22} aria-hidden="true" />
                      <span>
                        <strong>{valores.arquivo.name}</strong>
                        <small>{formatarTamanho(valores.arquivo.size)}</small>
                      </span>
                      <button
                        type="button"
                        aria-label={`Remover ${valores.arquivo.name}`}
                        onClick={(evento) => {
                          evento.stopPropagation();
                          atualizar("arquivo", null);
                          if (arquivoRef.current) arquivoRef.current.value = "";
                        }}
                      >
                        <X size={17} aria-hidden="true" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="cadastro__upload-icon"><UploadCloud size={19} aria-hidden="true" /></span>
                      <strong>Arraste ou selecione o documento</strong>
                      <small>{labels.documento}</small>
                    </>
                  )}
                </div>
                {erros.arquivo && <p id={id("arquivo-erro")} className="cadastro__field-error">{erros.arquivo}</p>}
              </div>

              <div className="cadastro__terms-wrap">
                <label className="cadastro__termos" htmlFor={id("termos")}>
                  <input
                    id={id("termos")}
                    name="termos"
                    data-field="termos"
                    type="checkbox"
                    checked={valores.termos}
                    onChange={(evento) => atualizar("termos", evento.target.checked)}
                    onBlur={validarCampo}
                    aria-invalid={Boolean(erros.termos)}
                    aria-describedby={erros.termos ? id("termos-erro") : undefined}
                  />
                  <span>
                    Li e concordo com os{" "}
                    <a href="/termos" target="_blank" rel="noreferrer">Termos de Serviço</a>, a{" "}
                    <a href="/privacidade" target="_blank" rel="noreferrer">Política de Privacidade</a> e o processo de homologação cadastral.
                  </span>
                </label>
                {erros.termos && <p id={id("termos-erro")} className="cadastro__field-error">{erros.termos}</p>}
              </div>

              <button className="cadastro__submit" type="submit" disabled={!valores.termos || carregando} aria-busy={carregando}>
                {carregando ? (
                  <>
                    <LoaderCircle className="cadastro__spinner" size={18} aria-hidden="true" />
                    Enviando…
                  </>
                ) : (
                  <>
                    Criar Cadastro
                    <ArrowRight size={18} aria-hidden="true" />
                  </>
                )}
              </button>
            </form>

            <div className="cadastro__footer-nav">
              Já possui uma conta ativa? <Link to="/login">Fazer Login</Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
