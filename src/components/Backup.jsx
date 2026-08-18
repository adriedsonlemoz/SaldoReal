import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import FinanceiroService from '../services/FinanceiroService';

const Backup = ({ setRoute }) => {
  const [backupCode,  setBackupCode]  = useState('');
  const [restoreCode, setRestoreCode] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const showToast  = (message, severity = 'success') => setToast({ open: true, message, severity });
  const closeToast = () => setToast({ ...toast, open: false });

  const handleGenerateBackup = async () => {
    try {
      const dados = await FinanceiroService.exportarTudo();

      const tabelas = dados.data || {};
      const totalRegistros = ['gastos', 'acordos', 'configuracoes', 'listas', 'itensLista']
        .reduce((total, nome) => total + (Array.isArray(tabelas[nome]) ? tabelas[nome].length : 0), 0);

      if (totalRegistros === 0)
        return showToast('Não há dados para salvar.', 'warning');

      // Base64 é apenas codificação para transporte/cópia; não é criptografia.
      const encodedBackup = btoa(encodeURIComponent(JSON.stringify(dados)));
      setBackupCode(encodedBackup);
      showToast('Código gerado com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao gerar o código. Os dados podem estar corrompidos.', 'error');
      console.error(error);
    }
  };

  const handleCopyBackup = () => {
    if (!backupCode) return showToast('Gere o backup primeiro!', 'warning');
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(backupCode)
        .then(() => showToast('Código copiado! Guarde em local seguro.', 'info'))
        .catch(() => showToast('Selecione o texto na caixa e copie manualmente.', 'warning'));
    } else {
      showToast('Selecione o texto abaixo e copie manualmente.', 'warning');
    }
  };

  const handleRestoreBackup = async () => {
    const codeLimpo = restoreCode.trim();
    if (!codeLimpo) return showToast('Cole o código primeiro!', 'warning');
    try {
      const decodedBackup = JSON.parse(decodeURIComponent(atob(codeLimpo)));
      if (decodedBackup && typeof decodedBackup === 'object' && !Array.isArray(decodedBackup)) {
        await FinanceiroService.importarTudo(decodedBackup);
      } else if (Array.isArray(decodedBackup)) {
        // formato legado: array de acordos
        await FinanceiroService.importarTudo({ acordos: decodedBackup });
      } else {
        throw new Error('Formato inválido.');
      }
      setRestoreCode('');
      showToast('Dados restaurados com sucesso! Recarregando...', 'success');
      setTimeout(() => window.location.reload(), 2000);
    } catch (e) {
      showToast('Erro! O código está incompleto, inválido ou incompatível com esta versão.', 'error');
      console.error(e);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', py: 2, px: 2 }}>
      <Snackbar open={toast.open} autoHideDuration={4000} onClose={closeToast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={toast.severity} variant="filled" sx={{ width: '100%', fontWeight: 600, borderRadius: '12px' }}>{toast.message}</Alert>
      </Snackbar>

      <Card sx={{ overflow: 'hidden', borderRadius: '18px' }}>
        <Box sx={{ bgcolor: 'primary.main', p: 1.5, textAlign: 'center' }}>
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>
            🛡️ Proteção de Dados — Backup
          </Typography>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* EXPORTAR */}
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: 'text.primary', mb: 0.5 }}>
            1. Criar cópia (exportar)
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', mb: 2.5, lineHeight: 1.5 }}>
            Gera um código com gastos, acordos, configurações, listas de compras e o Razão financeiro. Guarde em um local seguro.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button variant="contained" color="success" size="large" onClick={handleGenerateBackup} sx={{ flex: 1, fontWeight: 700, borderRadius: '12px' }}>
              Gerar código
            </Button>
            <Button variant="outlined" color="primary" size="large" onClick={handleCopyBackup} disabled={!backupCode} sx={{ fontWeight: 700, borderRadius: '12px' }}>
              Copiar
            </Button>
          </Box>

          {backupCode && (
            <TextField fullWidth multiline rows={4} value={backupCode}
              InputProps={{ readOnly: true }}
              sx={{ '& .MuiOutlinedInput-root': { fontFamily: 'monospace', fontSize: '0.72rem', color: 'text.secondary', borderRadius: '12px' } }}
            />
          )}

          <Divider sx={{ my: 3.5 }} />

          {/* IMPORTAR */}
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#EF4444', mb: 0.5 }}>
            2. Restaurar cópia (importar)
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', mb: 2.5, lineHeight: 1.5 }}>
            Cole o código gerado anteriormente.{' '}
            <strong style={{ color: '#EF4444' }}>Atenção:</strong> isso substituirá os dados atuais neste dispositivo.
          </Typography>

          <TextField fullWidth multiline rows={4}
            placeholder="Cole o código aqui..."
            value={restoreCode}
            onChange={e => setRestoreCode(e.target.value)}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { fontFamily: 'monospace', fontSize: '0.72rem', borderRadius: '12px' } }}
          />

          <Button fullWidth variant="contained" color="error" size="large" onClick={handleRestoreBackup}
            sx={{ fontWeight: 700, borderRadius: '12px' }}>
            Restaurar backup
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default Backup;
