import "./Eventos.css";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Banknote, SearchX, Ticket, Repeat2, Users, Wallet } from "lucide-react";
import { ChartCard } from "../../components/admin/ChartCard.jsx";
import { ExportMenu } from "../../components/admin/ExportMenu.jsx";
import { EmptyState, KpiCard, MiniBar, PageHeader, Pill, QueryBoundary } from "../../components/admin/ui.jsx";
import { statusTone } from "../../utils/admin/status.js";
import { useAdminQuery } from "../../hooks/useAdminQuery.js";
import { useExporter } from "../../hooks/useExporter.js";
import { obterEvento } from "../../services/adminApi.js";
import { economia, melhorProposta } from "../../services/adminCalculos.js";
import { formatBRL, formatBRLCompact, formatDate, formatNumber, formatPct } from "../../utils/admin/format.js";

export default function EventoDetalhe() {
  const { eventoId } = useParams();
  const query = useAdminQuery(
    () => obterEvento(eventoId).then((evento) => ({ evento, cotacoes: [] })),
    [eventoId],
  );

  if (query.error?.naoEncontrado) {
    return (
      <div className="adm-panel adm-state">
        <SearchX aria-hidden="true" />
        <h2>Evento não encontrado</h2>
        <p>O evento “{eventoId}” não existe ou foi removido.</p>
        <Link to="/admin/eventos" className="adm-btn adm-btn--outline">
          Voltar para eventos
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link to="/admin/eventos" className="evd-voltar">
        <ArrowLeft aria-hidden="true" /> Eventos
      </Link>
      <QueryBoundary query={query} linhasSkeleton={2}>
        {({ evento, cotacoes }) => <Conteudo e={evento} cs={cotacoes} />}
      </QueryBoundary>
    </>
  );
}

function Conteudo({ e, cs }) {
  const { pdf, csv } = useExporter();
  const pct = e.realizado == null || !e.previsto ? null : (e.realizado / e.previsto) * 100;
  const ocupacao = e.ingressosVendidos == null || !e.publico ? null : (e.ingressosVendidos / e.publico) * 100;
  const planejamento = e.planejamento.map((linha) => ({
    ...linha,
    saldo: linha.realizado == null ? null : linha.previsto - linha.realizado,
  }));
  const vendas = e.ingressosVendidos == null ? [] : [
    { canal: "Venda primária", ingressos: e.ingressosVendidos - e.ingressosRevenda },
    { canal: "Revenda (troca)", ingressos: e.ingressosRevenda },
    { canal: "Disponíveis", ingressos: Math.max(0, e.publico - e.ingressosVendidos) },
  ];

  const colPlan = [
    { key: "categoria", label: "Categoria" },
    { key: "previsto", label: "Previsto", format: (v) => formatBRL(Number(v)) },
    { key: "realizado", label: "Realizado", format: (v) => v == null ? "Não disponível" : formatBRL(Number(v)) },
    { key: "saldo", label: "Saldo", format: (v) => v == null ? "Não disponível" : formatBRL(Number(v)) },
  ];
  const colCot = [
    { key: "id", label: "Código" },
    { key: "servico", label: "Serviço" },
    { key: "situacao", label: "Situação" },
    { key: "respostas", label: "Propostas", format: (_, c) => `${c.propostas.length}/${c.convidados}` },
    { key: "melhor", label: "Melhor proposta", format: (_, c) => formatBRL(melhorProposta(c)?.valor ?? 0) },
  ];

  return (
    <>
      <PageHeader
        eyebrow={
          <Pill tone={statusTone(e.status)} dot>
            {e.status}
          </Pill>
        }
        title={e.nome}
        description={`${e.organizador} · ${e.cidade}/${e.uf} · ${formatDate(e.data)}`}
        actions={
          <ExportMenu
            label="Exportar evento"
            variant="primary"
            onPDF={() =>
              pdf({
                title: e.nome,
                subtitle: `${e.organizador} · ${e.cidade}/${e.uf} · ${formatDate(e.data)} · ${e.status}`,
                summary: [
                  { label: "Previsto", value: formatBRL(e.previsto) },
                  { label: "Realizado", value: e.realizado == null ? "Não disponível" : formatBRL(e.realizado) },
                  { label: "Público", value: formatNumber(e.publico) },
                  { label: "Ingressos vendidos", value: e.ingressosVendidos == null ? "Não disponível" : formatNumber(e.ingressosVendidos) },
                ],
                tables: [
                  { title: "Planejamento por categoria", columns: colPlan, rows: planejamento },
                  { title: "Cotações do evento", columns: colCot, rows: cs },
                ],
              })
            }
            onCSV={() => csv(`planejamento-${e.id}`, colPlan, planejamento)}
          />
        }
      />

      <div className="adm-grid adm-grid--kpi">
        <KpiCard label="Orçamento previsto" value={formatBRLCompact(e.previsto)} icon={Wallet} tone="primary" hint="Planejamento aprovado" />
        <KpiCard label="Custo realizado" value={pct == null ? "—" : formatBRLCompact(e.realizado)} icon={Banknote} tone="brand" progress={pct ?? 0} hint={pct == null ? "A API ainda não registra pagamentos realizados." : `${formatPct(pct)} executado`} delay={60} />
        <KpiCard label="Ingressos vendidos" value={ocupacao == null ? "—" : formatNumber(e.ingressosVendidos)} icon={Ticket} tone="success" progress={ocupacao ?? 0} hint={ocupacao == null ? "A API ainda não registra vendas de ingressos." : `${formatPct(ocupacao)} da capacidade de ${formatNumber(e.publico)}`} delay={120} />
        <KpiCard
          label="Ingressos em revenda"
          value={e.ingressosRevenda == null ? "—" : formatNumber(e.ingressosRevenda)}
          icon={Repeat2}
          tone="warning"
          hint={e.ingressosRevenda == null ? "A API ainda não registra revendas." : `${formatPct((e.ingressosRevenda / Math.max(1, e.ingressosVendidos)) * 100)} dos vendidos voltaram à troca`}
          delay={180}
        />
      </div>

      <div className="adm-grid adm-grid--3-2 adm-mt">
        <ChartCard
          title="Valores do planejamento"
          description="Valores previstos; dados de pagamentos realizados ainda não são disponibilizados."
          data={planejamento}
          xKey="categoria"
          xLabel="Categoria"
          series={[
            { key: "previsto", label: "Previsto" },
            { key: "realizado", label: "Realizado" },
            { key: "saldo", label: "Saldo" },
          ]}
          types={["bar", "horizontal", "stacked", "radar", "pie", "table"]}
          valueFormat={formatBRL}
          axisFormat={formatBRLCompact}
          height={330}
        />
        <ChartCard
          title="Ingressos por canal"
          description="A API ainda não disponibiliza dados de ingressos vendidos."
          data={vendas}
          xKey="canal"
          xLabel="Canal"
          series={[{ key: "ingressos", label: "Ingressos" }]}
          types={["donut", "pie", "bar", "table"]}
          valueFormat={formatNumber}
          height={330}
        />
      </div>

      <section className="adm-panel adm-panel--pad adm-mt">
        <div className="adm-row adm-row--between" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: "1.1rem" }}>Cotações e propostas</h3>
          <Link to="/admin/cotacoes" className="adm-link">
            Todas as cotações
          </Link>
        </div>
        {cs.length === 0 ? (
          <EmptyState>A API ainda não disponibiliza dados de cotações e propostas.</EmptyState>
        ) : (
          <div className="evd-cotacoes">
            {cs.map((c) => {
              const best = melhorProposta(c);
              const eco = economia(c);
              return (
                <article key={c.id} className="adm-surface-box" style={{ padding: 20 }}>
                  <div className="adm-row adm-row--between" style={{ alignItems: "flex-start", flexWrap: "nowrap" }}>
                    <div>
                      <div className="adm-mono adm-muted" style={{ fontSize: "0.75rem" }}>{c.id}</div>
                      <div style={{ fontFamily: "var(--adm-font-display)", fontSize: "1.1rem", fontWeight: 600 }}>{c.servico}</div>
                    </div>
                    <Pill tone={statusTone(c.situacao)} dot>
                      {c.situacao}
                    </Pill>
                  </div>
                  <ul className="evd-propostas">
                    {[...c.propostas]
                      .sort((a, b) => a.valor - b.valor)
                      .map((p) => (
                        <li key={p.id}>
                          <span className="evd-propostas__nome">{p.fornecedor}</span>
                          <div style={{ flex: 1 }}>
                            <MiniBar value={(best.valor / p.valor) * 100} tone={p.id === best.id ? "success" : "primary"} />
                          </div>
                          <span className="adm-mono adm-tabular evd-propostas__valor">{formatBRL(p.valor)}</span>
                        </li>
                      ))}
                  </ul>
                  <div className="adm-perforation" />
                  <div className="adm-row adm-row--between adm-muted" style={{ fontSize: "0.75rem" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Users size={12} aria-hidden="true" /> {c.propostas.length} de {c.convidados} responderam
                    </span>
                    <span className="adm-text-success adm-strong">↓ {formatPct(eco.pct)} economia</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
