import { useEffect, useState, useSyncExternalStore } from "react";
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
import { Link, useParams } from "react-router-dom";
import {
  getStoreSnapshot,
  setEvento,
  setEventoAtivo,
  subscribe,
} from "../services/eventoStore.js";
import "./CustoOrcamento.css";

const formatarMoeda = (valor) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);

function itensFornecedor(evento) {
  return evento.custos.fornecedores.map((fornecedor, indice) => ({
    id: fornecedor.itemId ?? fornecedor.fornecedorId ?? `fornecedor-${indice}`,
    category: fornecedor.category ?? "Fornecedor",
    quantity: fornecedor.quantity ?? "Item de fornecedor",
    title: fornecedor.title ?? "Custo de fornecedor cadastrado",
    specification: fornecedor.specification ?? "",
    value: fornecedor.valor,
  }));
}

function itensFiscais(evento) {
  if (Array.isArray(evento.custos.detalhesFiscais)) return evento.custos.detalhesFiscais;
  return evento.custos.fiscais > 0
    ? [{
        id: "fiscal-operacional",
        category: "Custos Fiscais & Operacionais",
        quantity: "Pacote operacional",
        title: "Taxas, ECAD, UTI e impostos",
        specification: "Custos fiscais e operacionais previstos para o evento.",
        value: evento.custos.fiscais,
      }]
    : [];
}

const novoFormulario = (tipo) => ({
  tipo,
  id: "",
  category: tipo === "fiscal" ? "Custos Fiscais & Operacionais" : "",
  quantity: "",
  title: "",
  specification: "",
  value: "",
});

