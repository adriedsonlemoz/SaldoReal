// src/components/home/GraficoMensal.jsx — beta.4
// "Saídas do Mês" — usa exclusivamente o Razão financeiro efetivado.

import React, { useEffect, useState } from 'react';
import Box        from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FinanceiroService from '../../services/FinanceiroService';
import { money } from './constants';

const ICONE_CAT = {
  'Mercado':          '🛒',
  'Alimentação':      '🍽️',
  'Transporte':       '🚗',
  'Saúde':            '💊',
  'Lazer':            '🏖️',
  'Educação':         '📚',
  'Casa':             '🏠',
  'Vestuário':        '👗',
  'Carnes':           '🥩',
  'Acordos/Dívidas':  '🤝',
  'Outros':           '📦',
};

const CORES = ['#A855F7', '#EC4899', '#06B6D4', '#10B981', '#F59E0B'];

const BAR_MAX_H = 100; // px — altura máxima real da barra mais alta

const GraficoMensal = () => {
  const [dados,   setDados]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        const movimentacoes = await FinanceiroService.carregarMovimentacoes();
        const hoje = new Date();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const mesAnoTarget = `${mes}/${hoje.getFullYear()}`;

        const totais = {};
        movimentacoes.forEach(m => {
          if (m.tipo !== 'despesa' || m.mesFluxo !== mesAnoTarget) return;
          const cat = m.categoria || 'Outros';
          totais[cat] = (totais[cat] || 0) + Number(m.valor || 0);
        });

        const sorted = Object.entries(totais)
          .map(([categoria, total]) => ({ categoria, total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 5);

        const sum = sorted.reduce((s, d) => s + d.total, 0);
        setDados(sorted);
        setTotal(sum);
      } catch {
        setDados([]);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  const maxVal = dados.length > 0 ? Math.max(...dados.map(d => d.total)) : 1;

  return (
    <Box sx={{
      bgcolor: 'background.paper',
      borderRadius: '20px',
      border: '1px solid rgba(0,0,0,0.05)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
      mb: 1.5,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <Box sx={{ px: 2, pt: 1.8, pb: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: 'text.primary', lineHeight: 1.2 }}>
            Saídas do Mês
          </Typography>
          <Typography sx={{ fontSize: '0.63rem', color: 'text.secondary', fontWeight: 600, mt: 0.2 }}>
            fluxo real por categoria
          </Typography>
        </Box>
        {total > 0 && (
          <Box sx={{
            px: 1.2, py: 0.4, borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(168,85,247,0.12), rgba(236,72,153,0.08))',
            border: '1px solid rgba(168,85,247,0.2)',
          }}>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#A855F7' }}>
              {money(total)}
            </Typography>
          </Box>
        )}
      </Box>

      {loading ? (
        <Box sx={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography sx={{ color: 'text.disabled', fontSize: '0.8rem' }}>Carregando...</Typography>
        </Box>
      ) : dados.length === 0 ? (
        <Box sx={{ height: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
          <Typography sx={{ fontSize: '2rem' }}>📊</Typography>
          <Typography sx={{ color: 'text.disabled', fontSize: '0.78rem', fontWeight: 600 }}>
            Nenhuma saída paga este mês
          </Typography>
        </Box>
      ) : (
        <Box sx={{ px: 2, pt: 1.5, pb: 1.5 }}>

          {/* Área das barras — altura fixa = BAR_MAX_H + espaço para emoji + valor */}
          <Box sx={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-around',
            // Reserva: BAR_MAX_H px barra + ~20px emoji + ~16px valor = ~136px total
            height: (BAR_MAX_H + 50) + 'px',
            position: 'relative',
          }}>
            {dados.map((d, i) => {
              // Proporcional: barra mais alta ocupa BAR_MAX_H, demais são fração real
              const ratio  = d.total / maxVal;               // 0..1
              const hPx    = Math.max(8, Math.round(ratio * BAR_MAX_H)); // mín 8px
              const cor    = CORES[i % CORES.length];
              const pct    = Math.round(ratio * 100);

              return (
                <Box key={d.categoria} sx={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  flex: 1, mx: 0.3,
                  // Âncora no fundo: os elementos empilham de baixo pra cima
                  height: '100%', justifyContent: 'flex-end',
                }}>
                  {/* Valor monetário */}
                  <Typography sx={{
                    fontSize: '0.52rem', fontWeight: 800, color: cor,
                    mb: 0.2, lineHeight: 1, textAlign: 'center',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%',
                  }}>
                    {money(d.total)}
                  </Typography>

                  {/* Emoji */}
                  <Typography sx={{ fontSize: '0.95rem', lineHeight: 1, mb: 0.35 }}>
                    {ICONE_CAT[d.categoria] || '📦'}
                  </Typography>

                  {/* Barra — altura proporcional */}
                  <Box sx={{
                    width: '100%',
                    height: hPx + 'px',
                    borderRadius: '8px 8px 4px 4px',
                    background: `linear-gradient(180deg, ${cor} 0%, ${cor}88 100%)`,
                    boxShadow: `0 4px 12px ${cor}40`,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'height 0.7s cubic-bezier(.34,1.56,.64,1)',
                    animation: `barGrow${i} 0.65s cubic-bezier(.34,1.56,.64,1) ${i * 80}ms both`,
                    [`@keyframes barGrow${i}`]: {
                      '0%': { height: '4px', opacity: 0.3 },
                      '100%': { height: hPx + 'px', opacity: 1 },
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute', top: 0, left: 0, right: 0, height: '35%',
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.22), transparent)',
                      borderRadius: '8px 8px 0 0',
                    },
                  }} />

                  {/* % pequeno no fundo */}
                  <Typography sx={{
                    fontSize: '0.5rem', fontWeight: 700,
                    color: 'text.disabled', mt: 0.3, lineHeight: 1,
                  }}>
                    {pct}%
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* Labels de categoria */}
          <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 0.5 }}>
            {dados.map((d, i) => (
              <Box key={d.categoria} sx={{ flex: 1, textAlign: 'center', mx: 0.3 }}>
                <Typography sx={{
                  fontSize: '0.55rem', fontWeight: 700, color: 'text.secondary',
                  lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                }}>
                  {d.categoria}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Total */}
          <Box sx={{ mt: 1.2, pt: 1, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'center' }}>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: 'text.primary' }}>
              Total Gasto Mês:{' '}
              <Box component="span" sx={{ color: '#A855F7' }}>{money(total)}</Box>
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default GraficoMensal;
