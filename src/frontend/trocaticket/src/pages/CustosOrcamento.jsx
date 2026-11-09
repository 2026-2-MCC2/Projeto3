import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  ChevronDown,
  Edit3,
  FileSpreadsheet,
  FileText,
  Flag,
  Grid2X2,
  Landmark,
  Network,
  Plus,
  SlidersHorizontal,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import CustosOrcamentoModal from "../components/CustosOrcamentoModal.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";
import { obterCategoria } from "../services/categorias.js";
import {
  custoPorPaxLotacao,
  custoTotal,
  gruposCusto,
  percentuaisGrupo,
  pontoEquilibrio,
  subtotalFiscal,
  subtotalProducao,
  valorGrupo,
} from "../services/calculos.js";
import {
  getStoreSnapshot,
  setEvento,
  setEventoAtivo,
  subscribe,
} from "../services/eventoStore.js";
import "./CustosOrcamento.css";

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const moedaSemCentavos = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});
const numero = new Intl.NumberFormat("pt-BR");
const percentual = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

const itemCategoria = (id) => {
  const categoria = obterCategoria(id);
  return { nome: categoria.nome, classe: id, grupo: categoria.grupoGrafico };
};
const categoriasProducao = {
  som: itemCategoria("som"),
  palco: itemCategoria("palco"),
  seguranca: itemCategoria("seguranca"),
  limpeza: itemCategoria("limpeza"),
  alimentacao: itemCategoria("alimentacao"),
  transporte: itemCategoria("transporte"),
  outro: itemCategoria("outro"),
};

const categoriasFiscais = {
  ecad: itemCategoria("ecad"),
  municipal: { ...itemCategoria("iss"), classe: "municipal" },
  tributario: itemCategoria("tributario"),
  gateway: itemCategoria("gateway"),
  operacao: { ...itemCategoria("uti"), classe: "operacao" },
  seguros: itemCategoria("seguros"),
  outro: itemCategoria("outro"),
};

function nomeFiscal(item, evento) {
  if (item.categoriaId === "municipal") {
    return `Prefeitura Municipal de ${evento.local.cidade || "sua cidade"}`;
  }
  return item.origem;
}

