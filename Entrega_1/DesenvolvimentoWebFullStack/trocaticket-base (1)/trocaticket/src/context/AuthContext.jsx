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

  // lembrar=true guarda no localStorage (persiste); senão só na aba (sessionStorage)
  const entrar = useCallback((usuario, lembrar) => {
    try {
      localStorage.removeItem(CHAVE);
      sessionStorage.removeItem(CHAVE);
      (lembrar ? localStorage : sessionStorage).setItem(CHAVE, JSON.stringify(usuario));
    } catch {
      /* storage indisponível: segue só em memória */
    }
    setUser(usuario);
  }, []);

  const sair = useCallback(() => {
    try {
      localStorage.removeItem(CHAVE);
      sessionStorage.removeItem(CHAVE);
    } catch {
      /* ignora */
    }
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, entrar, sair }), [user, entrar, sair]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
