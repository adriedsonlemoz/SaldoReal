import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { CATEGORIAS } from './constants';
import { getListCategoryIcon } from './categoryIcons';

const SeletorCategoria = ({ value, onChange }) => (
  <Box sx={{ display: 'flex', gap: .6, overflowX: 'auto', pb: .3, px: .05, scrollSnapType: 'x proximity', '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>
    {CATEGORIAS.map(cat => {
      const ativo = value === cat.id;
      const Icon = getListCategoryIcon(cat.id);
      return <Box key={cat.id} role="button" tabIndex={0} aria-pressed={ativo} onClick={() => onChange(cat.id)} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onChange(cat.id)} sx={{
        flexShrink: 0, minHeight: 42, px: .85, py: .5, borderRadius: '12px', cursor: 'pointer', scrollSnapAlign: 'start',
        border: `1.3px solid ${ativo ? '#7B2CBF' : 'rgba(72,45,91,.10)'}`, bgcolor: ativo ? 'rgba(123,44,191,.07)' : '#fff',
        display: 'flex', alignItems: 'center', gap: .45, boxShadow: ativo ? '0 3px 10px rgba(123,44,191,.07)' : 'none', userSelect: 'none', '&:active': { transform: 'scale(.97)' },
      }}>
        <Box sx={{ width: 25, height: 25, borderRadius: '8px', bgcolor: ativo ? 'rgba(123,44,191,.11)' : 'rgba(80,55,100,.045)', color: ativo ? 'primary.main' : 'text.secondary', display: 'grid', placeItems: 'center', position: 'relative' }}><Icon sx={{ fontSize: 15 }} />{ativo && <CheckRoundedIcon sx={{ position: 'absolute', fontSize: 9, right: -3, bottom: -3, bgcolor: 'primary.main', color: '#fff', borderRadius: '50%' }} />}</Box>
        <Typography sx={{ fontSize: '.68rem', fontWeight: 900, whiteSpace: 'nowrap', color: ativo ? 'primary.dark' : 'text.secondary' }}>{cat.label}</Typography>
      </Box>;
    })}
  </Box>
);
export default SeletorCategoria;
