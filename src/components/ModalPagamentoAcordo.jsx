// ─────────────────────────────────────────────────────────────────────────────
// src/components/ModalPagamentoAcordo.jsx
// CLEAN CODE — Modal de pagamento extraído de Carteira.jsx.
// BUG FIX #3 — Campo "Valor Real Pago" editável pelo usuário.
//              Alerta amigável exibido para acordos parcelados.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import Dialog          from '@mui/material/Dialog';
import DialogTitle     from '@mui/material/DialogTitle';
import DialogContent   from '@mui/material/DialogContent';
import DialogActions   from '@mui/material/DialogActions';
import Button          from '@mui/material/Button';
import Box             from '@mui/material/Box';
import Typography      from '@mui/material/Typography';
import TextField       from '@mui/material/TextField';
import Alert           from '@mui/material/Alert';

import FinanceiroUtils from '../utils/financeiro';

const money = FinanceiroUtils.money.bind(FinanceiroUtils);

const parseMoeda = (str) => {
  const num = parseFloat(String(str).replace(/\D/g, '')) / 100;
  return isNaN(num) ? 0 : num;
};

// ─────────────────────────────────────────────────────────────────────────────
const ModalPagamentoAcordo = ({ open, acordo, onClose, onConfirmar }) => {
  const [qtd,            setQtd]            = useState(1);
  const [data,           setData]           = useState(FinanceiroUtils.dateParaISOInput(new Date()));
  const [valorRealInput, setValorRealInput] = useState('');  // string formatada para exibição
  const [valorReal,      setValorReal]      = useState(null); // número ou null (usa parcela)

  // Sempre que o modal abre, redefine o estado
  useEffect(() => {
    if (open && acordo) {
      setQtd(1);
      setData(FinanceiroUtils.dateParaISOInput(new Date()));
      setValorReal(null);
      setValorRealInput('');
    }
  }, [open, acordo]);

  if (!acordo) return null;

  const maxQtd           = acordo.parcelas - (acordo.parcelasPagas || 0);
  const valorParcelaPad  = acordo.valorParcela || 0;
  const valorCalculado   = valorReal != null ? valorReal * qtd : valorParcelaPad * qtd;
  const isParcelado      = parseInt(acordo.parcelas) > 1;
  const estaAdiantado    = FinanceiroUtils.valorDevidoNoMes(acordo, new Date()) === 0;

  const handleValorRealChange = (e) => {
    const raw = parseMoeda(e.target.value);
    setValorReal(raw > 0 ? raw : null);
    setValorRealInput(raw > 0 ? money(raw) : '');
  };

  const handleConfirmar = () => {
    if (!data) return;
    // passa o valor por parcela (não o total)
    onConfirmar(acordo, qtd, data, valorReal);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          border: '2px solid',
          borderColor: 'success.main',
          borderRadius: '20px',
          minWidth: { xs: '92%', sm: '420px' },
        },
      }}
    >
      <DialogTitle sx={{ color: 'text.primary', fontWeight: 900, textAlign: 'center', pb: 0 }}>
        {estaAdiantado ? '⭐ Adiantar Parcelas' : '✅ Confirmar Pagamento'}
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>

        {/* Alerta para acordos parcelados */}
        {isParcelado && (
          <Alert severity="info" sx={{ mb: 2, borderRadius: '12px', fontSize: '0.78rem' }}>
            <strong>Acordo parcelado:</strong> confira o valor real debitado na sua conta.
            O campo abaixo permite corrigir o valor caso seja diferente da parcela combinada.
          </Alert>
        )}

        {/* Seletor de quantidade de parcelas */}
        <Typography sx={{ fontWeight: 700, color: 'text.secondary', mb: 1, textAlign: 'center', fontSize: '0.85rem' }}>
          Quantas parcelas deseja pagar agora?
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, mb: 2.5 }}>
          <Button
            onClick={() => setQtd(q => Math.max(1, q - 1))}
            sx={{ minWidth: 40, height: 40, bgcolor: 'rgba(123,44,191,0.1)', color: 'primary.main',
              fontSize: '1.4rem', fontWeight: 900, borderRadius: '8px', p: 0,
              '&:active': { transform: 'scale(0.8)' } }}>
            -
          </Button>
          <Typography sx={{ fontSize: '1.8rem', fontWeight: 900, color: 'primary.main', minWidth: 40, textAlign: 'center' }}>
            {qtd}x
          </Typography>
          <Button
            onClick={() => setQtd(q => Math.min(maxQtd, q + 1))}
            sx={{ minWidth: 40, height: 40, bgcolor: 'rgba(123,44,191,0.1)', color: 'primary.main',
              fontSize: '1.4rem', fontWeight: 900, borderRadius: '8px', p: 0,
              '&:active': { transform: 'scale(0.8)' } }}>
            +
          </Button>
        </Box>

        {/* Valor real pago — editável (BUG FIX #3) */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary', mb: 0.8 }}>
            Valor real por parcela <Typography component="span" sx={{ fontWeight: 400, fontSize: '0.7rem', color: 'text.disabled' }}>
              (opcional — deixe em branco para usar o valor da parcela)
            </Typography>
          </Typography>
          <TextField
            fullWidth
            placeholder={money(valorParcelaPad)}
            value={valorRealInput}
            onChange={handleValorRealChange}
            inputProps={{ inputMode: 'numeric' }}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.8)' },
              '& .MuiInputBase-input': { fontWeight: 800, fontSize: '1.1rem' },
            }}
          />
        </Box>

        {/* Resumo do valor */}
        <Box sx={{
          bgcolor: 'rgba(34,197,94,0.08)', p: 1.5, borderRadius: '12px',
          border: '1px dashed', borderColor: 'success.main', textAlign: 'center', mb: 2,
        }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>
            Total a registrar hoje:
          </Typography>
          <Typography sx={{ fontWeight: 900, fontSize: '1.5rem', color: 'success.main' }}>
            {money(valorCalculado)}
          </Typography>
          {valorReal != null && (
            <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', mt: 0.3 }}>
              Valor editado: {money(valorReal)} × {qtd} parcela{qtd > 1 ? 's' : ''}
            </Typography>
          )}
        </Box>

        {/* Data do pagamento */}
        <TextField
          fullWidth type="date"
          label="Qual foi o dia do pagamento?"
          InputLabelProps={{ shrink: true }}
          value={data}
          onChange={e => setData(e.target.value)}
          sx={{ bgcolor: 'rgba(123,44,191,0.04)', borderRadius: '4px', mb: 1.5 }}
        />

        <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.72rem', textAlign: 'center' }}>
          O pagamento poderá ser estornado individualmente depois no dossiê do acordo.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: 'center', gap: 2 }}>
        <Button variant="outlined" color="error" onClick={onClose} sx={{ fontWeight: 900, borderRadius: '12px', px: 3 }}>
          Cancelar
        </Button>
        <Button variant="contained" color="success" onClick={handleConfirmar}
          disabled={!data}
          sx={{ fontWeight: 900, borderRadius: '12px', px: 3 }}>
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalPagamentoAcordo;
