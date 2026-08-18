// src/hooks/useListas.js
// Hook de estado/UI para listas de compras. Toda persistência e regra de negócio
// fica centralizada em ListaComprasService.

import { useState, useCallback } from 'react';
import ListaComprasService from '../services/ListaComprasService';

export function useListas() {
  const [listas, setListas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const carregarListas = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const data = await ListaComprasService.carregarListas();
      setListas(data);
      return data;
    } catch (e) {
      console.error('[useListas] carregarListas:', e);
      setErro('Não foi possível carregar as listas.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const carregarItens = useCallback(async (listaId) => {
    try {
      return await ListaComprasService.carregarItens(listaId);
    } catch (e) {
      console.error('[useListas] carregarItens:', e);
      return [];
    }
  }, []);

  const criarLista = useCallback(async (nome, orcamento = 0) => {
    const id = await ListaComprasService.criarLista(nome, orcamento);
    await carregarListas();
    return id;
  }, [carregarListas]);

  const editarLista = useCallback(async (listaId, dados) => {
    await ListaComprasService.editarLista(listaId, dados);
    await carregarListas();
  }, [carregarListas]);

  const excluirLista = useCallback(async (listaId) => {
    await ListaComprasService.excluirLista(listaId);
    await carregarListas();
  }, [carregarListas]);

  const concluirLista = useCallback(async (listaId) => {
    const total = await ListaComprasService.concluirLista(listaId);
    await carregarListas();
    return total;
  }, [carregarListas]);

  const reabrirLista = useCallback(async (listaId) => {
    await ListaComprasService.reabrirLista(listaId);
    await carregarListas();
  }, [carregarListas]);

  const adicionarItem = useCallback((listaId, dados) => ListaComprasService.adicionarItem(listaId, dados), []);
  const editarItem = useCallback((itemId, dados) => ListaComprasService.editarItem(itemId, dados), []);
  const marcarComprado = useCallback((itemId, valor) => ListaComprasService.marcarComprado(itemId, valor), []);
  const desmarcarComprado = useCallback((itemId) => ListaComprasService.desmarcarComprado(itemId), []);
  const removerItem = useCallback((itemId) => ListaComprasService.removerItem(itemId), []);

  return {
    listas,
    loading,
    erro,
    carregarListas,
    carregarItens,
    criarLista,
    editarLista,
    excluirLista,
    concluirLista,
    reabrirLista,
    adicionarItem,
    editarItem,
    marcarComprado,
    desmarcarComprado,
    removerItem,
  };
}
