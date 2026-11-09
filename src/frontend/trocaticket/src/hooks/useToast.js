import { useContext } from "react";
import { ToastContext } from "../context/toastContext.js";

/** toast.success("Título", "descrição opcional") · toast.error(...) · toast.info(...) */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast deve ser usado dentro de <ToastProvider>");
  return ctx;
}
