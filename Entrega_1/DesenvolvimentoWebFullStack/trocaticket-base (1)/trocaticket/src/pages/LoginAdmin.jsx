import { useId, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IdCard, ShieldCheck, Smartphone, Info } from "lucide-react";
import TextField from "../components/TextField.jsx";
import PasswordField from "../components/PasswordField.jsx";
import OtpInput from "../components/OtpInput.jsx";
import Button from "../components/Button.jsx";
import Alert from "../components/Alert.jsx";
import { autenticar } from "../services/authService.js";
import { useAuth } from "../hooks/useAuth.js";
import { validarEmail, validarSenha, validarMfa } from "../utils/validators.js";
import { rotaInicial } from "../utils/rotas.js";
import "./LoginAdmin.css";

export default function LoginAdmin() {
  const [valores, setValores] = useState({ email: "", senha: "", mfa: "", manter: false });
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [erroApi, setErroApi] = useState("");
  const { entrar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mfaLabelId = useId();
  const mfaErroId = useId();

  const validadores = { email: validarEmail, senha: validarSenha, mfa: validarMfa };

  function atualizar(name, valor) {
    setValores((v) => ({ ...v, [name]: valor }));
    if (erros[name]) setErros((er) => ({ ...er, [name]: validadores[name](valor) }));
  }

  function handleChange(e) {
    const { name, type, checked, value } = e.target;
    atualizar(name, type === "checkbox" ? checked : value);
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
      mfa: validarMfa(valores.mfa),
    };
    setErros(novosErros);
    setErroApi("");

    const primeiro = Object.keys(novosErros).find((campo) => novosErros[campo]);
    if (primeiro) {
      // o MFA tem vários inputs: foca o primeiro dígito do grupo
      const alvo = primeiro === "mfa" ? form.querySelector(".otp__digit") : form.elements[primeiro];
      alvo?.focus();
      return;
    }

    setCarregando(true);
    try {
      const usuario = await autenticar({
        email: valores.email,
        senha: valores.senha,
        mfa: valores.mfa,
        admin: true,
      });
      entrar(usuario, valores.manter);
      navigate(location.state?.from ?? rotaInicial[usuario.perfil], { replace: true });
    } catch (err) {
      setErroApi(err.message);
      setCarregando(false);
    }
  }

  return (
    <section className="login-admin" aria-labelledby="login-admin-titulo">
      <header className="login-admin__header">
        <span className="login-admin__tag">
          <ShieldCheck size={12} aria-hidden="true" />
          Autenticação Restrita
        </span>
        <h1 id="login-admin-titulo">Acesso Administrativo</h1>
        <p>Informe suas credenciais corporativas com privilégio administrativo.</p>
      </header>

      <form className="login-admin__form" onSubmit={handleSubmit} noValidate>
        <TextField
          variant="outline"
          label="E-mail Corporativo"
          name="email"
          type="email"
          icon={IdCard}
          placeholder="nome@trocaticket.com.br"
          autoComplete="username"
          value={valores.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={erros.email}
        />

        <PasswordField
          variant="outline"
          label="Senha de Acesso"
          name="senha"
          placeholder="Sua senha"
          value={valores.senha}
          onChange={handleChange}
          onBlur={handleBlur}
          error={erros.senha}
          labelAside={
            <Link to="/recuperar-senha" className="login-admin__it">
              Recuperar acesso com TI
            </Link>
          }
        />

        <div className="login-admin__mfa">
          <span id={mfaLabelId} className="login-admin__mfa-label">
            <Smartphone size={15} aria-hidden="true" />
            Código MFA / Token de Segurança (6 dígitos)
          </span>
          <OtpInput
            value={valores.mfa}
            onChange={(v) => atualizar("mfa", v)}
            invalid={Boolean(erros.mfa)}
            labelledBy={mfaLabelId}
            describedBy={erros.mfa ? mfaErroId : undefined}
          />
          {erros.mfa ? (
            <p id={mfaErroId} className="field__error">
              {erros.mfa}
            </p>
          ) : (
            <p className="login-admin__hint">
              <Info size={13} aria-hidden="true" />
              Token dinâmico de 6 dígitos gerado no seu app corporativo.
            </p>
          )}
        </div>

        <label className="login-admin__keep">
          <input type="checkbox" name="manter" checked={valores.manter} onChange={handleChange} />
          <span>
            Manter autenticado nesta estação segura{" "}
            <small>(dispositivo corporativo homologado)</small>
          </span>
        </label>

        {erroApi && <Alert>{erroApi}</Alert>}

        <Button type="submit" compact loading={carregando}>
          Entrar no Painel Administrador
        </Button>
      </form>
    </section>
  );
}
