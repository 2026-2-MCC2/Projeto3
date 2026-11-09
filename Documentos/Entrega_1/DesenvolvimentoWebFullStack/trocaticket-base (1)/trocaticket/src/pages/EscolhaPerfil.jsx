import { useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, CircleHelp, Handshake, Ticket } from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";
import { PERFIS } from "../services/perfis.js";
import "./EscolhaPerfil.css";

const ICONE_PERFIL = {
  ticket: Ticket,
  handshake: Handshake,
};

const ROTAS_PERFIL = {
  organizador: "/eventos",
  fornecedor: "/fornecedor/painel",
  admin: "/admin",
};

const CHAVE_PERFIL = "trocaticket:perfil-escolhido";

function lerPerfilEscolhido() {
  const perfilSalvo = sessionStorage.getItem(CHAVE_PERFIL);
  return PERFIS.some((perfil) => perfil.id === perfilSalvo) ? perfilSalvo : "";
}

export default function EscolhaPerfil() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const radios = useRef({});
  const [perfilEscolhido, setPerfilEscolhido] = useState(lerPerfilEscolhido);
  const perfilAtual = PERFIS.find((perfil) => perfil.id === perfilEscolhido);

  if (user) {
    return <Navigate to={ROTAS_PERFIL[user.perfil] ?? "/"} replace />;
  }

  function selecionarPerfil(id) {
    sessionStorage.setItem(CHAVE_PERFIL, id);
    setPerfilEscolhido(id);
  }

  function navegarParaCadastro(perfil) {
    selecionarPerfil(perfil.id);
    navigate(`/cadastro?perfil=${perfil.id}`);
  }

  function moverSelecao(evento, indiceAtual) {
    const indiceSeguinte = evento.key === "ArrowRight" || evento.key === "ArrowDown"
      ? (indiceAtual + 1) % PERFIS.length
      : (indiceAtual - 1 + PERFIS.length) % PERFIS.length;

    evento.preventDefault();
    selecionarPerfil(PERFIS[indiceSeguinte].id);
    radios.current[PERFIS[indiceSeguinte].id]?.focus();
  }

  return (
    <main className="escolha">
      <div className="escolha__content">
        <header className="escolha__hero">
          <div className="escolha__wordmark" role="img" aria-label="TrocaTicket">
            <span>Troca</span><strong>Ticket</strong>
          </div>
          <h1>Escolha seu Perfil:</h1>
          <p>
            Selecione como você deseja utilizar nossa plataforma para personalizar sua experiência.
          </p>
        </header>

        <fieldset className="escolha__group" role="radiogroup">
          <legend className="escolha__sr-only">Escolha seu perfil</legend>
          <div className="escolha__cards">
            {PERFIS.map((perfil, index) => {
              const Icone = ICONE_PERFIL[perfil.icone];
              const selecionado = perfilEscolhido === perfil.id;

              return (
                <article
                  key={perfil.id}
                  className={`escolha__card${selecionado ? " escolha__card--selected" : ""}`}
                  onClick={(evento) => {
                    if (!evento.target.closest("button")) selecionarPerfil(perfil.id);
                  }}
                >
                  <input
                    ref={(elemento) => { radios.current[perfil.id] = elemento; }}
                    id={`perfil-${perfil.id}`}
                    className="escolha__radio"
                    type="radio"
                    name="perfil"
                    value={perfil.id}
                    checked={selecionado}
                    onChange={() => selecionarPerfil(perfil.id)}
                    onKeyDown={(evento) => {
                      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(evento.key)) {
                        moverSelecao(evento, index);
                      }
                    }}
                    aria-describedby={`perfil-${perfil.id}-chamada perfil-${perfil.id}-atribuicao`}
                  />
                  <div className="escolha__top">
                    <span className="escolha__icon" aria-hidden="true">
                      <Icone size={26} strokeWidth={1.9} />
                    </span>
                    <div className="escolha__profile">
                      <span id={`perfil-${perfil.id}-chamada`} className="escolha__pill">
                        {perfil.chamada}
                      </span>
                      <h2 className="escolha__name">
                        <label htmlFor={`perfil-${perfil.id}`}>{perfil.rotulo}</label>
                      </h2>
                    </div>
                  </div>

                  <div id={`perfil-${perfil.id}-atribuicao`} className="escolha__assignment">
                    <span className="escolha__info" aria-hidden="true">i</span>
                    <p><strong>Atribuição:</strong> {perfil.atribuicao}</p>
                  </div>

                  <button
                    type="button"
                    className="escolha__cta"
                    onClick={() => navegarParaCadastro(perfil)}
                  >
                    {perfil.cta}
                    <ArrowRight size={16} aria-hidden="true" />
                  </button>
                </article>
              );
            })}
          </div>
        </fieldset>

        <p className="escolha__live" aria-live="polite" aria-atomic="true">
          {perfilAtual ? `Perfil ${perfilAtual.rotulo} selecionado` : ""}
        </p>

        <footer className="escolha__footer">
          <p className="escolha__login">
            Já possui uma conta ativa no TrocaTicket?{" "}
            <Link to="/login">Fazer Login <span aria-hidden="true">›</span></Link>
          </p>
          <nav className="escolha__links" aria-label="Ajuda e políticas">
            <Link to="/suporte">
              <CircleHelp size={14} aria-hidden="true" />
              Dúvidas sobre os perfis? Fale com nosso time
            </Link>
            <span className="escolha__separator" aria-hidden="true">•</span>
            <Link to="/politicas-de-concessao">Políticas de Concessão</Link>
          </nav>
        </footer>
      </div>
    </main>
  );
}
