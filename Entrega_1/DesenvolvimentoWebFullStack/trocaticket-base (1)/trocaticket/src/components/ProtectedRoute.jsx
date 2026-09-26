import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { rotaInicial } from "../utils/rotas.js";

export default function ProtectedRoute({ perfil }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    const login = perfil === "admin" ? "/login-admin" : "/login";
    return <Navigate to={login} replace state={{ from: location.pathname }} />;
  }
  if (user.perfil !== perfil) {
    return <Navigate to={rotaInicial[user.perfil]} replace />;
  }
  return <Outlet />;
}
