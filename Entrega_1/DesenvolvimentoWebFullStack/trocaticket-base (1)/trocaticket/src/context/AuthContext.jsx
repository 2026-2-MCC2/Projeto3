import { useCallback, useMemo, useState } from "react";
import { AuthContext } from "./authContext.js";

const CHAVE = "trocaticket:auth";

function lerSessao() {
  try {
    const bruto = localStorage.getItem(CHAVE) ?? sessionStorage.getItem(CHAVE);
    return bruto ? JSON.parse(bruto) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(lerSessao);

  const entrar = useCallback((usuario, lembrar) => {
    localStorage.removeItem(CHAVE);
    sessionStorage.removeItem(CHAVE);
    (lembrar ? localStorage : sessionStorage).setItem(CHAVE, JSON.stringify(usuario));
    setUser(usuario);
  }, []);

  const sair = useCallback(() => {
    localStorage.removeItem(CHAVE);
    sessionStorage.removeItem(CHAVE);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, entrar, sair }), [user, entrar, sair]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
