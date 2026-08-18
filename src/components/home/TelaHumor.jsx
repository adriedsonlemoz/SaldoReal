import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import FinanceiroService from '../../services/FinanceiroService';
import { HUMORES, BG_GRADIENT, saudacao } from './constants';

const TelaHumor = ({ nome, onConcluir }) => {
  const [selecionado, setSelecionado] = useState(null);

  const confirmar = async () => {
    if (!selecionado) return;
    await FinanceiroService.salvarHumor(selecionado.nivel, selecionado.rotulo);
    onConcluir(selecionado);
  };

  const primeiroNome = nome.split(' ')[0];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: BG_GRADIENT, px: 3 }}>
      <Card sx={{ width: '100%', maxWidth: 380, p: 3.5, borderRadius: '20px', boxShadow: '0 24px 60px rgba(0,0,0,0.25)', textAlign: 'center' }}>
        <Typography sx={{ fontSize: '2rem', mb: 0.5 }}>💬</Typography>
        <Typography sx={{ fontWeight: 800, fontSize: '1.4rem', color: 'text.primary', mb: 0.5 }}>
          {saudacao()}, {primeiroNome}!
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', mb: 3, lineHeight: 1.5 }}>
          Como você está se sentindo com suas finanças hoje?
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, gap: 1 }}>
          {HUMORES.map(h => (
            <Box key={h.nivel} onClick={() => setSelecionado(h)}
              sx={{
                flex: 1, cursor: 'pointer', borderRadius: '12px', p: 1.2, py: 1.5,
                border: '2px solid',
                borderColor: selecionado?.nivel === h.nivel ? h.cor : 'divider',
                bgcolor: selecionado?.nivel === h.nivel ? `${h.cor}18` : 'transparent',
                transition: 'all 0.15s',
                '&:active': { transform: 'scale(0.95)' },
              }}>
              <Typography sx={{ fontSize: '1.8rem', lineHeight: 1 }}>{h.emoji}</Typography>
              <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: selecionado?.nivel === h.nivel ? h.cor : 'text.secondary', mt: 0.5, lineHeight: 1.2 }}>
                {h.rotulo}
              </Typography>
            </Box>
          ))}
        </Box>

        <Button fullWidth variant="contained" disabled={!selecionado} onClick={confirmar}
          sx={{ py: 1.5, fontWeight: 700, borderRadius: '12px', mb: 1.5 }}>
          {selecionado ? `Entrar como ${selecionado.emoji} ${selecionado.rotulo}` : 'Selecione como está'}
        </Button>
        <Button fullWidth variant="text" color="inherit" onClick={() => onConcluir(null)}
          sx={{ fontWeight: 500, color: 'text.secondary', fontSize: '0.85rem' }}>
          Pular por hoje
        </Button>
      </Card>
    </Box>
  );
};

export default TelaHumor;
