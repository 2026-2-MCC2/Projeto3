import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import "./Modal.css";

/**
 * Janela modal (centralizada) ou painel lateral (`side`), feita com o elemento
 * nativo <dialog>: foco preso, fecha com Esc e clique no fundo, sem bibliotecas.
 */
export function Modal({ open, onClose, title, description, footer, side = false, children }) {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`adm-modal${side ? " adm-modal--side" : ""}`}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      {open && (
        <div className="adm adm-modal__box">
          <header className="adm-modal__header">
            <div>
              <h2 id={titleId}>{title}</h2>
              {description && <p>{description}</p>}
            </div>
            <button type="button" className="adm-btn adm-btn--ghost adm-btn--icon" aria-label="Fechar" onClick={onClose}>
              <X aria-hidden="true" />
            </button>
          </header>
          <div className="adm-modal__body">{children}</div>
          {footer && <footer className="adm-modal__footer">{footer}</footer>}
        </div>
      )}
    </dialog>
  );
}
