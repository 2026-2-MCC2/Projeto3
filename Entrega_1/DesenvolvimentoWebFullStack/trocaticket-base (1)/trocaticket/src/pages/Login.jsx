import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, KeyRound, Hourglass, MessageCircleQuestion } from "lucide-react";
import TextField from "../components/TextField.jsx";
import PasswordField from "../components/PasswordField.jsx";
import Button from "../components/Button.jsx";
import Alert from "../components/Alert.jsx";
import { autenticar } from "../services/authService.js";
import { useAuth } from "../hooks/useAuth.js";
import { validarEmail, validarSenha } from "../utils/validators.js";
import { rotaInicial } from "../utils/rotas.js";
import "./Login.css";

const validadores = { email: validarEmail, senha: validarSenha };

export default function Login() {
  const [valores, setValores] = useState({ email: "", senha: "", lembrar: false });
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [erroApi, setErroApi] = useState("");
  const { entrar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleChange(e) {
    const { name, type, checked, value } = e.target;
    const novo = type === "checkbox" ? checked : value;
    setValores((v) => ({ ...v, [name]: novo }));
    if (erros[name]) setErros((er) => ({ ...er, [name]: validadores[name](novo) }));
  }

  function handleBlur(e) {
    const { name, value } = e.target;
    if (validadores[name]) setErros((er) => ({ ...er, [name]: validadores[name](value) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const novosErros = {
      email: validarEmail(valores.email),
      senha: validarSenha(valores.senha),
    };
    setErros(novosErros);
    setErroApi("");

    const primeiroInvalido = Object.keys(novosErros).find((campo) => novosErros[campo]);
    if (primeiroInvalido) {
      form.elements[primeiroInvalido]?.focus();
      return;
    }

    setCarregando(true);
    try {
      const usuario = await autenticar({ email: valores.email, senha: valores.senha });
      entrar(usuario, valores.lembrar);
      navigate(location.state?.from ?? rotaInicial[usuario.perfil], { replace: true });
    } catch (err) {
      setErroApi(err.message);
      setCarregando(false);
    }
  }

  return (
    <div className="login">
      <div className="login__card">
        <aside className="login__editorial">
          <div className="login__editorial-text">
            <h2>Acesse sua central de gestão de eventos, ingressos e parcerias.</h2>
            <p>
              Infraestrutura dedicada a organizadores e fornecedores homologados com total
              transparência, liquidez e conformidade jurídica.
            </p>
          </div>
        </aside>

        <section className="login__form-side" aria-labelledby="login-titulo">
          <div className="login__form-wrap">
            <div className="login__top">
              <div className="login__badge">
                <span className="login__badge-icon" aria-hidden="true">
                  <KeyRound size={15} />
                </span>
                <span>Acesso Seguro</span>
              </div>
              <p className="login__signup">
                Novo por aqui? <Link to="/">Cadastre-se</Link>
              </p>
            </div>

            <h1 id="login-titulo" className="login__title">
              Acesse sua Conta
            </h1>

            <form className="login__form" onSubmit={handleSubmit} noValidate>
              <TextField
                label="E-mail de Acesso ou Corporativo"
                name="email"
                type="email"
                icon={Mail}
                placeholder="seu.email@empresa.com.br"
                autoComplete="email"
                value={valores.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={erros.email}
              />

              <PasswordField
                label="Senha"
                name="senha"
                placeholder="••••••••"
                value={valores.senha}
                onChange={handleChange}
                onBlur={handleBlur}
                error={erros.senha}
                labelAside={
                  <Link to="/recuperar-senha" className="login__forgot">
                    Esqueceu a senha?
                  </Link>
                }
              />

              <label className="login__remember">
                <input
                  type="checkbox"
                  name="lembrar"
                  checked={valores.lembrar}
                  onChange={handleChange}
                />
                Lembrar acesso neste dispositivo
              </label>

              {erroApi && <Alert>{erroApi}</Alert>}

              <Button type="submit" loading={carregando}>
                Entrar
              </Button>
            </form>

            <div className="login__divider">
              <span>ou</span>
            </div>

            <div className="login__status">
              <span className="login__status-icon" aria-hidden="true">
                <Hourglass size={15} />
              </span>
              <div className="login__status-text">
                <strong>Cadastro em homologação?</strong>
                <span>Acompanhe a validação do seu CNPJ ou dados</span>
              </div>
              <Link to="/cadastro/status" className="login__status-link">
                Consultar
              </Link>
            </div>

            <p className="login__support">
              Dificuldades de acesso?{" "}
              <Link to="/suporte">
                <MessageCircleQuestion size={13} aria-hidden="true" /> Falar com o suporte técnico
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
