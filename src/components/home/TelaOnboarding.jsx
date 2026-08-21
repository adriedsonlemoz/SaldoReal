import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import FinanceiroService from '../../services/FinanceiroService';
import { money, BG_GRADIENT } from './constants';

const Dots = ({ active }) => (
  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 3 }}>
    {[1, 2].map(i => (
      <Box key={i} sx={{ width: i === active ? 20 : 8, height: 8, borderRadius: 4, bgcolor: i === active ? 'primary.main' : '#E2E8F0', transition: 'all 0.3s' }} />
    ))}
  </Box>
);

const TelaOnboarding = ({ onConcluir }) => {
  const [step, setStep]           = useState(0);
  const [nome, setNome]           = useState('');
  const [renda, setRenda]         = useState(0);
  const [inputRenda, setInputRenda] = useState('');
  const [diaPagamento, setDiaPagamento] = useState('');

  const handleRendaChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    const num = parseFloat(raw) / 100;
    setInputRenda(isNaN(num) ? '' : num);
    setRenda(isNaN(num) ? 0 : num);
  };

  const concluir = async () => {
    const s = nome.trim();
    const nomeFormatado = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    await FinanceiroService.setUsuario(nomeFormatado);
    if (renda > 0) await FinanceiroService.setRenda(renda);
    const dia = parseInt(diaPagamento);
    if (dia >= 1 && dia <= 31) await FinanceiroService.setDiaPagamento(dia);
    onConcluir(nomeFormatado);
  };

  if (step === 0) return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: BG_GRADIENT, px: 3, textAlign: 'center' }}>
      <Box sx={{ width: 96, height: 96, borderRadius: '28px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', mb: 4, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
        💜
      </Box>
      <Typography sx={{ fontSize: '2.4rem', fontWeight: 800, color: '#fff', lineHeight: 1.1, mb: 1 }}>Saldo Real</Typography>
      <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', mb: 5, maxWidth: 280, lineHeight: 1.5 }}>
        Seu assistente pessoal de compras e gastos.
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%', maxWidth: 320, mb: 5 }}>
        {[
          { emoji: '📊', texto: 'Insights automáticos sobre seus gastos' },
          { emoji: '🔔', texto: 'Alertas de vencimentos próximos' },
          { emoji: '📱', texto: 'Funciona 100% offline, no seu dispositivo' },
        ].map((item, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'rgba(255,255,255,0.07)', borderRadius: '12px', p: 1.5, border: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography sx={{ fontSize: '1.3rem' }}>{item.emoji}</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', fontWeight: 500 }}>{item.texto}</Typography>
          </Box>
        ))}
      </Box>
      <Button variant="contained" onClick={() => setStep(1)} sx={{ py: 1.8, px: 5, fontSize: '1rem', fontWeight: 700, borderRadius: '14px', bgcolor: '#fff', color: '#0F172A', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
        Começar →
      </Button>
    </Box>
  );

  if (step === 1) return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: BG_GRADIENT, px: 3 }}>
      <Card sx={{ width: '100%', maxWidth: 380, p: 3.5, borderRadius: '20px', boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }}>
        <Typography sx={{ fontSize: '1.8rem', mb: 0.5 }}>👋</Typography>
        <Typography sx={{ fontWeight: 800, fontSize: '1.4rem', color: 'text.primary', mb: 0.5 }}>Como você se chama?</Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', mb: 3 }}>Vamos personalizar sua experiência.</Typography>
        <TextField fullWidth label="Seu primeiro nome" value={nome} onChange={e => setNome(e.target.value)} onKeyDown={e => e.key === 'Enter' && nome.trim() && setStep(2)} autoFocus sx={{ mb: 3 }} />
        <Button fullWidth variant="contained" disabled={!nome.trim()} onClick={() => setStep(2)} sx={{ py: 1.5, fontWeight: 700, borderRadius: '12px', color: '#fff' }}>
          Continuar →
        </Button>
        <Dots active={1} />
      </Card>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: BG_GRADIENT, px: 3 }}>
      <Card sx={{ width: '100%', maxWidth: 380, p: 3.5, borderRadius: '20px', boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }}>
        <Typography sx={{ fontSize: '1.8rem', mb: 0.5 }}>💼</Typography>
        <Typography sx={{ fontWeight: 800, fontSize: '1.4rem', color: 'text.primary', mb: 0.5 }}>Qual é sua renda mensal?</Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', mb: 3 }}>
          Usado para calcular o percentual gasto. Pode pular e definir depois.
        </Typography>
        <TextField fullWidth label="Renda mensal (R$)" value={inputRenda === '' ? '' : money(inputRenda)} onChange={handleRendaChange} inputProps={{ inputMode: 'numeric' }} sx={{ mb: 2 }} />
        <TextField fullWidth label="Dia do recebimento (1–31)" value={diaPagamento} onChange={e => { const v = e.target.value.replace(/\D/g,''); if (v === '' || (parseInt(v) >= 1 && parseInt(v) <= 31)) setDiaPagamento(v); }} inputProps={{ inputMode: 'numeric', maxLength: 2 }} helperText="Ex: 5 (recebe todo dia 5). Pode pular." sx={{ mb: 3 }} />
        <Button fullWidth variant="contained" onClick={concluir} sx={{ py: 1.5, fontWeight: 700, borderRadius: '12px', mb: 1.5, color: '#fff' }}>
          Entrar no app ✓
        </Button>
        <Button fullWidth variant="text" color="inherit" onClick={concluir} sx={{ fontWeight: 500, color: 'text.secondary', fontSize: '0.85rem' }}>
          Pular por enquanto
        </Button>
        <Dots active={2} />
      </Card>
    </Box>
  );
};

export default TelaOnboarding;
