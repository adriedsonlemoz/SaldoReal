import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { money } from './constants';

const ResumoAtividadeMes = ({ saldoDisponivel = 0, despesasPagas = 0, percentual = 0 }) => {
  const hoje = new Date();
  const dia = Math.max(1, hoje.getDate());
  const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
  const diasRestantes = Math.max(1, ultimoDia - dia + 1);
  const mediaDiaria = despesasPagas / dia;
  const disponivelDia = Math.max(0, saldoDisponivel) / diasRestantes;

  const itens = [
    { label: 'Média gasta/dia', value: money(mediaDiaria), hint: `${dia} dia${dia !== 1 ? 's' : ''} decorridos`, icon: '📉' },
    { label: 'Disponível/dia', value: money(disponivelDia), hint: `${diasRestantes} dia${diasRestantes !== 1 ? 's' : ''} restantes`, icon: '🎯' },
    { label: 'Renda usada', value: `${Math.max(0, Math.round(percentual || 0))}%`, hint: percentual < 70 ? 'ritmo confortável' : percentual < 90 ? 'acompanhe de perto' : 'atenção ao limite', icon: '📌' },
  ];

  return (
    <Box sx={{ mt: 1.05, mb: .2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: .8 }}>
        <Typography sx={{ fontSize: '.68rem', fontWeight: 900, color: 'text.secondary', letterSpacing: '1px', textTransform: 'uppercase' }}>Ritmo do mês</Typography>
        <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: .7 }}>
        {itens.map(item => (
          <Box key={item.label} sx={{ minWidth: 0, p: .9, borderRadius: '14px', bgcolor: 'background.paper', border: '1px solid rgba(80,55,100,.07)', boxShadow: '0 4px 14px rgba(45,11,94,.035)' }}>
            <Typography sx={{ fontSize: '.8rem', lineHeight: 1 }}>{item.icon}</Typography>
            <Typography sx={{ fontSize: '.65rem', color: 'text.secondary', fontWeight: 800, mt: .45, lineHeight: 1.15 }}>{item.label}</Typography>
            <Typography sx={{ fontSize: '.78rem', fontWeight: 900, color: 'text.primary', mt: .22, lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.value}</Typography>
            <Typography sx={{ fontSize: '.66rem', color: 'text.disabled', mt: .18, lineHeight: 1.15 }}>{item.hint}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ResumoAtividadeMes;
