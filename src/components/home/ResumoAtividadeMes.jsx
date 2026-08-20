import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import DonutSmallRoundedIcon from '@mui/icons-material/DonutSmallRounded';
import { money } from './constants';

const ResumoAtividadeMes = ({ saldoDisponivel = 0, despesasPagas = 0, percentual = 0, diasAteReceber = null }) => {
  const hoje = new Date();
  const dia = Math.max(1, hoje.getDate());
  const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
  const diasRestantesMes = Math.max(1, ultimoDia - dia + 1);
  const diasRestantes = Math.max(1, Number.isFinite(diasAteReceber) ? diasAteReceber : diasRestantesMes);
  const mediaDiaria = despesasPagas / dia;
  const disponivelDia = Math.max(0, saldoDisponivel) / diasRestantes;
  const itens = [
    { label: 'Gasto médio/dia', value: money(mediaDiaria), hint: `${dia} dias corridos`, Icon: SpeedRoundedIcon },
    { label: 'Pode gastar/dia', value: money(disponivelDia), hint: `para o saldo durar ${diasRestantes} dia${diasRestantes !== 1 ? 's' : ''}`, Icon: TodayRoundedIcon },
    { label: 'Renda usada', value: `${Math.max(0, Math.round(percentual || 0))}%`, hint: percentual < 70 ? 'ritmo confortável' : percentual < 90 ? 'acompanhe de perto' : 'atenção ao limite', Icon: DonutSmallRoundedIcon },
  ];
  return (
    <Box sx={{ mt: .9 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: .7 }}><Typography sx={{ fontSize: '.66rem', fontWeight: 900, color: 'text.secondary', letterSpacing: '.9px', textTransform: 'uppercase' }}>Ritmo do mês</Typography><Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} /></Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,minmax(0,1fr))', sm: 'repeat(3,minmax(0,1fr))' }, gap: .65 }}>
        {itens.map(({ label, value, hint, Icon }) => (
          <Box key={label} sx={{ minWidth: 0, p: .82, borderRadius: '14px', bgcolor: 'background.paper', border: '1px solid rgba(72,45,91,.075)', boxShadow: '0 4px 14px rgba(45,11,94,.03)', '&:last-of-type': { gridColumn: { xs: '1 / -1', sm: 'auto' } } }}>
            <Box sx={{ width: 27, height: 27, borderRadius: '9px', bgcolor: 'rgba(123,44,191,.07)', color: 'primary.main', display: 'grid', placeItems: 'center' }}><Icon sx={{ fontSize: 16 }} /></Box>
            <Typography sx={{ fontSize: '.63rem', color: 'text.secondary', fontWeight: 800, mt: .42, lineHeight: 1.1 }}>{label}</Typography>
            <Typography sx={{ fontSize: '.75rem', fontWeight: 900, mt: .15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</Typography>
            <Typography sx={{ fontSize: '.61rem', color: 'text.disabled', mt: .12, lineHeight: 1.15 }}>{hint}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ResumoAtividadeMes;
