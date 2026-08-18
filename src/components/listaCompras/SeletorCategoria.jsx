// src/components/listaCompras/SeletorCategoria.jsx

import React from 'react';
import Box        from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { CATEGORIAS } from './constants';

/**
 * Barra horizontal de chips para selecionar categoria.
 * @param {string}   value    - id da categoria activa
 * @param {Function} onChange - (id: string) => void
 */
const SeletorCategoria = ({ value, onChange }) => (
  <Box
    sx={{
      display: 'flex',
      gap: 0.8,
      overflowX: 'auto',
      pb: 0.5,
      '&::-webkit-scrollbar': { display: 'none' },
      scrollbarWidth: 'none',
    }}
  >
    {CATEGORIAS.map((cat) => {
      const ativo = value === cat.id;
      return (
        <Box
          key={cat.id}
          onClick={() => onChange(cat.id)}
          sx={{
            flexShrink: 0,
            px: 1.4,
            py: 0.7,
            borderRadius: '20px',
            cursor: 'pointer',
            border: '2px solid',
            borderColor: ativo ? cat.cor : '#E8E8E8',
            bgcolor: ativo ? `${cat.cor}18` : '#FAFAFA',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            transition: 'all .15s ease',
            userSelect: 'none',
            WebkitTapHighlightColor: 'transparent',
            '&:active': { transform: 'scale(0.92)' },
          }}
        >
          <Typography sx={{ fontSize: '0.9rem', lineHeight: 1 }}>
            {cat.emoji}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.7rem',
              fontWeight: 800,
              whiteSpace: 'nowrap',
              color: ativo ? cat.cor : '#6B7280',
            }}
          >
            {cat.label}
          </Typography>
        </Box>
      );
    })}
  </Box>
);

export default SeletorCategoria;
