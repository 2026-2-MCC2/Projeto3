import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CircleCheck,
  Clock3,
  LoaderCircle,
  X,
} from "lucide-react";
import { PRAZO_ANALISE } from "../services/config.js";
import { getUsuario } from "../services/eventoStore.js";
import {
  consultarStatusCadastro,
  obterLimiteReenvios,
  reenviarConfirmacao,
} from "../services/statusCadastroService.js";
import "./CadastroEmAnalise.css";

const CHAVE_CADASTRO = "trocaticket:cadastro-pendente";
const ESTADOS_VALIDOS = ["em_analise", "aprovado", "reprovado"];

function lerCadastroPendente() {
  const cadastro = JSON.parse(sessionStorage.getItem(CHAVE_CADASTRO) ?? "null");
  if (!cadastro || !cadastro.usuarioId || !["organizador", "fornecedor"].includes(cadastro.perfil)) {
    return null;
  }
  return cadastro;
}

function lerEstadoInicial() {
  try {
    const cadastro = lerCadastroPendente();
    const limite = cadastro
      ? obterLimiteReenvios(cadastro.usuarioId)
      : { restante: 3, cooldownAte: 0 };
    const segundos = Math.max(0, Math.ceil((limite.cooldownAte - Date.now()) / 1000));
    return {
      cadastro,
      erro: "",
      cooldownAte: segundos ? limite.cooldownAte : 0,
      segundos,
      restante: limite.restante,
    };
  } catch {
    return {
      cadastro: null,
      erro: "Não foi possível ler os dados de acompanhamento do cadastro.",
      cooldownAte: 0,
      segundos: 0,
      restante: 3,
    };
  }
}

function VisuallyHidden({ children }) {
  return <span className="cadastro-analise__sr-only">{children}</span>;
}

function Etapas({ status }) {
  const aprovado = status === "aprovado";
  const reprovado = status === "reprovado";

  return (
    <section className="cadastro-analise__steps" aria-labelledby="cadastro-analise-etapas">
      <h2 id="cadastro-analise-etapas">Etapas do Processo de Credenciamento</h2>
      <ol className="cadastro-analise__stepper">
        <li className="cadastro-analise__step cadastro-analise__step--done">
          <span className="cadastro-analise__node" aria-hidden="true"><Check size={16} strokeWidth={2.5} /></span>
          <span className="cadastro-analise__step-label">Envio</span>
          <VisuallyHidden>concluída</VisuallyHidden>
        </li>
        <li className={`cadastro-analise__connector${reprovado ? " cadastro-analise__connector--rejected" : aprovado ? " cadastro-analise__connector--done" : ""}`} aria-hidden="true" />
        <li
          className={`cadastro-analise__step${aprovado ? " cadastro-analise__step--done" : reprovado ? " cadastro-analise__step--rejected" : " cadastro-analise__step--current"}`}
          aria-current={status === "em_analise" ? "step" : undefined}
        >
          <span className="cadastro-analise__node" aria-hidden="true">
            {aprovado
              ? <Check size={16} strokeWidth={2.5} />
              : reprovado
                ? <X size={17} strokeWidth={2.5} />
                : <LoaderCircle size={16} strokeWidth={2.5} />}
          </span>
          <span className="cadastro-analise__step-label">Análise</span>
          <VisuallyHidden>{aprovado ? "concluída" : reprovado ? "não aprovada" : "em andamento"}</VisuallyHidden>
        </li>
        <li className={`cadastro-analise__connector${aprovado ? " cadastro-analise__connector--done" : reprovado ? " cadastro-analise__connector--rejected" : ""}`} aria-hidden="true" />
        <li className={`cadastro-analise__step${aprovado ? " cadastro-analise__step--done" : " cadastro-analise__step--pending"}`}>
          <span className="cadastro-analise__node" aria-hidden="true">
            {aprovado ? <Check size={16} strokeWidth={2.5} /> : "3"}
          </span>
          <span className="cadastro-analise__step-label">Liberação</span>
          <VisuallyHidden>{aprovado ? "concluída" : "pendente"}</VisuallyHidden>
        </li>
      </ol>
    </section>
  );
}

