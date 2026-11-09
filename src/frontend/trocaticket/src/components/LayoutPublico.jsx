import { Outlet, useLocation } from "react-router-dom";
import Footer from "./Footer.jsx";
import Header from "./Header.jsx";
import { useAuth } from "../hooks/useAuth.js";

export default function LayoutPublico() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const semRodape = pathname === "/" || pathname === "/escolha-perfil";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header variant={user ? "logado" : "publico"} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Outlet />
      </div>
      {!semRodape && <Footer />}
    </div>
  );
}
