import { useId } from "react";
import "./TextField.css";

export default function TextField({
  label,
  icon: Icon,
  error,
  trailing,
  labelAside,
  variant = "filled",
  ...inputProps
}) {
  const id = useId();
  const erroId = `${id}-erro`;
  const classes = [
    "field",
    `field--${variant}`,
    error ? "field--invalid" : "",
    trailing ? "field--has-trailing" : "",
  ].join(" ");

  return (
    <div className={classes}>
      <div className="field__head">
        <label htmlFor={id} className="field__label">
          {label}
        </label>
        {labelAside}
      </div>
      <div className="field__control">
        {Icon && <Icon className="field__icon" size={16} aria-hidden="true" />}
        <input
          id={id}
          className="field__input"
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? erroId : undefined}
          {...inputProps}
        />
        {trailing}
      </div>
      {error && (
        <p id={erroId} className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}
