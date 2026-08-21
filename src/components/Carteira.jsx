// ─────────────────────────────────────────────────────────────────────────────
// src/components/Carteira.jsx
// CLEAN CODE — Modal de pagamento movido para ModalPagamentoAcordo.jsx.
//              Lógica de pagamento delegada ao hook useAcordos.
// BUG FIX #3 — recebe valorRealPago do modal e passa para o hook.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import Box         from '@mui/material/Box';
import Typography  from '@mui/material/Typography';
import Card        from '@mui/material/Card';
import Button      from '@mui/material/Button';
import Chip        from '@mui/material/Chip';
import Grid        from '@mui/material/Grid';
import Dialog      from '@mui/material/Dialog';
import DialogTitle    from '@mui/material/DialogTitle';
import DialogContent  from '@mui/material/DialogContent';
import DialogActions  from '@mui/material/DialogActions';
import TextField   from '@mui/material/TextField';
import MenuItem    from '@mui/material/MenuItem';
import Divider     from '@mui/material/Divider';
import Snackbar    from '@mui/material/Snackbar';
import Collapse    from '@mui/material/Collapse';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import FastForwardRoundedIcon from '@mui/icons-material/FastForwardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';

import FinanceiroUtils   from '../utils/financeiro';
import { useAcordos }    from '../hooks/useAcordos';
import ModalPagamentoAcordo from './ModalPagamentoAcordo';
import confetti from 'canvas-confetti';

const money = (v) => FinanceiroUtils.money(v);

