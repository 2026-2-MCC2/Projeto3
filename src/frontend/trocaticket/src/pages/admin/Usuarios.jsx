import { useEffect, useMemo, useState } from "react";
import AdminPageHeader from "../../components/admin/AdminPageHeader.jsx";
import AsyncState from "../../components/admin/AsyncState.jsx";
import Badge from "../../components/admin/Badge.jsx";
import Alert from "../../components/Alert.jsx";
import { buscarCadastros, alternarSituacaoCadastro } from "../../services/adminService.js";
import { tomStatus, formatarData } from "../../utils/admin.js";
import "./Usuarios.css";

const FILTROS = [
  { valor: "todos", label: "Todos" },
  { valor: "Organizador", label: "Organizador" },
  { valor: "Fornecedor", label: "Fornecedor" },
];

export default function Usuarios() {
  const [estado, setEstado] = useState({ carregando: true, erro: "", cadastros: [], historico: [] });
  const [filtro, setFiltro] = useState("todos");
  const [busca, setBusca] = useState("");
  const [processandoId, setProcessandoId] = useState(null);
  const [erroAcao, setErroAcao] = useState("");

  function carregar() {
    setEstado({ carregando: true, erro: "", cadastros: [], historico: [] });
    buscarCadastros()
      .then(({ cadastros, historico }) => setEstado({ carregando: false, erro: "", cadastros, historico }))
      .catch((err) => setEstado({ carregando: false, erro: err.message, cadastros: [], historico: [] }));
  }

  useEffect(carregar, []);

  const termo = busca.trim().toLowerCase();
  const filtrados = useMemo(
    () =>
      estado.cadastros.filter((c) => {
        const bateFiltro = filtro === "todos" || c.tipo === filtro;
        const bateBusca =
          !termo || c.nome.toLowerCase().includes(termo) || c.cnpj.includes(termo) || c.categoria.toLowerCase().includes(termo);
        return bateFiltro && bateBusca;
      }),
    [estado.cadastros, filtro, termo]
  );

  async function handleAlternar(cadastro) {
    setProcessandoId(cadastro.id);
    setErroAcao("");
    try {
      const { situacao } = await alternarSituacaoCadastro(cadastro.id, cadastro.situacao);
      setEstado((e) => ({
        ...e,
        cadastros: e.cadastros.map((c) => (c.id === cadastro.id ? { ...c, situacao } : c)),
      }));
    } catch (err) {
      setErroAcao(err.message);
    } finally {
      setProcessandoId(null);
    }
  }

  return (
    <section aria-labelledby="usuarios-titulo">
      <AdminPageHeader title="Cadastros" />

      <AsyncState loading={estado.carregando} error={estado.erro} onRetry={carregar}>
        <div className="admin-card usuarios__card">
          <div className="usuarios__card-head">
            <h2 className="admin-section-title">Organizadores e fornecedores</h2>
            <div className="usuarios__controles">
              <label className="admin-page-header__search">
                <input
                  type="search"
                  placeholder="Buscar por nome, CNPJ ou categoria"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  aria-label="Buscar por nome, CNPJ ou categoria"
                />
              </label>
              <div className="filter-chips">
                {FILTROS.map((f) => (
                  <button
                    key={f.valor}
                    type="button"
                    className={`filter-chip${filtro === f.valor ? " filter-chip--active" : ""}`}
                    onClick={() => setFiltro(f.valor)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {erroAcao && <Alert>{erroAcao}</Alert>}

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Cadastro</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Categoria</th>
                  <th scope="col">Aprovado em</th>
                  <th scope="col">Eventos</th>
                  <th scope="col">Situação</th>
                  <th scope="col">Ação</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="admin-empty-cell">
                      Nenhum cadastro encontrado para os filtros atuais.
                    </td>
                  </tr>
                ) : (
                  filtrados.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.nome}</strong>
                        <small>{c.cnpj}</small>
                      </td>
                      <td>{c.tipo}</td>
                      <td>{c.categoria}</td>
                      <td>{formatarData(c.aprovadoEm)}</td>
                      <td>{c.eventos}</td>
                      <td>
                        <Badge tone={tomStatus(c.situacao)}>{c.situacao}</Badge>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`usuarios__acao usuarios__acao--${c.situacao === "Ativo" ? "suspender" : "reativar"}`}
                          disabled={processandoId === c.id}
                          onClick={() => handleAlternar(c)}
                        >
                          {processandoId === c.id ? "Aguarde..." : c.situacao === "Ativo" ? "Suspender" : "Reativar"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-card usuarios__historico">
          <h2 className="admin-section-title usuarios__historico-titulo">Histórico do cadastro</h2>
          <ul className="usuarios__historico-lista">
            {estado.historico.map((h) => (
              <li key={h.id}>
                <div>
                  <strong>{h.cadastroNome}</strong>
                  <p>{h.descricao}</p>
                </div>
                <span>
                  {h.autor} • {formatarData(h.data)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </AsyncState>
    </section>
  );
}
