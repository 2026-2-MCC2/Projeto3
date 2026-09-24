import { useEffect, useRef } from "react";
import "./OtpInput.css";

/**
 * Campo de código de N dígitos (MFA). O valor é uma string só com números.
 * Avança sozinho ao digitar, volta com Backspace e aceita colar o código inteiro.
 */
export default function OtpInput({ value, onChange, length = 6, invalid = false, labelledBy, describedBy }) {
  const refs = useRef([]);
  // valor mais recente, para o onFocus não usar um valor antigo logo após digitar
  const atual = useRef(value);
  useEffect(() => {
    atual.current = value;
  }, [value]);

  function atualizar(novo) {
    atual.current = novo;
    onChange(novo);
  }

  const focar = (i) => refs.current[Math.max(0, Math.min(i, length - 1))]?.focus();

  function handleChange(i, e) {
    const digito = e.target.value.replace(/\D/g, "").slice(-1);
    if (!digito) return;
    atualizar((value.slice(0, i) + digito + value.slice(i + 1)).slice(0, length));
    focar(i + 1);
  }

  function handleKeyDown(i, e) {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (value[i]) {
        atualizar(value.slice(0, i) + value.slice(i + 1));
      } else if (i > 0) {
        atualizar(value.slice(0, i - 1) + value.slice(i));
        focar(i - 1);
      }
    } else if (e.key === "ArrowLeft") {
      focar(i - 1);
    } else if (e.key === "ArrowRight") {
      focar(i + 1);
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const colado = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!colado) return;
    atualizar(colado);
    focar(colado.length);
  }

  return (
    <div className="otp" role="group" aria-labelledby={labelledBy} aria-describedby={describedBy}>
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          className={`otp__digit ${invalid ? "otp__digit--invalid" : ""}`}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Dígito ${i + 1} de ${length}`}
          aria-invalid={invalid ? "true" : "false"}
          value={value[i] ?? ""}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => {
            // não deixa pular casas vazias: o foco vai para o próximo dígito a preencher
            if (i > atual.current.length) {
              focar(atual.current.length);
            } else {
              e.target.select();
            }
          }}
        />
      ))}
    </div>
  );
}
