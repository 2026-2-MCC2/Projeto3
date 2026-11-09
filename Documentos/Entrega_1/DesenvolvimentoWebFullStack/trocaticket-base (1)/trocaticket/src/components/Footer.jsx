import { Link } from "react-router-dom";
import "./Footer.css";

const links = [
  { to: "/termos", label: "Termos de Uso" },
  { to: "/privacidade", label: "Privacidade" },
  { to: "/seguranca", label: "Segurança" },
  { to: "/suporte", label: "Suporte" },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p>© 2026 TrocaTicket. Todos os direitos reservados.</p>
        <nav aria-label="Institucional">
          <ul className="footer__links">
            {links.map((l) => (
              <li key={l.to}>
                <Link to={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
