import { LoaderCircle, CircleAlert } from "lucide-react";
import "./AsyncState.css";

/**
 * Envolve o conteúdo de uma página do painel e mostra, de forma visível,
 * o estado de carregamento, o erro de rede/API ou uma mensagem de lista
 * vazia — sem cada página precisar reescrever essa lógica.
 */
export default function AsyncState({ loading, error, empty, emptyMessage, onRetry, children }) {
  if (loading) {
    return (
      <div className="async-state" role="status" aria-live="polite">
        <LoaderCircle className="async-state__spinner" size={22} aria-hidden="true" />
        <p>Carregando dados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="async-state async-state--error" role="alert">
        <CircleAlert size={22} aria-hidden="true" />
        <p>{error}</p>
        {onRetry && (
          <button type="button" className="async-state__retry" onClick={onRetry}>
            Tentar novamente
          </button>
        )}
      </div>
    );
  }

  if (empty) {
    return (
      <div className="async-state" role="status">
        <p>{emptyMessage ?? "Nenhum registro encontrado."}</p>
      </div>
    );
  }

  return children;
}
