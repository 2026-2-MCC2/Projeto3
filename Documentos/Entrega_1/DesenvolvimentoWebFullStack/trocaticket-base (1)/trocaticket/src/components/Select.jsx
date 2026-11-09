import { useId } from "react";
import { ChevronDown } from "lucide-react";
import "./TextField.css";

export default function Select({ label, icon: Icon, error, options, placeholder, ...selectProps }) {
  const id = useId();
  const erroId = `${id}-erro`;
  const classes = ["field", "field--select", error ? "field--invalid" : ""].join(" ");

  return (
    <div className={classes}>
      <div className="field__head">
        <label htmlFor={id} className="field__label">
          {label}
        </label>
      </div>
      <div className="field__control">
        {Icon && <Icon className="field__icon" size={16} aria-hidden="true" />}
        <select
          id={id}
          className="field__input"
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? erroId : undefined}
          {...selectProps}
        >
          <option value="">{placeholder ?? "Selecione..."}</option>
          {options.map((op) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
        </select>
        <ChevronDown className="field__chevron" size={14} aria-hidden="true" />
      </div>
      {error && (
        <p id={erroId} className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}
