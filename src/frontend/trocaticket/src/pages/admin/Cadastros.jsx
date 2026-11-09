import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Building2, ChevronLeft, ChevronRight, Gauge, History, Search, Wrench } from "lucide-react";
import { ChartCard } from "../../components/admin/ChartCard.jsx";
import { ExportMenu } from "../../components/admin/ExportMenu.jsx";
import { Modal } from "../../components/admin/Modal.jsx";
import { Avatar, Button, FilterChips, KpiCard, MiniBar, PageHeader, Pill, QueryBoundary } from "../../components/admin/ui.jsx";
import { statusTone } from "../../utils/admin/status.js";
import { useAdminQuery } from "../../hooks/useAdminQuery.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useExporter } from "../../hooks/useExporter.js";
import { useToast } from "../../hooks/useToast.js";
import { alterarStatusCadastro, listarAuditoria, listarCadastros } from "../../services/adminApi.js";
import { formatDateShort, formatDateTime, formatPct } from "../../utils/admin/format.js";
import { validarJustificativa } from "../../utils/admin/validacoes.js";
import "./Cadastros.css";

const POR_PAGINA = 8;

const COLUNAS = [
  { key: "nome", label: "Nome fantasia" },
  { key: "razao", label: "Razão social" },
  { key: "cnpj", label: "CNPJ" },
  { key: "tipo", label: "Tipo" },
  { key: "categoria", label: "Categoria" },
  { key: "cidade", label: "Cidade" },
  { key: "uf", label: "UF" },
  { key: "aprovadoEm", label: "Aprovado em", format: (v) => formatDateShort(String(v)) },
  { key: "eventos", label: "Eventos" },
  { key: "status", label: "Status" },
];

export default function Cadastros() {
  const query = useAdminQuery(() => Promise.all([listarCadastros(), listarAuditoria()]).then(([cadastros, auditoria]) => ({ cadastros, auditoria })));
  return (
    <QueryBoundary query={query}>{({ cadastros, auditoria }) => <Conteudo cadastros={cadastros} auditoria={auditoria} />}</QueryBoundary>
  );
}

