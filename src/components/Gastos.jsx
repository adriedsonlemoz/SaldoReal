// src/components/Gastos.jsx — Razão financeiro unificado (beta.4)
// Pendências e dinheiro efetivado aparecem juntos, com origem rastreável.

import React, { useState, useEffect, useMemo } from 'react';
import Box        from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button     from '@mui/material/Button';
import Dialog     from '@mui/material/Dialog';
import DialogTitle    from '@mui/material/DialogTitle';
import DialogContent  from '@mui/material/DialogContent';
import DialogActions  from '@mui/material/DialogActions';
import Snackbar   from '@mui/material/Snackbar';
import Alert      from '@mui/material/Alert';
import Chip       from '@mui/material/Chip';

import FinanceiroUtils  from '../utils/financeiro';
import FinanceiroService from '../services/FinanceiroService';

const money = (v) => FinanceiroUtils.money(v);

// ─────────────────────────────────────────────────────────────────────────────
// Ícone SVG inline — seta
// ─────────────────────────────────────────────────────────────────────────────
const IcoChevron = ({ left }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d={left ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'}
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Card de item individual
// ─────────────────────────────────────────────────────────────────────────────
const ItemCard = ({ item, onPago, onEdit, onDelete, setRoute }) => {
  const isAcordo  = item.tipo === 'acordo' || item.origem === 'acordo';
  const isVirtual = item.tipo === 'virtual';
  const isMovimento = item.tipo === 'movimentacao';
  const isLista = item.origem === 'lista_compras';
  const isEntrada = item.operacao === 'entrada';
  const cor       = isEntrada ? '#10B981' : '#EF4444';
  const corBg     = isEntrada ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)';
  const corBorda  = isAcordo  ? 'rgba(123,44,191,0.24)'
                  : isVirtual ? 'rgba(16,185,129,0.4)'
                  : item.isPago ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.09)';

  // Ícone por categoria
  const ICONES = {
    'Mercado':'🛒','Alimentação':'🍽️','Transporte':'🚗','Saúde':'💊',
    'Lazer':'🏖️','Educação':'📚','Casa':'🏠','Vestuário':'👗',
    'Carnes':'🥩','Acordos/Dívidas':'🤝','Saldo Acumulado':'💰',
  };
  const icone = ICONES[item.categoria] || (isAcordo ? '🤝' : isEntrada ? '💵' : '💸');
  const ORIGENS = {
    manual: ['Manual', '✍️', '#7B2CBF'],
    lista_compras: ['Compras', '🛒', '#8B5CF6'],
    acordo: ['Acordo', '🤝', '#7B2CBF'],
    renda: ['Renda', '💰', '#10B981'],
  };
  const origemMeta = ORIGENS[item.origem] || null;

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1.2,
      px: 1.4, py: 1.2, mb: 1,
      bgcolor: 'background.paper',
      border: `1.5px solid ${corBorda}`,
      borderRadius: '14px',
      opacity: item.isPago && !isVirtual ? 0.62 : 1,
      transition: 'all 0.15s',
      position: 'relative',
      overflow: 'hidden',
      // barra lateral colorida
      '&::before': {
        content: '""',
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        bgcolor: item.isPago ? 'transparent' : cor,
        borderRadius: '3px 0 0 3px',
      },
    }}>
      {/* Ícone */}
      <Box sx={{
        width: 36, height: 36, borderRadius: '11px',
        bgcolor: corBg, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0,
      }}>
        {icone}
      </Box>

      {/* Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap' }}>
          <Typography sx={{
            fontWeight: 700, fontSize: '0.88rem', color: 'text.primary', lineHeight: 1.2,
            textDecoration: item.isPago && !isVirtual ? 'line-through' : 'none',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160,
          }}>
            {item.nome}
          </Typography>
          {origemMeta && (
            <Chip label={`${origemMeta[1]} ${origemMeta[0]}`} size="small" sx={{
              height: 20, fontSize: '0.64rem', fontWeight: 800,
              bgcolor: `${origemMeta[2]}12`, color: origemMeta[2],
              border: `1px solid ${origemMeta[2]}24`,
            }} />
          )}
        </Box>
        <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', mt: 0.2, lineHeight: 1.25 }}>
          {isVirtual ? 'Saldo Acumulado'
            : isMovimento
              ? `Pago dia ${item.dia || '—'} · ${item.categoria || 'Geral'}${item.competencia ? ` · Comp. ${item.competencia}` : ''}`
              : `Dia ${item.dia || '—'} · ${item.categoria || 'Geral'}`}
          {item.parcelaText ? ` · ${item.parcelaText}` : ''}
        </Typography>
      </Box>

      {/* Valor */}
      <Typography sx={{
        fontWeight: 800, fontSize: '0.95rem',
        color: cor,
        textDecoration: item.isPago && !isVirtual ? 'line-through' : 'none',
        flexShrink: 0, mr: 0.5,
      }}>
        {isEntrada ? '+' : '-'}{money(item.valor)}
      </Typography>

      {/* Ações */}
      {!isVirtual && (
        <Box sx={{ display: 'flex', gap: 0.4, flexShrink: 0 }}>
          {isAcordo ? (
            <Box onClick={() => setRoute('acordos')} sx={{
              minWidth: 36, height: 30, px: 0.8, borderRadius: '9px', cursor: 'pointer',
              bgcolor: 'rgba(123,44,191,0.09)', color: '#7B2CBF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.68rem', fontWeight: 900,
            }}>Abrir</Box>
          ) : isLista ? (
            <Box onClick={() => setRoute('lista')} sx={{
              minWidth: 36, height: 30, px: 0.8, borderRadius: '9px', cursor: 'pointer',
              bgcolor: 'rgba(139,92,246,0.09)', color: '#7C3AED',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.68rem', fontWeight: 900,
            }}>Lista</Box>
          ) : (
            <>
              <Box onClick={() => onPago(item)} sx={{
                width: 30, height: 30, borderRadius: '9px', cursor: 'pointer',
                bgcolor: item.isPago ? 'rgba(16,185,129,0.1)' : '#10B981',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', transition: 'all 0.15s',
                '&:active': { transform: 'scale(0.88)' },
              }}>
                {item.isPago ? '↩' : '✓'}
              </Box>
              <Box onClick={() => onEdit(item)} sx={{
                width: 30, height: 30, borderRadius: '9px', cursor: 'pointer',
                bgcolor: 'rgba(123,44,191,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem',
              }}>✎</Box>
              <Box onClick={() => onDelete(isMovimento ? item.entidadeId : item.id, item.nome, 'gasto')} sx={{
                width: 30, height: 30, borderRadius: '9px', cursor: 'pointer',
                bgcolor: 'rgba(239,68,68,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', color: '#EF4444',
              }}>✕</Box>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Seção colapsável (pendentes / liquidados)
// ─────────────────────────────────────────────────────────────────────────────
const Secao = ({ titulo, cor, itens, setRoute, onPago, onEdit, onDelete }) => {
  const [aberta, setAberta] = useState(true);
  if (itens.length === 0) return null;
  return (
    <Box sx={{ mb: 2 }}>
      <Box onClick={() => setAberta(v => !v)} sx={{
        display: 'flex', alignItems: 'center', gap: 1, mb: 1, cursor: 'pointer',
        userSelect: 'none',
      }}>
        <Box sx={{ flex: 1, height: 1, bgcolor: `${cor}30` }} />
        <Typography sx={{
          fontSize: '0.68rem', fontWeight: 800, color: cor,
          letterSpacing: '1px', textTransform: 'uppercase',
          px: 0.5,
        }}>
          {titulo} · {itens.length}
        </Typography>
        <Box sx={{ flex: 1, height: 1, bgcolor: `${cor}30` }} />
        <Typography sx={{ fontSize: '0.69rem', color: cor, ml: 0.5 }}>
          {aberta ? '▲' : '▼'}
        </Typography>
      </Box>
      {aberta && itens.map(item => (
        <ItemCard
          key={`${item.tipo}_${item.id}`}
          item={item}
          setRoute={setRoute}
          onPago={onPago}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Gastos
// ─────────────────────────────────────────────────────────────────────────────
const Gastos = ({ setRoute, setEditItem }) => {
  const [gastosRegistrados, setGastosRegistrados] = useState([]);
  const [movimentacoes,    setMovimentacoes]    = useState([]);
  const [acordosMensais,   setAcordosMensais]   = useState([]);
  const [sobraAnterior,    setSobraAnterior]     = useState(0);
  const [rendaMensal,      setRendaMensal]       = useState(0);
  const [diaPagamento,     setDiaPagamento]      = useState(null);
  const [mesOffset,        setMesOffset]         = useState(0);
  const [toast,            setToast]             = useState({ open: false, texto: '', sev: 'success' });
  const [modalDelete,      setModalDelete]       = useState({ open: false, id: null, nome: '', tipo: 'gasto' });
  const [modalConfirmPag,  setModalConfirmPag]   = useState({ open: false, item: null });
  const [filtroOrigem,     setFiltroOrigem]      = useState('todas');

  const carregarTudo = async () => {
    const [{ gastos, movimentacoes: movs, acordos, sobraAnterior: sobra }, renda, dia] = await Promise.all([
      FinanceiroService.dadosGastosMensais(mesOffset),
      FinanceiroService.getRenda(),
      FinanceiroService.getDiaPagamento(),
    ]);
    setGastosRegistrados(gastos);
    setMovimentacoes(movs || []);
    setAcordosMensais(acordos);
    setSobraAnterior(sobra);
    setRendaMensal(renda || 0);
    setDiaPagamento(dia || null);
  };

  useEffect(() => { carregarTudo(); }, [mesOffset]);

  const pedirConfirmacaoPagamento = (item) => {
    if (!item.isPago) setModalConfirmPag({ open: true, item });
    else executarTogglePagamento(item);
  };

  const executarTogglePagamento = async (item) => {
    setModalConfirmPag({ open: false, item: null });
    try {
      const mesAnoTarget = FinanceiroUtils.dateParaMesAno(FinanceiroUtils.mesComOffset(mesOffset));
      await FinanceiroService.registrarPagamentoGasto(item, mesAnoTarget);
      setToast({ open: true, texto: '✅ Atualizado!', sev: 'success' });
      carregarTudo();
    } catch {
      setToast({ open: true, texto: '❌ Erro ao atualizar.', sev: 'error' });
    }
  };

  const editarLancamento = async (item) => {
    if (item.tipo === 'movimentacao') {
      const gasto = await FinanceiroService.carregarGasto(item.entidadeId || item.referenciaId);
      if (!gasto) {
        setToast({ open: true, texto: 'Este lançamento é gerenciado pela tela de origem.', sev: 'info' });
        return;
      }
      setEditItem(gasto);
    } else {
      setEditItem(item);
    }
    setRoute('novaConta');
  };

  const pedirExclusao = (id, nome, tipo = 'gasto') => setModalDelete({ open: true, id, nome, tipo });

  const executarExclusao = async () => {
    const { id, tipo } = modalDelete;
    if (id) {
      tipo === 'acordo' ? await FinanceiroService.apagarAcordo(id) : await FinanceiroService.apagarGasto(id);
      carregarTudo();
      setToast({ open: true, texto: '🗑️ Removido.', sev: 'info' });
    }
    setModalDelete({ open: false, id: null, nome: '', tipo: 'gasto' });
  };

  const { abertos, pagos, resumo } = useMemo(() => {
    const mesAlvo      = FinanceiroUtils.mesComOffset(mesOffset);
    const mesAnoTarget = FinanceiroUtils.dateParaMesAno(mesAlvo);
    let res = { ent: 0, sai: 0, entPaga: 0, saiPaga: 0 };
    let listAbertos = [], listPagos = [];

    const jaTemSalario = movimentacoes.some(m =>
      m.tipoOperacao === 'entrada' && (m.origem === 'renda' || FinanceiroUtils.ehEntradaRendaBase(m))
    );

    if (rendaMensal > 0 && diaPagamento && !jaTemSalario) {
      const hoje = new Date();
      const mesAtual = FinanceiroUtils.dateParaMesAno(hoje);
      const alvoNum = FinanceiroUtils.mesAnoParaNum(mesAnoTarget);
      const atualNum = FinanceiroUtils.mesAnoParaNum(mesAtual);
      const dataPagamento = FinanceiroUtils.dataVencimentoNoMes(diaPagamento, mesAlvo);
      const isPago = alvoNum < atualNum ? true : alvoNum > atualNum ? false : FinanceiroUtils.diferencaDias(dataPagamento, hoje) <= 0;
      const salarioVirtual = {
        id: 'salario_virtual', nome: '💼 Salário', valor: rendaMensal,
        tipoOperacao: 'entrada', operacao: 'entrada', isPago, dia: dataPagamento.getDate(),
        categoria: 'Salário', tipo: 'virtual', origem: 'renda',
      };
      res.ent += rendaMensal;
      if (isPago) res.entPaga += rendaMensal;
      isPago ? listPagos.push(salarioVirtual) : listAbertos.push(salarioVirtual);
    }

    if (sobraAnterior > 0) {
      res.ent += sobraAnterior; res.entPaga += sobraAnterior;
      listPagos.push({ id: 'sobra', nome: '💰 Sobra do período anterior', valor: sobraAnterior, tipoOperacao: 'entrada', operacao: 'entrada', isPago: true, dia: 1, categoria: 'Saldo Acumulado', tipo: 'virtual' });
    }

    movimentacoes.forEach(m => {
      const valor = Number(m.valor || 0);
      const obj = { ...m, operacao: m.tipoOperacao || m.operacao || m.tipo, isPago: true };
      // No retorno do serviço, tipo="movimentacao" e tipoOperacao guarda entrada/despesa.
      obj.operacao = m.tipoOperacao || m.operacao || (m.tipo === 'movimentacao' ? (m.tipoOperacao || 'despesa') : m.tipo);
      if (m.tipoOperacao === 'entrada' || m.operacao === 'entrada') { res.ent += valor; res.entPaga += valor; }
      else { res.sai += valor; res.saiPaga += valor; }
      listPagos.push(obj);
    });

    gastosRegistrados.forEach(g => {
      const valor = Number(g.valor || 0);
      const operacao = g.tipoOperacao === 'entrada' ? 'entrada' : 'despesa';
      const origem = operacao === 'entrada' && FinanceiroUtils.ehEntradaRendaBase(g) ? 'renda' : 'manual';
      if (operacao === 'entrada') res.ent += valor; else res.sai += valor;
      listAbertos.push({ ...g, isPago: false, operacao, origem });
    });

    acordosMensais.forEach(a => {
      const valor = Number(a.valorFluxo ?? a.valorParcela ?? 0);
      res.sai += valor;
      listAbertos.push({
        ...a, isPago: false, operacao: 'despesa', tipo: 'acordo', origem: 'acordo',
        nome: a.empresa, valor, dia: a.vencimentoDia,
        parcelaText: `${a.parcelasDevidas || 1} parcela(s) devida(s)`,
      });
    });

    const aceita = (item) => filtroOrigem === 'todas' || item.origem === filtroOrigem || (filtroOrigem === 'manual' && !item.origem && item.tipo !== 'virtual');
    listAbertos = listAbertos.filter(aceita);
    listPagos = listPagos.filter(aceita);
    listAbertos.sort((a, b) => (parseInt(a.dia) || 31) - (parseInt(b.dia) || 31));
    listPagos.sort((a, b) => (parseInt(a.dia) || 31) - (parseInt(b.dia) || 31));
    return { abertos: listAbertos, pagos: listPagos, resumo: res };
  }, [gastosRegistrados, movimentacoes, acordosMensais, mesOffset, sobraAnterior, rendaMensal, diaPagamento, filtroOrigem]);

  const saldoReal   = resumo.entPaga - resumo.saiPaga;
  const nomeMes     = FinanceiroUtils.nomeMesOffset(mesOffset);
  const saldoPrevisto = resumo.ent - resumo.sai;

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', px: 2, pt: 2 }}>

      <Snackbar open={toast.open} autoHideDuration={3000}
        onClose={() => setToast(t => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={toast.sev} variant="filled" sx={{ borderRadius: '12px', fontWeight: 700 }}>
          {toast.texto}
        </Alert>
      </Snackbar>

      {/* ── HEADER MÊS ─────────────────────────────────────────────────── */}
      <Box sx={{
        borderRadius: '20px', overflow: 'hidden', mb: 2,
        background: 'linear-gradient(145deg, #1A0533 0%, #2D0B5E 50%, #6B1FA8 100%)',
        boxShadow: '0 8px 28px rgba(107,31,168,0.35)',
        position: 'relative',
      }}>
        {/* orb decorativo */}
        <Box sx={{
          position: 'absolute', top: -20, right: -20, width: 80, height: 80,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(247,37,133,0.35), transparent 70%)',
          filter: 'blur(14px)', pointerEvents: 'none',
        }} />

        {/* Navegação de mês */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, pt: 1.8, pb: 1.2 }}>
          <Box onClick={() => setMesOffset(v => v - 1)} sx={{
            width: 34, height: 34, borderRadius: '10px',
            bgcolor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fff', '&:active': { transform: 'scale(0.88)' },
          }}>
            <IcoChevron left />
          </Box>
          <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '1rem', letterSpacing: '-0.2px' }}>
            {nomeMes}
          </Typography>
          <Box onClick={() => setMesOffset(v => v + 1)} sx={{
            width: 34, height: 34, borderRadius: '10px',
            bgcolor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fff', '&:active': { transform: 'scale(0.88)' },
          }}>
            <IcoChevron />
          </Box>
        </Box>

        {/* Métricas em 3 colunas */}
        <Box sx={{ display: 'flex', px: 1.5, pb: 1.8, gap: 1 }}>
          {[
            { label: 'ENTRADAS', valor: resumo.ent, cor: '#4ADE80', bg: 'rgba(74,222,128,0.12)', borda: 'rgba(74,222,128,0.3)' },
            { label: 'SAÍDAS',   valor: resumo.sai, cor: '#FB7185', bg: 'rgba(251,113,133,0.12)', borda: 'rgba(251,113,133,0.3)' },
            { label: 'FLUXO REAL', valor: saldoReal, cor: saldoReal >= 0 ? '#A78BFA' : '#FB7185', bg: 'rgba(167,139,250,0.12)', borda: 'rgba(167,139,250,0.3)' },
          ].map(m => (
            <Box key={m.label} sx={{
              flex: 1, textAlign: 'center', py: 1, px: 0.5,
              bgcolor: m.bg, border: `1px solid ${m.borda}`, borderRadius: '12px',
            }}>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: m.cor, letterSpacing: '0.6px', textTransform: 'uppercase', lineHeight: 1 }}>
                {m.label}
              </Typography>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 900, color: '#fff', mt: 0.3, lineHeight: 1, letterSpacing: '-0.5px' }}>
                {money(m.valor)}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Balanço previsto */}
        <Box sx={{
          mx: 1.5, mb: 1.5, px: 1.2, py: 0.7,
          bgcolor: 'rgba(255,255,255,0.06)', borderRadius: '10px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.69rem', fontWeight: 700 }}>
            Balanço previsto
          </Typography>
          <Typography sx={{
            fontWeight: 900, fontSize: '0.85rem',
            color: saldoPrevisto >= 0 ? '#4ADE80' : '#FB7185',
          }}>
            {money(saldoPrevisto)}
          </Typography>
        </Box>
      </Box>

      {/* ── RAZÃO FINANCEIRO ─────────────────────────────────────────────── */}
      <Box sx={{ mb: 1.2 }}>
        <Typography sx={{ fontWeight: 900, fontSize: '0.95rem', color: 'text.primary' }}>
          Razão financeiro
        </Typography>
        <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', mt: 0.2 }}>
          Entradas, compras, pagamentos de acordos e lançamentos manuais em um só fluxo.
        </Typography>
      </Box>
      {/* Filtro do Razão por origem */}
      <Box sx={{ display: 'flex', gap: 0.7, overflowX: 'auto', pb: 0.5, mb: 1.6, '&::-webkit-scrollbar': { display: 'none' } }}>
        {[
          ['todas', 'Tudo'], ['manual', '✍️ Manual'], ['lista_compras', '🛒 Compras'],
          ['acordo', '🤝 Acordos'], ['renda', '💰 Renda'],
        ].map(([id, label]) => (
          <Chip key={id} label={label} onClick={() => setFiltroOrigem(id)}
            variant={filtroOrigem === id ? 'filled' : 'outlined'}
            sx={{ flexShrink: 0, fontWeight: 800, fontSize: '0.68rem',
              bgcolor: filtroOrigem === id ? 'rgba(123,44,191,0.12)' : 'transparent',
              color: filtroOrigem === id ? 'primary.main' : 'text.secondary',
              borderColor: filtroOrigem === id ? 'primary.main' : 'divider' }} />
        ))}
      </Box>

      <Secao
        titulo="Pendentes"
        cor="#FB7185"
        itens={abertos}
        setRoute={setRoute}
        onPago={pedirConfirmacaoPagamento}
        onEdit={editarLancamento}
        onDelete={pedirExclusao}
      />
      <Secao
        titulo="Liquidados"
        cor="#4ADE80"
        itens={pagos}
        setRoute={setRoute}
        onPago={pedirConfirmacaoPagamento}
        onEdit={editarLancamento}
        onDelete={pedirExclusao}
      />

      {abertos.length === 0 && pagos.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography sx={{ fontSize: '3rem', mb: 1 }}>🎉</Typography>
          <Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1rem' }}>
            Nenhum lançamento este mês
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', mt: 0.5 }}>
            Use o botão + para adicionar gastos ou entradas
          </Typography>
        </Box>
      )}

      {/* ── MODAL CONFIRMAR PAGAMENTO ───────────────────────────────────── */}
      <Dialog open={modalConfirmPag.open}
        onClose={() => setModalConfirmPag({ open: false, item: null })}
        fullWidth maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ fontWeight: 800, textAlign: 'center', pb: 0.5 }}>
          ✅ Confirmar Pagamento
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pt: 1.5 }}>
          {modalConfirmPag.item && (
            <>
              <Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1rem', mb: 0.5 }}>
                {modalConfirmPag.item.nome}
              </Typography>
              <Typography sx={{
                fontWeight: 900, fontSize: '1.5rem', mb: 1,
                background: 'linear-gradient(135deg, #10B981, #06D6A0)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                {money(modalConfirmPag.item.valor || 0)}
              </Typography>
              {modalConfirmPag.item.parcelaText && (
                <Chip label={`Parcela ${modalConfirmPag.item.parcelaText}`} size="small"
                  sx={{ bgcolor: 'rgba(123,44,191,0.09)', color: '#7B2CBF', fontWeight: 800, mb: 1 }} />
              )}
              <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                Deseja marcar como pago?
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
          <Button onClick={() => setModalConfirmPag({ open: false, item: null })} color="inherit" sx={{ borderRadius: '12px' }}>
            Cancelar
          </Button>
          <Button variant="contained" color="success"
            onClick={() => executarTogglePagamento(modalConfirmPag.item)}
            sx={{ borderRadius: '12px', fontWeight: 800 }}>
            Confirmar ✓
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── MODAL APAGAR ───────────────────────────────────────────────── */}
      <Dialog open={modalDelete.open}
        onClose={() => setModalDelete({ open: false, id: null, nome: '', tipo: 'gasto' })}
        fullWidth maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ fontWeight: 800, color: 'error.main' }}>
          ⚠️ Remover {modalDelete.tipo === 'acordo' ? 'acordo' : 'registro'}
        </DialogTitle>
        <DialogContent>
          {modalDelete.tipo === 'acordo' && (
            <Box sx={{ mb: 1.5, p: 1.2, bgcolor: 'rgba(245,158,11,0.08)', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.25)' }}>
              <Typography sx={{ fontSize: '0.82rem', color: 'warning.main', fontWeight: 600 }}>
                ⚠️ Isso removerá o acordo e todo o histórico de pagamentos permanentemente.
              </Typography>
            </Box>
          )}
          <Typography sx={{ color: 'text.secondary', mb: 0.5, fontSize: '0.88rem' }}>
            Deseja remover permanentemente:
          </Typography>
          <Typography sx={{ fontWeight: 800, color: 'text.primary' }}>{modalDelete.nome}</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
          <Button onClick={() => setModalDelete({ open: false, id: null, nome: '', tipo: 'gasto' })} color="inherit" sx={{ borderRadius: '12px' }}>
            Cancelar
          </Button>
          <Button onClick={executarExclusao} variant="contained" color="error" sx={{ borderRadius: '12px', fontWeight: 800 }}>
            Remover
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Gastos;
