import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

const GRUPOS = [
  ["som", "Som & Iluminação"],
  ["palco", "Palco & Estrutura"],
  ["fiscais", "Custos Fiscais & ECAD"],
  ["seguranca", "Segurança & Operação"],
  ["variaveis", "Variáveis & Contingência"],
];

const CATEGORIAS_PRODUCAO = [
  ["som", "Som & Iluminação"],
  ["palco", "Palco & Estrutura"],
  ["seguranca", "Segurança & Operação"],
  ["limpeza", "Limpeza & Sanitários"],
  ["alimentacao", "Alimentação & Bebidas"],
  ["transporte", "Transporte & Logística"],
  ["outro", "Outro"],
];

const CATEGORIAS_FISCAIS = [
  ["ecad", "Direitos Autorais (ECAD)"],
  ["municipal", "Tributário Municipal"],
  ["tributario", "Tributário Estadual/Federal"],
  ["gateway", "Processamento & Gateway"],
  ["operacao", "Operação Crítica"],
  ["seguros", "Seguros"],
  ["outro", "Outro"],
];

const GRUPO_POR_CATEGORIA = {
  som: "som",
  palco: "palco",
  seguranca: "seguranca",
  limpeza: "seguranca",
  alimentacao: "variaveis",
  transporte: "variaveis",
  outro: "variaveis",
  ecad: "fiscais",
  municipal: "fiscais",
  tributario: "fiscais",
  gateway: "variaveis",
  operacao: "variaveis",
  seguros: "variaveis",
};

const moedaInput = (valor) => (
  valor === "" ? "" : new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2 }).format(valor)
);

function parseMoeda(valor) {
  const normalizado = valor.trim().replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  return Number(normalizado);
}

function novoItem(tipo, cidade, item) {
  if (item) {
    return tipo === "producao"
      ? {
          ...item,
          valorInput: moedaInput(item.valor),
          tagsInput: item.tags.join(", "),
        }
      : {
          ...item,
          taxaInput: item.calculo.tipo === "fixo" ? "" : String(item.calculo.taxa * 100).replace(".", ","),
          baseInput: item.calculo.base == null ? "" : moedaInput(item.calculo.base),
          valorInput: item.calculo.tipo === "percentual" ? "" : moedaInput(item.valor),
        };
  }
  if (tipo === "producao") {
    return {
      id: "",
      categoriaId: "som",
      grupoGrafico: "som",
      titulo: "",
      qtd: "",
      especificacao: "",
      valor: 0,
      valorInput: "",
      tags: [],
      tagsInput: "",
      alocacao: "direta",
    };
  }
  return {
    id: "",
    categoriaId: "ecad",
    grupoGrafico: "fiscais",
    origem: "Alíquota padrão sobre bilheteria bruta",
    titulo: "",
    observacao: "",
    calculo: { tipo: "percentual", taxa: 0.1, base: 0 },
    taxaInput: "10",
    baseInput: "",
    valorInput: "",
  };
}

