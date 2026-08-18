// src/components/home/QuickMenuCards.jsx
// Grade 2x2 de cards grandes com dados reais — Acordos, Listas, Relatório, Contas a Pagar.

import React, { useEffect, useState } from 'react';
import Box        from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid       from '@mui/material/Grid';
import FinanceiroService from '../../services/FinanceiroService';
import FinanceiroUtils from '../../utils/financeiro';
import ListaComprasService from '../../services/ListaComprasService';
import { money } from './constants';

const BigCard = ({ label, sub, icon, accent, bg, onClick, delay = 0 }) => (
  <Box
    onClick={onClick}
    sx={{
      borderRadius: '18px',
      background: bg,
      p: 1.8,
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
      minHeight: 110,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxShadow: `0 4px 20px ${accent}22`,
      border: `1px solid ${accent}18`,
      animation: `cardPop 0.45s ease ${delay}ms both`,
      '@keyframes cardPop': {
        '0%': { opacity: 0, transform: 'scale(0.9) translateY(6px)' },
        '100%': { opacity: 1, transform: 'scale(1) translateY(0)' },
      },
      transition: 'transform 0.18s ease, box-shadow 0.18s ease',
      WebkitTapHighlightColor: 'transparent',
      userSelect: 'none',
      '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: `0 10px 32px ${accent}35`,
      },
      '&:active': { transform: 'scale(0.96)' },
    }}
  >
    {/* Ícone decorativo grande */}
    <Box sx={{
      position: 'absolute', right: -8, bottom: -8,
      fontSize: '4rem', lineHeight: 1, opacity: 0.18,
      pointerEvents: 'none',
      filter: 'saturate(0.6)',
    }}>
      {icon}
    </Box>

    <Box>
      <Typography sx={{
        fontWeight: 900, fontSize: '1rem', color: '#fff',
        lineHeight: 1.2, mb: 0.3,
        textShadow: '0 1px 4px rgba(0,0,0,0.2)',
      }}>
        {label}
      </Typography>
    </Box>

    <Box>
      <Typography sx={{
        fontSize: '0.72rem', color: 'rgba(255,255,255,0.82)',
        fontWeight: 600, lineHeight: 1.3,
      }}>
        {sub}
      </Typography>
    </Box>
  </Box>
);

const QuickMenuCards = ({ setRoute }) => {
  const [totalAcordos, setTotalAcordos]   = useState(null);
  const [qtdListas,    setQtdListas]      = useState(null);
  const [qtdContas,    setQtdContas]      = useState(null);

  useEffect(() => {
    const carregar = async () => {
      try {
        const [acordos, listas, alertas] = await Promise.all([
          FinanceiroService.carregarAcordos(),
          ListaComprasService.carregarListas(),
          FinanceiroService.alertasDeVencimento(7),
        ]);

        // Valor realmente devido até o mês atual (inclui parcelas atrasadas).
        const ativos = acordos.filter(a => a.situacao === 'acordo');
        const sum = ativos.reduce(
          (s, a) => s + FinanceiroUtils.valorDevidoNoMes(a, new Date()), 0,
        );
        setTotalAcordos(sum);

        // Listas abertas
        const abertas = listas.filter(l => l.status === 'aberta');
        setQtdListas(abertas.length);

        // Contas próximas
        setQtdContas(alertas.length);
      } catch (e) {
        // silencia erros
      }
    };
    carregar();
  }, []);

  const CARDS = [
    {
      label: 'Meus Acordos',
      sub: totalAcordos != null
        ? (totalAcordos > 0 ? `Devido ${money(totalAcordos)}` : 'Tudo em dia')
        : 'Carregando...',
      icon: '🤝',
      accent: '#6D28D9',
      bg: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 100%)',
      route: 'acordos',
      delay: 0,
    },
    {
      label: 'Listas de Compras',
      sub: qtdListas != null
        ? (qtdListas > 0 ? `${qtdListas} lista${qtdListas !== 1 ? 's' : ''} ativa${qtdListas !== 1 ? 's' : ''}` : 'Nenhuma aberta')
        : 'Carregando...',
      icon: '🛒',
      accent: '#0E7490',
      bg: 'linear-gradient(135deg, #0E7490 0%, #0891B2 100%)',
      route: 'lista',
      delay: 60,
    },
    {
      label: 'Relatório de Gastos',
      sub: 'Ver evolução',
      icon: '📊',
      accent: '#065F46',
      bg: 'linear-gradient(135deg, #065F46 0%, #047857 100%)',
      route: 'relatorio',
      delay: 120,
    },
    {
      label: 'Contas a Pagar',
      sub: qtdContas != null
        ? (qtdContas > 0 ? `${qtdContas} conta${qtdContas !== 1 ? 's' : ''} próxima${qtdContas !== 1 ? 's' : ''}` : 'Tudo em dia ✓')
        : 'Carregando...',
      icon: '💳',
      accent: '#9D174D',
      bg: 'linear-gradient(135deg, #9D174D 0%, #BE185D 100%)',
      route: 'gastos',
      delay: 180,
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography sx={{
          fontSize: '0.62rem', fontWeight: 800, color: 'text.secondary',
          letterSpacing: '1px', textTransform: 'uppercase',
        }}>
          Acesso Rápido
        </Typography>
        <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
      </Box>

      <Grid container spacing={1.2}>
        {CARDS.map(card => (
          <Grid item xs={6} key={card.route + card.label}>
            <BigCard
              label={card.label}
              sub={card.sub}
              icon={card.icon}
              accent={card.accent}
              bg={card.bg}
              onClick={() => setRoute(card.route)}
              delay={card.delay}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default QuickMenuCards;
