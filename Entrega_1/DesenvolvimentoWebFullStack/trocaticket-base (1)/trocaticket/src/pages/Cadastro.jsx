import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Mail,
  Phone,
  IdCard,
  Briefcase,
  Lock,
} from "lucide-react";
import TextField from "../components/TextField.jsx";
import PasswordField from "../components/PasswordField.jsx";
import Select from "../components/Select.jsx";
import FileDropzone from "../components/FileDropzone.jsx";
import PasswordStrength from "../components/PasswordStrength.jsx";
import Button from "../components/Button.jsx";
import Alert from "../components/Alert.jsx";
import { mascararTelefone, mascararDocumento } from "../utils/masks.js";
import {
  validarNome,
  validarEmail,
  validarTelefone,
  validarDocumento,
  validarArea,
  validarSenha,
  validarArquivo,
  validarTermos,
  forcaSenha,
} from "../utils/validators.js";
import { enviarCadastro } from "../services/cadastroService.js";
import "./Cadastro.css";

const AREAS = {
  organizador: [
    "Shows e Festivais",
    "Eventos Corporativos",
    "Teatro e Artes Cênicas",
    "Esportes",
    "Conferências e Congressos",
    "Casamentos e Eventos Sociais",
  ],
  fornecedor: [
    "Som, Iluminação & Audiovisual",
    "Segurança e Controle de Acesso",
    "Estrutura e Decoração",
    "Alimentação e Bar",
    "Transporte e Logística",
  ],
};

const ESTADO_INICIAL = {
  perfil: "organizador",
  nome: "",
  email: "",
  telefone: "",
  documento: "",
  area: "",
  senha: "",
  arquivo: null,
  termos: false,
};

const validadores = {
  nome: validarNome,
  email: validarEmail,
  telefone: validarTelefone,
  documento: validarDocumento,
  area: validarArea,
  senha: validarSenha,
  arquivo: validarArquivo,
  termos: validarTermos,
};

