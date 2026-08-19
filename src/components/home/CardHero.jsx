// src/components/home/CardHero.jsx — resumo financeiro principal.

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { money } from './constants';

const CardHero = ({
  debito = 0,
  percentual = 0,
  renda = 0,
  saldoDisponivel = 0,
  saldoProjetado = 0,
  despesasPagas = 0,
  receitaConsiderada = 0,
}) => {
  const [mostrar, setMostrar] = useState(true);

  const pctPago = Math.max(0, Math.min(100, percentual || 0));
  const barColor = pctPago >= 80 ? '#FF4D6D' : pctPago >= 60 ? '#FFB703' : '#4DFFC3';
  const positivo = saldoDisponivel >= 0;
  const projetadoPositivo = saldoProjetado >= 0;
  const temRenda = receitaConsiderada > 0 || renda > 0;

  return (
    <Box sx={{
      position: 'relative', mb: 1, borderRadius: '22px', overflow: 'hidden',
      background: 'linear-gradient(145deg, #1A0533 0%, #2D0B5E 40%, #4A0E8F 70%, #6B1FA8 100%)',
      boxShadow: '0 12px 34px rgba(77,25,133,0.28), 0 3px 10px rgba(45,11,94,0.12)',
    }}>
      <Box sx={{
        position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(247,37,133,0.45) 0%, transparent 70%)',
        filter: 'blur(20px)', animation: 'pulse1 4s ease-in-out infinite', pointerEvents: 'none',
        '@keyframes pulse1': {
          '0%, 100%': { opacity: 0.7, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.15)' },
        },
      }} />
      <Box sx={{
        position: 'absolute', bottom: -20, left: -20, width: 90, height: 90, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(157,78,221,0.34) 0%, transparent 70%)',
        filter: 'blur(16px)', animation: 'pulse2 5s ease-in-out infinite', pointerEvents: 'none',
        '@keyframes pulse2': {
          '0%, 100%': { opacity: 0.5, transform: 'scale(1)' },
          '50%': { opacity: 0.9, transform: 'scale(1.2)' },
        },
      }} />
      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      <Box sx={{ px: 2, pt: 1.45, pb: 1.45, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: .7 }}>
          <Typography sx={{
            color: 'rgba(255,255,255,0.5)', fontSize: '0.66rem', fontWeight: 800,
            letterSpacing: '1.5px', textTransform: 'uppercase',
          }}>
            Saldo disponível
          </Typography>
          <Box onClick={() => setMostrar(v => !v)} sx={{
            cursor: 'pointer', bgcolor: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', px: 0.9, py: 0.4,
            fontSize: '0.68rem', lineHeight: 1, userSelect: 'none', transition: 'all 0.2s',
            '&:active': { transform: 'scale(0.9)' },
          }}>
            {mostrar ? '👁' : '🙈'}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: .9, mb: 1.05 }}>
          <Typography sx={{
            fontSize: { xs: '1.95rem', sm: '2.15rem' }, fontWeight: 900, lineHeight: 1, letterSpacing: '-1px', color: '#fff',
            textShadow: '0 2px 20px rgba(255,255,255,0.2)',
          }}>
            {mostrar ? money(saldoDisponivel) : '••••••'}
          </Typography>
          <Box sx={{
            mb: 0.15, px: .9, py: .25, borderRadius: '20px',
            background: positivo
              ? 'linear-gradient(135deg, rgba(4,210,161,0.25), rgba(4,210,161,0.1))'
              : 'linear-gradient(135deg, rgba(239,35,60,0.3), rgba(239,35,60,0.1))',
            border: `1px solid ${positivo ? 'rgba(4,210,161,0.4)' : 'rgba(239,35,60,0.4)'}`,
          }}>
            <Typography sx={{ fontSize: '0.64rem', fontWeight: 900, color: positivo ? '#4DFFC3' : '#FF8FA3' }}>
              {positivo ? '✓ NO AZUL' : '⚠ ATENÇÃO'}
            </Typography>
          </Box>
        </Box>

        {temRenda ? (
          <>
            <Box sx={{ position: 'relative', height: 5, borderRadius: 8, bgcolor: 'rgba(255,255,255,0.12)', mb: .55, overflow: 'hidden' }}>
              <Box sx={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pctPago}%`, borderRadius: 8,
                background: `linear-gradient(90deg, ${barColor}bb, ${barColor})`, boxShadow: `0 0 10px ${barColor}88`,
                transition: 'width 0.8s ease',
              }} />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.66rem', fontWeight: 600 }}>
                Pago {mostrar ? money(despesasPagas) : '••••'}{debito > 0 ? ` · Pendente ${mostrar ? money(debito) : '••••'}` : ''}
              </Typography>
              <Typography sx={{ color: barColor, fontSize: '0.66rem', fontWeight: 900 }}>
                {pctPago}% gasto
              </Typography>
            </Box>

            <Box sx={{
              mt: .85, px: 1.1, py: .65, borderRadius: '10px',
              bgcolor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex', justifyContent: 'space-between', gap: 1,
            }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.58)', fontSize: '0.68rem', fontWeight: 700 }}>
                Após pagar pendências
              </Typography>
              <Typography sx={{ color: projetadoPositivo ? '#4DFFC3' : '#FF8FA3', fontSize: '0.69rem', fontWeight: 900 }}>
                {mostrar ? money(saldoProjetado) : '••••••'}
              </Typography>
            </Box>
          </>
        ) : (
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 0.8, px: 1.5, py: 0.8,
            bgcolor: 'rgba(255,255,255,0.07)', borderRadius: '10px', border: '1px dashed rgba(255,255,255,0.2)',
          }}>
            <Typography sx={{ fontSize: '0.7rem' }}>💡</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.68rem', fontStyle: 'italic' }}>
              Configure sua renda para ver o progresso
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CardHero;
