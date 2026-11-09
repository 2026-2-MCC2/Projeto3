import { useState } from "react";

const FALLBACK = ["#153d6d", "#04a2ed", "#e9a03e", "#e85854", "#1f9b82", "#a7c8ea"];

function lerCores() {
  const raiz = document.querySelector(".adm") ?? document.documentElement;
  const estilo = getComputedStyle(raiz);
  return FALLBACK.map((padrao, i) => estilo.getPropertyValue(`--adm-chart-${i + 1}`).trim() || padrao);
}

/**
 * Resolve as variáveis --adm-chart-1..6 para cores concretas, para que o PNG/PDF
 * exportado mantenha a mesma paleta da tela. Para trocar as cores dos gráficos,
 * edite essas variáveis em src/components/admin/admin-theme.css.
 */
export function useChartColors() {
  const [cores] = useState(lerCores);
  return cores;
}