export default function Cadastro({ perfilInicial = "organizador" }) {
  const [valores, setValores] = useState({ ...ESTADO_INICIAL, perfil: perfilInicial });
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [erroApi, setErroApi] = useState("");
  const navigate = useNavigate();

  function atualizar(campo, valor) {
    setValores((v) => ({ ...v, [campo]: valor }));
    if (erros[campo]) setErros((er) => ({ ...er, [campo]: validadores[campo](valor) }));
  }

  function trocarPerfil(perfil) {
    setValores((v) => ({ ...v, perfil, area: "" }));
    setErros((er) => ({ ...er, area: "" }));
  }

  function handleBlur(e) {
    const { name, value } = e.target;
    if (validadores[name]) setErros((er) => ({ ...er, [name]: validadores[name](value) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const novosErros = {
      nome: validarNome(valores.nome),
      email: validarEmail(valores.email),
      telefone: validarTelefone(valores.telefone),
      documento: validarDocumento(valores.documento),
      area: validarArea(valores.area),
      senha: validarSenha(valores.senha),
      arquivo: validarArquivo(valores.arquivo),
      termos: validarTermos(valores.termos),
    };
    setErros(novosErros);
    setErroApi("");

    const primeiroInvalido = Object.keys(novosErros).find((campo) => novosErros[campo]);
    if (primeiroInvalido) {
      const alvo = form.querySelector(`[name="${primeiroInvalido}"]`) ?? form.elements[primeiroInvalido];
      alvo?.focus();
      return;
    }

    setCarregando(true);
    try {
      const resultado = await enviarCadastro(valores);
      navigate("/cadastro/status", { state: { protocolo: resultado.protocolo, email: valores.email } });
    } catch (err) {
      setErroApi(err.message);
      setCarregando(false);
    }
  }

  return (
    <div className="cadastro">
      <div className="container">
        <Link to="/" className="cadastro__voltar">
          ← Voltar à seleção
        </Link>

        <div className="cadastro__card">
          <aside className="cadastro__editorial">
            <div className="cadastro__editorial-text">
              <span className="cadastro__editorial-divider" aria-hidden="true" />
              <blockquote>
                “Conecte produções, gerencie ingressos e realize as melhores negociações para
                criação de eventos”
              </blockquote>
            </div>
          </aside>

          <section className="cadastro__form-side" aria-labelledby="cadastro-titulo">
            <div>
              <div className="cadastro__header">
                <h1 id="cadastro-titulo">Cadastro</h1>
                <p>
                  Preencha seus dados para solicitar acesso à plataforma. Seu cadastro passará por
                  análise cadastral prévia.
                </p>
              </div>

              <form className="cadastro__form" onSubmit={handleSubmit} noValidate>
                <div className="cadastro__switcher">
                  <span className="field__label">Tipo de Perfil</span>
                  <div className="cadastro__pills" role="tablist" aria-label="Tipo de perfil">
                    {["organizador", "fornecedor"].map((perfil) => (
                      <button
                        key={perfil}
                        type="button"
                        role="tab"
                        aria-selected={valores.perfil === perfil}
                        className={`cadastro__pill ${valores.perfil === perfil ? "cadastro__pill--active" : ""}`}
                        onClick={() => trocarPerfil(perfil)}
                      >
                        {perfil === "organizador" ? (
                          <Building2 size={15} aria-hidden="true" />
                        ) : (
                          <Briefcase size={15} aria-hidden="true" />
                        )}
                        {perfil === "organizador" ? "Organizador" : "Fornecedor"}
                      </button>
                    ))}
                  </div>
                </div>

                <TextField
                  label="Razão Social ou Nome Comercial"
                  name="nome"
                  icon={Building2}
                  placeholder="Ex: Produções Culturais Aurora Ltda."
                  value={valores.nome}
                  onChange={(e) => atualizar("nome", e.target.value)}
                  onBlur={handleBlur}
                  error={erros.nome}
                />

                <div className="cadastro__row">
                  <TextField
                    label="E-mail Corporativo"
                    name="email"
                    type="email"
                    icon={Mail}
                    placeholder="contato@empresa.com.br"
                    autoComplete="email"
                    value={valores.email}
                    onChange={(e) => atualizar("email", e.target.value)}
                    onBlur={handleBlur}
                    error={erros.email}
                  />
                  <TextField
                    label="Telefone / WhatsApp"
                    name="telefone"
                    type="tel"
                    icon={Phone}
                    placeholder="(11) 98765-4321"
                    value={valores.telefone}
                    onChange={(e) => atualizar("telefone", mascararTelefone(e.target.value))}
                    onBlur={handleBlur}
                    error={erros.telefone}
                  />
                </div>

                <div className="cadastro__row">
                  <TextField
                    label="CPF ou CNPJ"
                    name="documento"
                    icon={IdCard}
                    placeholder="00.000.000/0001-00"
                    value={valores.documento}
                    onChange={(e) => atualizar("documento", mascararDocumento(e.target.value))}
                    onBlur={handleBlur}
                    error={erros.documento}
                  />
                  <Select
                    label="Área de Atuação Principal"
                    name="area"
                    icon={Briefcase}
                    options={AREAS[valores.perfil]}
                    value={valores.area}
                    onChange={(e) => atualizar("area", e.target.value)}
                    onBlur={handleBlur}
                    error={erros.area}
                  />
                </div>

                <div className="cadastro__senha">
                  <PasswordField
                    label="Senha de Acesso"
                    name="senha"
                    placeholder="Crie uma senha forte"
                    value={valores.senha}
                    onChange={(e) => atualizar("senha", e.target.value)}
                    onBlur={handleBlur}
                    error={erros.senha}
                    labelAside={<span className="cadastro__hint">Mínimo 8 caracteres</span>}
                  />
                  <PasswordStrength pontuacao={forcaSenha(valores.senha)} />
                </div>

                <FileDropzone
                  label="Documentação"
                  hint="PDF, JPG ou PNG (até 10MB)"
                  accept=".pdf,.jpg,.jpeg,.png"
                  file={valores.arquivo}
                  onChange={(arquivo) => atualizar("arquivo", arquivo)}
                  error={erros.arquivo}
                />

                <label className="cadastro__termos">
                  <input
                    type="checkbox"
                    name="termos"
                    checked={valores.termos}
                    onChange={(e) => atualizar("termos", e.target.checked)}
                  />
                  <span>
                    Li e concordo com os <Link to="/termos">Termos de Serviço</Link>, a{" "}
                    <Link to="/privacidade">Política de Privacidade</Link> e o processo de
                    homologação cadastral.
                  </span>
                </label>
                {erros.termos && <p className="field__error">{erros.termos}</p>}

                {erroApi && <Alert>{erroApi}</Alert>}

                <Button type="submit" loading={carregando}>
                  <Lock size={14} aria-hidden="true" style={{ display: "none" }} />
                  Criar Cadastro
                </Button>
              </form>
            </div>

            <div className="cadastro__footer-nav">
              Já possui uma conta ativa? <Link to="/login">Fazer Login</Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
