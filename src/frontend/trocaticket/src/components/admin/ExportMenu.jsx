import { useEffect, useRef, useState } from "react";
import { Download, FileSpreadsheet, FileText, ImageDown, LoaderCircle } from "lucide-react";
import { useToast } from "../../hooks/useToast.js";
import "./ExportMenu.css";

/**
 * Botão "Exportar" com menu de formatos. Passe só os formatos disponíveis:
 *   <ExportMenu onPDF={...} onCSV={...} onPNG={...} />
 * Cada callback pode ser assíncrono; o botão mostra "carregando" e um aviso ao final.
 */
export function ExportMenu({ onPDF, onCSV, onPNG, label = "Exportar", variant = "outline", compact = false }) {
  const [aberto, setAberto] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const raiz = useRef(null);
  const toast = useToast();

  useEffect(() => {
    if (!aberto) return undefined;
    const fora = (e) => {
      if (raiz.current && !raiz.current.contains(e.target)) setAberto(false);
    };
    const esc = (e) => e.key === "Escape" && setAberto(false);
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  async function executar(fn, tipo) {
    setAberto(false);
    try {
      setOcupado(true);
      await fn();
      toast.success(`${tipo} gerado`, "O download começou no seu navegador.");
    } catch (e) {
      console.error(e);
      toast.error(`Não foi possível gerar o ${tipo}`, "Tente novamente em instantes.");
    } finally {
      setOcupado(false);
    }
  }

  const opcoes = [
    onPDF && { tipo: "PDF", titulo: "PDF", detalhe: "Relatório pronto para imprimir", icone: FileText, cor: "pdf", fn: onPDF },
    onCSV && { tipo: "CSV", titulo: "CSV", detalhe: "Dados para Excel ou Planilhas", icone: FileSpreadsheet, cor: "csv", fn: onCSV },
    onPNG && { tipo: "PNG", titulo: "Imagem PNG", detalhe: "Gráfico para apresentações", icone: ImageDown, cor: "png", fn: onPNG },
  ].filter(Boolean);

  return (
    <div className="adm-export" ref={raiz} data-export-ignore="true">
      <button
        type="button"
        className={`adm-btn adm-btn--${variant}${compact ? " adm-btn--icon" : ""}`}
        aria-haspopup="menu"
        aria-expanded={aberto}
        aria-label={label}
        disabled={ocupado}
        onClick={() => setAberto((v) => !v)}
      >
        {ocupado ? <LoaderCircle className="adm-spin" aria-hidden="true" /> : <Download aria-hidden="true" />}
        {!compact && label}
      </button>
      {aberto && (
        <div className="adm-export__menu" role="menu">
          <div className="adm-eyebrow adm-export__title">Formato do arquivo</div>
          {opcoes.map(({ tipo, titulo, detalhe, icone: Icone, cor, fn }) => (
            <button key={tipo} type="button" role="menuitem" className="adm-export__item" onClick={() => executar(fn, tipo)}>
              <Icone className={`adm-export__icon adm-export__icon--${cor}`} aria-hidden="true" />
              <span>
                <strong>{titulo}</strong>
                <small>{detalhe}</small>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
