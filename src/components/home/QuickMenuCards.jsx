import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import HandshakeRoundedIcon from '@mui/icons-material/HandshakeRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import FinanceiroService from '../../services/FinanceiroService';
import FinanceiroUtils from '../../utils/financeiro';
import ListaComprasService from '../../services/ListaComprasService';
import { money } from './constants';

const BigCard = ({ label, sub, Icon, tone = '#7B2CBF', onClick, delay = 0 }) => (
  <Box role="button" tabIndex={0} aria-label={label} onClick={onClick} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick()} sx={{
    borderRadius: '17px', bgcolor: 'background.paper', p: 1.05, cursor: 'pointer', minHeight: 82,
    border: '1px solid rgba(72,45,91,.085)', boxShadow: '0 5px 18px rgba(45,11,94,.045)',
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden',
    animation: `cardPop .35s ease ${delay}ms both`,
    '@keyframes cardPop': { '0%': { opacity: 0, transform: 'translateY(5px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
    transition: 'transform .16s ease, border-color .16s ease, box-shadow .16s ease',
    '&:hover': { transform: 'translateY(-2px)', borderColor: `${tone}33`, boxShadow: `0 8px 22px ${tone}16` }, '&:active': { transform: 'scale(.98)' },
  }}>
    <Box sx={{ position: 'absolute', width: 70, height: 70, borderRadius: '50%', right: -30, top: -30, bgcolor: `${tone}08`, pointerEvents: 'none' }} />
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: .6 }}>
      <Box sx={{ width: 34, height: 34, borderRadius: '11px', bgcolor: `${tone}0F`, color: tone, display: 'grid', placeItems: 'center' }}><Icon sx={{ fontSize: 19 }} /></Box>
      <ArrowForwardRoundedIcon sx={{ fontSize: 17, color: 'text.disabled' }} />
    </Box>
    <Box sx={{ mt: .7, minWidth: 0 }}>
      <Typography sx={{ fontWeight: 900, fontSize: '.79rem', lineHeight: 1.18, color: 'text.primary' }}>{label}</Typography>
      <Typography sx={{ mt: .22, fontSize: '.67rem', color: 'text.secondary', fontWeight: 700, lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</Typography>
    </Box>
  </Box>
);

const QuickMenuCards = ({ setRoute }) => {
  const [totalAcordos, setTotalAcordos] = useState(null);
  const [qtdListas, setQtdListas] = useState(null);
  const [qtdContas, setQtdContas] = useState(null);

  useEffect(() => {
    const carregar = async () => {
      try {
        const [acordos, listas, alertas] = await Promise.all([
          FinanceiroService.carregarAcordos(), ListaComprasService.carregarListas(), FinanceiroService.alertasDeVencimento(7),
        ]);
        const ativos = acordos.filter(a => a.situacao === 'acordo');
        setTotalAcordos(ativos.reduce((s, a) => s + FinanceiroUtils.valorDevidoNoMes(a, new Date()), 0));
        setQtdListas(listas.filter(l => l.status === 'aberta').length);
        setQtdContas(alertas.length);
      } catch { /* mantém placeholders */ }
    };
    carregar();
  }, []);

  const CARDS = [
    { label: 'Meus acordos', sub: totalAcordos != null ? (totalAcordos > 0 ? `Devido ${money(totalAcordos)}` : 'Tudo em dia') : 'Carregando…', Icon: HandshakeRoundedIcon, tone: '#7B2CBF', route: 'acordos' },
    { label: 'Listas de compras', sub: qtdListas != null ? (qtdListas > 0 ? `${qtdListas} lista${qtdListas !== 1 ? 's' : ''} ativa${qtdListas !== 1 ? 's' : ''}` : 'Nenhuma aberta') : 'Carregando…', Icon: ShoppingCartRoundedIcon, tone: '#8C48C8', route: 'lista' },
    { label: 'Relatório', sub: 'Acompanhar evolução', Icon: InsightsRoundedIcon, tone: '#6D5BD0', route: 'relatorio' },
    { label: 'Contas a pagar', sub: qtdContas != null ? (qtdContas > 0 ? `${qtdContas} próxima${qtdContas !== 1 ? 's' : ''}` : 'Tudo em dia') : 'Carregando…', Icon: ReceiptLongRoundedIcon, tone: '#A33B91', route: 'gastos' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: .75 }}>
        <Typography sx={{ fontSize: '.66rem', fontWeight: 900, color: 'text.secondary', letterSpacing: '.9px', textTransform: 'uppercase' }}>Acesso rápido</Typography>
        <Box sx={{ flex: 1, height: 1, bgcolor: 'divider' }} />
      </Box>
      <Grid container spacing={.85}>
        {CARDS.map((card, i) => <Grid item xs={6} key={card.route + card.label}><BigCard {...card} onClick={() => setRoute(card.route)} delay={i * 45} /></Grid>)}
      </Grid>
    </Box>
  );
};

export default QuickMenuCards;
