import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./authContext.js";
import { clearToken, getToken, getUsuarioAtual, saveToken } from "../services/api.js";

const CHAVE = "trocaticket:auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    let ativo = true;
    async function restaurarSessao() {
      const token = getToken();
      if (!token) {
        localStorage.removeItem(CHAVE);
        sessionStorage.removeItem(CHAVE);
        setReady(true);
        return;
      }
      let sessaoSalva = null;
      try {
        sessaoSalva = JSON.parse(localStorage.getItem(CHAVE) ?? sessionStorage.getItem(CHAVE) ?? "null");
      } catch {
        localStorage.removeItem(CHAVE);
        sessionStorage.removeItem(CHAVE);
      }
      try {
        const usuario = await getUsuarioAtual();
        if (ativo) setUser({ ...usuario, perfil: usuario.perfil.toLowerCase() });
      } catch (erro) {
        if (erro.status === 401) {
          clearToken();
          localStorage.removeItem(CHAVE);
          sessionStorage.removeItem(CHAVE);
        } else {
          console.error("Não foi possível validar a sessão com a API.", erro);
          if (ativo) {
            setUser(sessaoSalva);
            setAuthError("A API está indisponível. Algumas ações podem não funcionar até a conexão ser restabelecida.");
          }
        }
      } finally {
        if (ativo) setReady(true);
      }
    }
    restaurarSessao();
    return () => { ativo = false; };
  }, []);

  const entrar = useCallback((usuario, lembrar) => {
    localStorage.removeItem(CHAVE);
    sessionStorage.removeItem(CHAVE);
    const { token, ...dadosUsuario } = usuario;
    saveToken(token, lembrar);
    (lembrar ? localStorage : sessionStorage).setItem(CHAVE, JSON.stringify(dadosUsuario));
    setUser(dadosUsuario);
    setAuthError("");
  }, []);

  const sair = useCallback(() => {
    localStorage.removeItem(CHAVE);
    sessionStorage.removeItem(CHAVE);
    clearToken();
    setUser(null);
    setAuthError("");
  }, []);

  const value = useMemo(() => ({ user, ready, authError, entrar, sair }), [user, ready, authError, entrar, sair]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
