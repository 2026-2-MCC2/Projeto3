import { CircleAlert, LoaderCircle } from "lucide-react";
import "./ui.css";

/* Blocos de interface compartilhados pelas telas do painel do administrador. */

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="adm-page-header adm-rise">
      <div className="adm-page-header__text">
        {eyebrow && <div className="adm-page-header__eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="adm-page-header__actions">{actions}</div>}
    </div>
  );
}

/** Cartão de indicador com "picote" de ingresso. tone: brand | warning | danger | success | primary */
export function KpiCard({ label, value, unit, hint, icon: Icon, tone = "brand", progress, delay = 0 }) {
  return (
    <div className="adm-panel adm-kpi adm-rise" style={{ animationDelay: `${delay}ms` }}>
      <div className="adm-kpi__top">
        <div className="adm-eyebrow">{label}</div>
        <div className={`adm-icon-tile adm-icon-tile--${tone === "brand" ? "brand" : tone}`}>
          <Icon aria-hidden="true" />
        </div>
      </div>
      <div className="adm-kpi__value">
        <span className="adm-tabular">{value}</span>
        {unit && <small>{unit}</small>}
      </div>
      <div className="adm-perforation" />
      {progress !== undefined && <MiniBar value={progress} tone={tone === "primary" ? "primary" : tone} />}
      {hint && <div className="adm-kpi__hint">{hint}</div>}
    </div>
  );
}

/** Pílula de status. tone: brand | warning | danger | success | neutral */
export function Pill({ tone = "neutral", dot, children, as: Tag = "span", ...rest }) {
  return (
    <Tag className={`adm-pill adm-pill--${tone}${Tag === "button" ? " adm-pill--button" : ""}`} {...rest}>
      {dot && <span className="adm-pill__dot" aria-hidden="true" />}
      {children}
    </Tag>
  );
}

/** Filtro em "chips". options = [{ value, label, count? }] */
export function FilterChips({ options, value, onChange, label = "Filtro" }) {
  return (
    <div className="adm-chips" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" className="adm-chip" aria-pressed={value === o.value} onClick={() => onChange(o.value)}>
          {o.label}
          {o.count !== undefined && <span className="adm-chip__count">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

/** Seletor segmentado (abas de período, situação, etc.). */
export function Segmented({ options, value, onChange, label = "Opções" }) {
  return (
    <div className="adm-segmented" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Avatar({ name, tone = "brand" }) {
  const ini = name
    .split(/\s+/)
    .filter((p) => p.length > 2)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  return (
    <div className={`adm-avatar${tone === "brand" ? "" : ` adm-avatar--${tone}`}`} aria-hidden="true">
      {ini}
    </div>
  );
}

export function MiniBar({ value, tone = "primary" }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={`adm-minibar adm-minibar--${tone}`} role="presentation">
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

export function EmptyState({ children }) {
  return <div className="adm-empty">{children}</div>;
}

/**
 * Envolve o conteúdo de uma tela e mostra, de forma visível, o carregamento
 * (esqueleto) ou o erro (com botão "Tentar novamente").
 *   <QueryBoundary query={q} skeleton={<Skeleton/>}>{(data) => ...}</QueryBoundary>
 */
export function QueryBoundary({ query, children, linhasSkeleton = 3 }) {
  if (query.error && query.data === null) {
    return (
      <div className="adm-panel adm-state adm-state--error" role="alert">
        <CircleAlert aria-hidden="true" />
        <h2>Não foi possível carregar os dados</h2>
        <p>{query.error.message}</p>
        <button type="button" className="adm-btn adm-btn--outline" onClick={query.reload}>
          Tentar novamente
        </button>
      </div>
    );
  }
  if (query.data === null) {
    return (
      <div className="adm-stack" role="status" aria-live="polite" aria-busy="true">
        <span className="adm-sr-only">Carregando dados…</span>
        <div className="adm-grid adm-grid--kpi">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="adm-skeleton" style={{ height: 132 }} />
          ))}
        </div>
        {Array.from({ length: linhasSkeleton }, (_, i) => (
          <div key={i} className="adm-skeleton" style={{ height: 220 }} />
        ))}
      </div>
    );
  }
  return children(query.data);
}

/** Botão com estado de carregamento. */
export function Button({ variant = "primary", size, loading, icon: Icon, children, className = "", disabled, ...rest }) {
  const cls = ["adm-btn", `adm-btn--${variant}`, size ? `adm-btn--${size}` : "", className].filter(Boolean).join(" ");
  return (
    <button type="button" className={cls} {...rest} disabled={loading || disabled}>
      {loading ? <LoaderCircle className="adm-spin" aria-hidden="true" /> : Icon ? <Icon aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
