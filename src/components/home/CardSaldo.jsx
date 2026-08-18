import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { money } from './constants';

const CardSaldo = ({ debito, percentual, renda, saldoReal = 0 }) => {
  const [mostrarValor, setMostrarValor] = useState(true);

  const saldoExibido   = renda + saldoReal;
  const despesasPagas  = Math.max(0, -saldoReal);
  const pctPago        = renda > 0 ? Math.min(100, Math.round((despesasPagas / renda) * 100)) : 0;
  const barColor       = pctPago >= 80 ? '#EF233C' : pctPago >= 60 ? '#FFB703' : '#06D6A0';
  const saldoPositivo  = saldoExibido >= 0;

  return (
    <Card sx={{
      background: 'linear-gradient(135deg, #7B2CBF 0%, #9D4EDD 60%, #F72585 100%)',
      color: '#fff',
      p: 0,
      mb: 2,
      borderRadius: '20px',
      boxShadow: '0 8px 32px rgba(123,44,191,0.35)',
      border: 'none',
      overflow: 'hidden',
    }}>
      {/* faixa decorativa top */}
      <Box sx={{
        position: 'absolute', top: 0, right: 0,
        width: 140, height: 140,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.06)',
        transform: 'translate(40px, -60px)',
        pointerEvents: 'none',
      }} />

      <Box sx={{ p: 2.5, position: 'relative' }}>
        {/* header row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            Saldo Restante no Mês
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            {/* toggle visibilidade */}
            <Box onClick={() => setMostrarValor(v => !v)} sx={{ cursor: 'pointer', bgcolor: 'rgba(255,255,255,0.15)', borderRadius: '8px', px: 0.8, py: 0.4, fontSize: '0.7rem' }}>
              {mostrarValor ? '👁' : '🙈'}
            </Box>
          </Box>
        </Box>

        {/* valor principal */}
        <Typography sx={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1, mb: 0.4, letterSpacing: '-0.5px' }}>
          {mostrarValor ? money(saldoExibido) : '••••••'}
        </Typography>

        {/* badge positivo/negativo */}
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, bgcolor: saldoPositivo ? 'rgba(6,214,160,0.25)' : 'rgba(239,35,60,0.25)', borderRadius: '20px', px: 1.2, py: 0.3, mb: 2 }}>
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: saldoPositivo ? '#A7F3D0' : '#FECDD3', letterSpacing: '0.3px' }}>
            {saldoPositivo ? '✓ NO AZUL' : '⚠ ATENÇÃO'}
          </Typography>
        </Box>

        {/* barra de progresso */}
        {renda > 0 ? (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.7 }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem' }}>
                Pago {money(despesasPagas)}{debito > 0 ? ` · A pagar ${money(debito)}` : ''}
              </Typography>
              <Typography sx={{ color: '#fff', fontSize: '0.72rem', fontWeight: 800 }}>{pctPago}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate" value={pctPago}
              sx={{
                height: 7, borderRadius: 8,
                bgcolor: 'rgba(255,255,255,0.2)',
                '& .MuiLinearProgress-bar': { bgcolor: barColor, borderRadius: 8 },
              }}
            />
          </Box>
        ) : (
          <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontStyle: 'italic' }}>
            Configure sua renda para ver o progresso
          </Typography>
        )}
      </Box>
    </Card>
  );
};

export default CardSaldo;
