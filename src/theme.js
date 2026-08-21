import { createTheme } from '@mui/material/styles';

const PURPLE = '#7B2CBF';
const VIOLET = '#9D4EDD';
const PINK   = '#F72585';
const BG     = '#F7F4FA';
const PAPER  = '#FFFFFF';

const theme = createTheme({
  palette: {
    mode: 'light',
    background: { default: BG, paper: PAPER },
    primary:   { main: PURPLE, light: VIOLET, dark: '#5A189A', contrastText: '#fff' },
    secondary: { main: PINK, light: '#FF6BA8', dark: '#C1006A', contrastText: '#fff' },
    info:      { main: '#6D5BD0', light: '#8B7BE0', dark: '#4F46A5', contrastText: '#fff' },
    success:   { main: '#119C72', dark: '#087A58', contrastText: '#fff' },
    warning:   { main: '#C47B12', dark: '#975B08', contrastText: '#fff' },
    error:     { main: '#E54862', dark: '#BC2941', contrastText: '#fff' },
    text: { primary: '#241A31', secondary: '#716779', disabled: '#AAA2B2' },
    divider: '#E9E2EF',
  },
  typography: {
    fontFamily: `"Nunito", "Segoe UI", sans-serif`,
    htmlFontSize: 16,
    h1: { fontSize: '1.75rem', lineHeight: 1.08, fontWeight: 900, letterSpacing: '-.8px' },
    h2: { fontSize: '1.18rem', lineHeight: 1.16, fontWeight: 900, letterSpacing: '-.35px' },
    h3: { fontSize: '1rem', lineHeight: 1.2, fontWeight: 900, letterSpacing: '-.2px' },
    body1: { fontSize: '0.94rem', lineHeight: 1.45 },
    body2: { fontSize: '0.82rem', lineHeight: 1.42 },
    caption: { fontSize: '0.72rem', lineHeight: 1.35, fontWeight: 650 },
    button: { textTransform: 'none', fontWeight: 850, fontSize: '0.88rem' },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        html { font-size: 16px !important; -webkit-text-size-adjust: 100%; background: ${BG}; }
        body { background: ${BG}; color: #241A31; overscroll-behavior-y: none; }
        #root { min-height: 100dvh; }
        ::selection { background: rgba(123,44,191,.18); }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: #D8CFE2; border-radius: 999px; }
        :focus-visible { outline: 2px solid rgba(123,44,191,.55); outline-offset: 2px; }
      `,
    },
    MuiCard: { styleOverrides: { root: {
      borderRadius: 18,
      boxShadow: '0 8px 26px rgba(45,11,94,0.06)',
      border: '1px solid rgba(72,45,91,0.08)',
      backgroundImage: 'none',
    } } },
    MuiPaper: { styleOverrides: { rounded: { borderRadius: 18 } } },
    MuiButton: { styleOverrides: {
      root: {
        minHeight: 44, borderRadius: 13, fontWeight: 850, textTransform: 'none', boxShadow: 'none',
        fontSize: '0.88rem', transition: 'transform .15s ease, box-shadow .15s ease, background-color .15s ease',
        '&:active': { transform: 'scale(.98)' },
      },
      contained: {
        '&.MuiButton-containedPrimary': {
          background: `linear-gradient(135deg, ${PURPLE} 0%, ${VIOLET} 100%)`,
          color: '#fff',
          boxShadow: '0 6px 18px rgba(123,44,191,.20)',
          '&:hover': { boxShadow: '0 8px 22px rgba(123,44,191,.27)' },
        },
        '&.MuiButton-containedSecondary': {
          background: `linear-gradient(135deg, ${PINK} 0%, #D932B3 100%)`,
          boxShadow: '0 6px 18px rgba(247,37,133,.18)',
        },
      },
      outlined: { borderWidth: '1.4px', '&:hover': { borderWidth: '1.4px' } },
    } },
    MuiFab: { styleOverrides: { root: {
      background: `linear-gradient(135deg, ${PURPLE} 0%, ${PINK} 100%)`, color: '#fff',
      boxShadow: '0 8px 24px rgba(123,44,191,.30)',
    } } },
    MuiAppBar: { styleOverrides: { root: { background: PAPER, boxShadow: '0 1px 0 #E9E2EF' } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 10, fontWeight: 800, fontSize: '.72rem', minHeight: 28 } } },
    MuiDialog: { styleOverrides: {
      paper: { borderRadius: 22, boxShadow: '0 24px 70px rgba(45,11,94,.18)', maxHeight: 'min(75dvh, calc(100dvh - var(--app-safe-top) - var(--app-safe-bottom) - 24px))' },
      paperFullScreen: { borderRadius: 0, width: '100%', height: '100dvh', maxHeight: '100dvh', margin: 0 }
    } },
    MuiDialogContent: { styleOverrides: { root: { overscrollBehavior: 'contain' } } },
    MuiTextField: { styleOverrides: { root: {
      '& .MuiOutlinedInput-root': {
        minHeight: 52, borderRadius: 14, fontSize: '0.96rem', background: PAPER,
        '& fieldset': { borderColor: '#DED6E7' },
        '&:hover fieldset': { borderColor: '#A98CC2' },
        '&.Mui-focused fieldset': { borderColor: PURPLE, borderWidth: 2 },
      },
      '& .MuiInputLabel-root': { fontSize: '.92rem' },
      '& .MuiInputLabel-root.Mui-focused': { color: PURPLE },
      '& .MuiFormHelperText-root': { fontSize: '.72rem', marginLeft: 4 },
    } } },
    MuiLinearProgress: { styleOverrides: { root: { borderRadius: 999, backgroundColor: '#ECE7F2' }, bar: { borderRadius: 999 } } },
    MuiTypography: { styleOverrides: { root: { lineHeight: 1.4 } } },
  },
});
export default theme;
