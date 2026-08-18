// src/components/ErrorBoundary.jsx
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Box, Typography, Button, Paper, Stack } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../theme';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('💥 [ErrorBoundary] Erro crítico capturado:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleClearCache = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (_) {}
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100dvh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            p: 3,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              maxWidth: 400,
              width: '100%',
              p: 4,
              borderRadius: 4,
              textAlign: 'center',
              border: '1px solid',
              borderColor: 'error.light',
            }}
          >
            <Typography fontSize={64} lineHeight={1} mb={2}>💥</Typography>

            <Typography variant="h6" fontWeight={700} color="error.main" mb={1}>
              Algo deu errado
            </Typography>

            <Typography variant="body2" color="text.secondary" mb={3}>
              O aplicativo encontrou um erro inesperado. Tente reiniciar ou limpar o cache.
            </Typography>

            {this.state.error && (
              <Box
                sx={{
                  bgcolor: 'grey.100',
                  borderRadius: 2,
                  p: 1.5,
                  mb: 3,
                  textAlign: 'left',
                  overflowX: 'auto',
                }}
              >
                <Typography
                  variant="caption"
                  component="pre"
                  sx={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'error.dark', m: 0 }}
                >
                  {this.state.error.message}
                </Typography>
              </Box>
            )}

            <Stack spacing={1.5}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={this.handleReload}
              >
                🔄 Reiniciar
              </Button>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                onClick={this.handleClearCache}
              >
                🗑️ Limpar Cache e Reiniciar
              </Button>
            </Stack>
          </Paper>
        </Box>
      </ThemeProvider>
    );
  }
}

export default ErrorBoundary;
