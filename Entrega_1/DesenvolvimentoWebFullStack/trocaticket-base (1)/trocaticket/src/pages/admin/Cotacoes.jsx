import { Info } from "lucide-react";
import { PageHeader } from "../../components/admin/ui.jsx";

export default function Cotacoes() {
  return (
    <>
      <PageHeader title="Cotações" description="A API atual ainda não disponibiliza dados de cotações e propostas." />
      <section className="adm-panel adm-state" role="status">
        <Info aria-hidden="true" />
        <h2>Cotações indisponíveis</h2>
        <p>Esta tela não apresenta dados de demonstração. O fluxo será exibido quando a API oferecer endpoints de cotações e propostas.</p>
      </section>
    </>
  );
}
