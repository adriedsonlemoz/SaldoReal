// src/components/home/InsightStrip.jsx — REDESIGN
// Faixa insight com ícone em pill, texto limpo, dot animado de "ao vivo".

import React from 'react';
import Box        from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { insightColors } from './constants';

const InsightStrip = ({ insight }) => {
  if (!insight) return null;
  const c = insightColors[insight.tipo] || insightColors.info;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.2,
        px: 1.5,
        py: 1,
        mb: 1.5,
        bgcolor: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: '14px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.2s',
        '&:hover': { transform: 'translateX(2px)' },
      }}
    >
      {/* Pill emoji */}
      <Box sx={{
        flexShrink: 0,
        width: 32, height: 32,
        borderRadius: '10px',
        bgcolor: `${c.border}25`,
        border: `1px solid ${c.border}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.95rem',
      }}>
        {insight.emoji}
      </Box>

      <Typography sx={{
        fontSize: '0.76rem', fontWeight: 600, color: c.text,
        lineHeight: 1.45, flex: 1,
        overflow: 'hidden', display: '-webkit-box',
        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
      }}>
        {insight.texto}
      </Typography>

      {/* Dot pulsante */}
      <Box sx={{ flexShrink: 0, position: 'relative', width: 8, height: 8 }}>
        <Box sx={{
          width: 8, height: 8, borderRadius: '50%',
          bgcolor: c.border,
          position: 'absolute',
        }} />
        <Box sx={{
          width: 8, height: 8, borderRadius: '50%',
          bgcolor: c.border, opacity: 0.4,
          position: 'absolute',
          animation: 'pingDot 2s ease-in-out infinite',
          '@keyframes pingDot': {
            '0%': { transform: 'scale(1)', opacity: 0.4 },
            '70%': { transform: 'scale(2.2)', opacity: 0 },
            '100%': { transform: 'scale(1)', opacity: 0 },
          },
        }} />
      </Box>
    </Box>
  );
};

export default InsightStrip;
