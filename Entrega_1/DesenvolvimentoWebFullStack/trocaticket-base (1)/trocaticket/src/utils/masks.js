export function mascararTelefone(valor) {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/(\d{0,2})(\d{0,4})(\d{0,4})/, (_, a, b, c) =>
      [a && `(${a}`, a && a.length === 2 && ") ", b, c && `-${c}`].filter(Boolean).join("")
    );
  }
  return d.replace(/(\d{0,2})(\d{0,5})(\d{0,4})/, (_, a, b, c) =>
    [a && `(${a}`, a && a.length === 2 && ") ", b, c && `-${c}`].filter(Boolean).join("")
  );
}

export function mascararDocumento(valor) {
  const d = valor.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 11) {
    return d.replace(/(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})/, (_, a, b, c, e) =>
      [a, b && `.${b}`, c && `.${c}`, e && `-${e}`].filter(Boolean).join("")
    );
  }
  return d.replace(/(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})/, (_, a, b, c, e, f) =>
    [a, b && `.${b}`, c && `.${c}`, e && `/${e}`, f && `-${f}`].filter(Boolean).join("")
  );
}
