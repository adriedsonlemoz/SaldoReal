import React, { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FinanceiroService from '../../services/FinanceiroService';
import CategoryIcon, { categoriaMeta } from '../../ui/categoryIcons';
import { money } from './constants';

const SHADES = ['#7B2CBF', '#9150C7', '#A563CE', '#BA79D5', '#C98CDC'];

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
        const lista = Object.entries(totais).map(([categoria, total]) => ({ categoria, total })).sort((a, b) => b.total - a.total).slice(0, 5);
        if (ativo) setDados(lista);
      } catch { if (ativo) setDados([]); }
      finally { if (ativo) setLoading(false); }
    })();
    return () => { ativo = false; };
  }, []);

  const total = useMemo(() => dados.reduce((s, d) => s + d.total, 0), [dados]);
  const principal = dados[0] || null;

  return (
    <Box sx={{ bgcolor: 'background.paper', borderRadius: '18px', border: '1px solid rgba(72,45,91,.075)', boxShadow: '0 5px 20px rgba(45,11,94,.045)', mb: .9, overflow: 'hidden' }}>
      <Box sx={{ px: 1.3, pt: 1.05, pb: .75, display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'center' }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 900, fontSize: '.88rem', lineHeight: 1.15 }}>Despesas por categoria</Typography>
          <Typography sx={{ fontSize: '.65rem', color: 'text.secondary', mt: .12, fontWeight: 650 }}>o que mais pesou no mês</Typography>
        </Box>
        {total > 0 && <Typography sx={{ px: .8, py: .35, borderRadius: 999, bgcolor: 'rgba(123,44,191,.07)', color: 'primary.main', fontSize: '.67rem', fontWeight: 900, flexShrink: 0 }}>{money(total)}</Typography>}
      </Box>

      {loading ? (
        <Box sx={{ minHeight: 104, display: 'grid', placeItems: 'center' }}><Typography sx={{ color: 'text.disabled', fontSize: '.76rem' }}>Carregando…</Typography></Box>
      ) : !dados.length ? (
        <Box sx={{ minHeight: 104, px: 1.7, pb: 1.25, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
          <Box><Box sx={{ mx: 'auto', width: 40, height: 40, borderRadius: '13px', bgcolor: 'rgba(123,44,191,.07)', display: 'grid', placeItems: 'center', mb: .55 }}><CategoryIcon categoria="Outros" size={21} /></Box><Typography sx={{ fontSize: '.74rem', fontWeight: 850, color: 'text.secondary' }}>Nenhuma saída paga este mês</Typography><Typography sx={{ fontSize: '.64rem', color: 'text.disabled', mt: .18 }}>O resumo aparece assim que houver movimentações.</Typography></Box>
        </Box>
      ) : (
        <Box sx={{ px: 1.3, pb: 1.15 }}>
          {principal && (() => {
            const meta = categoriaMeta(principal.categoria);
            return <Box sx={{ mb: .85, p: .82, borderRadius: '13px', bgcolor: 'rgba(123,44,191,.045)', border: '1px solid rgba(123,44,191,.085)', display: 'flex', alignItems: 'center', gap: .75 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '10px', bgcolor: `${meta.color}12`, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CategoryIcon categoria={principal.categoria} size={18} /></Box>
              <Box sx={{ flex: 1, minWidth: 0 }}><Typography sx={{ fontSize: '.61rem', color: 'text.secondary', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.4px' }}>Maior categoria</Typography><Typography sx={{ fontSize: '.76rem', fontWeight: 900, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{principal.categoria}</Typography></Box>
              <Box sx={{ textAlign: 'right' }}><Typography sx={{ fontSize: '.76rem', fontWeight: 900, color: 'primary.main' }}>{money(principal.total)}</Typography><Typography sx={{ fontSize: '.62rem', color: 'text.secondary', fontWeight: 800 }}>{Math.round((principal.total / total) * 100)}%</Typography></Box>
            </Box>;
          })()}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: .7 }}>
            {dados.map((d, i) => {
              const pct = total > 0 ? (d.total / total) * 100 : 0;
              const shade = SHADES[i % SHADES.length];
              return <Box key={d.categoria}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '22px minmax(0,1fr) auto', alignItems: 'center', gap: .55, mb: .3 }}>
                  <Box sx={{ width: 22, height: 22, borderRadius: '7px', bgcolor: `${shade}0C`, display: 'grid', placeItems: 'center' }}><CategoryIcon categoria={d.categoria} size={14} color={shade} /></Box>
                  <Typography sx={{ fontSize: '.67rem', fontWeight: 800, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{d.categoria}</Typography>
                  <Typography sx={{ fontSize: '.66rem', fontWeight: 900, color: 'text.secondary' }}>{money(d.total)} · {Math.round(pct)}%</Typography>
                </Box>
                <Box sx={{ ml: '27px', height: 7, borderRadius: 99, bgcolor: '#F0EBF4', overflow: 'hidden' }}><Box sx={{ width: `${Math.max(2, pct)}%`, height: '100%', borderRadius: 99, bgcolor: shade, transition: 'width .5s ease' }} /></Box>
              </Box>;
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default GraficoMensal;
