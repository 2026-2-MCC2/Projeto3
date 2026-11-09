import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
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
import { consultarStatusCadastro } from "../services/statusCadastroService.js";
import "./CadastroEmAnalise.css";

const CHAVE_CADASTRO = "trocaticket:cadastro-pendente";
const ESTADOS_VALIDOS = ["em_analise", "aprovado", "reprovado"];

function lerCadastroPendente() {
  const cadastro = JSON.parse(sessionStorage.getItem(CHAVE_CADASTRO) ?? "null");
  if (!cadastro || !cadastro.usuarioId || !cadastro.statusToken || !["organizador", "fornecedor"].includes(cadastro.perfil)) {
    return null;
  }
  return cadastro;
}

function lerEstadoInicial() {
  try {
    const cadastro = lerCadastroPendente();
    return { cadastro, erro: "" };
  } catch {
    return { cadastro: null, erro: "Não foi possível ler os dados de acompanhamento do cadastro." };
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
  const tituloRef = useRef(null);
  const statusRef = useRef("");
  const [inicial] = useState(lerEstadoInicial);
  const { cadastro } = inicial;
  const [status, setStatus] = useState("");
  const [motivo, setMotivo] = useState("");
  const [carregandoStatus, setCarregandoStatus] = useState(Boolean(cadastro));
  const [toast, setToast] = useState("");
  const [erroStatus, setErroStatus] = useState(inicial.erro);

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

  const aprovado = status === "aprovado";
  const reprovado = status === "reprovado";
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
                  ? "Não foi possível aprovar seu cadastro com os documentos enviados. Consulte o motivo e fale com o suporte para orientações."
                  : "Seu cadastro está sendo analisado. Acompanhe o status nesta página; notificações por e-mail ainda não estão disponíveis."}
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
              <Link className="cadastro-analise__primary" to="/suporte">Falar com o suporte</Link>
            ) : (
              <Link className="cadastro-analise__primary" to={aprovado ? "/login" : "/escolha-perfil"}>
                {aprovado ? "Acessar a plataforma" : "Voltar ao início"}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
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
