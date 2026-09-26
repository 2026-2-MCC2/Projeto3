import { useEffect, useMemo, useState } from "react";
import { FileText, ShieldCheck, X, Check, LoaderCircle } from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import AsyncState from "../../components/admin/AsyncState.jsx";
import Badge from "../../components/admin/Badge.jsx";
import Alert from "../../components/Alert.jsx";
import { buscarAprovacoes, aprovarCadastro, rejeitarCadastro } from "../../services/adminService.js";
import { validarMotivoRejeicao } from "../../utils/validators.js";
import { formatarDataHora } from "../../utils/admin.js";
import "./Aprovacoes.css";

const FILTROS = [
  { valor: "todos", label: "Todos" },
  { valor: "Organizador", label: "Organizador" },
  { valor: "Fornecedor", label: "Fornecedor" },
];

export default function Aprovacoes() {
  const [estado, setEstado] = useState({ carregando: true, erro: "", lista: [] });
  const [filtro, setFiltro] = useState("todos");
  const [selecionadoId, setSelecionadoId] = useState(null);
  const [motivo, setMotivo] = useState("");
  const [erroMotivo, setErroMotivo] = useState("");
  const [processando, setProcessando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  function carregar() {
    setEstado({ carregando: true, erro: "", lista: [] });
    buscarAprovacoes()
      .then((lista) => {
        setEstado({ carregando: false, erro: "", lista });
        setSelecionadoId(lista[0]?.id ?? null);
      })
      .catch((err) => setEstado({ carregando: false, erro: err.message, lista: [] }));
  }

  useEffect(carregar, []);

  const filtrados = useMemo(
    () => (filtro === "todos" ? estado.lista : estado.lista.filter((a) => a.tipo === filtro)),
    [estado.lista, filtro]
  );

  const selecionado = estado.lista.find((a) => a.id === selecionadoId) ?? filtrados[0] ?? null;

  function selecionarProximo(idRemovido) {
    const restantes = estado.lista.filter((a) => a.id !== idRemovido);
    setEstado((e) => ({ ...e, lista: restantes }));
    const proximo = restantes.find((a) => filtro === "todos" || a.tipo === filtro);
    setSelecionadoId(proximo?.id ?? null);
    setMotivo("");
    setErroMotivo("");
  }

  async function handleAprovar() {
    if (!selecionado || processando) return;
    setProcessando(true);
    setMensagem("");
    try {
      await aprovarCadastro(selecionado.id);
      setMensagem(`Cadastro de "${selecionado.nome}" aprovado e acesso liberado.`);
      selecionarProximo(selecionado.id);
    } catch (err) {
      setMensagem(err.message);
    } finally {
      setProcessando(false);
    }
  }

  async function handleRejeitar(e) {
    e.preventDefault();
    if (!selecionado) return;
    const erro = validarMotivoRejeicao(motivo);
    setErroMotivo(erro);
    if (erro) {
      e.currentTarget.querySelector("#motivo-rejeicao")?.focus();
      return;
    }
    setProcessando(true);
    setMensagem("");
    try {
      await rejeitarCadastro(selecionado.id, motivo);
      setMensagem(`Cadastro de "${selecionado.nome}" rejeitado. O solicitante foi notificado por e-mail.`);
      selecionarProximo(selecionado.id);
    } catch (err) {
      setMensagem(err.message);
    } finally {
      setProcessando(false);
    }
  }

  function handleVisualizar(doc) {
    window.alert(`Pré-visualização de "${doc.nome}" (documento simulado no ambiente de testes).`);
  }

  return (
    <section aria-labelledby="aprovacoes-titulo">
      <AdminPageHeader title="Aprovações Pendentes de Cadastro" searchPlaceholder="Buscar por razão social" />

      <AsyncState
        loading={estado.carregando}
        error={estado.erro}
        onRetry={carregar}
        empty={!estado.carregando && !estado.erro && estado.lista.length === 0}
        emptyMessage="Não há cadastros pendentes no momento."
      >
        <div className="aprovacoes__layout">
          <div className="admin-card aprovacoes__detalhe">
            {!selecionado ? (
              <p className="aprovacoes__vazio">Selecione um cadastro na fila ao lado.</p>
            ) : (
              <>
                <header className="aprovacoes__detalhe-head">
                  <span className="aprovacoes__status-dot" aria-hidden="true" />
                  <h2 className="admin-section-title">Análise Cadastral</h2>
                </header>

                <div className="aprovacoes__titulo-linha">
                  <h3>{selecionado.nome}</h3>
                  <Badge tone={selecionado.tipo === "Fornecedor" ? "info" : "warning"}>{selecionado.tipo}</Badge>
                  {selecionado.cnpjAtivoReceita && (
                    <span className="aprovacoes__cnpj-ativo">
                      <ShieldCheck size={13} aria-hidden="true" /> CNPJ Ativo na RF
                    </span>
                  )}
                </div>
                <p className="aprovacoes__categoria">
                  Categoria: {selecionado.categoria} • Submetido em {formatarDataHora(selecionado.submetidoEm)}
                </p>

                <div className="aprovacoes__grid">
                  <div className="aprovacoes__campo">
                    <span>CNPJ / Registro</span>
                    <strong>{selecionado.cnpj}</strong>
                    <small>Inscrição Estadual: {selecionado.inscricaoEstadual}</small>
                  </div>
                  <div className="aprovacoes__campo">
                    <span>Contato principal</span>
                    <strong>{selecionado.contatoEmail}</strong>
                    <small>
                      {selecionado.contatoTelefone} • Resp: {selecionado.contatoNome}
                    </small>
                  </div>
                  <div className="aprovacoes__campo">
                    <span>Endereço fiscal</span>
                    <strong>{selecionado.endereco}</strong>
                    <small>{selecionado.cidadeUf}</small>
                  </div>
                  <div className="aprovacoes__campo">
                    <span>{selecionado.infoExtra.titulo}</span>
                    <strong>{selecionado.infoExtra.linha1}</strong>
                    <small>{selecionado.infoExtra.linha2}</small>
                  </div>
                </div>

                <div className="aprovacoes__docs">
                  <span className="aprovacoes__docs-titulo">Documentos comprobatórios anexados</span>
                  <div className="aprovacoes__docs-lista">
                    {selecionado.documentos.map((doc) => (
                      <div className="aprovacoes__doc" key={doc.nome}>
                        <FileText size={16} aria-hidden="true" />
                        <div>
                          <strong>{doc.nome}</strong>
                          <small>
                            {doc.tamanho} • {doc.origem}
                          </small>
                        </div>
                        <button type="button" className="admin-link-button" onClick={() => handleVisualizar(doc)}>
                          Visualizar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleRejeitar} noValidate>
                  <label className="aprovacoes__motivo-label" htmlFor="motivo-rejeicao">
                    Motivo da rejeição / Observações de auditoria
                  </label>
                  <textarea
                    id="motivo-rejeicao"
                    rows={3}
                    className={`aprovacoes__motivo${erroMotivo ? " aprovacoes__motivo--invalido" : ""}`}
                    placeholder="Exemplo: Documento do contrato social anexado está desatualizado ou ilegível. Por favor, submeter certidão atualizada com menos de 30 dias..."
                    value={motivo}
                    onChange={(e) => {
                      setMotivo(e.target.value);
                      if (erroMotivo) setErroMotivo(validarMotivoRejeicao(e.target.value));
                    }}
                    aria-invalid={erroMotivo ? "true" : "false"}
                    aria-describedby={erroMotivo ? "motivo-erro" : undefined}
                  />
                  {erroMotivo && (
                    <p id="motivo-erro" className="aprovacoes__erro">
                      {erroMotivo}
                    </p>
                  )}
                  <p className="aprovacoes__motivo-aviso">
                    O motivo informado será enviado automaticamente por e-mail ao solicitante e armazenado no log de
                    auditoria da plataforma.
                  </p>

                  {mensagem && <Alert>{mensagem}</Alert>}

                  <div className="aprovacoes__acoes">
                    <button
                      type="submit"
                      className="aprovacoes__btn aprovacoes__btn--rejeitar"
                      disabled={processando}
                    >
                      <X size={16} aria-hidden="true" /> Rejeitar cadastro
                    </button>
                    <button
                      type="button"
                      className="aprovacoes__btn aprovacoes__btn--aprovar"
                      disabled={processando}
                      onClick={handleAprovar}
                    >
                      {processando ? (
                        <LoaderCircle size={16} className="aprovacoes__spinner" aria-hidden="true" />
                      ) : (
                        <Check size={16} aria-hidden="true" />
                      )}
                      {processando ? "Processando..." : "Aprovar cadastro e liberar acesso"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>

          <div className="admin-card aprovacoes__fila">
            <h2 className="admin-section-title aprovacoes__fila-titulo">Fila de Cadastros</h2>
            <div className="filter-chips aprovacoes__filtros">
              {FILTROS.map((f) => (
                <button
                  key={f.valor}
                  type="button"
                  className={`filter-chip${filtro === f.valor ? " filter-chip--active" : ""}`}
                  onClick={() => setFiltro(f.valor)}
                >
                  {f.label}
                  {f.valor === "todos" && ` (${estado.lista.length})`}
                </button>
              ))}
            </div>

            <ul className="aprovacoes__lista">
              {filtrados.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    className={`aprovacoes__item${a.id === selecionado?.id ? " aprovacoes__item--ativo" : ""}`}
                    onClick={() => {
                      setSelecionadoId(a.id);
                      setMotivo("");
                      setErroMotivo("");
                      setMensagem("");
                    }}
                  >
                    <div className="aprovacoes__item-topo">
                      <strong>{a.nome}</strong>
                      <Badge tone={a.tipo === "Fornecedor" ? "info" : "warning"}>{a.tipo}</Badge>
                    </div>
                    <small>{a.cnpj}</small>
                    <div className="aprovacoes__item-rodape">
                      <span>{formatarDataHora(a.submetidoEm)}</span>
                      <span className={a.alerta ? "aprovacoes__item-alerta" : "aprovacoes__item-docs"}>
                        {a.alerta ?? `${a.documentos.length} docs anexados`}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>

            <p className="aprovacoes__contagem">
              Exibindo {filtrados.length} de {estado.lista.length} pendências
            </p>
          </div>
        </div>
      </AsyncState>
    </section>
  );
}
