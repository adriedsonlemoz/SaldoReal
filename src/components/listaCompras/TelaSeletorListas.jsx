import React, { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';
import ShoppingBasketRoundedIcon from '@mui/icons-material/ShoppingBasketRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import { parseMoedaInput, formatMoedaInput, propsInputMoeda } from '../../utils/moedaInput';
import CardLista from './CardLista';
import { money } from './constants';

const sectionTitle = {
  fontSize: '.72rem', fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase',
  letterSpacing: '.75px', mb: .85,
};

const TelaSeletorListas = ({ listas, loading, onAbrirLista, onCriarLista, onExcluir, onReabrir }) => {
  const [modalNova, setModalNova] = useState(false);
  const [nomeLista, setNomeLista] = useState('');
  const [orcamento, setOrcamento] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [confirmExcId, setConfirmExcId] = useState(null);

  const abertas = listas.filter(l => l.status === 'aberta');
  const concluidas = listas.filter(l => l.status === 'concluida');
  const resumo = useMemo(() => ({
    planejado: abertas.reduce((s, l) => s + Number(l.totalEstimado || 0), 0),
    pago: listas.reduce((s, l) => s + Number(l.totalReal || 0), 0),
  }), [listas]);

  const criar = async () => {
    if (!nomeLista.trim()) return;
    setSalvando(true);
    try {
      await onCriarLista(nomeLista.trim(), parseFloat(String(orcamento).replace(',', '.')) || 0);
      setModalNova(false);
      setNomeLista('');
      setOrcamento('');
    } finally {
      setSalvando(false);
    }
  };

  const stats = [
    { label: 'Em andamento', valor: abertas.length, Icon: ShoppingBasketRoundedIcon },
    { label: 'Planejado', valor: money(resumo.planejado), Icon: AccountBalanceWalletRoundedIcon },
    { label: 'Já pago', valor: money(resumo.pago), Icon: ReceiptLongRoundedIcon },
  ];

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto', px: { xs: 1.5, sm: 2 }, pt: 1.1, pb: 1.5, minHeight: 'calc(100dvh - 62px - var(--app-safe-bottom))' }}>
      <Box sx={{
        borderRadius: '22px', p: 1.65, mb: 1.15,
        background: 'linear-gradient(135deg,#2D0B5E 0%,#5A189A 58%,#7B2CBF 100%)',
        color: '#fff', boxShadow: '0 10px 26px rgba(45,11,94,.18)', overflow: 'hidden', position: 'relative',
      }}>
        <Box sx={{ position: 'absolute', width: 115, height: 115, borderRadius: '50%', bgcolor: 'rgba(255,255,255,.07)', right: -35, top: -50 }} />
        <Typography sx={{ fontSize: '.68rem', fontWeight: 900, letterSpacing: '.9px', opacity: .72, textTransform: 'uppercase' }}>
          Compras
        </Typography>
        <Typography sx={{ fontWeight: 900, fontSize: '1.18rem', mt: .2, lineHeight: 1.2 }}>
          Planeje antes, pague com controle.
        </Typography>
        <Typography sx={{ fontSize: '.75rem', mt: .5, opacity: .82, maxWidth: 390, lineHeight: 1.4 }}>
          Cada item pago entra no fluxo financeiro automaticamente.
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: .7, mt: 1.15 }}>
          {stats.map(({ label, valor, Icon }) => (
            <Box key={label} sx={{ minWidth: 0, bgcolor: 'rgba(255,255,255,.10)', border: '1px solid rgba(255,255,255,.12)', borderRadius: '13px', p: .85 }}>
              <Icon sx={{ fontSize: '1rem', opacity: .78, mb: .2 }} />
              <Typography sx={{ fontSize: '.61rem', fontWeight: 800, opacity: .7, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</Typography>
              <Typography sx={{ fontWeight: 900, fontSize: '.87rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{valor}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Button
        fullWidth variant="contained" onClick={() => setModalNova(true)}
        startIcon={<AddShoppingCartRoundedIcon />}
        sx={{
          minHeight: 46, mb: 1.35, borderRadius: '14px', fontWeight: 900,
          background: 'linear-gradient(135deg,#7B2CBF 0%,#9D4EDD 100%)', color: '#fff',
          boxShadow: '0 6px 18px rgba(123,44,191,.18)',
        }}
      >
        Nova lista de compras
      </Button>

      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>}

      {!loading && listas.length === 0 && (
        <Box sx={{ py: 2.8, px: 2, textAlign: 'center', bgcolor: 'background.paper', borderRadius: '18px', border: '1px dashed rgba(123,44,191,.20)' }}>
          <Box sx={{ width: 46, height: 46, mx: 'auto', borderRadius: '15px', bgcolor: 'rgba(123,44,191,.07)', display: 'grid', placeItems: 'center', color: 'primary.main' }}>
            <ShoppingBasketRoundedIcon />
          </Box>
          <Typography sx={{ fontWeight: 900, mt: .9 }}>Comece pela próxima compra</Typography>
          <Typography sx={{ fontSize: '.77rem', color: 'text.secondary', mt: .3, maxWidth: 360, mx: 'auto' }}>
            Crie uma lista, defina um orçamento e registre os valores reais conforme pagar.
          </Typography>
        </Box>
      )}

      {!loading && abertas.length > 0 && (
        <Box sx={{ mb: 1.45 }}>
          <Typography sx={sectionTitle}>Em andamento · {abertas.length}</Typography>
          {abertas.map(lista => (
            <CardLista key={lista.id} lista={lista} onClick={() => onAbrirLista(lista)} onExcluir={() => setConfirmExcId(lista.id)} onReabrir={() => onReabrir(lista.id)} />
          ))}
        </Box>
      )}

      {!loading && concluidas.length > 0 && (
        <Box>
          <Typography sx={sectionTitle}>Histórico · {concluidas.length}</Typography>
          {concluidas.map(lista => (
            <CardLista key={lista.id} lista={lista} onExcluir={() => setConfirmExcId(lista.id)} onReabrir={() => onReabrir(lista.id)} />
          ))}
        </Box>
      )}

      <Dialog open={modalNova} onClose={() => !salvando && setModalNova(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: .8 }}><AddShoppingCartRoundedIcon color="primary" /> Nova compra</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '.78rem', color: 'text.secondary', mb: 1.6 }}>
            Dê um nome simples. O orçamento é opcional e serve como limite de referência.
          </Typography>
          <TextField fullWidth autoFocus label="Nome da lista" placeholder="Ex: Mercado da semana" value={nomeLista} onChange={(e) => setNomeLista(e.target.value)} sx={{ mb: 1.3 }} onKeyDown={(e) => e.key === 'Enter' && criar()} />
          <TextField
            fullWidth label="Orçamento (opcional)" value={formatMoedaInput(orcamento)}
            onChange={(e) => setOrcamento(parseMoedaInput(e.target.value))}
            inputProps={propsInputMoeda}
            InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button color="inherit" onClick={() => setModalNova(false)}>Cancelar</Button>
          <Button variant="contained" disabled={!nomeLista.trim() || salvando} onClick={criar}>{salvando ? 'Criando…' : 'Criar lista'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmExcId !== null} onClose={() => setConfirmExcId(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 900 }}>Excluir lista?</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '.84rem', color: 'text.secondary' }}>
            A lista e seus itens serão removidos. <strong>Pagamentos já lançados no financeiro serão preservados</strong> para não alterar seu histórico.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button color="inherit" onClick={() => setConfirmExcId(null)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={async () => { const id = confirmExcId; setConfirmExcId(null); await onExcluir(id); }}>Excluir lista</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TelaSeletorListas;
