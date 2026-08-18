// src/hooks/useAcordos.js
// Hook fino: estado React aqui; regras e persistência ficam no FinanceiroService.

import { useState, useCallback } from 'react';
import FinanceiroService from '../services/FinanceiroService';

export function useAcordos() {
  const [acordos, setAcordos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      setAcordos(await FinanceiroService.carregarAcordos());
    } catch (e) {
      console.error('[useAcordos] carregar:', e);
      setErro('Não foi possível carregar os acordos.');
    } finally {
      setLoading(false);
    }
  }, []);

  const registrarPagamento = useCallback(async (acordo, qtd, data, valorRealPago) =>
    FinanceiroService.registrarPagamentoAcordo(acordo, qtd, data, valorRealPago), []);

  const estornarPagamento = useCallback(async (acordoId, pagamentoId) =>
    FinanceiroService.estornarPagamentoAcordo(acordoId, pagamentoId), []);

  const excluir = useCallback(async (id) => FinanceiroService.apagarAcordo(id), []);

  return { acordos, loading, erro, carregar, registrarPagamento, estornarPagamento, excluir };
}