function Conteudo({ cadastros, auditoria }) {
  const [params] = useSearchParams();
  const { pdf, csv } = useExporter();
  const [filtro, setFiltro] = useState("todos");
  const [busca, setBusca] = useState(params.get("busca") ?? "");
  const [pagina, setPagina] = useState(1);
  const [alvo, setAlvo] = useState(null);

  const lista = useMemo(
    () =>
      cadastros
        .filter((c) => filtro === "todos" || c.tipo === filtro || c.status === filtro)
        .filter((c) => [c.nome, c.razao, c.cnpj, c.categoria].join(" ").toLowerCase().includes(busca.toLowerCase())),
    [cadastros, filtro, busca],
  );
  const totalPaginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = lista.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);
  const maxEventos = Math.max(...cadastros.map((c) => c.eventos), 1);

  const org = cadastros.filter((c) => c.tipo === "Organizador").length;
  const forn = cadastros.length - org;
  const suspensos = cadastros.filter((c) => c.status === "Suspenso").length;
  const indice = ((cadastros.length - suspensos) / cadastros.length) * 100;

  const porCategoria = useMemo(() => {
    const m = new Map();
    cadastros.forEach((c) => {
      const r = m.get(c.categoria) ?? { categoria: c.categoria, organizadores: 0, fornecedores: 0 };
      if (c.tipo === "Organizador") r.organizadores++;
      else r.fornecedores++;
      m.set(c.categoria, r);
    });
    return [...m.values()].sort((a, b) => b.organizadores + b.fornecedores - (a.organizadores + a.fornecedores));
  }, [cadastros]);

  const porUF = useMemo(() => {
    const m = new Map();
    cadastros.forEach((c) => m.set(c.uf, (m.get(c.uf) ?? 0) + 1));
    return [...m.entries()].map(([uf, total]) => ({ uf, total })).sort((a, b) => b.total - a.total);
  }, [cadastros]);

  const historico = auditoria.filter((a) => a.entidade === "Cadastro" || a.entidade === "Aprovação").slice(0, 6);

  return (
    <>
      <PageHeader
        title="Cadastros"
        description="Organizadores e fornecedores homologados e ativos na plataforma."
        actions={
          <ExportMenu
            label="Exportar cadastros"
            variant="primary"
            onPDF={() =>
              pdf({
                title: "Cadastros homologados",
                subtitle: `${lista.length} registros · filtro: ${filtro}${busca ? ` · busca "${busca}"` : ""}`,
                orientation: "landscape",
                summary: [
                  { label: "Total", value: String(cadastros.length) },
                  { label: "Organizadores", value: String(org) },
                  { label: "Fornecedores", value: String(forn) },
                  { label: "Índice operacional", value: formatPct(indice) },
                ],
                tables: [{ columns: COLUNAS, rows: lista }],
              })
            }
            onCSV={() => csv("cadastros", COLUNAS, lista)}
          />
        }
      />

      <div className="adm-grid adm-grid--kpi">
        <KpiCard label="Total cadastrado" value={cadastros.length} icon={Building2} hint="Parceiros homologados" />
        <KpiCard label="Organizadores" value={org} unit="parceiros" icon={Building2} tone="primary" progress={(org / cadastros.length) * 100} hint={`${formatPct((org / cadastros.length) * 100)} da base`} delay={60} />
        <KpiCard label="Fornecedores técnicos" value={forn} unit="ativos" icon={Wrench} tone="brand" progress={(forn / cadastros.length) * 100} hint={`${formatPct((forn / cadastros.length) * 100)} da base`} delay={120} />
        <KpiCard
          label="Índice operacional"
          value={formatPct(indice)}
          icon={Gauge}
          tone={suspensos ? "warning" : "success"}
          hint={<span className="adm-text-danger adm-strong">● {suspensos} suspenso(s)</span>}
          delay={180}
        />
      </div>

      <div className="adm-grid adm-grid--3-2 adm-mt">
        <ChartCard
          title="Cadastros por categoria"
          description="Organizadores e fornecedores em cada segmento"
          data={porCategoria}
          xKey="categoria"
          xLabel="Categoria"
          series={[
            { key: "organizadores", label: "Organizadores" },
            { key: "fornecedores", label: "Fornecedores" },
          ]}
          types={["horizontal", "stacked", "bar", "radar", "table"]}
          height={320}
        />
        <ChartCard
          title="Distribuição por estado"
          description="Presença regional da base"
          data={porUF}
          xKey="uf"
          xLabel="UF"
          series={[{ key: "total", label: "Cadastros" }]}
          types={["donut", "pie", "bar", "table"]}
          height={320}
        />
      </div>

      <section className="adm-panel adm-panel--flush adm-mt">
        <div className="cad-filtros">
          <label className="adm-search" style={{ height: 44 }}>
            <Search aria-hidden="true" />
            <input
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setPagina(1);
              }}
              placeholder="Buscar por nome fantasia, razão social, CNPJ ou categoria…"
              aria-label="Buscar cadastros"
            />
          </label>
          <FilterChips
            label="Filtrar cadastros"
            value={filtro}
            onChange={(v) => {
              setFiltro(v);
              setPagina(1);
            }}
            options={[
              { value: "todos", label: "Todos", count: cadastros.length },
              { value: "Organizador", label: "Organizadores", count: org },
              { value: "Fornecedor", label: "Fornecedores", count: forn },
              { value: "Ativo", label: "Apenas ativos", count: cadastros.length - suspensos },
              { value: "Suspenso", label: "Suspensos", count: suspensos },
            ]}
          />
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table adm-table--wide">
            <thead>
              <tr>
                {["Cadastro / CNPJ", "Tipo", "Categoria", "UF / Cidade", "Aprovado em", "Eventos", "Status", "Ação"].map((h) => (
                  <th key={h} scope="col">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visiveis.map((c) => (
                <tr key={c.id} className={c.status === "Suspenso" ? "adm-row--danger" : ""}>
                  <td>
                    <div className="adm-row" style={{ flexWrap: "nowrap" }}>
                      <Avatar name={c.nome} tone={c.status === "Suspenso" ? "danger" : "brand"} />
                      <div>
                        <div className="adm-strong">{c.nome}</div>
                        <div className="adm-mono adm-muted" style={{ fontSize: "0.75rem" }}>{c.cnpj}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Pill tone={c.tipo === "Organizador" ? "brand" : "neutral"}>{c.tipo}</Pill>
                  </td>
                  <td>{c.categoria}</td>
                  <td>
                    <span className="cad-uf">{c.uf}</span>
                    <span className="adm-muted">{c.cidade}</span>
                  </td>
                  <td className="adm-mono" style={{ fontSize: "0.75rem" }}>{formatDateShort(c.aprovadoEm)}</td>
                  <td>
                    <div className="cad-eventos">
                      <span className="adm-mono adm-strong">{c.eventos}</span>
                      <MiniBar value={(c.eventos / maxEventos) * 100} tone={c.status === "Suspenso" ? "danger" : "primary"} />
                    </div>
                  </td>
                  <td>
                    <Pill tone={statusTone(c.status)} dot>
                      {c.status}
                    </Pill>
                  </td>
                  <td>
                    <Button size="sm" variant={c.status === "Ativo" ? "danger-ghost" : "primary"} onClick={() => setAlvo(c)}>
                      {c.status === "Ativo" ? "Suspender" : "Reativar"}
                    </Button>
                  </td>
                </tr>
              ))}
              {visiveis.length === 0 && (
                <tr>
                  <td colSpan={8} className="adm-table-empty">
                    Nenhum cadastro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="cad-paginacao">
          <span>
            Exibindo <b>{visiveis.length}</b> de <b>{lista.length}</b> registros
          </span>
          <nav className="adm-row" style={{ gap: 4 }} aria-label="Paginação">
            <Button size="icon" variant="ghost" icon={ChevronLeft} disabled={paginaAtual === 1} aria-label="Página anterior" onClick={() => setPagina(paginaAtual - 1)} />
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
              <Button key={n} size="sm" variant={n === paginaAtual ? "secondary" : "ghost"} aria-current={n === paginaAtual ? "page" : undefined} onClick={() => setPagina(n)}>
                {n}
              </Button>
            ))}
            <Button size="icon" variant="ghost" icon={ChevronRight} disabled={paginaAtual === totalPaginas} aria-label="Próxima página" onClick={() => setPagina(paginaAtual + 1)} />
          </nav>
        </div>
      </section>

      <section className="adm-panel adm-panel--pad adm-mt">
        <div className="adm-row" style={{ marginBottom: 20, flexWrap: "nowrap" }}>
          <div className="adm-icon-tile">
            <History aria-hidden="true" />
          </div>
          <div>
            <h3 style={{ fontSize: "1.1rem" }}>Histórico de alterações</h3>
            <p className="adm-muted" style={{ fontSize: "0.875rem" }}>Suspensões, reativações e aprovações auditadas</p>
          </div>
        </div>
        <div className="cad-historico">
          {historico.map((h) => (
            <article key={h.id} className="adm-surface-box">
              <div className="adm-row adm-row--between" style={{ alignItems: "flex-start", flexWrap: "nowrap" }}>
                <strong>{h.alvo}</strong>
                <Pill tone={statusTone(h.acao)}>{h.acao}</Pill>
              </div>
              <p className="adm-muted" style={{ marginTop: 8, fontSize: "0.875rem" }}>{h.justificativa}</p>
              <div className="adm-perforation" />
              <div className="adm-row adm-row--between adm-muted" style={{ fontSize: "0.75rem" }}>
                <span>{h.autor}</span>
                <span className="adm-mono">{formatDateTime(h.data)}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <ConfirmarStatus alvo={alvo} onFechar={() => setAlvo(null)} />
    </>
  );
}

/** Janela de suspensão/reativação com justificativa obrigatória (validada antes de enviar). */
function ConfirmarStatus({ alvo, onFechar }) {
  return (
    <Modal open={!!alvo} onClose={onFechar} title={alvo ? `${alvo.status === "Ativo" ? "Suspender" : "Reativar"} ${alvo.nome}?` : ""}>
      {alvo && <FormularioStatus key={alvo.id} alvo={alvo} onFechar={onFechar} />}
    </Modal>
  );
}

function FormularioStatus({ alvo, onFechar }) {
  const { user } = useAuth();
  const toast = useToast();
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const suspendendo = alvo.status === "Ativo";

  async function confirmar(e) {
    e.preventDefault();
    const problema = validarJustificativa(motivo);
    if (problema) return setErro(problema);
    setEnviando(true);
    try {
      await alterarStatusCadastro(alvo.id, motivo.trim(), user?.nome ?? "Administrador");
      toast.success(suspendendo ? `${alvo.nome} suspenso` : `${alvo.nome} reativado`, "Alteração registrada no histórico de auditoria.");
      onFechar();
    } catch (err) {
      toast.error("Não foi possível alterar o status", err.message);
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={confirmar} noValidate className="adm-stack adm-stack--sm">
      <p className="adm-muted" style={{ fontSize: "0.9rem" }}>
        {suspendendo
          ? "O parceiro deixa de receber convites e não pode criar eventos até ser reativado."
          : "O parceiro volta a operar normalmente na plataforma."}
      </p>
      <div className="adm-field">
        <label htmlFor="motivo-status">Justificativa</label>
        <textarea
          id="motivo-status"
          className="adm-textarea"
          rows={4}
          value={motivo}
          onChange={(e) => {
            setMotivo(e.target.value);
            setErro("");
          }}
          aria-invalid={erro ? "true" : "false"}
          aria-describedby="motivo-status-ajuda"
          placeholder="Justificativa (registrada na auditoria)…"
        />
        <p id="motivo-status-ajuda" className={`adm-help${erro ? " adm-help--error" : ""}`} role={erro ? "alert" : undefined}>
          {erro || "Obrigatória. Fica salva no histórico de auditoria."}
        </p>
      </div>
      <div className="adm-row" style={{ justifyContent: "flex-end" }}>
        <Button variant="ghost" onClick={onFechar} disabled={enviando}>
          Cancelar
        </Button>
        <Button type="submit" variant={suspendendo ? "danger" : "primary"} loading={enviando}>
          Confirmar {suspendendo ? "suspensão" : "reativação"}
        </Button>
      </div>
    </form>
  );
}
