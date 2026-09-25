import { useId, useRef, useState } from "react";
import { UploadCloud, FileCheck2, X } from "lucide-react";
import "./FileDropzone.css";

export default function FileDropzone({ label, hint, error, file, onChange, accept }) {
  const id = useId();
  const erroId = `${id}-erro`;
  const inputRef = useRef(null);
  const [arrastando, setArrastando] = useState(false);

  function handleFiles(lista) {
    onChange(lista?.[0] ?? null);
  }

  return (
    <div className="dropzone-field">
      <div className="dropzone-field__head">
        <span className="field__label">{label}</span>
        {hint && <span className="dropzone-field__hint">{hint}</span>}
      </div>

      <div
        className={`dropzone ${arrastando ? "dropzone--active" : ""} ${error ? "dropzone--invalid" : ""} ${file ? "dropzone--filled" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastando(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          className="dropzone__input"
          aria-describedby={error ? erroId : undefined}
          aria-invalid={error ? "true" : "false"}
          onChange={(e) => handleFiles(e.target.files)}
        />

        {file ? (
          <div className="dropzone__file">
            <FileCheck2 size={20} aria-hidden="true" />
            <span className="dropzone__filename">{file.name}</span>
            <button
              type="button"
              className="dropzone__remove"
              aria-label={`Remover ${file.name}`}
              onClick={() => {
                onChange(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <label htmlFor={id} className="dropzone__label">
            <span className="dropzone__icon" aria-hidden="true">
              <UploadCloud size={18} />
            </span>
            <span className="dropzone__title">Arraste ou selecione o documento</span>
            <span className="dropzone__subtitle">
              Contrato Social, Cartão CNPJ ou Documento de Identificação com foto
            </span>
          </label>
        )}
      </div>

      {error && (
        <p id={erroId} className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}
