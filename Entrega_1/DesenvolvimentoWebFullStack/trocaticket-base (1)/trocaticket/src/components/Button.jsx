import { ArrowRight, LoaderCircle } from "lucide-react";
import "./Button.css";

export default function Button({ children, loading = false, compact = false, ...props }) {
  return (
    <button
      className={`btn ${compact ? "btn--compact" : ""}`}
      disabled={loading || props.disabled}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <>
          <LoaderCircle className="btn__spinner" size={16} aria-hidden="true" />
          Entrando...
        </>
      ) : (
        <>
          {children}
          <ArrowRight size={14} aria-hidden="true" />
        </>
      )}
    </button>
  );
}