export default function CustoOrcamento() {
  const store = useSyncExternalStore(subscribe, getStoreSnapshot, getStoreSnapshot);
  const { id } = useParams();
  const evento = store.eventos.find((item) => item.id === (id ?? store.eventoAtivoId));
  const itens = evento ? itensFornecedor(evento) : [];
  const custosFiscais = evento ? itensFiscais(evento) : [];
  const [formulario, setFormulario] = useState(null);
  const [statusExportacao, setStatusExportacao] = useState("");

  useEffect(() => {
    if (!evento) return;
    if (evento.id !== store.eventoAtivoId) setEventoAtivo(evento.id);
    if (evento.etapaAtual !== "custo") setEvento(evento.id, { etapaAtual: "custo" });
  }, [evento, store.eventoAtivoId]);

  const totalProducao = itens.reduce((total, item) => total + item.value, 0);
  const totalFiscal = custosFiscais.reduce((total, item) => total + item.value, 0);
  const totalGeral = totalProducao + totalFiscal;
  const todosOsCustos = [...itens, ...custosFiscais];

  function abrirNovo(tipo) {
    setFormulario(novoFormulario(tipo));
  }

  function editarItem(tipo, item) {
    setFormulario({ ...item, tipo, value: String(item.value) });
  }

  function salvarCustos(proximosItens, proximosCustosFiscais) {
    if (!evento) return;
    setEvento(evento.id, {
      custos: {
        fornecedores: proximosItens.map(({ id: itemId, ...item }) => ({
          ...item,
          fornecedorId: itemId,
          valor: item.value,
        })),
        fiscais: proximosCustosFiscais.reduce((total, item) => total + item.value, 0),
        detalhesFiscais: proximosCustosFiscais,
      },
    });
  }

  function salvarItem(event) {
    event.preventDefault();
    const valor = Number(formulario.value);
    if (!Number.isFinite(valor) || valor < 0) return;

    const listaAtual = formulario.tipo === "fiscal" ? custosFiscais : itens;
    const registro = {
      ...formulario,
      id: formulario.id || globalThis.crypto.randomUUID(),
      value: valor,
    };
    const listaAtualizada = formulario.id
      ? listaAtual.map((item) => (item.id === formulario.id ? registro : item))
      : [...listaAtual, registro];
    salvarCustos(
      formulario.tipo === "fiscal" ? itens : listaAtualizada,
      formulario.tipo === "fiscal" ? listaAtualizada : custosFiscais,
    );
    setFormulario(null);
  }

  function excluirItem(tipo, id) {
    if (!window.confirm("Deseja excluir este custo do orçamento?")) return;
    if (tipo === "fiscal") {
      salvarCustos(itens, custosFiscais.filter((item) => item.id !== id));
    } else {
      salvarCustos(itens.filter((item) => item.id !== id), custosFiscais);
    }
  }

  function baixarPlanilha() {
    const escapar = (valor) => `"${String(valor).replaceAll('"', '""')}"`;
    const linhas = [
      ["Tipo", "Categoria", "Item", "Quantidade", "Especificação", "Valor"],
      ...itens.map((item) => ["Produção", item.category, item.title, item.quantity, item.specification, item.value]),
      ...custosFiscais.map((item) => ["Fiscal/operacional", item.category, item.title, item.quantity, item.specification, item.value]),
    ];
    const csv = `\ufeff${linhas.map((linha) => linha.map(escapar).join(";")).join("\r\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "orcamento-trocaticket.csv";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatusExportacao("Planilha CSV baixada.");
  }

  return (
    <div className="orcamento-page">
      <header className="orcamento-page__header">
        <div>
          <h1>Composição de Custos e Orçamento</h1>
          {evento && <p className="orcamento-page__event-name">{evento.nome || "Novo evento"}</p>}
        </div>
        <div className="orcamento-page__actions">
          <button className="button button--primary" type="button" onClick={() => abrirNovo("producao")}><Plus size={15} aria-hidden="true" /> Item de Produção</button>
          <button className="button button--secondary" type="button" onClick={() => abrirNovo("fiscal")}><Calculator size={15} aria-hidden="true" /> Custo Fiscal/Op.</button>
        </div>
      </header>

      <div className="orcamento-grid">
        <section className="cost-items-card">
          <div className="cost-items-card__heading">
            <h2><span><Grid2X2 size={15} aria-hidden="true" /></span> Itens de Custo & Produção</h2>
            <div><small>SUBTOTAL PRODUÇÃO</small><strong>{formatarMoeda(totalProducao)}</strong></div>
          </div>
          <div className="cost-items-list">
            {itens.length === 0 && <p className="cost-list-empty">Nenhum item de produção cadastrado.</p>}
            {itens.map((item) => <CostItem key={item.id} item={item} tipo="producao" onEdit={editarItem} onDelete={excluirItem} />)}
          </div>
          <div className="cost-items-card__heading cost-items-card__heading--fiscal">
            <h2><span><Calculator size={15} aria-hidden="true" /></span> Custos Fiscais & Operacionais</h2>
            <div><small>SUBTOTAL FISCAL/OPERACIONAL</small><strong>{formatarMoeda(totalFiscal)}</strong></div>
          </div>
          <div className="cost-items-list">
            {custosFiscais.length === 0 && <p className="cost-list-empty">Nenhum custo fiscal ou operacional cadastrado.</p>}
            {custosFiscais.map((item) => <CostItem key={item.id} item={item} tipo="fiscal" onEdit={editarItem} onDelete={excluirItem} />)}
          </div>
        </section>

        <CostSummary
          items={todosOsCustos}
          totalGeral={totalGeral}
          capacidade={evento?.capacidadeAlvara ?? 0}
          publicoMinimo={evento?.publico.minimo ?? 0}
          onDownload={baixarPlanilha}
          statusExportacao={statusExportacao}
        />
      </div>

      <footer className="orcamento-page__footer">
        <Link to={evento ? `/organizador/eventos/novo?id=${encodeURIComponent(evento.id)}` : "/organizador"} className="button button--secondary">Voltar</Link>
        <Link to="/organizador/eventos/novo/proposta" className="button button--primary">Salvar e continuar</Link>
      </footer>

      {formulario && (
        <div className="budget-modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setFormulario(null); }}>
          <section className="budget-modal" role="dialog" aria-modal="true" aria-labelledby="budget-modal-title">
            <header className="budget-modal__header">
              <div>
                <span>{formulario.tipo === "fiscal" ? "CUSTO FISCAL / OPERACIONAL" : "CUSTO DE PRODUÇÃO"}</span>
                <h2 id="budget-modal-title">{formulario.id ? "Editar custo" : "Adicionar custo"}</h2>
              </div>
              <button type="button" className="budget-modal__close" aria-label="Fechar" onClick={() => setFormulario(null)}>×</button>
            </header>
            <form className="budget-modal__form" onSubmit={salvarItem}>
              <label>Categoria<input autoFocus required value={formulario.category} onChange={(event) => setFormulario({ ...formulario, category: event.target.value })} /></label>
              <label>Nome do item<input required value={formulario.title} onChange={(event) => setFormulario({ ...formulario, title: event.target.value })} /></label>
              <label>Quantidade<input required value={formulario.quantity} onChange={(event) => setFormulario({ ...formulario, quantity: event.target.value })} /></label>
              <label>Valor (R$)<input required type="number" min="0" step="0.01" value={formulario.value} onChange={(event) => setFormulario({ ...formulario, value: event.target.value })} /></label>
              <label className="budget-modal__wide">Especificação<textarea rows="3" value={formulario.specification} onChange={(event) => setFormulario({ ...formulario, specification: event.target.value })} /></label>
              <footer className="budget-modal__footer">
                <button type="button" className="button button--secondary" onClick={() => setFormulario(null)}>Cancelar</button>
                <button type="submit" className="button button--primary">Salvar custo</button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

function CostItem({ item, tipo, onEdit, onDelete }) {
  return (
    <article className="cost-item">
      <div className="cost-item__heading">
        <div><span className="cost-item__category">{item.category}</span><span className="cost-item__quantity">{item.quantity}</span></div>
        <div className="cost-item__value"><small>Custo Previsto</small><strong>{formatarMoeda(item.value)}</strong></div>
      </div>
      <h3>{item.title}</h3>
      <p><strong>Especificação:</strong> {item.specification || "Não informada."}</p>
      <div className="cost-item__footer"><span><SlidersHorizontal size={12} aria-hidden="true" /> {tipo === "fiscal" ? "Custo fiscal / operacional" : "Alocação direta de produção"}</span><div><button type="button" onClick={() => onEdit(tipo, item)}><Edit3 size={13} aria-hidden="true" /> Editar Item</button><button type="button" onClick={() => onDelete(tipo, item.id)}><Trash2 size={13} aria-hidden="true" /> Excluir</button></div></div>
    </article>
  );
}

function CostSummary({ items, totalGeral, capacidade, publicoMinimo, onDownload, statusExportacao }) {
  const categorias = items.reduce((grupos, item) => {
    grupos[item.category] = (grupos[item.category] ?? 0) + item.value;
    return grupos;
  }, {});
  const cores = ["#4F7658", "#C08C45", "#6B8792", "#A85B4B", "#6D6A8D"];

  return (
    <aside className="cost-summary">
      <h2><Scale size={16} aria-hidden="true" /> Resumo Consolidado</h2>
      <div className="cost-summary__total"><small>CUSTO TOTAL PLANEJADO</small><strong>{formatarMoeda(totalGeral)}</strong></div>
      <div className="cost-summary__metrics"><div><small>Capacidade Alvará</small><strong>{formatarMoeda(capacidade > 0 ? totalGeral / capacidade : 0)} <em>/ pax</em></strong><span>{new Intl.NumberFormat("pt-BR").format(capacidade)} pessoas máx.</span></div><div><small>Ponto de Equilíbrio</small><strong>{formatarMoeda(publicoMinimo > 0 ? totalGeral / publicoMinimo : 0)} <em>/ pax</em></strong><span>{new Intl.NumberFormat("pt-BR").format(publicoMinimo)} pagantes mín.</span></div></div>
      <div className="allocation-chart"><div><strong>{totalGeral > 0 ? "100%" : "0%"}</strong><span>ALOCADO</span></div></div>
      <ul className="allocation-legend">
        {Object.entries(categorias).map(([categoria, valor], index) => (
          <li key={categoria}><span className="legend-dot" style={{ backgroundColor: cores[index % cores.length] }} /> <strong>{categoria}</strong><em>{totalGeral ? `${Math.round((valor / totalGeral) * 100)}%` : "0%"}</em><b>{formatarMoeda(valor)}</b></li>
        ))}
      </ul>
      <div className="export-card"><FileSpreadsheet size={17} aria-hidden="true" /><div><strong>Exportar Planilha Completa</strong><span>Arquivo CSV compatível com planilhas</span></div><button type="button" onClick={onDownload}><Download size={13} aria-hidden="true" /> Baixar</button></div>
      <p className="budget-export-status" role="status" aria-live="polite">{statusExportacao}</p>
    </aside>
  );
}