export default function CustosOrcamentoModal({ tipo, item, cidade, onClose, onSave }) {
  const [form, setForm] = useState(() => novoItem(tipo, cidade, item));
  const [erro, setErro] = useState("");
  const [tagTemporaria, setTagTemporaria] = useState("");
  const dialogRef = useRef(null);
  const tituloRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const anterior = document.activeElement;
    tituloRef.current?.focus();
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const focaveis = [...dialogRef.current.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )];
      if (focaveis.length === 0) return;
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
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      anterior?.focus?.();
    };
  }, []);

  const categorias = tipo === "producao" ? CATEGORIAS_PRODUCAO : CATEGORIAS_FISCAIS;
  const grupoSelecionado = GRUPOS.find(([id]) => id === form.grupoGrafico)?.[1] ?? "";
  const valorCalculado = tipo === "fiscal" && form.calculo.tipo === "percentual"
    ? parseMoeda(form.baseInput || "0") * (Number(form.taxaInput.replace(",", ".")) || 0) / 100
    : null;

  function atualizar(chave, valor) {
    setForm((atual) => ({ ...atual, [chave]: valor }));
    setErro("");
  }

  function mudarCategoria(categoriaId) {
    setForm((atual) => ({
      ...atual,
      categoriaId,
      grupoGrafico: GRUPO_POR_CATEGORIA[categoriaId] ?? "",
      ...(tipo === "fiscal" && categoriaId === "municipal" && atual.categoriaId !== "municipal"
        ? { origem: `Prefeitura Municipal de ${cidade || ""}`.trim() }
        : {}),
    }));
    setErro("");
  }

  function adicionarTag() {
    const tag = tagTemporaria.trim();
    if (!tag) return;
    setForm((atual) => ({
      ...atual,
      tags: atual.tags.includes(tag) ? atual.tags : [...atual.tags, tag],
    }));
    setTagTemporaria("");
  }

  function salvar(event) {
    event.preventDefault();
    const titulo = form.titulo.trim();
    if (!form.categoriaId || !form.grupoGrafico) {
      setErro("Selecione uma categoria e um grupo para o gráfico.");
      return;
    }
    if (titulo.length < 3 || titulo.length > 120) {
      setErro("O título deve ter entre 3 e 120 caracteres.");
      return;
    }

    if (tipo === "producao") {
      const valor = parseMoeda(form.valorInput);
      if (!form.qtd.trim() || !Number.isFinite(valor) || valor <= 0) {
        setErro("Informe a quantidade e um custo previsto maior que zero.");
        return;
      }
      onSave({
        id: form.id || globalThis.crypto?.randomUUID?.() || `custo-${Date.now()}`,
        categoriaId: form.categoriaId,
        grupoGrafico: form.grupoGrafico,
        titulo,
        qtd: form.qtd.trim(),
        especificacao: form.especificacao.trim(),
        valor,
        tags: form.tags,
        alocacao: form.alocacao,
      });
      return;
    }

    const tipoCalculo = form.calculo.tipo;
    const calculo = { tipo: tipoCalculo };
    let valor;
    if (tipoCalculo === "percentual") {
      const taxa = Number(form.taxaInput.replace(",", ".")) / 100;
      const base = parseMoeda(form.baseInput);
      if (!Number.isFinite(taxa) || taxa <= 0 || taxa > 1 || !Number.isFinite(base) || base <= 0) {
        setErro("Informe um percentual entre 0 e 100 e uma base de cálculo maior que zero.");
        return;
      }
      calculo.taxa = taxa;
      calculo.base = base;
      valor = base * taxa;
    } else if (tipoCalculo === "taxa_media") {
      const taxa = Number(form.taxaInput.replace(",", ".")) / 100;
      valor = parseMoeda(form.valorInput);
      if (!Number.isFinite(taxa) || taxa <= 0 || taxa > 1 || !Number.isFinite(valor) || valor <= 0) {
        setErro("Informe uma taxa entre 0 e 100 e um valor maior que zero.");
        return;
      }
      calculo.taxa = taxa;
    } else {
      valor = parseMoeda(form.valorInput);
      if (!Number.isFinite(valor) || valor <= 0) {
        setErro("Informe um valor maior que zero.");
        return;
      }
    }
    if (!form.origem.trim()) {
      setErro("Informe a origem ou referência.");
      return;
    }
    onSave({
      id: form.id || globalThis.crypto?.randomUUID?.() || `fiscal-${Date.now()}`,
      categoriaId: form.categoriaId,
      grupoGrafico: form.grupoGrafico,
      origem: form.origem.trim(),
      titulo,
      observacao: form.observacao.trim(),
      calculo,
      valor,
    });
  }

  const categoriaLabel = categorias.find(([id]) => id === form.categoriaId)?.[1] ?? "";

  return (
    <div
      className="budget-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        className="budget-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="budget-modal-title"
      >
        <header className="budget-modal__header">
          <div>
            <span>{tipo === "producao" ? "ITEM DE PRODUÇÃO" : "CUSTO FISCAL / OPERACIONAL"}</span>
            <h2 id="budget-modal-title" ref={tituloRef} tabIndex={-1}>
              {item ? "Editar item" : tipo === "producao" ? "Adicionar item de produção" : "Adicionar custo fiscal"}
            </h2>
          </div>
          <button type="button" className="budget-modal__close" aria-label="Fechar" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <form className="budget-modal__form" onSubmit={salvar}>
          <label>
            Categoria *
            <select value={form.categoriaId} onChange={(event) => mudarCategoria(event.target.value)} required>
              {categorias.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
          </label>
          <label>
            Grupo no gráfico *
            <select
              value={form.grupoGrafico}
              onChange={(event) => atualizar("grupoGrafico", event.target.value)}
              required
            >
              <option value="">Não classificado</option>
              {GRUPOS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
          </label>
          {tipo === "producao" ? (
            <>
              <label className="budget-modal__wide">
                Título * <span className="budget-modal__counter">{form.titulo.length}/120</span>
                <input
                  autoFocus
                  maxLength={120}
                  minLength={3}
                  value={form.titulo}
                  onChange={(event) => atualizar("titulo", event.target.value)}
                  required
                />
              </label>
              <label className="budget-modal__wide">
                Quantidade / Escopo *
                <input
                  maxLength={120}
                  placeholder="Ex.: 1 sistema completo"
                  value={form.qtd}
                  onChange={(event) => atualizar("qtd", event.target.value)}
                  required
                />
              </label>
              <label className="budget-modal__wide">
                Especificação técnica <span className="budget-modal__counter">{form.especificacao.length}/300</span>
                <textarea
                  maxLength={300}
                  rows={3}
                  value={form.especificacao}
                  onChange={(event) => atualizar("especificacao", event.target.value)}
                />
              </label>
              <label>
                Custo previsto (R$) *
                <input
                  inputMode="decimal"
                  placeholder="0,00"
                  value={form.valorInput}
                  onChange={(event) => atualizar("valorInput", event.target.value)}
                  required
                />
              </label>
              <label>
                Modo de alocação
                <select value={form.alocacao} onChange={(event) => atualizar("alocacao", event.target.value)}>
                  <option value="direta">Alocação direta de produção</option>
                  <option value="cotacao">Cotar com fornecedores (Propostas)</option>
                </select>
              </label>
              <div className="budget-modal__wide budget-modal__tags">
                <label htmlFor="budget-tag-input">Tags (opcional)</label>
                <div className="budget-modal__tag-input">
                  <input
                    id="budget-tag-input"
                    placeholder="Ex.: RF06"
                    value={tagTemporaria}
                    onChange={(event) => setTagTemporaria(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        adicionarTag();
                      }
                    }}
                  />
                  <button type="button" onClick={adicionarTag}>Adicionar tag</button>
                </div>
                <div className="budget-modal__tag-list">
                  {form.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      aria-label={`Remover tag ${tag}`}
                      onClick={() => atualizar("tags", form.tags.filter((atual) => atual !== tag))}
                    >
                      {tag} <X size={12} aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <label className="budget-modal__wide">
                Origem / Referência *
                <input
                  value={form.origem}
                  onChange={(event) => atualizar("origem", event.target.value)}
                  required
                />
              </label>
              <label className="budget-modal__wide">
                Descrição *
                <input
                  autoFocus
                  maxLength={120}
                  minLength={3}
                  value={form.titulo}
                  onChange={(event) => atualizar("titulo", event.target.value)}
                  required
                />
              </label>
              <label className="budget-modal__wide">
                Observação
                <textarea
                  rows={2}
                  value={form.observacao}
                  onChange={(event) => atualizar("observacao", event.target.value)}
                />
              </label>
              <label className="budget-modal__wide">
                Tipo de cálculo *
                <select
                  value={form.calculo.tipo}
                  onChange={(event) => setForm((atual) => ({
                    ...atual,
                    calculo: { tipo: event.target.value },
                    taxaInput: event.target.value === "percentual" ? "10" : event.target.value === "taxa_media" ? "2,4" : "",
                  }))}
                >
                  <option value="percentual">Percentual sobre base</option>
                  <option value="taxa_media">Taxa média</option>
                  <option value="fixo">Valor fixo</option>
                </select>
              </label>
              {form.calculo.tipo !== "fixo" && (
                <label>
                  Taxa (%) *
                  <input
                    inputMode="decimal"
                    value={form.taxaInput}
                    onChange={(event) => atualizar("taxaInput", event.target.value)}
                    required
                  />
                </label>
              )}
              {form.calculo.tipo === "percentual" ? (
                <label>
                  Base de cálculo (R$) *
                  <input
                    inputMode="decimal"
                    value={form.baseInput}
                    onChange={(event) => atualizar("baseInput", event.target.value)}
                    required
                  />
                </label>
              ) : (
                <label>
                  Valor (R$) *
                  <input
                    inputMode="decimal"
                    value={form.valorInput}
                    onChange={(event) => atualizar("valorInput", event.target.value)}
                    required
                  />
                </label>
              )}
              {form.calculo.tipo === "percentual" && (
                <p className="budget-modal__preview">
                  Prévia do cálculo: {Number.isFinite(valorCalculado)
                    ? `R$ ${moedaInput(valorCalculado)}`
                    : "R$ 0,00"}
                </p>
              )}
            </>
          )}
          {erro && <p className="budget-modal__error" role="alert">{erro}</p>}
          <div className="budget-modal__footer">
            <span>{categoriaLabel}{grupoSelecionado ? ` · ${grupoSelecionado}` : ""}</span>
            <div>
              <button type="button" className="button button--secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="button button--primary">
                {item ? "Salvar alterações" : "Adicionar Item"}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
