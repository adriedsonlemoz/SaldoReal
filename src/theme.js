import { createTheme } from '@mui/material/styles';

const PURPLE = '#7B2CBF';
const VIOLET = '#9D4EDD';
const PINK   = '#F72585';
const BG     = '#F6F3FA';
const PAPER  = '#FFFFFF';

const theme = createTheme({
  palette: {
    mode: 'light',
    background: { default: BG, paper: PAPER },
    primary:   { main: PURPLE, light: VIOLET, dark: '#5A189A', contrastText: '#fff' },
    secondary: { main: PINK, light: '#FF6BA8', dark: '#C1006A', contrastText: '#fff' },
    info:      { main: '#6D5BD0', light: '#8B7BE0', dark: '#4F46A5', contrastText: '#fff' },
    success:   { main: '#119C72', dark: '#087A58', contrastText: '#fff' },
    warning:   { main: '#D58A16', dark: '#A86608', contrastText: '#fff' },
    error:     { main: '#E54862', dark: '#BC2941', contrastText: '#fff' },
    text: { primary: '#241A31', secondary: '#756C80', disabled: '#B7AFBF' },
    divider: '#EAE4F0',
  },
  typography: {
    fontFamily: `"Nunito", "Segoe UI", sans-serif`,
    htmlFontSize: 16,
    body1: { fontSize: '0.94rem' },
    body2: { fontSize: '0.82rem' },
    button: { textTransform: 'none', fontWeight: 800, fontSize: '0.9rem' },
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
      `,
    },
    MuiCard: { styleOverrides: { root: {
      borderRadius: 18, boxShadow: '0 6px 24px rgba(45,11,94,0.06)',
      border: '1px solid rgba(80,55,100,0.07)', backgroundImage: 'none',
    } } },
    MuiButton: { styleOverrides: {
      root: {
        minHeight: 40, borderRadius: 12, fontWeight: 800, textTransform: 'none', boxShadow: 'none',
        fontSize: '0.9rem', transition: 'transform .15s ease, box-shadow .15s ease, background-color .15s ease',
        '&:active': { transform: 'scale(.98)' },
      },
      contained: {
        '&.MuiButton-containedPrimary': {
          background: `linear-gradient(135deg, ${PURPLE} 0%, ${VIOLET} 100%)`,
          boxShadow: '0 6px 18px rgba(123,44,191,.22)',
          '&:hover': { boxShadow: '0 8px 22px rgba(123,44,191,.30)' },
        },
        '&.MuiButton-containedSecondary': {
          background: `linear-gradient(135deg, ${PINK} 0%, #D932B3 100%)`,
          boxShadow: '0 6px 18px rgba(247,37,133,.20)',
        },
      },
      outlined: { borderWidth: '1.5px', '&:hover': { borderWidth: '1.5px' } },
    } },
    MuiFab: { styleOverrides: { root: {
      background: `linear-gradient(135deg, ${PURPLE} 0%, ${PINK} 100%)`, color: '#fff',
      boxShadow: '0 8px 26px rgba(123,44,191,.34)',
    } } },
    MuiAppBar: { styleOverrides: { root: { background: PAPER, boxShadow: '0 1px 0 #EAE4F0' } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 10, fontWeight: 800, fontSize: '.72rem', minHeight: 26 } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 22, boxShadow: '0 24px 70px rgba(45,11,94,.18)' } } },
    MuiTextField: { styleOverrides: { root: {
      '& .MuiOutlinedInput-root': {
        minHeight: 52, borderRadius: 14, fontSize: '1rem', background: PAPER,
        '& fieldset': { borderColor: '#DED6E7' },
        '&:hover fieldset': { borderColor: '#A98CC2' },
        '&.Mui-focused fieldset': { borderColor: PURPLE, borderWidth: 2 },
      },
      '& .MuiInputLabel-root.Mui-focused': { color: PURPLE },
      '& .MuiFormHelperText-root': { fontSize: '.72rem', marginLeft: 4 },
    } } },
    MuiLinearProgress: { styleOverrides: { root: { borderRadius: 999, backgroundColor: '#ECE7F2' }, bar: { borderRadius: 999 } } },
    MuiTypography: { styleOverrides: { root: { lineHeight: 1.4 } } },
  },
});
export default theme;
