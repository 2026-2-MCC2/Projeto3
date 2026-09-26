import {
  Calculator,
  Download,
  Edit3,
  FileSpreadsheet,
  Grid2X2,
  Plus,
  Scale,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";

const itens = [
  {
    category: "Som & Iluminação",
    quantity: "Qtd: 1 sistema completo",
    title: "Sistema Line Array K2 + Rider Técnico de Palco",
    specification: "PA: L-Acoustics K2 com subs KS28, consoles digitais Avid S6L, monitores de palco e microfonação técnica.",
    value: "R$ 80.000,00",
  },
  {
    category: "Palco & Estrutura",
    quantity: "Qtd: 1 estrutura modular",
    title: "Palco Geodésico 24x18m com Cobertura Cristal & House Mix",
    specification: "Estrutura: Cobertura em alumínio Q30/Q50, piso naval com acabamento antiderrapante, torres de delay e laudo ART de montagem.",
    value: "R$ 62.500,00",
  },
  {
    category: "Segurança & Operação",
    quantity: "Qtd: 77 profissionais (turno 12h)",
    title: "Contingente de 65 Vigilantes Patrimoniais + 12 Bombeiros Civis",
    specification: "Escala de segurança interna/perimetral homologada pela Polícia Federal e brigada com plano de evacuação médica.",
    value: "R$ 25.500,00",
  },
  {
    category: "Limpeza & Sanitários",
    quantity: "Qtd: 44 cabines + equipe pós-evento",
    title: "40 Cabines Químicas Standard + 4 Cabines PCD + Coleta Seletiva",
    specification: "Manutenção contínua e higienização durante o evento, caminhão limpa-fossa e descarte certificado de resíduos.",
    value: "R$ 20.000,00",
  },
];

export default function CustoOrcamento() {
  return (
    <div className="orcamento-page">
      <header className="orcamento-page__header">
        <h1>Composição de Custos e Orçamento</h1>
        <div className="orcamento-page__actions">
          <button className="button button--primary" type="button"><Plus size={15} aria-hidden="true" /> Item de Produção</button>
          <button className="button button--secondary" type="button"><Calculator size={15} aria-hidden="true" /> Custo Fiscal/Op.</button>
        </div>
      </header>

      <div className="orcamento-grid">
        <section className="cost-items-card">
          <div className="cost-items-card__heading">
            <h2><span><Grid2X2 size={15} aria-hidden="true" /></span> Itens de Custo & Produção</h2>
            <div><small>SUBTOTAL PRODUÇÃO</small><strong>R$ 188.000,00</strong></div>
          </div>
          <div className="cost-items-list">
            {itens.map((item) => <CostItem key={item.title} {...item} />)}
          </div>
        </section>

        <CostSummary />
      </div>

      <footer className="orcamento-page__footer">
        <Link to="/organizador/eventos/novo" className="button button--secondary">Voltar</Link>
        <Link to="/organizador/eventos/novo/proposta" className="button button--primary">Salvar e continuar</Link>
      </footer>
    </div>
  );
}

function CostItem({ category, quantity, title, specification, value }) {
  return (
    <article className="cost-item">
      <div className="cost-item__heading">
        <div><span className="cost-item__category">{category}</span><span className="cost-item__quantity">{quantity}</span></div>
        <div className="cost-item__value"><small>Custo Previsto</small><strong>{value}</strong></div>
      </div>
      <h3>{title}</h3>
      <p><strong>Especificação:</strong> {specification}</p>
      <div className="cost-item__footer"><span><SlidersHorizontal size={12} aria-hidden="true" /> Alocação direta de produção</span><div><button type="button"><Edit3 size={13} aria-hidden="true" /> Editar Item</button><button type="button"><Trash2 size={13} aria-hidden="true" /> Excluir</button></div></div>
    </article>
  );
}

function CostSummary() {
  return (
    <aside className="cost-summary">
      <h2><Scale size={16} aria-hidden="true" /> Resumo Consolidado</h2>
      <div className="cost-summary__total"><small>CUSTO TOTAL PLANEJADO</small><strong>R$ 284.500,00</strong></div>
      <div className="cost-summary__metrics"><div><small>Capacidade Alvará</small><strong>R$ 33,47 <em>/ pax</em></strong><span>8.500 pessoas máx.</span></div><div><small>Ponto de Equilíbrio</small><strong>R$ 94,83 <em>/ pax</em></strong><span>3.000 pagantes mín.</span></div></div>
      <div className="allocation-chart"><div><strong>100%</strong><span>ALOCADO</span></div></div>
      <ul className="allocation-legend">
        <li><span className="legend-dot dot-sound" /> <strong>Som & Iluminação</strong><em>28%</em><b>R$ 80.000</b></li>
        <li><span className="legend-dot dot-stage" /> <strong>Palco & Estrutura</strong><em>22%</em><b>R$ 62.500</b></li>
        <li><span className="legend-dot dot-fiscal" /> <strong>Custos Fiscais & ECAD</strong><em>18%</em><b>R$ 51.200</b></li>
        <li><span className="legend-dot dot-security" /> <strong>Segurança & Operação</strong><em>16%</em><b>R$ 45.500</b></li>
        <li><span className="legend-dot dot-other" /> <strong>Variáveis & Contingência</strong><em>16%</em><b>R$ 45.300</b></li>
      </ul>
      <div className="export-card"><FileSpreadsheet size={17} aria-hidden="true" /><div><strong>Exportar Planilha Completa</strong><span>Formatos XLSX, CSV e PDF Preliminar</span></div><button type="button"><Download size={13} aria-hidden="true" /> Baixar</button></div>
    </aside>
  );
}
