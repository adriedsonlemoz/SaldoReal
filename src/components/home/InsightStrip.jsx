import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import { insightColors } from './constants';

const icons = {
  sucesso: CheckCircleRoundedIcon,
  success: CheckCircleRoundedIcon,
  alerta: WarningAmberRoundedIcon,
  warning: WarningAmberRoundedIcon,
  economia: TrendingUpRoundedIcon,
  info: InfoRoundedIcon,
};

const InsightStrip = ({ insight }) => {
  if (!insight) return null;
  const c = insightColors[insight.tipo] || insightColors.info;
  const Icon = icons[insight.tipo] || InfoRoundedIcon;

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1,
      px: 1.2, py: .82, mb: 1,
      bgcolor: c.bg, border: `1px solid ${c.border}`,
      borderRadius: '14px', minHeight: 48,
    }}>
      <Box sx={{
        width: 32, height: 32, borderRadius: '10px', flexShrink: 0,
        bgcolor: 'rgba(255,255,255,.65)', display: 'grid', placeItems: 'center',
        color: c.text,
      }}>
        <Icon sx={{ fontSize: '1.08rem' }} />
      </Box>
      <Typography sx={{
        fontSize: '.76rem', fontWeight: 700, color: c.text,
        lineHeight: 1.4, flex: 1,
      }}>
        {insight.texto}
      </Typography>
    </Box>
  );
};

export default InsightStrip;