function slug(texto) {
  return (texto || "evento")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function dadosProducao(itens) {
  return [
    ["Categoria", "Grupo no gráfico", "Item", "Quantidade / escopo", "Especificação", "Tags", "Alocação", "Valor (R$)"],
    ...itens.map((item) => [
      categoriasProducao[item.categoriaId]?.nome ?? "Outro",
      gruposCusto.find(({ id }) => id === item.grupoGrafico)?.nome ?? "",
      item.titulo,
      item.qtd,
      item.especificacao,
      item.tags.join(", "),
      item.alocacao === "cotacao" ? "Cotar com fornecedores" : "Alocação direta de produção",
      item.valor,
    ]),
  ];
}

function dadosFiscais(itens, evento) {
  return [
    ["Categoria", "Grupo no gráfico", "Origem / referência", "Descrição", "Observação", "Tipo de cálculo", "Taxa", "Base (R$)", "Valor (R$)"],
    ...itens.map((item) => [
      categoriasFiscais[item.categoriaId]?.nome ?? "Outro",
      gruposCusto.find(({ id }) => id === item.grupoGrafico)?.nome ?? "",
      nomeFiscal(item, evento),
      item.titulo,
      item.observacao,
      item.calculo.tipo,
      item.calculo.taxa ?? "",
      item.calculo.base ?? "",
      item.valor,
    ]),
  ];
}

function gerarCsv(itens, fiscais, evento) {
  const escapar = (valor) => `"${String(valor ?? "").replaceAll('"', '""')}"`;
  const linhas = [
    ["Tipo", "Categoria", "Grupo no gráfico", "Origem / item", "Quantidade / taxa", "Especificação / observação", "Valor (R$)"],
    ...itens.map((item) => [
      "Produção",
      categoriasProducao[item.categoriaId]?.nome ?? "Outro",
      gruposCusto.find(({ id }) => id === item.grupoGrafico)?.nome ?? "",
      item.titulo,
      item.qtd,
      item.especificacao,
      item.valor,
    ]),
    ...fiscais.map((item) => [
      "Fiscal / operacional",
      categoriasFiscais[item.categoriaId]?.nome ?? "Outro",
      gruposCusto.find(({ id }) => id === item.grupoGrafico)?.nome ?? "",
      `${nomeFiscal(item, evento)} — ${item.titulo}`,
      item.calculo.tipo === "percentual"
        ? `${percentual.format(item.calculo.taxa * 100)}% sobre ${moeda.format(item.calculo.base)}`
        : item.calculo.tipo === "taxa_media"
          ? `Taxa média ${percentual.format(item.calculo.taxa * 100)}%`
          : "Valor fixo",
      item.observacao,
      item.valor,
    ]),
  ];
  return `\ufeff${linhas.map((linha) => linha.map(escapar).join(";")).join("\r\n")}`;
}

function baixarArquivo(conteudo, mime, nome) {
  const url = URL.createObjectURL(new Blob([conteudo], { type: mime }));
  const link = document.createElement("a");
  link.href = url;
  link.download = nome;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function CustosOrcamento() {
  const store = useSyncExternalStore(subscribe, getStoreSnapshot, getStoreSnapshot);
  const { id } = useParams();
  const navigate = useNavigate();
  const evento = store.eventos.find((item) => item.id === (id ?? store.eventoAtivoId));
  const itens = evento?.custos.fornecedores ?? [];
  const fiscais = evento?.custos.fiscais ?? [];
  const [modal, setModal] = useState(null);
  const [menuExportacao, setMenuExportacao] = useState(false);
  const [toast, setToast] = useState(null);
  const [itemExclusao, setItemExclusao] = useState(null);
  const [alteracoesNaoSalvas, setAlteracoesNaoSalvas] = useState(false);
  const [grupoEmFoco, setGrupoEmFoco] = useState(null);
  const menuRef = useRef(null);
  const timerToastRef = useRef(null);
  const triggerModalRef = useRef(null);
  const confirmDialogRef = useRef(null);
  const confirmCancelRef = useRef(null);
  const subtotal = evento ? subtotalProducao(evento) : 0;
  const fiscalTotal = evento ? subtotalFiscal(evento) : 0;
  const total = evento ? custoTotal(evento) : 0;

  const exibirToast = useCallback((mensagem, acao = null) => {
    window.clearTimeout(timerToastRef.current);
    setToast({ mensagem, acao });
    timerToastRef.current = window.setTimeout(() => setToast(null), 6000);
  }, [setToast]);

  useEffect(() => () => window.clearTimeout(timerToastRef.current), []);

  useEffect(() => {
    if (!evento) return;
    if (evento.id !== store.eventoAtivoId) setEventoAtivo(evento.id);
    if (evento.etapaAtual !== "custo") setEvento(evento.id, { etapaAtual: "custo" });
  }, [evento, store.eventoAtivoId]);

  useEffect(() => {
    if (!menuExportacao) return undefined;
    function fecharMenu(event) {
      if (!menuRef.current?.contains(event.target)) setMenuExportacao(false);
      if (event.key === "Escape") setMenuExportacao(false);
    }
    document.addEventListener("pointerdown", fecharMenu);
    document.addEventListener("keydown", fecharMenu);
    return () => {
      document.removeEventListener("pointerdown", fecharMenu);
      document.removeEventListener("keydown", fecharMenu);
    };
  }, [menuExportacao]);

  useEffect(() => {
    if (!itemExclusao) return undefined;
    const anterior = document.activeElement;
    confirmCancelRef.current?.focus();
    function manterFoco(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        setItemExclusao(null);
        return;
      }
      if (event.key !== "Tab") return;
      const focaveis = [...confirmDialogRef.current.querySelectorAll("button:not([disabled])")];
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      const indiceAtual = focaveis.indexOf(document.activeElement);
      if (indiceAtual === -1) {
        event.preventDefault();
        (event.shiftKey ? ultimo : primeiro).focus();
      } else if (event.shiftKey && indiceAtual === 0) {
        event.preventDefault();
        ultimo.focus();
      } else if (!event.shiftKey && indiceAtual === focaveis.length - 1) {
        event.preventDefault();
        primeiro.focus();
      }
    }
    document.addEventListener("keydown", manterFoco);
    return () => {
      document.removeEventListener("keydown", manterFoco);
      if (anterior?.isConnected) anterior.focus();
      else document.querySelector(".costs-heading__actions .costs-button")?.focus();
    };
  }, [itemExclusao]);

  if (!evento) {
    return (
      <div className="costs-page">
        <p className="costs-empty-event">Selecione ou cadastre um evento antes de compor o orçamento.</p>
        <Link className="costs-button costs-button--primary" to="/organizador/eventos/novo">
          Criar Evento
        </Link>
      </div>
    );
  }

  function salvarCustos(proximosItens, proximosFiscais) {
    setEvento(evento.id, {
      custos: {
        fornecedores: proximosItens,
        fiscais: proximosFiscais,
      },
    });
    setAlteracoesNaoSalvas(true);
  }

  function salvarItem(item) {
    const tipo = modal.tipo;
    if (tipo === "producao") {
      const lista = itens.some((atual) => atual.id === item.id)
        ? itens.map((atual) => (atual.id === item.id ? item : atual))
        : [...itens, item];
      salvarCustos(lista, fiscais);
    } else {
      const lista = fiscais.some((atual) => atual.id === item.id)
        ? fiscais.map((atual) => (atual.id === item.id ? item : atual))
        : [...fiscais, item];
      salvarCustos(itens, lista);
    }
    exibirToast(modal.item ? "Item atualizado" : "Item adicionado");
    fecharModal();
  }

  function abrirModal(event, tipo, item = null) {
    triggerModalRef.current = event.currentTarget;
    setModal({ tipo, item });
  }

  function fecharModal() {
    setModal(null);
    window.requestAnimationFrame(() => triggerModalRef.current?.focus());
  }

  function confirmarExclusao() {
    if (!itemExclusao) return;
    const { tipo, item } = itemExclusao;
    const listaAnterior = tipo === "producao" ? itens : fiscais;
    const indiceOriginal = listaAnterior.findIndex((atual) => atual.id === item.id);
    const listaAtualizada = listaAnterior.filter((atual) => atual.id !== item.id);
    if (tipo === "producao") salvarCustos(listaAtualizada, fiscais);
    else salvarCustos(itens, listaAtualizada);
    setItemExclusao(null);
    exibirToast("Item excluído", () => {
      const listaDesfeita = [...listaAtualizada];
      listaDesfeita.splice(indiceOriginal, 0, item);
      if (tipo === "producao") salvarCustos(listaDesfeita, fiscais);
      else salvarCustos(itens, listaDesfeita);
      setAlteracoesNaoSalvas(true);
      exibirToast("Exclusão desfeita");
    });
  }

  function salvarRascunho() {
    setEvento(evento.id, { status: "planejamento" });
    setAlteracoesNaoSalvas(false);
    exibirToast("Rascunho salvo");
  }

  function irParaPropostas() {
    if (itens.length === 0) {
      exibirToast("Adicione ao menos um item de produção antes de continuar.");
      document.querySelector(".production-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const pendente = [...itens, ...fiscais].find((item) => !item.grupoGrafico);
    if (pendente) {
      exibirToast("Classifique os itens restantes no gráfico antes de continuar.");
      document.querySelector(`[data-cost-id="${pendente.id}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setEvento(evento.id, { status: "planejamento" });
    setAlteracoesNaoSalvas(false);
    navigate(`/eventos/${encodeURIComponent(evento.id)}/propostas`);
  }

  function navegarEtapaUm(event) {
    if (alteracoesNaoSalvas && !window.confirm("Há alterações no orçamento que ainda não foram salvas como rascunho. Deseja sair mesmo assim?")) {
      event.preventDefault();
    }
  }

  function baixarCsv() {
    baixarArquivo(
      gerarCsv(itens, fiscais, evento),
      "text/csv;charset=utf-8",
      `orcamento-${slug(evento.nome)}.csv`,
    );
    setMenuExportacao(false);
    exibirToast("Arquivo CSV baixado");
  }

  function criarWorkbook(XLSX, apenasDre) {
    const workbook = XLSX.utils.book_new();
    if (!apenasDre) {
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(dadosProducao(itens)), "Produção");
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(dadosFiscais(fiscais, evento)), "Fiscais");
      return workbook;
    }

    const rowsDre = [
      ["Grupo", "Valor (R$)", "Percentual"],
      ...gruposCusto.map((grupo) => [
        grupo.nome,
        valorGrupo(evento, grupo.id),
        total > 0 ? valorGrupo(evento, grupo.id) / total : 0,
      ]),
      ["Não classificado", Math.max(0, total - gruposCusto.reduce((soma, grupo) => soma + valorGrupo(evento, grupo.id), 0)), ""],
      ["Custo total", total, ""],
      ["Custo por pessoa (lotação máxima)", custoPorPaxLotacao(evento), ""],
      ["Ponto de equilíbrio por pagante mínimo", pontoEquilibrio(evento), ""],
    ];
    const dre = XLSX.utils.aoa_to_sheet(rowsDre);
    dre["!cols"] = [{ wch: 38 }, { wch: 20 }, { wch: 16 }];
    gruposCusto.forEach((grupo, indice) => {
      const celulaPercentual = XLSX.utils.encode_cell({ r: indice + 1, c: 2 });
      if (dre[celulaPercentual]) dre[celulaPercentual].z = "0.0%";
    });
    XLSX.utils.book_append_sheet(workbook, dre, "DRE Preliminar");
    return workbook;
  }

  async function baixarXlsx(apenasDre = false) {
    try {
      const XLSX = await import("@e965/xlsx");
      const workbook = criarWorkbook(XLSX, apenasDre);
      XLSX.writeFile(workbook, `orcamento-${slug(evento.nome)}${apenasDre ? "-dre" : ""}.xlsx`);
      setMenuExportacao(false);
      exibirToast(apenasDre ? "DRE preliminar baixada" : "Planilha XLSX baixada");
    } catch (error) {
      console.error("Falha ao gerar a planilha de custos.", error);
      exibirToast("Não foi possível gerar a planilha. Tente novamente.");
    }
  }

  const pendenciaGrupo = [...itens, ...fiscais].some((item) => !item.grupoGrafico);

  return (
    <div className="costs-page">
      <Breadcrumb etapaAtual={2} eventoId={evento.id} onEtapaUmClick={navegarEtapaUm} />

      <header className="costs-heading">
        <h1>Composição de Custos e Orçamento</h1>
        <div className="costs-heading__actions">
          <button
            type="button"
            className="costs-button costs-button--primary"
            onClick={(event) => abrirModal(event, "producao")}
          >
            <Plus size={17} aria-hidden="true" /> Item de Produção
          </button>
          <button
            type="button"
            className="costs-button costs-button--fiscal"
            onClick={(event) => abrirModal(event, "fiscal")}
          >
            <FileText size={16} aria-hidden="true" /> Custo Fiscal/Op.
          </button>
        </div>
      </header>

      <div className="costs-grid">
        <div className="costs-column">
          <CostSection
            className="production-card"
            icon={<Grid2X2 size={16} aria-hidden="true" />}
            iconClass="is-blue"
            title="Itens de Custo & Produção"
            subtitle={`${itens.length} ${itens.length === 1 ? "contrato" : "contratos"} de fornecedores integrados`}
            subtotalLabel="SUBTOTAL PRODUÇÃO"
            subtotal={subtotal}
          >
            {itens.length === 0 ? (
              <p className="cost-section__empty">Nenhum item de produção cadastrado. Use + Item de Produção para começar.</p>
            ) : itens.map((item) => (
              <ProductionItem
                key={item.id}
                item={item}
                onEdit={(event) => abrirModal(event, "producao", item)}
                onDelete={() => setItemExclusao({ tipo: "producao", item })}
              />
            ))}
          </CostSection>

          <CostSection
            icon={<Landmark size={17} aria-hidden="true" />}
            iconClass="is-orange"
            title="Custos Fiscais, Operacionais & Variáveis"
            subtitle="Retenções tributárias e garantias operacionais"
            subtotalLabel="SUBTOTAL FISC./OPER."
            subtotal={fiscalTotal}
            className="fiscal-card"
          >
            {fiscais.length === 0 ? (
              <p className="cost-section__empty">Nenhum custo fiscal ou operacional cadastrado.</p>
            ) : fiscais.map((item) => (
              <FiscalItem
                key={item.id}
                item={item}
                evento={evento}
                onEdit={(event) => abrirModal(event, "fiscal", item)}
                onDelete={() => setItemExclusao({ tipo: "fiscal", item })}
              />
            ))}
          </CostSection>
        </div>

        <div className="costs-summary-column">
          <CostSummary
            evento={evento}
            total={total}
            pendenciaGrupo={pendenciaGrupo}
            grupoEmFoco={grupoEmFoco}
            setGrupoEmFoco={setGrupoEmFoco}
          />
          <div className="cost-export-card">
            <span className="cost-export-card__icon"><FileSpreadsheet size={18} aria-hidden="true" /></span>
            <div>
              <strong>Exportar Planilha Completa</strong>
              <span>Formatos XLSX, CSV e DRE Preliminar</span>
            </div>
            <div className="cost-export-menu" ref={menuRef}>
              <button
                type="button"
                className="cost-export-menu__trigger"
                aria-expanded={menuExportacao}
                aria-haspopup="menu"
                onClick={() => setMenuExportacao((aberto) => !aberto)}
              >
                Baixar <ChevronDown size={14} aria-hidden="true" />
              </button>
              {menuExportacao && (
                <div className="cost-export-menu__items" role="menu">
                  <button type="button" role="menuitem" onClick={() => baixarXlsx(false)}>Planilha (.xlsx)</button>
                  <button type="button" role="menuitem" onClick={baixarCsv}>Dados (.csv)</button>
                  <button type="button" role="menuitem" onClick={() => baixarXlsx(true)}>DRE Preliminar (.xlsx)</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="costs-step-actions">
        <Link
          to={`/organizador/eventos/novo?id=${encodeURIComponent(evento.id)}`}
          className="costs-button costs-button--back"
          onClick={navegarEtapaUm}
        >
          <ArrowLeft size={16} aria-hidden="true" /> Voltar
        </Link>
        <div className="costs-step-actions__right">
          <button type="button" className="costs-button costs-button--draft" onClick={salvarRascunho}>
            <Bookmark size={15} aria-hidden="true" /> Salvar Rascunho
          </button>
          <button type="button" className="costs-button costs-button--primary" onClick={irParaPropostas}>
            Ir para as Propostas <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      {modal && (
        <CustosOrcamentoModal
          tipo={modal.tipo}
          item={modal.item}
          cidade={evento.local.cidade}
          onClose={fecharModal}
          onSave={salvarItem}
        />
      )}

      {itemExclusao && (
        <div className="budget-modal-overlay">
          <section
            ref={confirmDialogRef}
            className="cost-confirm-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="cost-confirm-title"
          >
            <h2 id="cost-confirm-title">Excluir este item?</h2>
            <p>Esta ação não pode ser desfeita.</p>
            <div>
              <button
                ref={confirmCancelRef}
                type="button"
                className="costs-button costs-button--back"
                onClick={() => setItemExclusao(null)}
              >
                Cancelar
              </button>
              <button type="button" className="costs-button costs-button--danger" onClick={confirmarExclusao}>Excluir</button>
            </div>
          </section>
        </div>
      )}

      {toast && (
        <div className="cost-toast" role="status" aria-live="polite">
          <Check size={16} aria-hidden="true" />
          <span>{toast.mensagem}</span>
          {toast.acao && (
            <button type="button" onClick={() => {
              const acao = toast.acao;
              window.clearTimeout(timerToastRef.current);
              setToast(null);
              acao();
            }}>
              Desfazer
            </button>
          )}
          <button type="button" className="cost-toast__close" aria-label="Fechar notificação" onClick={() => setToast(null)}>
            <X size={15} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

function CostSection({ icon, iconClass, title, subtitle, subtotalLabel, subtotal, className = "", children }) {
  return (
    <section className={`cost-section ${className}`}>
      <header className="cost-section__header">
        <span className={`cost-section__icon ${iconClass}`}>{icon}</span>
        <div className="cost-section__title">
          <h2>{title}</h2>
          <span>{subtitle}</span>
        </div>
        <div className="cost-section__subtotal">
          <small>{subtotalLabel}</small>
          <strong>{moeda.format(subtotal)}</strong>
        </div>
      </header>
      <div className="cost-section__items">{children}</div>
    </section>
  );
}

function ProductionItem({ item, onEdit, onDelete }) {
  const category = categoriasProducao[item.categoriaId] ?? categoriasProducao.outro;
  const group = gruposCusto.find(({ id }) => id === item.grupoGrafico);
  return (
    <article className={`cost-item cost-item--${category.classe}`} data-cost-id={item.id}>
      <div className="cost-item__top">
        <div className="cost-item__tags">
          <span className={`cost-category cost-category--${category.classe}`}>{category.nome}</span>
          <span className="cost-item__quantity">Qtd: {item.qtd}</span>
          {item.tags.map((tag) => <span className="cost-tag" key={tag}>{tag}</span>)}
        </div>
        <div className="cost-item__value">
          <small>Custo Previsto</small>
          <strong className={`cost-value--${category.classe}`}>{moeda.format(item.valor)}</strong>
        </div>
      </div>
      <h3 title={item.titulo}>{item.titulo}</h3>
      <p className="cost-item__description"><strong>Especificação:</strong> {item.especificacao || "Não informada."}</p>
      <div className="cost-item__footer">
        <span>
          <SlidersHorizontal size={13} aria-hidden="true" />
          {item.alocacao === "cotacao" ? "Cotar com fornecedores" : "Alocação direta de produção"}
          {!group && <em>Classifique o grupo</em>}
        </span>
        <ItemActions onEdit={onEdit} onDelete={onDelete} />
      </div>
    </article>
  );
}

function FiscalItem({ item, evento, onEdit, onDelete }) {
  const category = categoriasFiscais[item.categoriaId] ?? categoriasFiscais.outro;
  const tipoCalculo = item.calculo.tipo;
  const tipoLabel = tipoCalculo === "percentual"
    ? `Percentual: ${percentual.format(item.calculo.taxa * 100)}%`
    : tipoCalculo === "taxa_media"
      ? `Taxa média: ${percentual.format(item.calculo.taxa * 100)}%`
      : "Valor Fixo";
  const tipoClasse = tipoCalculo === "percentual" ? "percent" : tipoCalculo === "taxa_media" ? "average" : "fixed";

  return (
    <article className="fiscal-item" data-cost-id={item.id}>
      <div className="fiscal-item__top">
        <div className="fiscal-item__reference">
          <span className={`cost-category cost-category--${category.classe}`}>{category.nome}</span>
          <span>{nomeFiscal(item, evento)}</span>
        </div>
        <span className={`fiscal-item__calc fiscal-item__calc--${tipoClasse}`}>{tipoLabel}</span>
      </div>
      <h3>{item.titulo}</h3>
      <div className="fiscal-item__bottom">
        <p>{item.observacao || "Sem observações adicionais."}</p>
        <strong>{moeda.format(item.valor)}</strong>
      </div>
      {tipoCalculo === "percentual" && (
        <small className="fiscal-item__base">Base de cálculo: {moeda.format(item.calculo.base)}</small>
      )}
      <ItemActions onEdit={onEdit} onDelete={onDelete} />
    </article>
  );
}

function ItemActions({ onEdit, onDelete }) {
  return (
    <div className="cost-item__actions">
      <button type="button" className="cost-item__edit" onClick={onEdit}>
        <Edit3 size={13} aria-hidden="true" /> Editar Item
      </button>
      <button type="button" className="cost-item__delete" onClick={onDelete}>
        <Trash2 size={13} aria-hidden="true" /> Excluir
      </button>
    </div>
  );
}

function CostSummary({
  evento,
  total,
  pendenciaGrupo,
  grupoEmFoco,
  setGrupoEmFoco,
}) {
  const porcentagens = percentuaisGrupo(evento);
  const alocado = gruposCusto.reduce((soma, grupo) => soma + valorGrupo(evento, grupo.id), 0);
  const percentualAlocado = total > 0 ? (alocado / total) * 100 : 0;
  const circunferencia = 2 * Math.PI * 78;
  const segmentos = gruposCusto.reduce((acumulador, grupo) => {
    const valor = valorGrupo(evento, grupo.id);
    const share = total > 0 ? valor / total : 0;
    const arc = share * circunferencia;
    return {
      offset: acumulador.offset + arc,
      itens: [...acumulador.itens, { grupo, valor, arc, offset: -acumulador.offset }],
    };
  }, { offset: 0, itens: [] }).itens;

  return (
    <aside className="cost-summary">
      <header className="cost-summary__header">
        <span><Network size={17} aria-hidden="true" /></span>
        <h2>Resumo Consolidado</h2>
        <span className="cost-summary__status">Ativo</span>
      </header>
      <div className="cost-summary__total">
        <small>CUSTO TOTAL PLANEJADO</small>
        <strong>{moeda.format(total)}</strong>
      </div>
      <div className="cost-summary__metrics">
        <div>
          <UsersRound size={15} aria-hidden="true" />
          <span>Capacidade Alvará</span>
          <strong>{moeda.format(custoPorPaxLotacao(evento))}<em>/ pax</em></strong>
          <small>{numero.format(evento.capacidadeAlvara)} pessoas máx.</small>
        </div>
        <div>
          <Flag size={15} aria-hidden="true" />
          <span>Ponto de Equilíbrio</span>
          <strong>{moeda.format(pontoEquilibrio(evento))}<em>/ pax</em></strong>
          <small>{numero.format(evento.publico.minimo)} pagantes mín.</small>
        </div>
      </div>
      <div className="cost-donut-wrap">
        <div className="cost-donut">
          <svg
            viewBox="0 0 210 210"
            role="img"
            aria-label={`Alocação de custos: ${gruposCusto.map((grupo) => `${grupo.nome}, ${moeda.format(valorGrupo(evento, grupo.id))}`).join("; ")}.`}
          >
            <circle className="cost-donut__shadow" cx="105" cy="105" r="101" />
            <circle className="cost-donut__track" cx="105" cy="105" r="78" />
            <g transform="rotate(-90 105 105)">
              {segmentos.map(({ grupo, valor, arc, offset }) => {
                return (
                  <circle
                    key={grupo.id}
                    className={`cost-donut__segment${grupoEmFoco === grupo.id ? " is-active" : ""}`}
                    cx="105"
                    cy="105"
                    r="78"
                    stroke={grupo.cor}
                    strokeDasharray={`${Math.max(0, arc - 2)} ${circunferencia - Math.max(0, arc - 2)}`}
                    strokeDashoffset={offset}
                    tabIndex={0}
                    aria-label={`${grupo.nome}: ${moeda.format(valor)} (${percentual.format(total > 0 ? (valor / total) * 100 : 0)}%)`}
                    onMouseEnter={() => setGrupoEmFoco(grupo.id)}
                    onMouseLeave={() => setGrupoEmFoco(null)}
                    onFocus={() => setGrupoEmFoco(grupo.id)}
                    onBlur={() => setGrupoEmFoco(null)}
                  />
                );
              })}
            </g>
            <text className="cost-donut__percent" x="105" y="101">{percentual.format(percentualAlocado)}%</text>
            <text className="cost-donut__label" x="105" y="122">ALOCADO</text>
          </svg>
          {grupoEmFoco && (
            <div className="cost-donut__tooltip" role="status">
              {gruposCusto.find(({ id }) => id === grupoEmFoco)?.nome} —{" "}
              {moeda.format(valorGrupo(evento, grupoEmFoco))} (
              {percentual.format(total > 0 ? (valorGrupo(evento, grupoEmFoco) / total) * 100 : 0)}%)
            </div>
          )}
        </div>
      </div>
      {pendenciaGrupo && (
        <p className="cost-summary__warning" role="status">Classifique os itens restantes</p>
      )}
      <ul className="cost-legend" aria-label="Distribuição de custos por grupo">
        {gruposCusto.map((grupo) => (
          <li key={grupo.id}>
            <span className="cost-legend__name"><i style={{ backgroundColor: grupo.cor }} />{grupo.nome}</span>
            <strong style={{ color: grupo.cor }}>{porcentagens.grupos[grupo.id]}%</strong>
            <b>{moedaSemCentavos.format(valorGrupo(evento, grupo.id))}</b>
          </li>
        ))}
        {porcentagens.naoAlocado > 0 && (
          <li className="cost-legend__unallocated">
            <span className="cost-legend__name"><i />Não classificado</span>
            <strong>{porcentagens.naoAlocado}%</strong>
            <b>{moedaSemCentavos.format(Math.max(0, total - alocado))}</b>
          </li>
        )}
      </ul>
    </aside>
  );
}
