import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { LoaderCircle, Search } from "lucide-react";
import { buscarGlobal } from "../../services/adminApi.js";
import "./GlobalSearch.css";

/**
 * Busca global da barra superior: procura em aprovações pendentes, cadastros,
 * eventos e cotações. Atalho: Ctrl/⌘ + K.
 */
export default function GlobalSearch() {
  const [termo, setTermo] = useState("");
  const [resposta, setResposta] = useState({ termo: "", itens: [] });
  const [aberta, setAberta] = useState(false);
  const campo = useRef(null);
  const raiz = useRef(null);

  const valido = termo.trim().length >= 2;
  const buscando = valido && resposta.termo !== termo;
  const itens = valido && resposta.termo === termo ? resposta.itens : [];

  useEffect(() => {
    if (termo.trim().length < 2) return undefined;
    let cancelado = false;
    const t = setTimeout(() => {
      buscarGlobal(termo).then((itensEncontrados) => {
        if (!cancelado) setResposta({ termo, itens: itensEncontrados });
      });
    }, 200);
    return () => {
      cancelado = true;
      clearTimeout(t);
    };
  }, [termo]);

  useEffect(() => {
    const atalho = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        campo.current?.focus();
      }
    };
    const fora = (e) => {
      if (raiz.current && !raiz.current.contains(e.target)) setAberta(false);
    };
    document.addEventListener("keydown", atalho);
    document.addEventListener("mousedown", fora);
    return () => {
      document.removeEventListener("keydown", atalho);
      document.removeEventListener("mousedown", fora);
    };
  }, []);

  function escolher() {
    setAberta(false);
    setTermo("");
  }

  return (
    <div className="adm-gsearch" ref={raiz}>
      <label className="adm-search adm-gsearch__box">
        <Search aria-hidden="true" />
        <input
          ref={campo}
          type="search"
          value={termo}
          placeholder="Buscar eventos, organizadores, cotações…"
          aria-label="Busca global"
          onChange={(e) => {
            setTermo(e.target.value);
            setAberta(true);
          }}
          onFocus={() => setAberta(true)}
          onKeyDown={(e) => e.key === "Escape" && setAberta(false)}
        />
        {buscando ? <LoaderCircle className="adm-spin" aria-hidden="true" /> : <kbd>Ctrl K</kbd>}
      </label>
      {aberta && valido && (
        <div className="adm-gsearch__results adm-panel" role="listbox" aria-label="Resultados da busca">
          {buscando && itens.length === 0 && <p className="adm-gsearch__empty">Buscando…</p>}
          {!buscando && itens.length === 0 && <p className="adm-gsearch__empty">Nada encontrado para “{termo}”.</p>}
          {itens.map((r) => (
            <Link key={`${r.tipo}-${r.rota}`} to={r.rota} role="option" className="adm-gsearch__item" onClick={escolher}>
              <span className="adm-eyebrow">{r.tipo}</span>
              <strong>{r.titulo}</strong>
              <small>{r.detalhe}</small>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
