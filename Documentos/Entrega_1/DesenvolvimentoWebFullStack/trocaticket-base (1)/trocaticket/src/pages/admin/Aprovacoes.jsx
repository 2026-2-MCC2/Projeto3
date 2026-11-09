import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BadgeCheck, Building2, CalendarClock, CircleAlert, CircleCheck, Circle, FileText, Filter, MapPin, ShieldCheck, UserRound, X } from "lucide-react";
import DocumentoCard from "../../components/admin/DocumentoCard.jsx";
import { ExportMenu } from "../../components/admin/ExportMenu.jsx";
import { Button, FilterChips, PageHeader, Pill, QueryBoundary } from "../../components/admin/ui.jsx";
import { MODO_PLACEHOLDER } from "../../services/adminDocumentos.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useAdminQuery } from "../../hooks/useAdminQuery.js";
import { useExporter } from "../../hooks/useExporter.js";
import { useToast } from "../../hooks/useToast.js";
import { aprovarCadastro, atualizarChecklist, listarPendentes, rejeitarCadastro } from "../../services/adminApi.js";
import { formatDateTime } from "../../utils/admin/format.js";
import { validarChecklistCompleto, validarJustificativa } from "../../utils/admin/validacoes.js";
import "./Aprovacoes.css";

const CHECK_META = {
  valido: { label: "Válido", tone: "brand", proximo: "pendente" },
  verificacao: { label: "Em verificação", tone: "warning", proximo: "valido" },
  pendente: { label: "Pendente", tone: "danger", proximo: "verificacao" },
};

const COLUNAS = [
  { key: "id", label: "ID" },
  { key: "nome", label: "Empresa" },
  { key: "tipo", label: "Tipo" },
  { key: "cnpj", label: "CNPJ" },
  { key: "cidade", label: "Cidade" },
  { key: "uf", label: "UF" },
  { key: "horasNaFila", label: "Horas na fila" },
  { key: "checklist", label: "Checklist", format: (_, r) => `${r.checklist.filter((c) => c.status === "valido").length}/${r.checklist.length}` },
];

export default function Aprovacoes() {
  const query = useAdminQuery(listarPendentes);
  const { pdf, csv } = useExporter();
  const total = query.data?.length;

  return (
    <>
      <PageHeader
        eyebrow={total !== undefined && <Pill tone="danger" dot>{total} pendentes</Pill>}
        title="Aprovações de cadastros"
        description="Fila de análise e homologação documental de organizadores e fornecedores parceiros."
        actions={
          query.data && (
            <ExportMenu
              label="Exportar fila"
              onPDF={() => pdf({ title: "Fila de aprovações", subtitle: "Cadastros aguardando análise documental", tables: [{ columns: COLUNAS, rows: query.data }] })}
              onCSV={() => csv("fila-aprovacoes", COLUNAS, query.data)}
            />
          )
        }
      />
      <QueryBoundary query={query} linhasSkeleton={2}>
        {(pendentes) => <Fila pendentes={pendentes} />}
      </QueryBoundary>
    </>
  );
}

function Fila({ pendentes }) {
  const [params, setParams] = useSearchParams();
  const id = params.get("id");
  const [filtro, setFiltro] = useState("todos");
  const [busca, setBusca] = useState("");

  const lista = useMemo(
    () =>
      pendentes
        .filter((p) => filtro === "todos" || p.tipo === filtro)
        .filter((p) => [p.nome, p.cnpj, p.cidade].join(" ").toLowerCase().includes(busca.toLowerCase())),
    [pendentes, filtro, busca],
  );

  const selecionado = pendentes.find((p) => p.id === id) ?? lista[0];
  const selecionar = (pid) => setParams({ id: pid }, { replace: true });
  const contar = (tipo) => pendentes.filter((p) => p.tipo === tipo).length;

  return (
    <div className="apr-layout">
      <aside className="adm-stack adm-stack--sm" aria-label="Fila de cadastros">
        <div className="adm-panel adm-stack adm-stack--sm" style={{ padding: 16 }}>
          <label className="adm-search">
            <Filter aria-hidden="true" />
            <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Filtrar por nome, CNPJ ou cidade…" aria-label="Filtrar fila" />
          </label>
          <FilterChips
            label="Tipo de cadastro"
            value={filtro}
            onChange={setFiltro}
            options={[
              { value: "todos", label: "Todos", count: pendentes.length },
              { value: "Organizador", label: "Organizadores", count: contar("Organizador") },
              { value: "Fornecedor", label: "Fornecedores", count: contar("Fornecedor") },
            ]}
          />
        </div>

        {lista.length === 0 && <div className="adm-panel adm-empty">Nenhum cadastro encontrado.</div>}

        {lista.map((p) => {
          const ativo = selecionado?.id === p.id;
          const critico = p.horasNaFila > 24;
          return (
            <button key={p.id} type="button" className={`adm-panel apr-card${ativo ? " is-active" : ""}`} aria-pressed={ativo} onClick={() => selecionar(p.id)}>
              <div className="adm-row adm-row--between" style={{ flexWrap: "nowrap" }}>
                <div className="adm-row" style={{ gap: 8 }}>
                  <Pill tone={p.tipo === "Organizador" ? "brand" : "neutral"}>{p.tipo}</Pill>
                  <span className="adm-muted" style={{ fontSize: "0.75rem" }}>{p.categoria}</span>
                </div>
                <span className={`adm-mono adm-strong ${critico ? "adm-text-danger" : "adm-muted"}`} style={{ fontSize: "0.75rem" }}>
                  {p.horasNaFila}h
                </span>
              </div>
              <div className="apr-card__nome">{p.nome}</div>
              <div className="adm-mono adm-muted" style={{ fontSize: "0.75rem" }}>CNPJ {p.cnpj}</div>
              <div className="adm-row adm-row--between" style={{ marginTop: 12, fontSize: "0.75rem" }}>
                <span className="apr-card__local">
                  <MapPin aria-hidden="true" /> {p.cidade}/{p.uf}
                </span>
                {critico ? <Pill tone="danger">SLA crítico</Pill> : ativo ? <Pill tone="brand" dot>Em análise</Pill> : <span className="adm-muted">Aguardando</span>}
              </div>
            </button>
          );
        })}
      </aside>

      {selecionado ? (
        <Detalhe key={selecionado.id} p={selecionado} aoConcluir={() => setParams({}, { replace: true })} />
      ) : (
        <div className="adm-panel adm-state">
          <BadgeCheck style={{ color: "var(--adm-success)" }} aria-hidden="true" />
          <h2 style={{ color: "var(--adm-fg)" }}>Fila zerada</h2>
          <p>Todos os cadastros foram analisados.</p>
        </div>
      )}
    </div>
  );
}

