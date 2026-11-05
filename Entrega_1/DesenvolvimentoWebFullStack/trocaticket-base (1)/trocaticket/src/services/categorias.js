export const categorias = [
  { id: "som", nome: "Som & PA", rotuloCurto: "Som", cor: "#2563eb", grupoGrafico: "som", tipoCusto: "infraestrutura" },
  { id: "palco", nome: "Estruturas & Palco", rotuloCurto: "Palco", cor: "#6d5bf0", grupoGrafico: "palco", tipoCusto: "infraestrutura" },
  { id: "seguranca", nome: "Segurança Privada", rotuloCurto: "Segurança", cor: "#10b981", grupoGrafico: "seguranca", tipoCusto: "encargos_operacao" },
  { id: "limpeza", nome: "Limpeza", rotuloCurto: "Limpeza", cor: "#a78bfa", grupoGrafico: "seguranca", tipoCusto: "encargos_operacao" },
  { id: "ecad", nome: "ECAD", rotuloCurto: "ECAD", cor: "#f59e0b", grupoGrafico: "fiscais", tipoCusto: "encargos_operacao" },
  { id: "uti", nome: "UTI", rotuloCurto: "UTI", cor: "#ef4444", grupoGrafico: "variaveis", tipoCusto: "encargos_operacao" },
  { id: "gateway", nome: "Gateway", rotuloCurto: "Gateway", cor: "#1e40af", grupoGrafico: "variaveis", tipoCusto: "encargos_operacao" },
  { id: "iss", nome: "ISS", rotuloCurto: "ISS", cor: "#64748b", grupoGrafico: "fiscais", tipoCusto: "encargos_operacao" },
  { id: "som_pa", nome: "Som & PA", rotuloCurto: "Som", cor: "#2563eb", grupoGrafico: "som", tipoCusto: "infraestrutura" },
  { id: "iluminacao", nome: "Iluminação Cênica", rotuloCurto: "Iluminação", cor: "#4f7cf2", grupoGrafico: "som", tipoCusto: "infraestrutura" },
  { id: "estruturas", nome: "Estruturas & Palco", rotuloCurto: "Palco", cor: "#6d5bf0", grupoGrafico: "palco", tipoCusto: "infraestrutura" },
  { id: "municipal", nome: "ISS", rotuloCurto: "ISS", cor: "#64748b", grupoGrafico: "fiscais", tipoCusto: "encargos_operacao" },
  { id: "operacao", nome: "UTI", rotuloCurto: "UTI", cor: "#ef4444", grupoGrafico: "variaveis", tipoCusto: "encargos_operacao" },
  { id: "alimentacao", nome: "Alimentação & Bebidas", rotuloCurto: "Alimentação", cor: "#f97316", grupoGrafico: "variaveis", tipoCusto: "encargos_operacao" },
  { id: "transporte", nome: "Transporte & Logística", rotuloCurto: "Transporte", cor: "#0ea5e9", grupoGrafico: "variaveis", tipoCusto: "encargos_operacao" },
  { id: "outro", nome: "Outro", rotuloCurto: "Outro", cor: "#94a3b8", grupoGrafico: "variaveis", tipoCusto: "encargos_operacao" },
  { id: "tributario", nome: "Tributário Estadual/Federal", rotuloCurto: "Tributário", cor: "#64748b", grupoGrafico: "fiscais", tipoCusto: "encargos_operacao" },
  { id: "seguros", nome: "Seguros", rotuloCurto: "Seguros", cor: "#64748b", grupoGrafico: "variaveis", tipoCusto: "encargos_operacao" },
];

export function obterCategoria(id) {
  return categorias.find((categoria) => categoria.id === id) ?? {
    id: id ?? "outro",
    nome: "Outros",
    rotuloCurto: "Outros",
    cor: "#94a3b8",
    grupoGrafico: "variaveis",
    tipoCusto: "encargos_operacao",
  };
}
