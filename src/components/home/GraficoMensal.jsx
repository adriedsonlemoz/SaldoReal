// src/components/home/GraficoMensal.jsx — beta.6
// Distribuição das saídas do mês em formato horizontal, otimizado para celular.
// Usa exclusivamente o Razão financeiro efetivado.

import React, { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FinanceiroService from '../../services/FinanceiroService';
import { money } from './constants';

const ICONE_CAT = {
  Mercado: '🛒', Alimentação: '🍽️', Alimentacao: '🍽️', Transporte: '🚗',
  Saúde: '💊', Saude: '💊', Lazer: '🎬', Educação: '📚', Educacao: '📚',
  Casa: '🏠', Moradia: '🏠', Contas: '💡', Vestuário: '👗', Carnes: '🥩',
  'Acordos/Dívidas': '🤝', Outros: '📦',
};

const CORES = ['#7B2CBF', '#9D4EDD', '#C04CCF', '#F72585', '#6D5BD0'];

const GraficoMensal = () => {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const movimentacoes = await FinanceiroService.carregarMovimentacoes();
        const hoje = new Date();
        const mesAno = `${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`;
        const totais = {};
        movimentacoes.forEach(m => {
          if (m.tipo !== 'despesa' || m.mesFluxo !== mesAno) return;
          const categoria = m.categoria || 'Outros';
          totais[categoria] = (totais[categoria] || 0) + Number(m.valor || 0);
        });
        const lista = Object.entries(totais)
          .map(([categoria, total]) => ({ categoria, total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 5);
        if (ativo) setDados(lista);
      } catch {
        if (ativo) setDados([]);
      } finally {
        if (ativo) setLoading(false);
      }
    })();
    return () => { ativo = false; };
  }, []);

  const total = useMemo(() => dados.reduce((s, d) => s + d.total, 0), [dados]);
  const principal = dados[0] || null;

  return (
    <Box sx={{
      bgcolor: 'background.paper', borderRadius: '18px', border: '1px solid rgba(80,55,100,.07)',
      boxShadow: '0 5px 20px rgba(45,11,94,.055)', mb: 1.05, overflow: 'hidden',
    }}>
      <Box sx={{ px: 1.45, pt: 1.2, pb: .9, display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'flex-start' }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 900, fontSize: '.92rem', lineHeight: 1.15 }}>Para onde foi seu dinheiro</Typography>
          <Typography sx={{ fontSize: '.69rem', color: 'text.secondary', mt: .2, fontWeight: 600 }}>saídas pagas neste mês</Typography>
        </Box>
        {total > 0 && (
          <Box sx={{ px: 1, py: .45, borderRadius: '10px', bgcolor: 'rgba(123,44,191,.08)', border: '1px solid rgba(123,44,191,.14)', flexShrink: 0 }}>
            <Typography sx={{ fontSize: '.7rem', color: 'primary.main', fontWeight: 900 }}>{money(total)}</Typography>
          </Box>
        )}
      </Box>

      {loading ? (
        <Box sx={{ minHeight: 112, display: 'grid', placeItems: 'center' }}>
          <Typography sx={{ color: 'text.disabled', fontSize: '.78rem' }}>Carregando…</Typography>
        </Box>
      ) : !dados.length ? (
        <Box sx={{ minHeight: 112, px: 2, pb: 1.4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: .4 }}>
          <Typography sx={{ fontSize: '1.35rem' }}>📊</Typography>
          <Typography sx={{ fontSize: '.78rem', fontWeight: 800, color: 'text.secondary' }}>Nenhuma saída paga este mês</Typography>
          <Typography sx={{ fontSize: '.67rem', color: 'text.disabled', textAlign: 'center' }}>Quando você pagar uma conta ou compra, a distribuição aparece aqui.</Typography>
        </Box>
      ) : (
        <Box sx={{ px: 1.45, pb: 1.35 }}>
          {principal && (
            <Box sx={{ mb: 1.05, p: 1, borderRadius: '13px', background: 'linear-gradient(135deg, rgba(123,44,191,.08), rgba(247,37,133,.045))', border: '1px solid rgba(123,44,191,.11)', display: 'flex', alignItems: 'center', gap: .85 }}>
              <Box sx={{ width: 34, height: 34, borderRadius: '11px', bgcolor: 'rgba(123,44,191,.10)', display: 'grid', placeItems: 'center', fontSize: '1rem', flexShrink: 0 }}>
                {ICONE_CAT[principal.categoria] || '📦'}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: '.66rem', color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.5px' }}>Maior categoria</Typography>
                <Typography sx={{ fontSize: '.8rem', fontWeight: 900, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{principal.categoria}</Typography>
              </Box>
              <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                <Typography sx={{ fontSize: '.8rem', fontWeight: 900, color: 'primary.main' }}>{money(principal.total)}</Typography>
                <Typography sx={{ fontSize: '.65rem', color: 'text.secondary', fontWeight: 800 }}>{Math.round((principal.total / total) * 100)}% do total</Typography>
              </Box>
            </Box>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: .85 }}>
            {dados.map((d, i) => {
              const pct = total > 0 ? Math.max(2, (d.total / total) * 100) : 0;
              const cor = CORES[i % CORES.length];
              return (
                <Box key={d.categoria}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: .65, mb: .38 }}>
                    <Typography sx={{ fontSize: '.82rem', width: 18, lineHeight: 1 }}>{ICONE_CAT[d.categoria] || '📦'}</Typography>
                    <Typography sx={{ flex: 1, minWidth: 0, fontSize: '.7rem', fontWeight: 800, color: 'text.primary', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{d.categoria}</Typography>
                    <Typography sx={{ fontSize: '.68rem', fontWeight: 900, color: 'text.secondary' }}>{money(d.total)}</Typography>
                    <Typography sx={{ width: 30, textAlign: 'right', fontSize: '.66rem', fontWeight: 900, color }}>{Math.round((d.total / total) * 100)}%</Typography>
                  </Box>
                  <Box sx={{ ml: '25px', height: 7, borderRadius: 999, bgcolor: '#EFEAF4', overflow: 'hidden' }}>
                    <Box sx={{ height: '100%', width: `${pct}%`, borderRadius: 999, background: `linear-gradient(90deg, ${cor}, ${cor}B8)`, transition: 'width .6s ease' }} />
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default GraficoMensal;
