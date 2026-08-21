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
import TextField    from '@mui/material/TextField';
import Snackbar   from '@mui/material/Snackbar';
import Alert      from '@mui/material/Alert';
import Chip       from '@mui/material/Chip';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import HandshakeRoundedIcon from '@mui/icons-material/HandshakeRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import CategoryIcon from '../ui/categoryIcons';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';

import FinanceiroUtils  from '../utils/financeiro';
import FinanceiroService from '../services/FinanceiroService';
import { parseMoedaInput, formatMoedaInput, propsInputMoeda } from '../utils/moedaInput';

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
// Card de item individual — leitura em três zonas: origem, contexto, valor/ação.
// ─────────────────────────────────────────────────────────────────────────────
const ORIGENS = {
  manual: { label: 'Manual', Icon: EditNoteRoundedIcon, color: '#7B2CBF' },
  lista_compras: { label: 'Compras', Icon: ShoppingCartRoundedIcon, color: '#8C48C8' },
  acordo: { label: 'Acordo', Icon: HandshakeRoundedIcon, color: '#7B2CBF' },
  renda: { label: 'Renda', Icon: SavingsRoundedIcon, color: '#119C72' },
};

const ActionButton = ({ label, onClick, color = '#7B2CBF', bg = 'rgba(123,44,191,.07)', children }) => (
  <Box role="button" tabIndex={0} aria-label={label} onClick={onClick} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick()} sx={{ width: 38, height: 38, borderRadius: '11px', bgcolor: bg, color, display: 'grid', placeItems: 'center', cursor: 'pointer', border: `1px solid ${color}14`, transition: 'transform .14s ease, background-color .14s ease', '&:active': { transform: 'scale(.92)' } }}>{children}</Box>
);