function Detalhe({ p, aoConcluir }) {
  const { user } = useAuth();
  const toast = useToast();
  const autor = user?.nome ?? "Administrador";
  const [checklist, setChecklist] = useState(p.checklist);
  const [obs, setObs] = useState("");
  const [erro, setErro] = useState("");
  const [processando, setProcessando] = useState(null); // "aprovar" | "rejeitar" | null

  const validos = checklist.filter((c) => c.status === "valido").length;

  function alternarChecagem(item) {
    const proximo = CHECK_META[item.status].proximo;
    setChecklist((lista) => lista.map((c) => (c.id === item.id ? { ...c, status: proximo } : c)));
    setErro("");
    atualizarChecklist(p.id, item.id, proximo).catch(() => {
      setChecklist((lista) => lista.map((c) => (c.id === item.id ? { ...c, status: item.status } : c)));
      toast.error("Não foi possível salvar a checagem", "A alteração foi desfeita. Tente novamente.");
    });
  }

  async function aprovar() {
    const problema = validarChecklistCompleto(checklist);
    if (problema) return setErro(problema);
    setErro("");
    setProcessando("aprovar");
    try {
      await aprovarCadastro(p.id, obs.trim(), autor);
      toast.success(`${p.nome} aprovado`, "Cadastro ativado e registrado na auditoria.");
      aoConcluir();
    } catch (e) {
      toast.error("Não foi possível aprovar", e.message);
      setProcessando(null);
    }
  }

  async function rejeitar() {
    const problema = validarJustificativa(obs);
    if (problema) return setErro(problema);
    setErro("");
    setProcessando("rejeitar");
    try {
      await rejeitarCadastro(p.id, obs.trim(), autor);
      toast.info(`${p.nome} rejeitado`, "O motivo foi registrado no acompanhamento do cadastro.");
      aoConcluir();
    } catch (e) {
      toast.error("Não foi possível rejeitar", e.message);
      setProcessando(null);
    }
  }

  const info = [
    { label: "CNPJ", value: p.cnpj, mono: true },
    { label: "Inscrição estadual", value: p.ie, mono: true },
    { label: "Responsável legal", value: p.responsavel, icon: UserRound },
    { label: "Contato comercial", value: p.telefone, mono: true },
    { label: "E-mail corporativo", value: p.email, link: true },
    { label: "CNAE primário", value: p.cnae },
  ];

  return (
    <div className="adm-stack adm-rise">
      <section className="adm-panel adm-panel--pad">
        <div className="adm-row adm-row--between" style={{ alignItems: "flex-start" }}>
          <div className="apr-title">
            <div className="apr-title__logo" aria-hidden="true">
              {p.nome.split(" ").slice(0, 2).map((w) => w[0]).join("")}
            </div>
            <div>
              <div className="adm-row" style={{ gap: 8, fontSize: "0.75rem" }}>
                <Pill tone="brand">
                  <Building2 aria-hidden="true" />
                  {p.tipo}
                </Pill>
                <Pill>Porte: {p.porte}</Pill>
                <span className="apr-inline adm-muted">
                  <CalendarClock aria-hidden="true" /> Submetido em {formatDateTime(p.submetidoEm)}
                </span>
              </div>
              <h2 style={{ marginTop: 8, fontSize: "1.6rem" }}>{p.nome}</h2>
              <p className="adm-muted" style={{ fontSize: "0.875rem" }}>Nome fantasia: {p.fantasia}</p>
            </div>
          </div>
          <div className="adm-right">
            <div className="adm-eyebrow">ID do cadastro</div>
            <div className="adm-mono adm-strong apr-id">#{p.id}</div>
          </div>
        </div>

        <dl className="apr-info adm-surface-box">
          {info.map((i) => (
            <div key={i.label}>
              <dt className="adm-eyebrow">{i.label}</dt>
              <dd className={`${i.mono ? "adm-mono" : ""}${i.link ? " apr-link" : ""}`}>{i.value}</dd>
            </div>
          ))}
        </dl>

        <div className="apr-endereco">
          <div className="adm-icon-tile" style={{ width: 36, height: 36 }}>
            <MapPin aria-hidden="true" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="adm-eyebrow">Endereço operacional declarado</div>
            <div className="apr-endereco__texto">{p.endereco}</div>
          </div>
          <a className="adm-btn adm-btn--secondary adm-btn--sm" href={`https://www.google.com/maps/search/${encodeURIComponent(p.endereco)}`} target="_blank" rel="noreferrer">
            Ver no mapa
          </a>
        </div>
      </section>

      <section className="adm-panel adm-panel--pad" aria-labelledby={`chk-${p.id}`}>
        <div className="adm-row adm-row--between" style={{ marginBottom: 8 }}>
          <h3 id={`chk-${p.id}`} className="apr-h3">
            <ShieldCheck aria-hidden="true" /> Validação de conformidade
          </h3>
          <div className="adm-row" style={{ gap: 12 }}>
            <div style={{ width: 112 }}>
              <div className="adm-minibar adm-minibar--brand">
                <span style={{ width: `${(validos / checklist.length) * 100}%` }} />
              </div>
            </div>
            <span className="adm-mono adm-muted" style={{ fontSize: "0.75rem" }}>
              {validos} de {checklist.length}
            </span>
          </div>
        </div>
        <p className="adm-help" style={{ marginBottom: 12 }}>Clique no status para alterar a situação de cada checagem.</p>
        <ul className="apr-checks">
          {checklist.map((c) => {
            const meta = CHECK_META[c.status];
            const Icone = c.status === "valido" ? CircleCheck : c.status === "verificacao" ? CircleAlert : Circle;
            return (
              <li key={c.id}>
                <Icone className={`apr-checks__icon apr-checks__icon--${c.status}`} aria-hidden="true" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="adm-strong" style={{ fontSize: "0.875rem" }}>{c.titulo}</div>
                  <div className="adm-muted" style={{ fontSize: "0.75rem" }}>{c.descricao}</div>
                </div>
                <Pill as="button" type="button" tone={meta.tone} title="Alterar status" aria-label={`${c.titulo}: ${meta.label}. Clique para alterar.`} onClick={() => alternarChecagem(c)}>
                  {meta.label}
                </Pill>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="adm-panel adm-panel--pad" aria-labelledby={`docs-${p.id}`}>
        <div className="adm-row adm-row--between" style={{ marginBottom: 16 }}>
          <h3 id={`docs-${p.id}`} className="apr-h3">
            <FileText aria-hidden="true" /> Documentos submetidos
          </h3>
          {MODO_PLACEHOLDER && <Pill tone="warning">Exemplos · sem servidor de arquivos</Pill>}
        </div>
        <div className="apr-docs">
          {p.documentos.map((d) => (
            <DocumentoCard key={d.id} doc={d} />
          ))}
        </div>
      </section>

      <section className="adm-panel adm-panel--pad">
        <div className="adm-field">
          <label htmlFor={`obs-${p.id}`} style={{ color: "var(--adm-primary)", fontWeight: 600 }}>
            Observações / motivo da rejeição
          </label>
          <textarea
            id={`obs-${p.id}`}
            className="adm-textarea"
            rows={4}
            value={obs}
            onChange={(e) => {
              setObs(e.target.value);
              setErro("");
            }}
            aria-invalid={erro ? "true" : "false"}
            aria-describedby={`obs-ajuda-${p.id}`}
            placeholder="Ex.: Certidão negativa vencida. Envie uma versão emitida há menos de 30 dias."
          />
          <p id={`obs-ajuda-${p.id}`} className={`adm-help${erro ? " adm-help--error" : ""}`} role={erro ? "alert" : undefined}>
            {erro || "Obrigatório para rejeitar. Enviado por e-mail ao solicitante e salvo na auditoria."}
          </p>
        </div>
      </section>

      <div className="adm-panel apr-acoes">
        <span className="apr-acoes__nota">
          <span aria-hidden="true" /> Ação registrada na auditoria com validação de segurança
        </span>
        <div className="adm-row" style={{ gap: 8 }}>
          <Button variant="danger-outline" icon={X} loading={processando === "rejeitar"} disabled={processando !== null} onClick={rejeitar}>
            Rejeitar cadastro
          </Button>
          <Button icon={BadgeCheck} loading={processando === "aprovar"} disabled={processando !== null} onClick={aprovar}>
            Aprovar cadastro
          </Button>
        </div>
      </div>
    </div>
  );
}
