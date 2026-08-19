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
import { parseMoedaInput, formatMoedaInput, propsInputMoeda } from '../../utils/moedaInput';
import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';
import CardLista from './CardLista';
import { money } from './constants';

const sectionTitle = {
  fontSize: '.7rem', fontWeight: 900, color: '#64748B', textTransform: 'uppercase',
  letterSpacing: '.8px', mb: 1,
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

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto', px: { xs: 1.5, sm: 2 }, pt: 1.2, pb: 2, minHeight: 'calc(100dvh - 64px - env(safe-area-inset-bottom, 0px))' }}>
      <Box sx={{
        borderRadius: '22px', p: 1.8, mb: 1.4,
        background: 'linear-gradient(135deg,#2D0B5E 0%,#5A189A 55%,#7B2CBF 100%)',
        color: '#fff', boxShadow: '0 11px 30px rgba(45,11,94,.20)', overflow: 'hidden', position: 'relative',
      }}>
        <Box sx={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', bgcolor: 'rgba(255,255,255,.08)', right: -35, top: -55 }} />
        <Typography sx={{ fontSize: '.7rem', fontWeight: 900, letterSpacing: '1px', opacity: .8, textTransform: 'uppercase' }}>
          SaldoReal · Compras
        </Typography>
        <Typography sx={{ fontWeight: 900, fontSize: '1.28rem', mt: .25, lineHeight: 1.15 }}>
          Seu mercado, sem bagunçar as contas.
        </Typography>
        <Typography sx={{ fontSize: '.76rem', mt: .7, opacity: .88, maxWidth: 360, lineHeight: 1.45 }}>
          Planeje a compra e registre cada pagamento no fluxo financeiro na hora em que acontecer.
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mt: 1.4 }}>
          <Box sx={{ flex: 1, bgcolor: 'rgba(255,255,255,.13)', border: '1px solid rgba(255,255,255,.16)', borderRadius: '14px', p: 1.1 }}>
            <Typography sx={{ fontSize: '.66rem', fontWeight: 800, opacity: .75, textTransform: 'uppercase' }}>Em andamento</Typography>
            <Typography sx={{ fontWeight: 900, fontSize: '1.05rem' }}>{abertas.length}</Typography>
          </Box>
          <Box sx={{ flex: 1, bgcolor: 'rgba(255,255,255,.13)', border: '1px solid rgba(255,255,255,.16)', borderRadius: '14px', p: 1.1 }}>
            <Typography sx={{ fontSize: '.66rem', fontWeight: 800, opacity: .75, textTransform: 'uppercase' }}>Planejado</Typography>
            <Typography sx={{ fontWeight: 900, fontSize: '.96rem' }}>{money(resumo.planejado)}</Typography>
          </Box>
          <Box sx={{ flex: 1, bgcolor: 'rgba(255,255,255,.13)', border: '1px solid rgba(255,255,255,.16)', borderRadius: '14px', p: 1.1 }}>
            <Typography sx={{ fontSize: '.66rem', fontWeight: 800, opacity: .75, textTransform: 'uppercase' }}>Já pago</Typography>
            <Typography sx={{ fontWeight: 900, fontSize: '.96rem' }}>{money(resumo.pago)}</Typography>
          </Box>
        </Box>
      </Box>

      <Button
        fullWidth variant="contained" onClick={() => setModalNova(true)}
        startIcon={<AddShoppingCartRoundedIcon />}
        sx={{
          py: 1.15, mb: 1.7, borderRadius: '16px', fontWeight: 900,
          background: 'linear-gradient(135deg,#7B2CBF 0%,#9D4EDD 100%)',
          boxShadow: '0 7px 20px rgba(123,44,191,.20)',
        }}
      >
        Nova lista de compras
      </Button>

      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>}

      {!loading && listas.length === 0 && (
        <Box sx={{ p: 3.2, textAlign: 'center', bgcolor: 'background.paper', borderRadius: '20px', border: '1px dashed #CBD5E1' }}>
          <Typography sx={{ fontSize: '2.2rem' }}>🧾</Typography>
          <Typography sx={{ fontWeight: 900, mt: 1 }}>Comece pela próxima compra</Typography>
          <Typography sx={{ fontSize: '.78rem', color: 'text.secondary', mt: .4 }}>
            Crie uma lista, defina um orçamento e pague os itens conforme passar no caixa.
          </Typography>
        </Box>
      )}

      {!loading && abertas.length > 0 && (
        <>
          <Typography sx={sectionTitle}>Em andamento · {abertas.length}</Typography>
          {abertas.map(lista => (
            <CardLista
              key={lista.id} lista={lista} onClick={() => onAbrirLista(lista)}
              onExcluir={() => setConfirmExcId(lista.id)} onReabrir={() => onReabrir(lista.id)}
            />
          ))}
        </>
      )}

      {!loading && concluidas.length > 0 && (
        <>
          <Typography sx={{ ...sectionTitle, mt: 3 }}>Histórico · {concluidas.length}</Typography>
          {concluidas.map(lista => (
            <CardLista
              key={lista.id} lista={lista}
              onExcluir={() => setConfirmExcId(lista.id)} onReabrir={() => onReabrir(lista.id)}
            />
          ))}
        </>
      )}

      <Dialog open={modalNova} onClose={() => !salvando && setModalNova(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 900 }}>🛒 Nova compra</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '.78rem', color: 'text.secondary', mb: 2 }}>
            Dê um nome simples. O orçamento é opcional e serve só como limite de referência.
          </Typography>
          <TextField
            fullWidth autoFocus label="Nome da lista" placeholder="Ex: Mercado da semana"
            value={nomeLista} onChange={(e) => setNomeLista(e.target.value)} sx={{ mb: 1.5 }}
            onKeyDown={(e) => e.key === 'Enter' && criar()}
          />
          <TextField
            fullWidth label="Orçamento (opcional)" value={formatMoedaInput(orcamento)}
            onChange={(e) => setOrcamento(parseMoedaInput(e.target.value))}
            inputProps={propsInputMoeda}
            InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button color="inherit" onClick={() => setModalNova(false)}>Cancelar</Button>
          <Button variant="contained" disabled={!nomeLista.trim() || salvando} onClick={criar}>
            {salvando ? 'Criando…' : 'Criar lista'}
          </Button>
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
          <Button color="error" variant="contained" onClick={async () => {
            const id = confirmExcId;
            setConfirmExcId(null);
            await onExcluir(id);
          }}>Excluir lista</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TelaSeletorListas;
