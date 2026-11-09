import "./StatCard.css";

/** Cartão de indicador usado nos topos das telas (Visão Geral, Eventos, Cotações...). */
export default function StatCard({ label, value, helper, tone = "default" }) {
  return (
    <div className={`stat-card stat-card--${tone}`}>
      <span className="stat-card__label">{label}</span>
      <strong className="stat-card__value">{value}</strong>
      {helper && <span className="stat-card__helper">{helper}</span>}
    </div>
  );
}