export default function CadastroEmAnalise() {
  const navigate = useNavigate();
  const tituloRef = useRef(null);
  const statusRef = useRef("");
  const [inicial] = useState(lerEstadoInicial);
  const { cadastro } = inicial;
  const [status, setStatus] = useState("");
  const [motivo, setMotivo] = useState("");
  const [carregandoStatus, setCarregandoStatus] = useState(Boolean(cadastro));
  const [reenviando, setReenviando] = useState(false);
  const [toast, setToast] = useState("");
  const [erroStatus, setErroStatus] = useState(inicial.erro);
  const [cooldownAte, setCooldownAte] = useState(inicial.cooldownAte);
  const [segundosRestantes, setSegundosRestantes] = useState(inicial.segundos);
  const [reenviarDisponivel, setReenviarDisponivel] = useState(inicial.restante);

  useEffect(() => {
    tituloRef.current?.focus();
    if (inicial.erro) console.error("Falha ao carregar o registro de acompanhamento cadastral.");
  }, [inicial.erro]);

  const atualizarStatus = useCallback(async () => {
    try {
      const resultado = await consultarStatusCadastro(cadastro.usuarioId);
      if (!ESTADOS_VALIDOS.includes(resultado.status)) {
        throw new Error("O serviço retornou um status cadastral inválido.");
      }
      setErroStatus("");
      if (statusRef.current && statusRef.current !== resultado.status) {
        setToast(`Status do cadastro atualizado: ${resultado.status.replace("_", " ")}.`);
      }
      statusRef.current = resultado.status;
      setStatus(resultado.status);
      setMotivo(resultado.motivo ?? "");
    } catch (erro) {
      setErroStatus(erro.message);
      console.error("Falha ao consultar o status cadastral.", erro);
    } finally {
      setCarregandoStatus(false);
    }
  }, [cadastro]);

  useEffect(() => {
    if (!cadastro) return undefined;
    const primeiraConsulta = window.setTimeout(atualizarStatus, 0);

    const intervalo = window.setInterval(() => {
      if (document.visibilityState === "visible") atualizarStatus();
    }, 60_000);
    const aoVoltarFoco = () => {
      if (document.visibilityState === "visible") atualizarStatus();
    };
    document.addEventListener("visibilitychange", aoVoltarFoco);
    window.addEventListener("focus", aoVoltarFoco);

    return () => {
      window.clearTimeout(primeiraConsulta);
      window.clearInterval(intervalo);
      document.removeEventListener("visibilitychange", aoVoltarFoco);
      window.removeEventListener("focus", aoVoltarFoco);
    };
  }, [cadastro, atualizarStatus]);

  useEffect(() => {
    if (!cooldownAte) {
      return undefined;
    }
    const atualizarContagem = () => {
      const restante = Math.max(0, Math.ceil((cooldownAte - Date.now()) / 1000));
      setSegundosRestantes(restante);
      if (!restante) {
        setCooldownAte(0);
        setReenviarDisponivel(obterLimiteReenvios(cadastro.usuarioId).restante);
      }
    };
    const intervalo = window.setInterval(atualizarContagem, 1000);
    return () => window.clearInterval(intervalo);
  }, [cadastro, cooldownAte]);

  if (!cadastro && !erroStatus) {
    return <Navigate to="/escolha-perfil" replace />;
  }
  if (!cadastro) {
    return (
      <main className="cadastro-analise">
        <p className="cadastro-analise__error" role="alert">{erroStatus}</p>
        <Link to="/escolha-perfil">Voltar à escolha de perfil</Link>
      </main>
    );
  }

  async function reenviarEmail() {
    setReenviando(true);
    setToast("");
    try {
      await reenviarConfirmacao(cadastro.usuarioId);
      const limite = obterLimiteReenvios(cadastro.usuarioId);
      setReenviarDisponivel(limite.restante);
      setCooldownAte(limite.cooldownAte);
      setSegundosRestantes(Math.max(0, Math.ceil((limite.cooldownAte - Date.now()) / 1000)));
      setToast("E-mail reenviado");
    } catch (erro) {
      setToast(erro.message === "Limite de reenvios atingido. Tente novamente mais tarde."
        ? erro.message
        : "Não foi possível reenviar. Tente novamente.");
      console.error("Falha ao reenviar o e-mail de confirmação.", erro);
    } finally {
      setReenviando(false);
    }
  }

  function corrigirCadastro() {
    const usuario = getUsuario(cadastro.usuarioId);
    if (!usuario) {
      setToast("Não foi possível recuperar os dados do cadastro. Fale com a equipe de suporte.");
      return;
    }
    navigate("/cadastro", {
      state: {
        cadastroId: usuario.id,
        perfil: usuario.perfil,
        dadosCadastro: {
          nome: usuario.nome,
          email: usuario.email,
          telefone: usuario.telefone,
          area: usuario.areaAtuacao || usuario.tipoOrganizacao,
        },
      },
    });
  }

  const aprovado = status === "aprovado";
  const reprovado = status === "reprovado";
  const limiteAtingido = reenviarDisponivel <= 0;
  const reenvioDesabilitado = reenviando || segundosRestantes > 0 || limiteAtingido;
  const titulo = aprovado
    ? "Cadastro Aprovado"
    : reprovado
      ? "Cadastro não aprovado"
      : "Cadastro Enviado para Análise";

  return (
    <main className="cadastro-analise">
      <section className={`cadastro-analise__card${aprovado ? " cadastro-analise__card--approved" : ""}${reprovado ? " cadastro-analise__card--rejected" : ""}`} aria-labelledby="cadastro-analise-titulo">
        <div className="cadastro-analise__accent" aria-hidden="true" />
        <div className="cadastro-analise__body">
          <div className="cadastro-analise__status-icon" aria-hidden="true">
            <span className="cadastro-analise__status-ring">
              {aprovado
                ? <CircleCheck size={32} strokeWidth={2.5} />
                : reprovado
                  ? <AlertTriangle size={32} strokeWidth={2.5} />
                  : <Clock3 size={32} strokeWidth={2.5} />}
            </span>
          </div>

          <h1 id="cadastro-analise-titulo" ref={tituloRef} tabIndex="-1" className="cadastro-analise__title">
            {titulo}
          </h1>
          <p className="cadastro-analise__description">
            {aprovado
              ? "Seu acesso foi liberado. Entre com seu e-mail e senha para começar."
              : reprovado
                ? "Não foi possível aprovar seu cadastro com os documentos enviados. Consulte o motivo e corrija os dados para uma nova análise."
                : "Seu cadastro está sendo analisado. Você receberá a notificação de validação cadastral por e-mail após a análise documental."}
          </p>

          {status === "em_analise" && (
            <p className="cadastro-analise__deadline">
              O prazo padrão de análise é de{" "}
              <strong>{PRAZO_ANALISE.min} a {PRAZO_ANALISE.max} {PRAZO_ANALISE.unidade}</strong>.
            </p>
          )}

          {reprovado && motivo && (
            <p className="cadastro-analise__reason"><strong>Motivo:</strong> {motivo}</p>
          )}

          {status && <Etapas status={status} />}

          {erroStatus && <p className="cadastro-analise__error" role="alert">{erroStatus}</p>}

          <div className="cadastro-analise__actions">
            {reprovado ? (
              <>
                <button className="cadastro-analise__primary" type="button" onClick={corrigirCadastro}>
                  Corrigir dados e reenviar <ArrowRight size={16} aria-hidden="true" />
                </button>
                <Link className="cadastro-analise__secondary" to="/suporte">Falar com o suporte</Link>
              </>
            ) : (
              <>
                <Link className="cadastro-analise__primary" to="/login">
                  {aprovado ? "Acessar a plataforma" : "Fazer Login"}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                {!aprovado && (
                  <button
                    className="cadastro-analise__secondary"
                    type="button"
                    onClick={reenviarEmail}
                    disabled={reenvioDesabilitado}
                  >
                    {reenviando
                      ? <><LoaderCircle size={16} aria-hidden="true" /> Enviando…</>
                      : limiteAtingido
                        ? "Limite de reenvios atingido. Tente novamente mais tarde."
                        : segundosRestantes
                          ? `Reenviar em ${segundosRestantes}s`
                          : "Reenviar E-mail"}
                  </button>
                )}
              </>
            )}
          </div>

          <p className="cadastro-analise__help">
            Dúvidas no envio de documentos?{" "}
            <Link to="/suporte">Fale com a equipe de suporte</Link>
          </p>
          <p className="cadastro-analise__live" aria-live="polite" aria-atomic="true">
            {toast || (carregandoStatus ? "Consultando o status do cadastro." : "")}
          </p>
        </div>
      </section>
    </main>
  );
}
