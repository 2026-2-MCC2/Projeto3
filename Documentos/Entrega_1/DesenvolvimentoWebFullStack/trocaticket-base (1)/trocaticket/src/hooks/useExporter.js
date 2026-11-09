import { useMemo } from "react";
import { useAuth } from "./useAuth.js";
import { downloadCSV, downloadPDF, downloadPNG } from "../utils/admin/export.js";

/**
 * Exportações já "assinadas" com o administrador logado (aparece no cabeçalho
 * do PDF). Use nas telas: const { pdf, csv, png } = useExporter();
 */
export function useExporter() {
  const { user } = useAuth();
  return useMemo(() => {
    const autor = { nome: user?.nome ?? "Administrador", cargo: "Administrador(a)" };
    return {
      pdf: (opcoes) => downloadPDF({ ...opcoes, autor }),
      csv: downloadCSV,
      png: downloadPNG,
    };
  }, [user]);
}
