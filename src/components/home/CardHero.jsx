import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import { money } from './constants';

const Metric = ({ label, value, color = 'rgba(255,255,255,.94)' }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography sx={{ color: 'rgba(255,255,255,.52)', fontSize: '.64rem', fontWeight: 800, letterSpacing: '.25px' }}>{label}</Typography>
    <Typography sx={{ color, fontSize: '.76rem', fontWeight: 900, mt: .08, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</Typography>
  </Box>
);

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
  const positivo = saldoDisponivel >= 0;
  const temRenda = receitaConsiderada > 0 || renda > 0;
  const statusColor = positivo ? '#67E8B8' : '#FF9BAA';
  const projectColor = saldoProjetado >= 0 ? '#67E8B8' : '#FF9BAA';

  return (
    <Box sx={{
      position: 'relative', mb: .9, borderRadius: '22px', overflow: 'hidden',
      background: 'linear-gradient(145deg, #32105A 0%, #4A1C73 50%, #6B2C96 100%)',
      boxShadow: '0 10px 28px rgba(62,18,109,.18)',
      border: '1px solid rgba(255,255,255,.08)',
    }}>
      <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at 90% 12%, rgba(213,92,180,.18), transparent 36%), radial-gradient(circle at 12% 100%, rgba(190,143,222,.16), transparent 33%)' }} />
      <Box sx={{ px: 1.7, py: 1.35, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: 'rgba(255,255,255,.55)', fontSize: '.64rem', fontWeight: 900, letterSpacing: '1.2px', textTransform: 'uppercase' }}>Saldo disponível</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: .7, mt: .35, minWidth: 0 }}>
              <Typography sx={{ fontSize: { xs: '1.95rem', sm: '2.15rem' }, fontWeight: 900, color: '#fff', letterSpacing: '-1px', lineHeight: 1, minWidth: 0 }}>
                {mostrar ? money(saldoDisponivel) : '••••••'}
              </Typography>
              <Box sx={{ px: .72, py: .22, borderRadius: 999, bgcolor: positivo ? 'rgba(17,156,114,.16)' : 'rgba(229,72,98,.17)', border: `1px solid ${positivo ? 'rgba(103,232,184,.28)' : 'rgba(255,155,170,.32)'}`, flexShrink: 0 }}>
                <Typography sx={{ fontSize: '.62rem', fontWeight: 900, color: statusColor }}>{positivo ? 'NO AZUL' : 'ATENÇÃO'}</Typography>
              </Box>
            </Box>
          </Box>
          <Box role="button" tabIndex={0} aria-label={mostrar ? 'Ocultar saldo' : 'Mostrar saldo'} onClick={() => setMostrar(v => !v)} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setMostrar(v => !v)} sx={{ width: 38, height: 38, borderRadius: '12px', bgcolor: 'rgba(255,255,255,.09)', border: '1px solid rgba(255,255,255,.11)', display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'rgba(255,255,255,.80)', flexShrink: 0, '&:active': { transform: 'scale(.92)' } }}>
            {mostrar ? <VisibilityRoundedIcon sx={{ fontSize: 18 }} /> : <VisibilityOffRoundedIcon sx={{ fontSize: 18 }} />}
          </Box>
        </Box>

        {temRenda ? (
          <>
            <Box sx={{ height: 4, borderRadius: 99, bgcolor: 'rgba(255,255,255,.10)', mt: 1.05, overflow: 'hidden' }}>
              <Box sx={{ height: '100%', width: `${pctPago}%`, borderRadius: 99, background: pctPago >= 90 ? 'linear-gradient(90deg,#F72585,#FF7DAE)' : 'linear-gradient(90deg,#9D4EDD,#D46BD4)', transition: 'width .55s ease' }} />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: .7, mt: .85, p: .85, borderRadius: '12px', bgcolor: 'rgba(255,255,255,.065)', border: '1px solid rgba(255,255,255,.085)' }}>
              <Metric label="Pago" value={mostrar ? money(despesasPagas) : '••••'} />
              <Metric label="Pendente" value={mostrar ? money(debito) : '••••'} />
              <Metric label="Projetado" value={mostrar ? money(saldoProjetado) : '••••'} color={projectColor} />
            </Box>
            <Typography sx={{ mt: .55, color: 'rgba(255,255,255,.52)', fontSize: '.64rem', fontWeight: 750, textAlign: 'right' }}>{pctPago}% da renda utilizada</Typography>
          </>
        ) : (
          <Typography sx={{ mt: .9, px: .9, py: .65, borderRadius: '10px', bgcolor: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.65)', fontSize: '.68rem', fontWeight: 700 }}>Configure sua renda para acompanhar o ritmo do mês.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default CardHero;
