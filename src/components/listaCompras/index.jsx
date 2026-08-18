// src/components/listaCompras/index.jsx
// Orquestra a experiência de compras. A regra financeira fica no serviço:
// pagar item = lançar despesa paga imediatamente.

import React, { useState, useEffect, useCallback } from 'react';
import { useListas } from '../../hooks/useListas';
import TelaSeletorListas from './TelaSeletorListas';
import TelaListaAtiva from './TelaListaAtiva';

const TELAS = { SELETOR: 'seletor', LISTA_ATIVA: 'lista_ativa' };

const ListaComprasIndex = ({ setRoute }) => {
  const hook = useListas();
  const [tela, setTela] = useState(TELAS.SELETOR);
  const [listaAtiva, setListaAtiva] = useState(null);
  const [itens, setItens] = useState([]);

  useEffect(() => {
    hook.carregarListas();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const abrirLista = useCallback(async (lista) => {
    const itensCarregados = await hook.carregarItens(lista.id);
    const listas = await hook.carregarListas();
    setItens(itensCarregados);
    setListaAtiva(listas.find(l => l.id === lista.id) || lista);
    setTela(TELAS.LISTA_ATIVA);
  }, [hook]);

  const sincronizarListaAtiva = useCallback(async (listaId) => {
    const [listas, novosItens] = await Promise.all([
      hook.carregarListas(),
      hook.carregarItens(listaId),
    ]);
    const atualizada = listas.find(l => l.id === listaId);
    if (atualizada) setListaAtiva(atualizada);
    setItens(novosItens);
  }, [hook]);

  const handleCriarLista = async (nome, orcamento) => {
    const novoId = await hook.criarLista(nome, orcamento);
    const listas = await hook.carregarListas();
    const nova = listas.find(l => l.id === novoId);
    if (nova) await abrirLista(nova);
  };

  const handlePagar = async (itemId, valorReal) => {
    const valor = await hook.marcarComprado(itemId, valorReal);
    await sincronizarListaAtiva(listaAtiva.id);
    return valor;
  };

  const handleDesfazerPagamento = async (itemId) => {
    await hook.desmarcarComprado(itemId);
    await sincronizarListaAtiva(listaAtiva.id);
  };

  const handleRemove = async (itemId) => {
    await hook.removerItem(itemId);
    await sincronizarListaAtiva(listaAtiva.id);
  };

  const handleAdicionar = async (dados) => {
    await hook.adicionarItem(listaAtiva.id, dados);
    await sincronizarListaAtiva(listaAtiva.id);
  };

  const handleConcluir = async (listaId) => hook.concluirLista(listaId);

  const handleEditarLista = async (listaId, dados) => {
    await hook.editarLista(listaId, dados);
    await sincronizarListaAtiva(listaId);
  };

  const handleVoltarAoSeletor = async () => {
    setTela(TELAS.SELETOR);
    setListaAtiva(null);
    setItens([]);
    await hook.carregarListas();
  };

  if (tela === TELAS.LISTA_ATIVA && listaAtiva) {
    return (
      <TelaListaAtiva
        lista={listaAtiva}
        itens={itens}
        onVoltar={handleVoltarAoSeletor}
        onPagar={handlePagar}
        onDesfazerPagamento={handleDesfazerPagamento}
        onRemove={handleRemove}
        onAdicionar={handleAdicionar}
        onConcluir={handleConcluir}
        onEditarLista={handleEditarLista}
        setRoute={setRoute}
      />
    );
  }

  return (
    <TelaSeletorListas
      listas={hook.listas}
      loading={hook.loading}
      onAbrirLista={abrirLista}
      onCriarLista={handleCriarLista}
      onExcluir={hook.excluirLista}
      onReabrir={hook.reabrirLista}
    />
  );
};

export default ListaComprasIndex;
