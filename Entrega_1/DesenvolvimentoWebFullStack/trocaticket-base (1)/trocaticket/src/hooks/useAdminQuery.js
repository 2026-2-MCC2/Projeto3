import { useCallback, useEffect, useRef, useState } from "react";
import { assinarMudancas } from "../services/adminApi.js";

/**
 * Lê dados assíncronos do painel com estados de carregamento e erro.
 *
 *   const { data, loading, error, reload } = useAdminQuery(() => listarEventos());
 *
 * - `loading` é true só na primeira carga (ou quando `deps` mudam); depois de
 *   uma escrita (aprovar, suspender...) os dados são revalidados em segundo
 *   plano e `data` continua na tela, sem piscar.
 * - `error` traz a mensagem para exibir com <QueryBoundary onRetry={reload}>.
 * - `deps` funciona como as dependências do useEffect (ex.: [periodo]).
 */
export function useAdminQuery(fetcher, deps = []) {
  const fetcherRef = useRef(fetcher);
  const [tick, setTick] = useState(0);
  const [resultado, setResultado] = useState({ chave: null, data: null, error: null });
  const chave = `${deps.join("|")}#${tick}`;

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => assinarMudancas(() => setTick((t) => t + 1)), []);

  useEffect(() => {
    let cancelado = false;
    fetcherRef
      .current()
      .then((data) => {
        if (!cancelado) setResultado({ chave, data, error: null });
      })
      .catch((e) => {
        if (!cancelado) setResultado((anterior) => ({ chave, data: anterior.data, error: e }));
      });
    return () => {
      cancelado = true;
    };
  }, [chave]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  const resolvido = resultado.chave === chave;

  return {
    data: resultado.data,
    loading: !resolvido,
    error: resolvido ? resultado.error : null,
    reload,
  };
}
