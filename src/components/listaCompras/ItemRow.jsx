import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { CAT_MAP, money } from './constants';

const ItemRow = ({ item, onPagar, onDesfazer, onRemove }) => {
  const cat = CAT_MAP[item.categoria] || CAT_MAP.Outros;
  const pago = item.status === 'comprado';
  const estimado = Number(item.valorTotal || 0);
  const valor = pago ? Number(item.valorTotalReal ?? estimado) : estimado;

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1.2, p: 1.35, mb: 1,
      borderRadius: '16px', bgcolor: 'background.paper', border: '1px solid',
      borderColor: pago ? 'rgba(13,148,136,.22)' : 'rgba(15,23,42,.08)',
      boxShadow: pago ? '0 5px 18px rgba(13,148,136,.06)' : '0 3px 14px rgba(15,23,42,.04)',
    }}>
      <Box sx={{
        width: 40, height: 40, borderRadius: '13px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        bgcolor: pago ? 'rgba(13,148,136,.10)' : `${cat.cor}12`, fontSize: '1.15rem',
      }}>
        {pago ? <CheckCircleRoundedIcon sx={{ color: '#087A58', fontSize: '1.25rem' }} /> : cat.emoji}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{
          fontWeight: 800, fontSize: '.88rem', color: 'text.primary',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2,
        }}>
          {item.nome}
        </Typography>
        <Typography sx={{ fontSize: '.72rem', color: 'text.secondary', mt: .35, fontWeight: 600 }}>
          {item.quantidade} {item.unidade || 'un'}
          {item.precoPorMedida > 0 ? ` · ${money(item.precoPorMedida)}/${item.unidade || 'un'}` : ''}
          {pago ? ' · lançado no financeiro' : ` · ${cat.label}`}
        </Typography>
      </Box>

      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
        <Typography sx={{ fontWeight: 900, fontSize: '.92rem', color: pago ? '#087A58' : 'text.primary' }}>
          {money(valor)}
        </Typography>
        {!pago ? (
          <Button
            size="small"
            variant="contained"
            onClick={() => onPagar(item)}
            startIcon={<PaymentsRoundedIcon sx={{ fontSize: '14px !important' }} />}
            sx={{
              mt: .45, minWidth: 68, minHeight: 40, px: 1.1, py: .35, borderRadius: '9px', fontSize: '.7rem',
              background: 'linear-gradient(135deg,#7B2CBF 0%,#9D4EDD 100%)',
              boxShadow: 'none', '&:hover': { boxShadow: 'none' },
            }}
          >
            Pagar
          </Button>
        ) : (
          <Button
            size="small"
            variant="text"
            onClick={() => onDesfazer(item)}
            startIcon={<UndoRoundedIcon sx={{ fontSize: '13px !important' }} />}
            sx={{ mt: .25, color: '#64748B', fontSize: '.7rem', minHeight: 40, px: .7, minWidth: 0 }}
          >
            Desfazer
          </Button>
        )}
      </Box>

      <IconButton
        size="small"
        onClick={() => onRemove(item)}
        aria-label={`Remover ${item.nome}`}
        sx={{ color: '#94A3B8', width: 40, height: 40, '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2' } }}
      >
        <DeleteOutlineIcon sx={{ fontSize: '1.05rem' }} />
      </IconButton>
    </Box>
  );
};

export default ItemRow;
