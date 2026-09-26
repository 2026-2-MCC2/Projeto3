import { Link } from "react-router-dom";
import { Ticket, Handshake, CircleHelp } from "lucide-react";
import PerfilCard from "../components/PerfilCard.jsx";
import "./EscolhaPerfil.css";

const perfis = [
  {
    id: "organizador",
    icon: Ticket,
    tag: "Para produtores & gestores",
    titulo: "Organizador",
    atribuicao:
      "Como Organizador, você cadastra eventos, gerencia emissões, controla transferências de ingressos e acompanha o faturamento da bilheteria.",
    textoBotao: "Quero ser Organizador",
    to: "/cadastro/organizador",
  },
  {
    id: "fornecedor",
    icon: Handshake,
    tag: "Para prestadores & empresas",
    titulo: "Fornecedor",
    atribuicao:
      "Como Fornecedor, você disponibiliza produtos e serviços para organizadores, responde a cotações e gerencia acessos de staff nos eventos.",
    textoBotao: "Quero ser Fornecedor",
    to: "/cadastro/fornecedor",
  },
];

export default function EscolhaPerfil() {
  return (
    <div className="container escolha">
      <header className="escolha__hero">
        <h1 className="escolha__brand">
          <strong>Troca</strong>Ticket
        </h1>
        <h2 className="escolha__subtitle">Escolha seu Perfil:</h2>
      </header>

      <section className="escolha__grid" aria-label="Perfis disponíveis">
        {perfis.map((p) => (
          <PerfilCard key={p.id} {...p} />
        ))}
      </section>

      <div className="escolha__bottom">
        <p>
          Já possui uma conta ativa no TrocaTicket?{" "}
          <Link to="/login" className="escolha__login">
            Fazer Login
          </Link>
        </p>
        <p className="escolha__help">
          <Link to="/ajuda">
            <CircleHelp size={13} aria-hidden="true" /> Dúvidas sobre os perfis? Fale com nosso time
          </Link>
          <Link to="/politicas">Políticas de Concessão</Link>
        </p>
      </div>
    </div>
  );
}
