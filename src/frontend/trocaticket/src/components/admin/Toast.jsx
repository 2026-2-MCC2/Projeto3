import { useCallback, useMemo, useRef, useState } from "react";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { ToastContext } from "../../context/toastContext.js";
import "./Toast.css";

const ICONES = { success: CircleCheck, error: CircleAlert, info: Info };

/** Avisos temporários (canto superior direito). Envolve o painel inteiro. */
export function ToastProvider({ children }) {
  const [itens, setItens] = useState([]);
  const contador = useRef(0);

  const remover = useCallback((id) => setItens((lista) => lista.filter((t) => t.id !== id)), []);

  const mostrar = useCallback(
    (tipo, titulo, descricao) => {
      const id = ++contador.current;
      setItens((lista) => [...lista, { id, tipo, titulo, descricao }]);
      setTimeout(() => remover(id), 5000);
    },
    [remover],
  );

  const api = useMemo(
    () => ({
      success: (t, d) => mostrar("success", t, d),
      error: (t, d) => mostrar("error", t, d),
      info: (t, d) => mostrar("info", t, d),
    }),
    [mostrar],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="adm-toasts" role="region" aria-label="Notificações" aria-live="polite">
        {itens.map((t) => {
          const Icone = ICONES[t.tipo];
          return (
            <div key={t.id} className={`adm-toast adm-toast--${t.tipo}`} role={t.tipo === "error" ? "alert" : "status"}>
              <Icone aria-hidden="true" />
              <div>
                <strong>{t.titulo}</strong>
                {t.descricao && <p>{t.descricao}</p>}
              </div>
              <button type="button" aria-label="Fechar aviso" onClick={() => remover(t.id)}>
                <X aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
