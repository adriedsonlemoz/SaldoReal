import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { CAT_MAP, money } from './constants';
import { getListCategoryIcon } from './categoryIcons';

const ItemRow = ({ item, onPagar, onDesfazer, onRemove }) => {
  const cat = CAT_MAP[item.categoria] || CAT_MAP.Outros;
  const Icon = getListCategoryIcon(item.categoria);
  const pago = item.status === 'comprado';
  const estimado = Number(item.valorTotal || 0);
  const valor = pago ? Number(item.valorTotalReal ?? estimado) : estimado;

  return (
    <Box sx={{ p: 1, mb: .75, borderRadius: '15px', bgcolor: 'background.paper', border: `1px solid ${pago ? 'rgba(17,156,114,.14)' : 'rgba(72,45,91,.08)'}`, boxShadow: '0 4px 14px rgba(45,11,94,.035)' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: '38px minmax(0,1fr) auto', gap: .8, alignItems: 'center' }}>
        <Box sx={{ width: 38, height: 38, borderRadius: '11px', display: 'grid', placeItems: 'center', bgcolor: pago ? 'rgba(17,156,114,.07)' : 'rgba(123,44,191,.055)', color: pago ? 'success.main' : 'primary.main' }}>{pago ? <CheckCircleRoundedIcon sx={{ fontSize: 19 }} /> : <Icon sx={{ fontSize: 19 }} />}</Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 900, fontSize: '.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.15 }}>{item.nome}</Typography>
          <Typography sx={{ fontSize: '.64rem', color: 'text.secondary', mt: .25, fontWeight: 650, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.quantidade} {item.unidade || 'un'}{item.precoPorMedida > 0 ? ` · ${money(item.precoPorMedida)}/${item.unidade || 'un'}` : ''}{pago ? ' · lançado no financeiro' : ` · ${cat.label}`}</Typography>
        </Box>
        <Typography sx={{ fontWeight: 900, fontSize: '.88rem', color: pago ? 'success.dark' : 'text.primary', whiteSpace: 'nowrap' }}>{money(valor)}</Typography>
      </Box>
      <Box sx={{ mt: .65, pt: .6, borderTop: '1px solid rgba(72,45,91,.05)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: .35 }}>
        {!pago ? <Button size="small" variant="contained" onClick={() => onPagar(item)} startIcon={<PaymentsRoundedIcon sx={{ fontSize: '15px !important' }} />} sx={{ minHeight: 36, px: 1, fontSize: '.66rem', boxShadow: 'none' }}>Pagar</Button>
          : <Button size="small" variant="text" onClick={() => onDesfazer(item)} startIcon={<UndoRoundedIcon sx={{ fontSize: '14px !important' }} />} sx={{ minHeight: 36, px: .7, fontSize: '.66rem', color: 'text.secondary' }}>Desfazer</Button>}
        <IconButton size="small" onClick={() => onRemove(item)} aria-label={`Remover ${item.nome}`} sx={{ width: 36, height: 36, color: 'text.disabled', '&:hover': { color: 'error.main', bgcolor: 'rgba(229,72,98,.06)' } }}><DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} /></IconButton>
      </Box>
    </Box>
  );
};

export default ItemRow;