// ─────────────────────────────────────────────────────────────────────────────
const Carteira = ({ acordos, carregarDados, abrirEditar, abrirNovo }) => {
  const { registrarPagamento, estornarPagamento, excluir } = useAcordos();

  const [abaFiltro,   setAbaFiltro]   = useState('ativos');
  const [expandidos,  setExpandidos]  = useState({});
  const [mesOffset,   setMesOffset]   = useState(0);
  const [busca,       setBusca]       = useState('');
  const [ordenacao,   setOrdenacao]   = useState('vencimento');
  const [modalDelete, setModalDelete] = useState({ open: false, id: null });
  const [modalView,   setModalView]   = useState({ open: false, acordo: null });
  const [modalPagar,  setModalPagar]  = useState({ open: false, acordo: null });
  const [modalEstorno, setModalEstorno] = useState({ open: false, acordoId: null, pagamento: null });
  const [toast,       setToast]       = useState({ open: false, texto: '', bgcolor: 'success.main' });

  const nomeDoMes      = (offset) => FinanceiroUtils.nomeMesOffset(offset, true);
  const valorDevidoMes = (acordo, offset) =>
    FinanceiroUtils.valorDevidoNoMes(acordo, FinanceiroUtils.mesComOffset(offset));

  const totalNegociado    = acordos.filter(a => a.situacao === 'acordo').reduce((acc, i) => acc + (i.valorTotalReal || 0), 0);
  const totalVencido      = acordos.filter(a => a.situacao === 'vencida').reduce((acc, i) => acc + (i.valorNegociado || 0), 0);
  const totalMesCalculado = acordos.reduce((acc, a) => acc + valorDevidoMes(a, mesOffset), 0);

  const listaFiltrada = useMemo(() => {
    let filtrados = [];
    if (abaFiltro === 'ativos')   filtrados = acordos.filter(a => a.situacao !== 'vencida' && parseInt(a.parcelasPagas || 0) < parseInt(a.parcelas || 0));
    if (abaFiltro === 'vencidas') filtrados = acordos.filter(a => a.situacao === 'vencida');
    if (abaFiltro === 'quitados') filtrados = acordos.filter(a => a.situacao !== 'vencida' && parseInt(a.parcelasPagas || 0) >= parseInt(a.parcelas || 0));

    if (busca.trim()) {
      const q = busca.trim().toLowerCase();
      filtrados = filtrados.filter(a =>
        a.empresa?.toLowerCase().includes(q) ||
        a.categoria?.toLowerCase().includes(q) ||
        a.adm?.toLowerCase().includes(q)
      );
    }
    return filtrados.sort((a, b) => {
      if (ordenacao === 'valor') return (b.valorTotalReal || b.valorNegociado || 0) - (a.valorTotalReal || a.valorNegociado || 0);
      if (ordenacao === 'nome')  return a.empresa?.localeCompare(b.empresa);
      return (parseInt(a.vencimentoDia) || 31) - (parseInt(b.vencimentoDia) || 31);
    });
  }, [acordos, abaFiltro, busca, ordenacao]);

  const toggleExpandir  = (id) => setExpandidos(prev => ({ ...prev, [id]: !prev[id] }));
  const showToast       = (texto, bgcolor = 'success.main') =>
    setToast({ open: true, texto, bgcolor });

  // ── formatação / cálculos ──────────────────────────────────────────────────
  const calcularDataTermino = (acordo) => {
    const totais = parseInt(acordo.parcelas) || 0;
    if (!totais) return 'N/A';
    const data = FinanceiroUtils.dataVencimentoParcela(acordo, totais);
    return data ? FinanceiroUtils.formatarDataDate(data) : 'N/A';
  };

  const calcularTempoAberto = (dataInicio) => {
    if (!dataInicio) return 'Não informado';
    const inicio = new Date(dataInicio + 'T00:00:00');
    const hoje   = new Date();
    let anos  = hoje.getFullYear() - inicio.getFullYear();
    let meses = hoje.getMonth()    - inicio.getMonth();
    if (meses < 0) { anos -= 1; meses += 12; }
    if (anos <= 0 && meses <= 0) return 'Menos de 1 mês';
    const partes = [];
    if (anos  > 0) partes.push(`${anos} ano${anos > 1 ? 's' : ''}`);
    if (meses > 0) partes.push(`${meses} mês${meses > 1 ? 'es' : ''}`);
    return partes.join(' e ');
  };

  const calcularTempoAteAcordo = (dataDivida, dataAcordo) => {
    if (!dataDivida || !dataAcordo) return null;
    const inicio = new Date(dataDivida  + 'T00:00:00');
    const fim    = new Date(dataAcordo  + 'T00:00:00');
    if (fim < inicio) return 'Feito antes da data informada';
    let anos  = fim.getFullYear() - inicio.getFullYear();
    let meses = fim.getMonth()    - inicio.getMonth();
    if (meses < 0) { anos -= 1; meses += 12; }
    if (anos <= 0 && meses <= 0) return 'Negociada no mesmo mês';
    const partes = [];
    if (anos  > 0) partes.push(`${anos} ano${anos > 1 ? 's' : ''}`);
    if (meses > 0) partes.push(`${meses} mês${meses > 1 ? 'es' : ''}`);
    return partes.join(' e ');
  };

  const formatarData = (data) => {
    if (!data) return 'N/A';
    return data.split('-').reverse().join('/');
  };

  // ── handlers ──────────────────────────────────────────────────────────────
  const iniciarPagamento = (acordo) => {
    if (parseInt(acordo.parcelasPagas || 0) >= parseInt(acordo.parcelas || 0)) return;
    setModalPagar({ open: true, acordo });
  };

  /**
   * Chamado pelo ModalPagamentoAcordo.
   * valorRealPago = valor real por parcela (pode ser null → usa acordo.valorParcela).
   */
  const confirmarPagamento = async (acordo, qtd, data, valorRealPago) => {
    try {
      const quitou = await registrarPagamento(acordo, qtd, data, valorRealPago);
      if (quitou) confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
      setModalPagar({ open: false, acordo: null });
      carregarDados();
      showToast(`✅ ${qtd > 1 ? `${qtd} parcelas registradas` : 'Pagamento registrado'} com sucesso!`);
    } catch {
      showToast('❌ Erro ao salvar o pagamento.', 'error.main');
    }
  };

  const confirmarEstorno = async () => {
    const { acordoId, pagamento } = modalEstorno;
    if (!acordoId || !pagamento?.pagamentoId) return;
    try {
      await estornarPagamento(acordoId, pagamento.pagamentoId);
      setModalEstorno({ open: false, acordoId: null, pagamento: null });
      setModalView({ open: false, acordo: null });
      await carregarDados();
      showToast('↩️ Pagamento estornado. O Razão financeiro foi atualizado.', 'warning.main');
    } catch (e) {
      console.error(e);
      showToast('❌ Não foi possível estornar o pagamento.', 'error.main');
    }
  };

  const executarExclusao = async () => {
    if (modalDelete.id) {
      await excluir(modalDelete.id);
      carregarDados();
      showToast('🗑️ Registro excluído.', 'text.secondary');
    }
    setModalDelete({ open: false, id: null });
  };

  const copiarResumo = (acordo) => {
    let txt = `📄 *DOSSIÊ: ${acordo.empresa.toUpperCase()}*\n`;
    txt += `Situação: ${acordo.situacao === 'acordo' ? '🤝 Acordo' : '🔴 Vencida'}\n`;
    if (acordo.situacao === 'acordo') {
      txt += `Total: ${money(acordo.valorTotalReal)} | Falta: ${money((acordo.parcelas - acordo.parcelasPagas) * acordo.valorParcela)}\n`;
      txt += `Pagamento: ${acordo.parcelas}x ${money(acordo.valorParcela)} (${acordo.parcelasPagas} pagas)\n`;
      txt += `Término: ${calcularDataTermino(acordo)}\n`;
    } else {
      txt += `Dívida: ${money(acordo.valorNegociado)}\n`;
    }
    if (acordo.notas) txt += `\nNotas: ${acordo.notas}\n`;
    navigator.clipboard.writeText(txt)
      .then(() => showToast('📋 Dossiê copiado!'))
      .catch(() => showToast('❌ Erro ao copiar.', 'error.main'));
  };

  const btnRadar = {
    minWidth: 0, p: 0, border: 'none !important', boxShadow: 'none !important',
    bgcolor: 'transparent !important', fontSize: '1.2rem',
    '&:active': { transform: 'scale(0.8)' },
  };

  return (
    <Box>
      {/* ── Modal Excluir ── */}
      <Dialog open={modalDelete.open} onClose={() => setModalDelete({ open: false, id: null })}>
        <DialogTitle sx={{ color: 'error.main', fontWeight: 900, display: 'flex', alignItems: 'center', gap: .7 }}><WarningAmberRoundedIcon /> Excluir registro</DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            Tem certeza de que deseja excluir permanentemente este registro?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'center', gap: 2 }}>
          <Button variant="contained" color="info" onClick={() => setModalDelete({ open: false, id: null })} sx={{ fontWeight: 900 }}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={executarExclusao} sx={{ fontWeight: 900 }}>Sim, Apagar</Button>
        </DialogActions>
      </Dialog>

      {/* ── Modal Pagamento (componente isolado) ── */}
      <ModalPagamentoAcordo
        open={modalPagar.open}
        acordo={modalPagar.acordo}
        onClose={() => setModalPagar({ open: false, acordo: null })}
        onConfirmar={confirmarPagamento}
      />

      {/* ── Modal Dossiê ── */}
      <Dialog open={modalView.open} onClose={() => setModalView({ open: false, acordo: null })}
        PaperProps={{ sx: { border: '2px solid', borderColor: 'primary.main', minWidth: { xs: '95%', sm: '500px' }, borderRadius: '20px' } }}>
        {modalView.acordo && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: .65 }}><DescriptionRoundedIcon color="primary" /><Typography sx={{ fontWeight: 900, fontSize: '.92rem', color: 'text.primary' }}>Dossiê</Typography></Box>
              <Button variant="outlined" startIcon={<ContentCopyRoundedIcon />} sx={{ fontWeight: 850, minWidth: 'auto', px: 1 }} onClick={() => copiarResumo(modalView.acordo)}>Copiar</Button>
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography sx={{ fontWeight: 900, color: 'text.primary', fontSize: '1.8rem', lineHeight: 1, textTransform: 'uppercase' }}>
                  {modalView.acordo.empresa}
                </Typography>
                <Typography sx={{ fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase' }}>
                  {modalView.acordo.categoria}{modalView.acordo.adm ? ` • ${modalView.acordo.adm}` : ''}
                </Typography>
              </Box>
              <Box sx={{ bgcolor: 'rgba(123,44,191,0.06)', p: 1, borderRadius: '8px', mb: 2, textAlign: 'center' }}>
                <Typography fontWeight={900}
                  color={modalView.acordo.situacao === 'acordo' ? 'success.main' : modalView.acordo.situacao === 'quitado' ? 'primary.main' : 'error.main'}>
                  {modalView.acordo.situacao === 'acordo' ? '🤝 Acordo' : modalView.acordo.situacao === 'quitado' ? '✅ Quitado' : '🔴 Vencida'}
                </Typography>
              </Box>

              {modalView.acordo.situacao !== 'vencida' && (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'text.secondary', mb: 0.5, textTransform: 'uppercase' }}>Progresso</Typography>
                  <Card variant="outlined" sx={{ p: 1.5, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Pagamento de <b>{modalView.acordo.parcelas}x {money(modalView.acordo.valorParcela)}</b></Typography>
                      <Typography variant="body2" fontWeight={900} color="primary.main">{modalView.acordo.parcelasPagas} Pagas</Typography>
                    </Box>
                    <Grid container spacing={1} sx={{ mt: 1, borderTop: '1px dashed', borderColor: 'divider', pt: 1 }}>
                      <Grid item xs={6}><Typography variant="caption" color="textSecondary" display="block">Assinado em</Typography><Typography variant="body2" fontWeight="bold">{formatarData(modalView.acordo.dataAcordo)}</Typography></Grid>
                      <Grid item xs={6}><Typography variant="caption" color="textSecondary" display="block">Término Previsto</Typography><Typography variant="body2" fontWeight="bold" color="success.main">{calcularDataTermino(modalView.acordo)}</Typography></Grid>
                      {FinanceiroUtils.proximaParcelaPendente(modalView.acordo) && (() => {
                        const prox = FinanceiroUtils.proximaParcelaPendente(modalView.acordo);
                        return <Grid item xs={12}><Typography variant="caption" color="textSecondary" display="block">Próximo vencimento</Typography><Typography variant="body2" fontWeight="bold" color="primary.main">{FinanceiroUtils.resumoPrazo(prox.data)} · parcela {prox.numero}</Typography></Grid>;
                      })()}
                    </Grid>
                  </Card>
                </>
              )}

              {modalView.acordo.dataDivida && (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'text.secondary', mb: 0.5, textTransform: 'uppercase' }}>Linha do Tempo</Typography>
                  <Card variant="outlined" sx={{ p: 1.5, mb: 2 }}>
                    <Typography variant="body2">Início: <b>{formatarData(modalView.acordo.dataDivida)}</b></Typography>
                    {modalView.acordo.situacao === 'acordo'
                      ? <Typography variant="body2" sx={{ mt: 0.5, color: 'warning.main', fontWeight: 'bold' }}>Ficou aberta por: {calcularTempoAteAcordo(modalView.acordo.dataDivida, modalView.acordo.dataAcordo)}</Typography>
                      : <Typography variant="body2" sx={{ mt: 0.5, color: 'error.main', fontWeight: 'bold' }}>Em aberto há: {calcularTempoAberto(modalView.acordo.dataDivida)}</Typography>}
                  </Card>
                </>
              )}

              {modalView.acordo.notas && (
                <Box sx={{ bgcolor: 'rgba(123,44,191,0.06)', p: 1.5, borderRadius: '6px', mb: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'text.secondary', mb: 0.5 }}>NOTAS</Typography>
                  <Typography variant="body2" sx={{ color: 'text.primary', whiteSpace: 'pre-wrap' }}>{modalView.acordo.notas}</Typography>
                </Box>
              )}

              {modalView.acordo.historicoPagamentos?.length > 0 && (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'text.secondary', mb: 0.5, textTransform: 'uppercase' }}>Histórico</Typography>
                  <Box sx={{ maxHeight: 120, overflowY: 'auto', bgcolor: 'rgba(34,197,94,0.05)', border: '1px solid', borderColor: 'success.main', p: 1, borderRadius: '6px' }}>
                    {modalView.acordo.historicoPagamentos.map((hist, idx) => (
                      <Box key={hist.pagamentoId || idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.7 }}>
                        <Typography variant="body2" sx={{ flex: 1, fontWeight: 'bold', color: 'success.main' }}>
                          ✅ {Number(hist.parcela || 0) > 0 ? `Parcela ${hist.parcela}` : (hist.descricao || 'Pagamento')} em {hist.data}
                          {hist.valorPago ? ` · ${money(hist.valorPago)}` : ''}
                        </Typography>
                        {hist.pagamentoId && (
                          <Button size="small" color="warning" variant="outlined"
                            onClick={() => setModalEstorno({ open: true, acordoId: modalView.acordo.id, pagamento: hist })}
                            sx={{ minWidth: 0, px: 1, py: 0.3, borderRadius: '8px', fontSize: '0.66rem', fontWeight: 800 }}>
                            Estornar
                          </Button>
                        )}
                      </Box>
                    ))}
                  </Box>
                </>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
              <Button fullWidth variant="contained" color="primary"
                onClick={() => setModalView({ open: false, acordo: null })}
                sx={{ fontWeight: 900, borderRadius: '12px' }}>
                Fechar Dossiê
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog open={modalEstorno.open} onClose={() => setModalEstorno({ open: false, acordoId: null, pagamento: null })}
        fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '18px' } }}>
        <DialogTitle sx={{ fontWeight: 900, color: 'warning.main', display: 'flex', alignItems: 'center', gap: .7 }}><UndoRoundedIcon /> Estornar pagamento</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.88rem' }}>
            Este estorno remove somente este pagamento do acordo e do Razão financeiro. As demais parcelas permanecem intactas.
          </Typography>
          {modalEstorno.pagamento && (
            <Box sx={{ mt: 1.5, p: 1.2, bgcolor: 'rgba(245,158,11,0.08)', borderRadius: '10px' }}>
              <Typography sx={{ fontWeight: 800 }}>
                {Number(modalEstorno.pagamento.parcela || 0) > 0 ? `Parcela ${modalEstorno.pagamento.parcela}` : 'Pagamento'} · {modalEstorno.pagamento.data}
              </Typography>
              <Typography sx={{ color: 'warning.main', fontWeight: 900 }}>
                {money(modalEstorno.pagamento.valorPago || 0)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button onClick={() => setModalEstorno({ open: false, acordoId: null, pagamento: null })} color="inherit">Cancelar</Button>
          <Button onClick={confirmarEstorno} variant="contained" color="warning" sx={{ fontWeight: 800 }}>Estornar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Box sx={{ bgcolor: toast.bgcolor, color: '#fff', px: 3, py: 1.5, borderRadius: '8px', fontWeight: 900, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
          {toast.texto}
        </Box>
      </Snackbar>

      {/* Dashboard 3 em 1 */}
      <Card sx={{ p: { xs: 1.1, sm: 1.4 }, mb: 1.2, boxShadow: 'none' }}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={4} sx={{ borderRight: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 900, color: 'text.secondary', fontSize: { xs: '0.65rem', sm: '0.8rem' }, textTransform: 'uppercase' }}>Acordos</Typography>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: '1rem', sm: '1.4rem' }, color: 'primary.main', mt: 0.5 }}>{money(totalNegociado)}</Typography>
          </Grid>
          <Grid item xs={4} sx={{ borderRight: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 900, color: 'error.main', fontSize: { xs: '0.65rem', sm: '0.8rem' }, textTransform: 'uppercase' }}>Vencidas</Typography>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: '1rem', sm: '1.4rem' }, color: 'error.main', mt: 0.5 }}>{money(totalVencido)}</Typography>
          </Grid>
          <Grid item xs={4} sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5 }}>
              <Button aria-label="Mês anterior" onClick={() => setMesOffset(prev => Math.max(0, prev - 1))} disabled={mesOffset === 0} sx={{ ...btnRadar, color: 'primary.main', width: 32, height: 32 }}><ArrowBackIosNewRoundedIcon sx={{ fontSize: 13 }} /></Button>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: .3, minWidth: 0 }}><CalendarMonthRoundedIcon sx={{ fontSize: 14, color: 'primary.main' }} /><Typography sx={{ fontWeight: 900, color: 'primary.main', fontSize: { xs: '.61rem', sm: '.72rem' }, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{nomeDoMes(mesOffset)}</Typography></Box>
              <Button aria-label="Próximo mês" onClick={() => setMesOffset(prev => prev + 1)} sx={{ ...btnRadar, color: 'primary.main', width: 32, height: 32 }}><ArrowForwardIosRoundedIcon sx={{ fontSize: 13 }} /></Button>
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: '1rem', sm: '1.4rem' },
              color: totalMesCalculado === 0 && mesOffset === 0 ? 'success.main' : 'primary.main', mt: 0.5 }}>
              {totalMesCalculado === 0 && mesOffset === 0 ? 'TUDO PAGO' : money(totalMesCalculado)}
            </Typography>
          </Grid>
        </Grid>
      </Card>

      {/* Busca + Ordenação */}
      <Box sx={{ display: 'flex', gap: .7, mb: 1 }}>
        <TextField fullWidth size="small" placeholder="Buscar credor, categoria, adm..."
          value={busca} onChange={e => setBusca(e.target.value)}
          sx={{ flex: 1 }} InputProps={{ startAdornment: <SearchRoundedIcon sx={{ mr: .6, color: 'text.secondary', fontSize: 18 }} /> }}
        />
        <TextField select size="small" value={ordenacao} onChange={e => setOrdenacao(e.target.value)}
          sx={{ minWidth: { xs: 112, sm: 140 } }}>
          {[
            { value: 'vencimento', label: 'Vencimento' },
            { value: 'valor', label: 'Valor' },
            { value: 'nome', label: 'Nome' },
          ].map(op => <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>)}
        </TextField>
      </Box>

      {/* Abas filtro */}
      <Box sx={{ display: 'flex', gap: .5, mb: 1.1, p: .35, borderRadius: '14px', bgcolor: 'rgba(123,44,191,.035)', border: '1px solid rgba(123,44,191,.07)' }}>
        {['ativos', 'vencidas', 'quitados'].map(t => (
          <Button key={t} fullWidth
            variant={abaFiltro === t ? 'contained' : 'text'} color="primary" sx={{ minHeight: 40, fontWeight: 900, textTransform: 'capitalize', fontSize: { xs: '.69rem', sm: '.78rem' }, boxShadow: abaFiltro === t ? '0 4px 12px rgba(123,44,191,.15)' : 'none' }}
            onClick={() => setAbaFiltro(t)}>
            {t}
          </Button>
        ))}
      </Box>

      {/* Lista */}
      {listaFiltrada.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 3, px: 1 }}><InboxRoundedIcon sx={{ fontSize: '2rem', color: 'primary.main', opacity: .65 }} /><Typography sx={{ mt: .45, fontWeight: 850, color: 'text.secondary' }}>Nenhum registro nesta aba.</Typography>{abrirNovo && <Button variant="contained" onClick={abrirNovo} sx={{ mt: 1.2, px: 2 }}>+ Criar primeiro acordo</Button>}</Box>
      ) : (
        listaFiltrada.map(acordo => {
          const valorFaltaPagar      = (acordo.parcelas - acordo.parcelasPagas) * acordo.valorParcela;
          const porcentagemProgresso = Math.round((acordo.parcelasPagas / acordo.parcelas) * 100) || 0;
          const isExpanded           = expandidos[acordo.id];
          const estaAdiantado        = valorDevidoMes(acordo, 0) === 0;
          const proximaPendente      = FinanceiroUtils.proximaParcelaPendente(acordo);
          const prazoProxima         = proximaPendente ? FinanceiroUtils.resumoPrazo(proximaPendente.data) : null;

          return (
            <Card key={acordo.id} sx={{
              mb: .85, p: 0, border: '1px solid rgba(72,45,91,.08)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(45,11,94,.035)', position: 'relative', '&:before': { content: '""', position: 'absolute', left: 0, top: 10, bottom: 10, width: 3, borderRadius: '0 3px 3px 0', bgcolor: acordo.situacao === 'vencida' ? 'error.main' : parseInt(acordo.parcelasPagas || 0) >= parseInt(acordo.parcelas || 0) ? 'success.main' : 'primary.main' },
            }}>
              <Box role="button" tabIndex={0} aria-expanded={isExpanded} onClick={() => toggleExpandir(acordo.id)} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && toggleExpandir(acordo.id)} sx={{
                p: 1.25, pl: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                cursor: 'pointer', bgcolor: isExpanded ? 'rgba(123,44,191,0.05)' : 'background.paper',
              }}>
                <Box sx={{ flex: 1, pr: 1 }}>
                  <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: 'text.primary', lineHeight: 1.1, mb: 0.5, textTransform: 'uppercase' }}>
                    {acordo.empresa}
                  </Typography>
                  <Typography variant="caption" sx={{
                    fontWeight: 'bold', textTransform: 'uppercase',
                    color: acordo.situacao === 'acordo' ? 'success.main' : acordo.situacao === 'quitado' ? 'primary.main' : 'error.main',
                  }}>
                    {acordo.situacao === 'acordo' ? 'Acordo ativo' : acordo.situacao === 'quitado' ? 'Quitado' : 'Vencida'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '1rem',
                    color: acordo.situacao === 'quitado' ? 'primary.main' : 'error.main', lineHeight: 1 }}>
                    {money(acordo.situacao === 'vencida' ? acordo.valorNegociado : acordo.valorTotalReal)}
                  </Typography>
                  <Typography sx={{ fontSize: '1rem', color: 'primary.main', fontWeight: 900,
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
                    ▼
                  </Typography>
                </Box>
              </Box>

              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Divider sx={{ mb: 1.5 }} />
                  {acordo.situacao !== 'vencida' ? (
                    <Box sx={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
                      {acordo.situacao === 'acordo' && acordo.parcelasPagas < acordo.parcelas && (
                        <Typography variant="caption" sx={{ fontWeight: 900, color: 'error.main', mb: 1.5, display: 'block' }}>
                          ⚠️ Faltam pagar: {money(valorFaltaPagar)}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: 'rgba(123,44,191,0.06)', p: 1, borderRadius: '6px', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>Orig: {money(acordo.original)}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 900, color: 'success.main' }}>Econ: {acordo.desconto || 0}% OFF</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>Pagamento: <b>{acordo.parcelas}x {money(acordo.valorParcela)}</b></Typography>
                        <Typography variant="body2" sx={{ fontWeight: 900, color: 'primary.main' }}>{acordo.parcelasPagas}/{acordo.parcelas} Pagas</Typography>
                      </Box>
                      <Box sx={{ width: '100%', bgcolor: 'rgba(123,44,191,0.15)', borderRadius: '4px', height: 18, my: 1, overflow: 'hidden', position: 'relative' }}>
                        <Box sx={{ width: `${porcentagemProgresso}%`, bgcolor: 'primary.main', height: '100%', transition: 'width 0.5s ease' }} />
                        <Typography sx={{ position: 'absolute', top: 0, left: 0, right: 0, textAlign: 'center', fontSize: '0.7rem', fontWeight: 900, color: '#fff', lineHeight: '18px', textShadow: '1px 1px 2px rgba(0,0,0,0.4)' }}>{porcentagemProgresso}%</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', gap: .35, borderTop: '1px dashed', borderColor: 'divider', pt: 1, mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">Término: <b>{calcularDataTermino(acordo)}</b></Typography>
                        <Typography variant="body2" color="text.secondary">Próx. venc.: <b>{prazoProxima || `Dia ${acordo.vencimentoDia}`}</b></Typography>
                      </Box>
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button fullWidth variant="contained"
                          color={parseInt(acordo.parcelasPagas || 0) >= parseInt(acordo.parcelas || 0) ? 'primary' : estaAdiantado ? 'warning' : 'success'}
                          sx={{ fontWeight: 900 }}
                          onClick={() => iniciarPagamento(acordo)}
                          disabled={parseInt(acordo.parcelasPagas || 0) >= parseInt(acordo.parcelas || 0)}>
                          {parseInt(acordo.parcelasPagas || 0) >= parseInt(acordo.parcelas || 0) ? <><CheckCircleRoundedIcon sx={{ mr: .4, fontSize: 17 }} /> Quitado</> : estaAdiantado ? <><FastForwardRoundedIcon sx={{ mr: .4, fontSize: 17 }} /> Adiantar</> : <><PaidRoundedIcon sx={{ mr: .4, fontSize: 17 }} /> Pagar</>}
                        </Button>
                        <Button aria-label="Ver detalhes" variant="outlined" sx={{ minWidth: 44, px: 0 }} onClick={() => setModalView({ open: true, acordo })}><VisibilityRoundedIcon /></Button>
                        <Button aria-label="Editar acordo" variant="outlined" sx={{ minWidth: 44, px: 0 }} onClick={() => abrirEditar && abrirEditar(acordo)}><EditRoundedIcon /></Button>
                        <Button aria-label="Excluir acordo" variant="outlined" color="error" sx={{ minWidth: 44, px: 0 }} onClick={() => setModalDelete({ open: true, id: acordo.id })}><DeleteOutlineRoundedIcon /></Button>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
                      <Box sx={{ bgcolor: 'rgba(239,68,68,0.08)', color: 'error.main', p: 1, borderRadius: '6px', textAlign: 'center', fontWeight: 900, mb: 1, border: '1px solid', borderColor: 'error.main' }}>
                        DÍVIDA EM ABERTO / SEM ACORDO
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed', borderColor: 'divider', pb: 1, mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">Origem: <b>{formatarData(acordo.dataDivida)}</b></Typography>
                        <Typography variant="body2" color="text.secondary">Vencimento: <b>Dia {acordo.vencimentoDia}</b></Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: 'rgba(123,44,191,0.06)', p: 1, borderRadius: '6px' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>Dívida Aberta Há:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 900, color: 'warning.main' }}>{calcularTempoAberto(acordo.dataDivida)}</Typography>
                      </Box>
                      {FinanceiroUtils.verificarPrescricao(acordo.dataDivida) && (
                        <Box sx={{ bgcolor: 'error.main', color: '#fff', p: 0.5, borderRadius: '6px', textAlign: 'center', fontWeight: 900, mt: 1, fontSize: '0.8rem' }}>
                          ⚠️ PRESCRITA (MAIS DE 5 ANOS)
                        </Box>
                      )}
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button fullWidth variant="contained" startIcon={<EditRoundedIcon />} sx={{ fontWeight: 900 }} onClick={() => abrirEditar && abrirEditar(acordo)}>Editar</Button>
                        <Button aria-label="Ver detalhes" variant="outlined" sx={{ minWidth: 44, px: 0 }} onClick={() => setModalView({ open: true, acordo })}><VisibilityRoundedIcon /></Button>
                        <Button aria-label="Excluir acordo" variant="outlined" color="error" sx={{ minWidth: 44, px: 0 }} onClick={() => setModalDelete({ open: true, id: acordo.id })}><DeleteOutlineRoundedIcon /></Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Collapse>
            </Card>
          );
        })
      )}
    </Box>
  );
};

export default Carteira;
