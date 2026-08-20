import React, { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded';
import ShoppingBasketRoundedIcon from '@mui/icons-material/ShoppingBasketRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ItemRow from './ItemRow';
import ModalAdicionarItem from './ModalAdicionarItem';
import { money } from './constants';
import { parseMoedaInput, formatMoedaInput, propsInputMoeda } from '../../utils/moedaInput';

const SummaryBox = ({ label, value, tone = 'neutral', caption }) => {
  const tones = {
    paid: { bg: 'rgba(17,156,114,.07)', color: '#087A58' },
    primary: { bg: 'rgba(123,44,191,.07)', color: '#6F22AE' },
    neutral: { bg: 'rgba(45,11,94,.035)', color: '#40384A' },
  };
  const c = tones[tone] || tones.neutral;
  return (
    <Box sx={{ flex: 1, minWidth: 0, p: 1.15, borderRadius: '14px', bgcolor: c.bg }}>
      <Typography sx={{ fontSize: '.66rem', fontWeight: 900, color: c.color, textTransform: 'uppercase', letterSpacing: '.45px' }}>{label}</Typography>
      <Typography sx={{ fontWeight: 900, fontSize: '.98rem', color: c.color, mt: .15 }}>{money(value)}</Typography>
      {caption && <Typography sx={{ fontSize: '.66rem', color: 'text.secondary', mt: .15 }}>{caption}</Typography>}
    </Box>
  );
};

const SectionTitle = ({ title, count, paid }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
    <Typography sx={{ fontSize: '.7rem', fontWeight: 900, letterSpacing: '.8px', textTransform: 'uppercase', color: paid ? '#087A58' : '#655B6D' }}>
      {title}
    </Typography>
    <Box sx={{ px: .8, py: .15, borderRadius: '8px', bgcolor: paid ? 'rgba(17,156,114,.09)' : '#F0EAF5', color: paid ? '#087A58' : '#6F6479', fontSize: '.66rem', fontWeight: 900 }}>
      {count}
    </Box>
  </Box>
);

const TelaListaAtiva = ({
  lista, itens, onVoltar, onPagar, onDesfazerPagamento, onRemove,
  onAdicionar, onConcluir, onEditarLista, setRoute,
}) => {
  const [modalAdd, setModalAdd] = useState(false);
  const [itemPagamento, setItemPagamento] = useState(null);
  const [valorPagamento, setValorPagamento] = useState('');
  const [itemDesfazer, setItemDesfazer] = useState(null);
  const [itemRemover, setItemRemover] = useState(null);
  const [modalOrc, setModalOrc] = useState(false);
  const [orcInput, setOrcInput] = useState('');
  const [modalFinalizar, setModalFinalizar] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: '', sev: 'success', verGastos: false });

  const dados = useMemo(() => {
    const pendentes = itens.filter(i => i.status !== 'comprado');
    const pagos = itens.filter(i => i.status === 'comprado');
    const planejado = itens.reduce((s, i) => s + Number(i.valorTotal || 0), 0);
    const totalPago = pagos.reduce((s, i) => s + Number(i.valorTotalReal ?? i.valorTotal ?? 0), 0);
    const restantePlanejado = Math.max(0, planejado - pagos.reduce((s, i) => s + Number(i.valorTotal || 0), 0));
    return { pendentes, pagos, planejado, totalPago, restantePlanejado };
  }, [itens]);

  const orcamento = Number(lista.orcamento || 0);
  const pctOrcamento = orcamento > 0 ? Math.min(100, (dados.totalPago / orcamento) * 100) : 0;
  const acima = orcamento > 0 && dados.totalPago > orcamento;

  const abrirPagamento = (item) => {
    setItemPagamento(item);
    setValorPagamento(Number(item.valorTotal || 0));
  };

  const confirmarPagamento = async () => {
    if (!itemPagamento) return;
    const valor = Number(valorPagamento || 0);
    if (!Number.isFinite(valor) || valor < 0) return;
    setProcessando(true);
    try {
      await onPagar(itemPagamento.id, valor);
      setItemPagamento(null);
      setToast({ open: true, msg: `${money(valor)} lançado como despesa paga.`, sev: 'success', verGastos: true });
    } catch {
      setToast({ open: true, msg: 'Não foi possível registrar o pagamento.', sev: 'error', verGastos: false });
    } finally {
      setProcessando(false);
    }
  };

  const salvarOrcamento = async () => {
    await onEditarLista(lista.id, { orcamento: Number(orcInput || 0) });
    setModalOrc(false);
  };

  const finalizar = async () => {
    setProcessando(true);
    try {
      await onConcluir(lista.id);
      setModalFinalizar(false);
      await onVoltar();
    } finally {
      setProcessando(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 620, mx: 'auto', px: { xs: 1.5, sm: 2 }, pt: 1.1, pb: 2, minHeight: 'calc(100dvh - 62px - env(safe-area-inset-bottom, 0px))' }}>
      <Snackbar
        open={toast.open} autoHideDuration={4500}
        onClose={() => setToast(t => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={toast.sev} variant="filled" sx={{ borderRadius: '13px', fontWeight: 700, alignItems: 'center' }}
          action={toast.verGastos && setRoute ? (
            <Button color="inherit" size="small" onClick={() => setRoute('gastos')} sx={{ fontSize: '.65rem' }}>
              Ver fluxo
            </Button>
          ) : undefined}
        >
          {toast.msg}
        </Alert>
      </Snackbar>

      <Box sx={{
        borderRadius: '22px', p: 1.65, color: '#fff', mb: 1.1, position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg,#2D0B5E 0%,#5A189A 58%,#7B2CBF 100%)',
        boxShadow: '0 10px 28px rgba(45,11,94,.20)',
      }}>
        <Box sx={{ position: 'absolute', width: 130, height: 130, borderRadius: '50%', bgcolor: 'rgba(255,255,255,.08)', right: -45, top: -60 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button aria-label="Voltar às listas" onClick={onVoltar} sx={{ minWidth: 44, width: 44, height: 44, p: 0, color: '#fff', bgcolor: 'rgba(255,255,255,.10)', '&:hover': { bgcolor: 'rgba(255,255,255,.16)' } }}>
            <ArrowBackRoundedIcon />
          </Button>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: '.66rem', fontWeight: 900, opacity: .75, textTransform: 'uppercase', letterSpacing: '.8px' }}>Compra em andamento</Typography>
            <Typography sx={{ fontWeight: 900, fontSize: '1.18rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2 }}>
              {lista.nome}
            </Typography>
          </Box>
          <Button
            size="small" onClick={() => { setOrcInput(orcamento || 0); setModalOrc(true); }}
            startIcon={<EditRoundedIcon />}
            sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,.11)', fontSize: '.68rem', px: .9 }}
          >
            Orçamento
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mt: 1.35 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: '.66rem', fontWeight: 800, opacity: .72, textTransform: 'uppercase' }}>Itens</Typography>
            <Typography sx={{ fontWeight: 900, fontSize: '1rem' }}>{dados.pagos.length}/{itens.length}</Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: '.66rem', fontWeight: 800, opacity: .72, textTransform: 'uppercase' }}>Pago</Typography>
            <Typography sx={{ fontWeight: 900, fontSize: '1rem' }}>{money(dados.totalPago)}</Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: '.66rem', fontWeight: 800, opacity: .72, textTransform: 'uppercase' }}>Pendente</Typography>
            <Typography sx={{ fontWeight: 900, fontSize: '1rem' }}>{dados.pendentes.length}</Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ bgcolor: 'background.paper', borderRadius: '17px', p: 1.15, mb: 1.1, border: '1px solid rgba(15,23,42,.06)' }}>
        <Box sx={{ display: 'flex', gap: .8 }}>
          <SummaryBox label="Planejado" value={dados.planejado} tone="primary" caption="todos os itens" />
          <SummaryBox label="Pago" value={dados.totalPago} tone="paid" caption="já no financeiro" />
          <SummaryBox label="A comprar" value={dados.restantePlanejado} caption="estimativa restante" />
        </Box>

        {orcamento > 0 && (
          <Box sx={{ mt: 1.3, px: .2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: .55 }}>
              <Typography sx={{ fontSize: '.68rem', color: 'text.secondary', fontWeight: 800 }}>
                Orçamento {money(orcamento)}
              </Typography>
              <Typography sx={{ fontSize: '.68rem', color: acima ? '#E54862' : '#7B2CBF', fontWeight: 900 }}>
                {pctOrcamento.toFixed(0)}% pago
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate" value={pctOrcamento}
              sx={{ height: 7, bgcolor: '#EEF2F7', '& .MuiLinearProgress-bar': { bgcolor: acima ? '#E54862' : '#7B2CBF' } }}
            />
            {dados.planejado > orcamento && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: .45, mt: .55, color: '#B26A00' }}>
              <WarningAmberRoundedIcon sx={{ fontSize: '.9rem' }} />
              <Typography sx={{ fontSize: '.68rem', color: 'inherit', fontWeight: 700 }}>
                O total planejado está {money(dados.planejado - orcamento)} acima do orçamento.
              </Typography>
            </Box>
            )}
          </Box>
        )}
      </Box>

      <Button
        fullWidth variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => setModalAdd(true)}
        sx={{ mb: 1.4, py: 1.05, borderRadius: '14px', color: '#7B2CBF', borderColor: 'rgba(123,44,191,.24)', bgcolor: 'rgba(123,44,191,.04)', fontWeight: 900 }}
      >
        Adicionar item
      </Button>

      {itens.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 2.4, px: 1.4, border: '1px dashed #D8CDE2', borderRadius: '20px', bgcolor: 'rgba(255,255,255,.72)' }}>
          <ShoppingBasketRoundedIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />
          <Typography sx={{ fontWeight: 900, mt: .55 }}>Sua lista está vazia</Typography>
          <Typography sx={{ fontSize: '.76rem', color: 'text.secondary', mt: .25 }}>Adicione o primeiro produto para começar.</Typography>
          <Box sx={{ mt: 1.4, display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: .6, textAlign: 'left' }}>
            {[
              ['1', 'Adicione', 'produto e preço'],
              ['2', 'Pague', 'valor real'],
              ['3', 'Sincroniza', 'automaticamente'],
            ].map(([n, titulo, texto]) => (
              <Box key={n} sx={{ minWidth: 0, p: .75, borderRadius: '12px', bgcolor: 'rgba(123,44,191,.045)', border: '1px solid rgba(123,44,191,.09)' }}>
                <Typography sx={{ width: 20, height: 20, borderRadius: '7px', display: 'grid', placeItems: 'center', bgcolor: 'rgba(123,44,191,.10)', color: 'primary.main', fontSize: '.65rem', fontWeight: 900 }}>{n}</Typography>
                <Typography sx={{ mt: .45, fontSize: '.68rem', fontWeight: 900, lineHeight: 1.1 }}>{titulo}</Typography>
                <Typography sx={{ mt: .12, fontSize: '.65rem', color: 'text.secondary', lineHeight: 1.12 }}>{texto}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {dados.pendentes.length > 0 && (
        <Box sx={{ mb: 1.35 }}>
          <SectionTitle title="A comprar" count={dados.pendentes.length} />
          {dados.pendentes.map(item => (
            <ItemRow key={item.id} item={item} onPagar={abrirPagamento} onDesfazer={() => {}} onRemove={setItemRemover} />
          ))}
        </Box>
      )}

      {dados.pagos.length > 0 && (
        <Box sx={{ mb: 1.35 }}>
          <SectionTitle title="Pago e lançado" count={dados.pagos.length} paid />
          <Typography sx={{ fontSize: '.7rem', color: 'text.secondary', mb: 1, mt: -.5 }}>
            Estes valores já fazem parte da Home, Fluxo, Relatório e gráficos do SaldoReal.
          </Typography>
          {dados.pagos.map(item => (
            <ItemRow key={item.id} item={item} onPagar={() => {}} onDesfazer={setItemDesfazer} onRemove={setItemRemover} />
          ))}
        </Box>
      )}

      {itens.length > 0 && (
        <Box sx={{ mt: 1.45, p: 1.3, borderRadius: '16px', bgcolor: 'rgba(123,44,191,.035)', border: '1px solid rgba(123,44,191,.10)' }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <ReceiptLongRoundedIcon sx={{ color: 'primary.main' }} />
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 900, fontSize: '.82rem' }}>Terminou a compra?</Typography>
              <Typography sx={{ fontSize: '.67rem', color: 'text.secondary' }}>Finalizar só arquiva a lista. Os itens pagos já estão no financeiro.</Typography>
            </Box>
            <Button size="small" variant="outlined" onClick={() => setModalFinalizar(true)} startIcon={<ArchiveRoundedIcon />} sx={{ fontSize: '.68rem' }}>
              Finalizar
            </Button>
          </Box>
        </Box>
      )}

      <ModalAdicionarItem open={modalAdd} onClose={() => setModalAdd(false)} onAdicionar={onAdicionar} />

      <Dialog open={!!itemPagamento} onClose={() => !processando && setItemPagamento(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: .8 }}><PaymentsRoundedIcon color="primary" /> Registrar pagamento</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontWeight: 800, mb: .3 }}>{itemPagamento?.nome}</Typography>
          <Typography sx={{ fontSize: '.76rem', color: 'text.secondary', mb: 2 }}>
            Confirme o valor realmente pago. Ao confirmar, a despesa entra imediatamente no fluxo financeiro.
          </Typography>
          <TextField
            fullWidth autoFocus label="Valor pago" value={formatMoedaInput(valorPagamento)}
            onChange={(e) => setValorPagamento(parseMoedaInput(e.target.value))}
            inputProps={propsInputMoeda}
            InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
            onKeyDown={(e) => e.key === 'Enter' && confirmarPagamento()}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button color="inherit" onClick={() => setItemPagamento(null)}>Cancelar</Button>
          <Button
            variant="contained" onClick={confirmarPagamento} disabled={processando}
            startIcon={<PaymentsRoundedIcon />}
            sx={{ background: 'linear-gradient(135deg,#7B2CBF 0%,#9D4EDD 100%)' }}
          >
            {processando ? 'Registrando…' : 'Pagar e lançar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!itemDesfazer} onClose={() => setItemDesfazer(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 900 }}>Desfazer pagamento?</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '.82rem', color: 'text.secondary' }}>
            Isso volta <strong>{itemDesfazer?.nome}</strong> para “A comprar” e remove o lançamento correspondente do fluxo financeiro.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button color="inherit" onClick={() => setItemDesfazer(null)}>Cancelar</Button>
          <Button variant="contained" color="warning" onClick={async () => {
            const item = itemDesfazer;
            setItemDesfazer(null);
            await onDesfazerPagamento(item.id);
          }}>Desfazer</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!itemRemover} onClose={() => setItemRemover(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 900 }}>Remover item?</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '.82rem', color: 'text.secondary' }}>
            {itemRemover?.status === 'comprado'
              ? <>Este item já está pago. Removê-lo também excluirá <strong>o lançamento financeiro deste item</strong>.</>
              : 'O item será retirado da lista.'}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button color="inherit" onClick={() => setItemRemover(null)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={async () => {
            const item = itemRemover;
            setItemRemover(null);
            await onRemove(item.id);
          }}>Remover</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={modalOrc} onClose={() => setModalOrc(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 900 }}>Orçamento da compra</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '.76rem', color: 'text.secondary', mb: 1.6 }}>Use como limite de referência. Ele não cria nenhuma movimentação financeira.</Typography>
          <TextField
            fullWidth autoFocus label="Limite" value={formatMoedaInput(orcInput)} onChange={(e) => setOrcInput(parseMoedaInput(e.target.value))}
            inputProps={propsInputMoeda}
            InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button color="inherit" onClick={() => setModalOrc(false)}>Cancelar</Button>
          <Button variant="contained" onClick={salvarOrcamento}>Salvar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={modalFinalizar} onClose={() => setModalFinalizar(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 900 }}>Finalizar esta compra?</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '.82rem', color: 'text.secondary' }}>
            A lista será arquivada no histórico. <strong>{dados.pagos.length} item(ns) pagos, total de {money(dados.totalPago)}, já estão registrados no financeiro.</strong>
          </Typography>
          {dados.pendentes.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: .5, mt: 1.2, color: '#B26A00' }}>
              <WarningAmberRoundedIcon sx={{ fontSize: '1rem', mt: .05 }} />
              <Typography sx={{ fontSize: '.74rem', color: 'inherit', fontWeight: 700 }}>
                {dados.pendentes.length} item(ns) ainda estão em “A comprar” e não entram nas finanças.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button color="inherit" onClick={() => setModalFinalizar(false)}>Cancelar</Button>
          <Button variant="contained" onClick={finalizar} disabled={processando}>Finalizar lista</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TelaListaAtiva;
