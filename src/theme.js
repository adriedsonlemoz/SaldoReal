import { createTheme } from '@mui/material/styles';

const PURPLE = '#7B2CBF';
const PINK   = '#F72585';
const BLUE   = '#00B4D8';
const BG     = '#F5F5F5';
const WHITE  = '#FFFFFF';

const theme = createTheme({
  palette: {
    mode: 'light',
    background: { default: BG, paper: WHITE },
    primary:   { main: PURPLE, light: '#9D4EDD', dark: '#5A189A', contrastText: '#fff' },
    secondary: { main: PINK,   light: '#FF6BA8', dark: '#C1006A', contrastText: '#fff' },
    info:      { main: BLUE,   light: '#48CAE4', dark: '#0077B6', contrastText: '#fff' },
    success:   { main: '#06D6A0', contrastText: '#fff' },
    warning:   { main: '#FFB703', contrastText: '#fff' },
    error:     { main: '#EF233C', contrastText: '#fff' },
    text: {
      primary:   '#1A1A2E',
      secondary: '#6B7280',
      disabled:  '#C4C4C4',
    },
    divider: '#F0F0F0',
  },

  typography: {
    fontFamily: `"Nunito", "Segoe UI", sans-serif`,
    htmlFontSize: 16,
    button: { textTransform: 'none', fontWeight: 700, fontSize: '0.9rem' },
  },

  shape: { borderRadius: 14 },

  components: {
    MuiCssBaseline: {
      styleOverrides: `
        html { font-size: 16px !important; -webkit-text-size-adjust: 100%; }
        body { background: ${BG}; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #E0E0E0; border-radius: 4px; }
      `,
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.04)',
          backgroundImage: 'none',
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12, fontWeight: 700, textTransform: 'none',
          boxShadow: 'none', fontSize: '0.9rem',
          transition: 'all 0.18s ease',
          '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' },
          '&:active': { transform: 'scale(0.97)' },
        },
        contained: {
          '&.MuiButton-containedPrimary': {
            background: `linear-gradient(135deg, ${PURPLE} 0%, #9D4EDD 100%)`,
            boxShadow: `0 4px 14px rgba(123,44,191,0.3)`,
            '&:hover': { boxShadow: `0 6px 20px rgba(123,44,191,0.45)` },
          },
          '&.MuiButton-containedSecondary': {
            background: `linear-gradient(135deg, ${PINK} 0%, #FF6BA8 100%)`,
            boxShadow: `0 4px 14px rgba(247,37,133,0.3)`,
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': { borderWidth: '1.5px' },
        },
      },
    },

    MuiFab: {
      styleOverrides: {
        root: {
          background: `linear-gradient(135deg, ${PINK} 0%, #FF6BA8 100%)`,
          color: WHITE,
          boxShadow: `0 6px 24px rgba(247,37,133,0.4)`,
          '&:hover': { boxShadow: `0 8px 28px rgba(247,37,133,0.55)` },
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          background: WHITE,
          boxShadow: '0 1px 0 #F0F0F0',
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 700, fontSize: '0.75rem' },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12, fontSize: '1rem', background: WHITE,
            '& fieldset': { borderColor: '#E8E8E8' },
            '&:hover fieldset': { borderColor: PURPLE },
            '&.Mui-focused fieldset': { borderColor: PURPLE, borderWidth: 2 },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: PURPLE },
        },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 8, backgroundColor: '#EEE' },
        bar:  { borderRadius: 8 },
      },
    },

    MuiTypography: {
      styleOverrides: { root: { lineHeight: 1.5 } },
    },
  },
});

export default theme;
