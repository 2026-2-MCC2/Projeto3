import { useState } from "react";
import { Download, Eye, FileText, Info } from "lucide-react";
import { useToast } from "../../hooks/useToast.js";
import { useAdminQuery } from "../../hooks/useAdminQuery.js";
import { baixarDocumento, MODO_PLACEHOLDER, obterUrlDocumento } from "../../services/adminDocumentos.js";
import { Modal } from "./Modal.jsx";
import { QueryBoundary } from "./ui.jsx";
import "./DocumentoCard.css";

/**
 * Cartão de um documento submetido (contrato social, CND...). Hoje é um
 * PLACEHOLDER: a pré-visualização mostra uma página de exemplo. Quando o
 * documento tiver `url` (ou adminDocumentos.js buscar no servidor) a mesma
 * tela passa a exibir o arquivo real — veja src/services/adminDocumentos.js.
 */
export default function DocumentoCard({ doc }) {
  const [aberto, setAberto] = useState(false);
  const toast = useToast();

  async function baixar() {
    try {
      const ok = await baixarDocumento(doc);
      if (!ok) toast.info("Download indisponível no modo demonstração", "Quando o servidor de arquivos estiver conectado, o arquivo será baixado aqui.");
    } catch {
      toast.error("Não foi possível baixar o documento", "Tente novamente em instantes.");
    }
  }

  return (
    <>
      <div className="adm-doc">
        <div className="adm-doc__top">
          <div className="adm-doc__tile" aria-hidden="true">
            PDF
          </div>
          <div>
            <div className="adm-doc__name" title={doc.nome}>
              {doc.nome}
            </div>
            <div className="adm-doc__meta">
              {doc.tamanho} · {doc.info}
            </div>
          </div>
        </div>
        <div className="adm-doc__actions">
          <button type="button" className="adm-link" onClick={() => setAberto(true)}>
            <Eye aria-hidden="true" /> Pré-visualizar
          </button>
          <button type="button" className="adm-doc__download" aria-label={`Baixar ${doc.nome}`} onClick={baixar}>
            <Download aria-hidden="true" />
          </button>
        </div>
      </div>

      <Modal side open={aberto} onClose={() => setAberto(false)} title={doc.nome} description={`${doc.tamanho} · ${doc.info}`}>
        <Preview doc={doc} />
      </Modal>
    </>
  );
}

function Preview({ doc }) {
  const query = useAdminQuery(() => obterUrlDocumento(doc).then((url) => ({ url })), [doc.id]);
  return (
    <QueryBoundary query={query} linhasSkeleton={1}>
      {({ url }) =>
        url ? (
          <iframe className="adm-doc__frame" src={url} title={`Pré-visualização de ${doc.nome}`} />
        ) : (
          <PlaceholderPagina doc={doc} />
        )
      }
    </QueryBoundary>
  );
}

/** Página de exemplo exibida enquanto o documento não vem do servidor. */
function PlaceholderPagina({ doc }) {
  return (
    <div className="adm-stack adm-stack--sm">
      {MODO_PLACEHOLDER && (
        <div className="adm-doc__aviso" role="note">
          <Info aria-hidden="true" />
          <p>
            <strong>Documento de exemplo.</strong> Este arquivo ainda não está conectado ao servidor — aqui aparecerá o PDF enviado pelo solicitante.
          </p>
        </div>
      )}
      <div className="adm-doc__page" aria-hidden="true">
        <FileText />
        <div className="adm-doc__line adm-doc__line--title" />
        <div className="adm-doc__line" />
        <div className="adm-doc__line" />
        <div className="adm-doc__line adm-doc__line--short" />
        <div className="adm-doc__gap" />
        <div className="adm-doc__line" />
        <div className="adm-doc__line" />
        <div className="adm-doc__line adm-doc__line--short" />
        <div className="adm-doc__stamp">{doc.nome.replace(/\.pdf$/i, "")}</div>
      </div>
    </div>
  );
}
