import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RestoreRoundedIcon from '@mui/icons-material/RestoreRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { money } from './constants';

const CardLista = ({ lista, onClick, onExcluir, onReabrir }) => {
  const aberta = lista.status === 'aberta';
  const pago = Number(lista.totalReal || 0);
  const planejado = Number(lista.totalEstimado || 0);
  const orcamento = Number(lista.orcamento || 0);
  const pctPago = orcamento > 0 ? Math.min(100, (pago / orcamento) * 100) : 0;
  const acima = orcamento > 0 && pago > orcamento;

  return (
    <Box
      role={aberta ? 'button' : undefined} tabIndex={aberta ? 0 : undefined}
      aria-label={aberta ? `Abrir lista ${lista.nome}` : undefined}
      onClick={aberta ? onClick : undefined}
      onKeyDown={aberta ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick() : undefined}
      sx={{
        p: 1.45, mb: 1, borderRadius: '18px', bgcolor: 'background.paper',
        border: '1px solid rgba(15,23,42,.07)', cursor: aberta ? 'pointer' : 'default',
        boxShadow: '0 5px 18px rgba(15,23,42,.045)', transition: 'all .16s',
        '&:active': aberta ? { transform: 'scale(.985)' } : undefined,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
        <Box sx={{
          width: 42, height: 42, borderRadius: '14px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
          background: aberta
            ? 'linear-gradient(135deg,rgba(123,44,191,.11),rgba(157,78,221,.10))'
            : 'rgba(100,116,139,.09)',
        }}>
          {aberta ? '🛒' : '✓'}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', gap: .7, alignItems: 'center' }}>
            <Typography sx={{ fontWeight: 900, fontSize: '.92rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {lista.nome}
            </Typography>
            <Box sx={{
              px: .7, py: .15, borderRadius: '7px', flexShrink: 0,
              bgcolor: aberta ? 'rgba(123,44,191,.09)' : 'rgba(100,116,139,.10)',
              color: aberta ? '#7B2CBF' : '#64748B', fontSize: '.68rem', fontWeight: 900,
            }}>
              {aberta ? 'EM ANDAMENTO' : 'FINALIZADA'}
            </Box>
          </Box>
          <Typography sx={{ fontSize: '.72rem', color: 'text.secondary', mt: .3, fontWeight: 600 }}>
            Planejado {money(planejado)} · Pago {money(pago)}
          </Typography>
        </Box>

        {aberta ? (
          <ChevronRightRoundedIcon sx={{ color: '#9D4EDD' }} />
        ) : (
          <Button
            size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); onReabrir(); }}
            startIcon={<RestoreRoundedIcon />}
            sx={{ color: '#7B2CBF', borderColor: 'rgba(123,44,191,.25)', fontSize: '.7rem', px: .9, minHeight: 40 }}
          >
            Reabrir
          </Button>
        )}

        <IconButton
          size="small" aria-label={`Excluir lista ${lista.nome}`}
          onClick={(e) => { e.stopPropagation(); onExcluir(); }}
          sx={{ color: '#94A3B8', width: 40, height: 40, '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2' } }}
        >
          <DeleteOutlineIcon sx={{ fontSize: '1rem' }} />
        </IconButton>
      </Box>

      {orcamento > 0 && (
        <Box sx={{ mt: 1.25 }}>
          <LinearProgress
            variant="determinate" value={pctPago}
            sx={{
              height: 5, bgcolor: '#F1F5F9',
              '& .MuiLinearProgress-bar': { bgcolor: acima ? '#E54862' : '#7B2CBF' },
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: .45 }}>
            <Typography sx={{ fontSize: '.68rem', color: 'text.secondary', fontWeight: 700 }}>
              {pctPago.toFixed(0)}% do orçamento pago
            </Typography>
            <Typography sx={{ fontSize: '.68rem', color: acima ? '#EF4444' : 'text.secondary', fontWeight: 800 }}>
              Limite {money(orcamento)}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CardLista;