const ItemCard = ({ item, onPago, onEdit, onDelete, setRoute }) => {
  const isAcordo = item.tipo === 'acordo' || item.origem === 'acordo';
  const isVirtual = item.tipo === 'virtual';
  const isMovimento = item.tipo === 'movimentacao';
  const isLista = item.origem === 'lista_compras';
  const isEntrada = item.operacao === 'entrada';
  const isRendaVirtual = isVirtual && item.origem === 'renda';
  const isRendaConfiguradaRecebida = isMovimento && item.origem === 'renda' && !item.entidadeId;
  const cor = isEntrada ? '#119C72' : '#E54862';
  const origemMeta = ORIGENS[item.origem] || ORIGENS.manual;
  const OrigemIcon = origemMeta.Icon;
  const contexto = isRendaVirtual
    ? `Previsto dia ${item.dia || '—'} · aguardando confirmação`
    : isVirtual
      ? 'Saldo acumulado'
      : isMovimento
        ? `${isEntrada ? 'Recebido' : 'Pago'} dia ${item.dia || '—'} · ${item.categoria || 'Geral'}${item.competencia ? ` · Comp. ${item.competencia}` : ''}`
        : `Dia ${item.dia || '—'} · ${item.categoria || 'Geral'}`;

  return (
    <Box sx={{ p: 1.05, mb: .75, bgcolor: 'background.paper', border: '1px solid rgba(72,45,91,.08)', borderRadius: '15px', boxShadow: '0 4px 15px rgba(45,11,94,.035)', opacity: item.isPago && !isVirtual ? .78 : 1, position: 'relative', overflow: 'hidden', transition: 'all .16s ease' }}>
      <Box sx={{ position: 'absolute', left: 0, top: 11, bottom: 11, width: 3, borderRadius: '0 3px 3px 0', bgcolor: item.isPago ? 'rgba(123,44,191,.14)' : cor }} />
      <Box sx={{ display: 'grid', gridTemplateColumns: '38px minmax(0,1fr) auto', gap: .8, alignItems: 'center' }}>
        <Box sx={{ width: 38, height: 38, borderRadius: '11px', bgcolor: isEntrada ? 'rgba(17,156,114,.07)' : 'rgba(123,44,191,.055)', display: 'grid', placeItems: 'center' }}><CategoryIcon categoria={item.categoria || (isAcordo ? 'Acordos/Dívidas' : 'Outros')} size={19} color={isEntrada ? '#119C72' : undefined} /></Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 900, fontSize: '.82rem', lineHeight: 1.18, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: item.isPago && !isVirtual ? 'line-through' : 'none' }}>{item.nome}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: .45, mt: .3, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: .25, px: .5, py: .16, borderRadius: 99, bgcolor: `${origemMeta.color}0B`, color: origemMeta.color, flexShrink: 0 }}><OrigemIcon sx={{ fontSize: 12 }} /><Typography sx={{ fontSize: '.58rem', fontWeight: 900 }}>{origemMeta.label}</Typography></Box>
            <Typography sx={{ fontSize: '.63rem', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {contexto}{item.parcelaText ? ` · ${item.parcelaText}` : ''}
            </Typography>
          </Box>
        </Box>
        <Typography sx={{ fontWeight: 900, fontSize: '.9rem', color: cor, lineHeight: 1, whiteSpace: 'nowrap', textDecoration: item.isPago && !isVirtual ? 'line-through' : 'none' }}>{isEntrada ? '+' : '-'}{money(item.valor)}</Typography>
      </Box>

      {(!isVirtual || isRendaVirtual) && (
        <Box sx={{ mt: .72, pt: .65, borderTop: '1px solid rgba(72,45,91,.055)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: .45 }}>
          {isAcordo ? <Button size="small" variant="text" onClick={() => setRoute('acordos')} startIcon={<OpenInNewRoundedIcon sx={{ fontSize: '16px !important' }} />} sx={{ minHeight: 36, px: .75, fontSize: '.66rem' }}>Abrir acordo</Button>
          : isLista ? <Button size="small" variant="text" onClick={() => setRoute('lista')} startIcon={<ShoppingCartRoundedIcon sx={{ fontSize: '16px !important' }} />} sx={{ minHeight: 36, px: .75, fontSize: '.66rem' }}>Abrir lista</Button>
          : <>
            {isRendaVirtual ? (
              <Button size="small" variant="contained" color="success" onClick={() => onPago(item)}
                startIcon={<CheckRoundedIcon sx={{ fontSize: '17px !important' }} />}
                sx={{ minHeight: 38, px: 1.15, borderRadius: '11px', fontSize: '.68rem', fontWeight: 900, textTransform: 'none' }}>
                Receber agora
              </Button>
            ) : (
              <ActionButton
                label={item.isPago ? `${isEntrada ? 'Desfazer recebimento' : 'Desfazer pagamento'} de ${item.nome}` : `${isEntrada ? 'Receber' : 'Marcar'} ${item.nome}${isEntrada ? ' agora' : ' como pago'}`}
                onClick={() => onPago(item)}
                color={item.isPago ? '#7B2CBF' : '#119C72'}
                bg={item.isPago ? 'rgba(123,44,191,.06)' : 'rgba(17,156,114,.09)'}
              >{item.isPago ? <UndoRoundedIcon sx={{ fontSize: 18 }} /> : <CheckRoundedIcon sx={{ fontSize: 19 }} />}</ActionButton>
            )}
            <ActionButton label={`Editar ${item.nome}`} onClick={() => onEdit(item)}><EditRoundedIcon sx={{ fontSize: 17 }} /></ActionButton>
            <ActionButton
              label={`Excluir ${item.nome}`}
              onClick={() => onDelete(
                isRendaVirtual ? 'renda_config' : (isRendaConfiguradaRecebida ? (item.movimentacaoId || item.id) : (isMovimento ? item.entidadeId : item.id)),
                item.nome,
                isRendaVirtual ? 'renda_config' : (isRendaConfiguradaRecebida ? 'movimentacao' : 'gasto'),
              )}
              color="#E54862" bg="rgba(229,72,98,.06)"
            ><DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} /></ActionButton>
          </>}
        </Box>
      )}
    </Box>
  );
};

const Secao = ({ titulo, cor, itens, setRoute, onPago, onEdit, onDelete }) => {
  const [aberta, setAberta] = useState(true);
  if (itens.length === 0) return null;
  return (
    <Box sx={{ mb: 1.25 }}>
      <Box role="button" tabIndex={0} aria-expanded={aberta} onClick={() => setAberta(v => !v)} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setAberta(v => !v)} sx={{ display: 'flex', alignItems: 'center', gap: .65, mb: .65, px: .7, py: .55, borderRadius: '11px', bgcolor: `${cor}08`, cursor: 'pointer', userSelect: 'none' }}>
        <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: cor }} />
        <Typography sx={{ flex: 1, fontSize: '.67rem', fontWeight: 900, color: 'text.primary', textTransform: 'uppercase', letterSpacing: '.65px' }}>{titulo}</Typography>
        <Box sx={{ minWidth: 23, height: 23, px: .45, borderRadius: 99, bgcolor: `${cor}12`, color: cor, display: 'grid', placeItems: 'center', fontSize: '.62rem', fontWeight: 900 }}>{itens.length}</Box>
        {aberta ? <KeyboardArrowUpRoundedIcon sx={{ color: cor, fontSize: 19 }} /> : <KeyboardArrowDownRoundedIcon sx={{ color: cor, fontSize: 19 }} />}
      </Box>
      {aberta && itens.map(item => <ItemCard key={`${item.tipo}_${item.id}`} item={item} setRoute={setRoute} onPago={onPago} onEdit={onEdit} onDelete={onDelete} />)}
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
  const [rendaRecebidaNaCompetencia, setRendaRecebidaNaCompetencia] = useState(false);
  const [mesOffset,        setMesOffset]         = useState(0);
  const [toast,            setToast]             = useState({ open: false, texto: '', sev: 'success' });
  const [modalDelete,      setModalDelete]       = useState({ open: false, id: null, nome: '', tipo: 'gasto' });
  const [modalConfirmPag,  setModalConfirmPag]   = useState({ open: false, item: null });
  const [modalRendaConfig,  setModalRendaConfig]  = useState({ open: false, valor: 0, dia: '' });
  const [modalRecebimento,  setModalRecebimento]  = useState({ open: false, modo: 'receber', id: null, valor: 0, data: '', competencia: null });
  const [filtroOrigem,     setFiltroOrigem]      = useState('todas');

  const carregarTudo = async () => {
    const [{ gastos, movimentacoes: movs, acordos, sobraAnterior: sobra, rendaRecebidaNaCompetencia: rendaRecebida }, renda, dia] = await Promise.all([
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
    setRendaRecebidaNaCompetencia(Boolean(rendaRecebida));
  };

  useEffect(() => { carregarTudo(); }, [mesOffset]);

  const abrirRecebimentoRenda = (item, modo = 'receber') => {
    const competencia = item.competencia || FinanceiroUtils.dateParaMesAno(FinanceiroUtils.mesComOffset(mesOffset));
    const data = item.data || FinanceiroUtils.dateParaISOInput(new Date());
    setModalRecebimento({
      open: true,
      modo,
      id: modo === 'editar' ? (item.movimentacaoId || item.id) : null,
      valor: Number(item.valor || rendaMensal || 0),
      data,
      competencia,
    });
  };

  const pedirConfirmacaoPagamento = (item) => {
    if (item.tipo === 'virtual' && item.origem === 'renda') {
      abrirRecebimentoRenda(item, 'receber');
      return;
    }
    if (!item.isPago) setModalConfirmPag({ open: true, item });
    else executarTogglePagamento(item);
  };

  const executarTogglePagamento = async (item) => {
    setModalConfirmPag({ open: false, item: null });
    try {
      const mesAnoTarget = FinanceiroUtils.dateParaMesAno(FinanceiroUtils.mesComOffset(mesOffset));
      await FinanceiroService.registrarPagamentoGasto(item, mesAnoTarget);
      setToast({ open: true, texto: item?.operacao === 'entrada' ? '✅ Recebimento desfeito.' : '✅ Atualizado!', sev: 'success' });
      carregarTudo();
    } catch {
      setToast({ open: true, texto: '❌ Erro ao atualizar.', sev: 'error' });
    }
  };

  const salvarRecebimentoRenda = async () => {
    try {
      if (Number(modalRecebimento.valor || 0) <= 0) {
        setToast({ open: true, texto: '⚠️ Informe um valor maior que zero.', sev: 'warning' });
        return;
      }
      if (modalRecebimento.modo === 'editar') {
        await FinanceiroService.atualizarRecebimentoRenda(modalRecebimento.id, {
          valor: modalRecebimento.valor,
          data: modalRecebimento.data,
        });
        setToast({ open: true, texto: '✅ Recebimento atualizado.', sev: 'success' });
      } else {
        await FinanceiroService.registrarRecebimentoRenda(
          modalRecebimento.competencia,
          modalRecebimento.valor,
          modalRecebimento.data,
        );
        setToast({ open: true, texto: '✅ Renda recebida e lançada nas contas.', sev: 'success' });
      }
      setModalRecebimento({ open: false, modo: 'receber', id: null, valor: 0, data: '', competencia: null });
      carregarTudo();
    } catch (e) {
      console.error(e);
      setToast({ open: true, texto: '❌ Não foi possível salvar o recebimento.', sev: 'error' });
    }
  };

  const abrirEdicaoRenda = () => setModalRendaConfig({
    open: true,
    valor: Number(rendaMensal || 0),
    dia: diaPagamento ? String(diaPagamento) : '',
  });

  const salvarConfigRenda = async () => {
    const valor = Number(modalRendaConfig.valor || 0);
    const dia = parseInt(modalRendaConfig.dia, 10);
    if (valor <= 0 || dia < 1 || dia > 31) {
      setToast({ open: true, texto: '⚠️ Informe valor e dia de recebimento válidos.', sev: 'warning' });
      return;
    }
    try {
      await Promise.all([FinanceiroService.setRenda(valor), FinanceiroService.setDiaPagamento(dia)]);
      setModalRendaConfig({ open: false, valor: 0, dia: '' });
      setToast({ open: true, texto: '✅ Renda mensal atualizada.', sev: 'success' });
      carregarTudo();
    } catch {
      setToast({ open: true, texto: '❌ Não foi possível atualizar a renda.', sev: 'error' });
    }
  };

  const editarLancamento = async (item) => {
    if (item.tipo === 'virtual' && item.origem === 'renda') {
      abrirEdicaoRenda();
      return;
    }
    if (item.tipo === 'movimentacao') {
      if (item.origem === 'renda' && !item.entidadeId) {
        abrirRecebimentoRenda(item, 'editar');
        return;
      }
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
    try {
      if (tipo === 'renda_config') {
        await FinanceiroService.removerRendaConfigurada();
      } else if (id) {
        if (tipo === 'acordo') await FinanceiroService.apagarAcordo(id);
        else if (tipo === 'movimentacao') await FinanceiroService.apagarMovimentacao(id);
        else await FinanceiroService.apagarGasto(id);
      }
      carregarTudo();
      setToast({
        open: true,
        texto: tipo === 'renda_config' ? '🗑️ Renda mensal removida. Os próximos meses ficaram zerados.' : '🗑️ Removido.',
        sev: 'info',
      });
    } catch {
      setToast({ open: true, texto: '❌ Não foi possível remover.', sev: 'error' });
    }
    setModalDelete({ open: false, id: null, nome: '', tipo: 'gasto' });
  };

  const { abertos, pagos, resumo } = useMemo(() => {
    const mesAlvo      = FinanceiroUtils.mesComOffset(mesOffset);
    const mesAnoTarget = FinanceiroUtils.dateParaMesAno(mesAlvo);
    let res = { ent: 0, sai: 0, entPaga: 0, saiPaga: 0 };
    let listAbertos = [], listPagos = [];

    const jaTemSalario = rendaRecebidaNaCompetencia || movimentacoes.some(m =>
      m.tipoOperacao === 'entrada' && (m.origem === 'renda' || FinanceiroUtils.ehEntradaRendaBase(m))
    ) || gastosRegistrados.some(g =>
      g.tipoOperacao === 'entrada' && FinanceiroUtils.ehEntradaRendaBase(g)
    );

    if (rendaMensal > 0 && diaPagamento && !jaTemSalario) {
      const dataPagamento = FinanceiroUtils.dataVencimentoNoMes(diaPagamento, mesAlvo);
      const salarioVirtual = {
        id: 'salario_virtual', nome: '💼 Salário', valor: rendaMensal,
        tipoOperacao: 'entrada', operacao: 'entrada', isPago: false, dia: dataPagamento.getDate(),
        categoria: 'Salário', tipo: 'virtual', origem: 'renda', competencia: mesAnoTarget,
      };
      // A renda configurada é previsão até o usuário confirmar o recebimento.
      // Não existe mais baixa visual automática somente porque o dia chegou.
      res.ent += rendaMensal;
      listAbertos.push(salarioVirtual);
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
  }, [gastosRegistrados, movimentacoes, acordosMensais, mesOffset, sobraAnterior, rendaMensal, diaPagamento, rendaRecebidaNaCompetencia, filtroOrigem]);

  const saldoReal   = resumo.entPaga - resumo.saiPaga;
  const nomeMes     = FinanceiroUtils.nomeMesOffset(mesOffset);
  const saldoPrevisto = resumo.ent - resumo.sai;

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', px: { xs: 1.25, sm: 2 }, pt: { xs: 1.05, sm: 1.6 }, pb: .7 }}>

      <Snackbar open={toast.open} autoHideDuration={3000}
        onClose={() => setToast(t => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={toast.sev} variant="filled" sx={{ borderRadius: '12px', fontWeight: 700 }}>
          {toast.texto}
        </Alert>
      </Snackbar>

      {/* ── HEADER MÊS ─────────────────────────────────────────────────── */}
      <Box sx={{
        borderRadius: '19px', overflow: 'hidden', mb: 1.35,
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.45, pt: 1.25, pb: .9 }}>
          <Box role="button" tabIndex={0} aria-label="Mês anterior" onClick={() => setMesOffset(v => v - 1)} onKeyDown={e => e.key === 'Enter' && setMesOffset(v => v - 1)} sx={{
            width: 38, height: 38, borderRadius: '11px',
            bgcolor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fff', '&:active': { transform: 'scale(0.88)' },
          }}>
            <IcoChevron left />
          </Box>
          <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '1rem', letterSpacing: '-0.2px' }}>
            {nomeMes}
          </Typography>
          <Box role="button" tabIndex={0} aria-label="Próximo mês" onClick={() => setMesOffset(v => v + 1)} onKeyDown={e => e.key === 'Enter' && setMesOffset(v => v + 1)} sx={{
            width: 38, height: 38, borderRadius: '11px',
            bgcolor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fff', '&:active': { transform: 'scale(0.88)' },
          }}>
            <IcoChevron />
          </Box>
        </Box>

        {/* Métricas em 3 colunas */}
        <Box sx={{ display: 'flex', px: 1.15, pb: 1.1, gap: .6 }}>
          {[
            { label: 'ENTRADAS', valor: resumo.ent, cor: '#4ADE80', bg: 'rgba(74,222,128,0.12)', borda: 'rgba(74,222,128,0.3)' },
            { label: 'SAÍDAS',   valor: resumo.sai, cor: '#FB7185', bg: 'rgba(251,113,133,0.12)', borda: 'rgba(251,113,133,0.3)' },
            { label: 'FLUXO REAL', valor: saldoReal, cor: saldoReal >= 0 ? '#A78BFA' : '#FB7185', bg: 'rgba(167,139,250,0.12)', borda: 'rgba(167,139,250,0.3)' },
          ].map(m => (
            <Box key={m.label} sx={{
              flex: 1, textAlign: 'center', py: .75, px: .35,
              bgcolor: m.bg, border: `1px solid ${m.borda}`, borderRadius: '12px',
            }}>
              <Typography sx={{ fontSize: '0.64rem', fontWeight: 800, color: m.cor, letterSpacing: '0.6px', textTransform: 'uppercase', lineHeight: 1 }}>
                {m.label}
              </Typography>
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 900, color: '#fff', mt: 0.3, lineHeight: 1, letterSpacing: '-0.5px' }}>
                {money(m.valor)}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Balanço previsto */}
        <Box sx={{
          mx: 1.15, mb: 1.15, px: 1, py: .58,
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
      <Box sx={{ mb: .8 }}>
        <Typography sx={{ fontWeight: 900, fontSize: '.92rem', color: 'text.primary' }}>
          Razão financeiro
        </Typography>
        <Typography sx={{ fontSize: '.68rem', color: 'text.secondary', mt: .15 }}>
          Entradas, compras, pagamentos de acordos e lançamentos manuais em um só fluxo.
        </Typography>
      </Box>
      {/* Filtro do Razão por origem */}
      <Box sx={{ display: 'flex', gap: .55, overflowX: 'auto', pb: .35, mb: 1.05, '&::-webkit-scrollbar': { display: 'none' } }}>
        {[
          ['todas', 'Tudo'], ['manual', 'Manual'], ['lista_compras', 'Compras'],
          ['acordo', 'Acordos'], ['renda', 'Renda'],
        ].map(([id, label]) => (
          <Chip key={id} label={label} onClick={() => setFiltroOrigem(id)}
            variant={filtroOrigem === id ? 'filled' : 'outlined'}
            sx={{ flexShrink: 0, fontWeight: 800, fontSize: '0.64rem',
              bgcolor: filtroOrigem === id ? 'primary.main' : '#fff',
              color: filtroOrigem === id ? '#fff' : 'text.secondary',
              borderColor: filtroOrigem === id ? 'primary.main' : 'divider',
              boxShadow: filtroOrigem === id ? '0 4px 12px rgba(123,44,191,.16)' : 'none' }} />
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
        <Box sx={{ textAlign: 'center', py: 2.8, px: 1.5, bgcolor: 'background.paper', borderRadius: '17px', border: '1px dashed rgba(123,44,191,.18)' }}>
          <InboxRoundedIcon sx={{ fontSize: '2rem', color: 'primary.main', opacity: .68, mb: .4 }} />
          <Typography sx={{ fontWeight: 850, color: 'text.primary', fontSize: '.95rem' }}>
            Nenhum lançamento este mês
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', mt: 0.5 }}>
            Use o botão + para adicionar gastos ou entradas
          </Typography>
        </Box>
      )}

      {/* ── MODAL RECEBER / EDITAR RENDA CONFIGURADA ─────────────────────── */}
      <Dialog open={modalRecebimento.open}
        onClose={() => setModalRecebimento({ open: false, modo: 'receber', id: null, valor: 0, data: '', competencia: null })}
        fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ fontWeight: 900, pb: .6, display: 'flex', alignItems: 'center', gap: .7 }}>
          <SavingsRoundedIcon color="success" /> {modalRecebimento.modo === 'editar' ? 'Editar recebimento' : 'Receber renda agora'}
        </DialogTitle>
        <DialogContent sx={{ pt: 1.2 }}>
          <Typography sx={{ fontSize: '.78rem', color: 'text.secondary', mb: 1.5, lineHeight: 1.45 }}>
            {modalRecebimento.modo === 'editar'
              ? 'Ajuste o valor realmente recebido ou a data em que o dinheiro entrou.'
              : `Confirme o valor que entrou. Você pode receber antes do dia ${diaPagamento || 'configurado'} e o lançamento será registrado na data escolhida.`}
          </Typography>
          <TextField fullWidth label="Valor recebido"
            value={formatMoedaInput(modalRecebimento.valor, { comSimbolo: true })}
            onChange={e => setModalRecebimento(v => ({ ...v, valor: parseMoedaInput(e.target.value) }))}
            inputProps={propsInputMoeda} sx={{ mb: 1.4 }} />
          <TextField fullWidth type="date" label="Data do recebimento" value={modalRecebimento.data}
            onChange={e => setModalRecebimento(v => ({ ...v, data: e.target.value }))}
            InputLabelProps={{ shrink: true }} />
          {modalRecebimento.competencia && (
            <Typography sx={{ mt: 1, fontSize: '.68rem', color: 'text.secondary' }}>
              Competência: {modalRecebimento.competencia}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
          <Button onClick={() => setModalRecebimento({ open: false, modo: 'receber', id: null, valor: 0, data: '', competencia: null })} color="inherit" sx={{ borderRadius: '12px' }}>Cancelar</Button>
          <Button variant="contained" color="success" onClick={salvarRecebimentoRenda} sx={{ borderRadius: '12px', fontWeight: 850 }}>
            {modalRecebimento.modo === 'editar' ? 'Salvar' : 'Confirmar recebimento'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── MODAL EDITAR RENDA MENSAL ─────────────────────────────────────── */}
      <Dialog open={modalRendaConfig.open}
        onClose={() => setModalRendaConfig({ open: false, valor: 0, dia: '' })}
        fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ fontWeight: 900, pb: .6 }}>Editar renda mensal</DialogTitle>
        <DialogContent sx={{ pt: 1.2 }}>
          <Typography sx={{ fontSize: '.78rem', color: 'text.secondary', mb: 1.5, lineHeight: 1.45 }}>
            Esta é a previsão criada na configuração inicial. A alteração vale para os próximos recebimentos; lançamentos já recebidos continuam no histórico.
          </Typography>
          <TextField fullWidth label="Renda mensal"
            value={formatMoedaInput(modalRendaConfig.valor, { comSimbolo: true })}
            onChange={e => setModalRendaConfig(v => ({ ...v, valor: parseMoedaInput(e.target.value) }))}
            inputProps={propsInputMoeda} sx={{ mb: 1.4 }} />
          <TextField fullWidth label="Dia do recebimento (1–31)" value={modalRendaConfig.dia}
            onChange={e => {
              const valor = e.target.value.replace(/\D/g, '');
              if (valor === '' || (parseInt(valor, 10) >= 1 && parseInt(valor, 10) <= 31))
                setModalRendaConfig(v => ({ ...v, dia: valor }));
            }} inputProps={{ inputMode: 'numeric', maxLength: 2 }} />
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
          <Button onClick={() => setModalRendaConfig({ open: false, valor: 0, dia: '' })} color="inherit" sx={{ borderRadius: '12px' }}>Cancelar</Button>
          <Button variant="contained" onClick={salvarConfigRenda} sx={{ borderRadius: '12px', fontWeight: 850 }}>Salvar</Button>
        </DialogActions>
      </Dialog>

      {/* ── MODAL CONFIRMAR PAGAMENTO ───────────────────────────────────── */}
      <Dialog open={modalConfirmPag.open}
        onClose={() => setModalConfirmPag({ open: false, item: null })}
        fullWidth maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ fontWeight: 900, pb: .5, display: 'flex', alignItems: 'center', gap: .7 }}><PaymentsRoundedIcon color="success" /> {modalConfirmPag.item?.operacao === 'entrada' ? 'Confirmar recebimento' : 'Confirmar pagamento'}</DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pt: 1.5 }}>
          {modalConfirmPag.item && (
            <>
              <Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1rem', mb: 0.5 }}>
                {modalConfirmPag.item.nome}
              </Typography>
              <Typography sx={{
                fontWeight: 900, fontSize: '1.5rem', mb: 1,
                color: 'success.main',
              }}>
                {money(modalConfirmPag.item.valor || 0)}
              </Typography>
              {modalConfirmPag.item.parcelaText && (
                <Chip label={`Parcela ${modalConfirmPag.item.parcelaText}`} size="small"
                  sx={{ bgcolor: 'rgba(123,44,191,0.09)', color: '#7B2CBF', fontWeight: 800, mb: 1 }} />
              )}
              <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                {modalConfirmPag.item.operacao === 'entrada' ? 'Deseja marcar como recebido?' : 'Deseja marcar como pago?'}
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
          ⚠️ Remover {modalDelete.tipo === 'acordo' ? 'acordo' : modalDelete.tipo === 'renda_config' ? 'renda mensal' : modalDelete.tipo === 'movimentacao' ? 'recebimento' : 'registro'}
        </DialogTitle>
        <DialogContent>
          {modalDelete.tipo === 'acordo' && (
            <Box sx={{ mb: 1.5, p: 1.2, bgcolor: 'rgba(245,158,11,0.08)', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.25)' }}>
              <Typography sx={{ fontSize: '0.82rem', color: 'warning.main', fontWeight: 600 }}>
                ⚠️ Isso removerá o acordo e todo o histórico de pagamentos permanentemente.
              </Typography>
            </Box>
          )}
          {modalDelete.tipo === 'renda_config' && (
            <Box sx={{ mb: 1.5, p: 1.2, bgcolor: 'rgba(245,158,11,0.08)', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.25)' }}>
              <Typography sx={{ fontSize: '0.82rem', color: 'warning.main', fontWeight: 600 }}>
                Isso zera a renda mensal configurada e remove a previsão dos próximos meses. Recebimentos já registrados permanecem no histórico.
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
