import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { CATEGORIAS } from './constants';

const SeletorCategoria = ({ value, onChange }) => (
  <Box sx={{
    display: 'flex', gap: .7, overflowX: 'auto', pb: .35, px: .1,
    scrollSnapType: 'x proximity', '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none',
  }}>
    {CATEGORIAS.map((cat) => {
      const ativo = value === cat.id;
      return (
        <Box key={cat.id} onClick={() => onChange(cat.id)} sx={{
          flexShrink: 0, minHeight: 38, px: 1.05, py: .55, borderRadius: '12px', cursor: 'pointer', scrollSnapAlign: 'start',
          border: '1.5px solid', borderColor: ativo ? '#7B2CBF' : '#E3DCE9',
          bgcolor: ativo ? 'rgba(123,44,191,.09)' : '#fff', display: 'flex', alignItems: 'center', gap: .55,
          boxShadow: ativo ? '0 4px 12px rgba(123,44,191,.08)' : 'none', userSelect: 'none', '&:active': { transform: 'scale(.97)' },
        }}>
          <Typography sx={{ fontSize: '.95rem', lineHeight: 1 }}>{cat.emoji}</Typography>
          <Typography sx={{ fontSize: '.72rem', fontWeight: 900, whiteSpace: 'nowrap', color: ativo ? '#6A23A7' : '#665D6E' }}>{cat.label}</Typography>
        </Box>
      );
    })}
  </Box>
);
export default SeletorCategoria;
