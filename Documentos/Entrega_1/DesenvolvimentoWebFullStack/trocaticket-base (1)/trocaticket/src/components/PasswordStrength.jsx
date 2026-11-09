import "./PasswordStrength.css";

const ROTULOS = ["Muito fraca", "Fraca", "Razoável", "Boa", "Forte"];

export default function PasswordStrength({ pontuacao }) {
  return (
    <div className="strength" role="status">
      <div className="strength__bars" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`strength__bar ${i < pontuacao ? `strength__bar--${pontuacao}` : ""}`} />
        ))}
      </div>
      {pontuacao > 0 && <span className="strength__label">{ROTULOS[pontuacao]}</span>}
    </div>
  );
}
