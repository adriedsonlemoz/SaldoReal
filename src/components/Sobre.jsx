import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// ── LOG PERSISTENTE ──────────────────────────────────────────────────────────
const LOG_KEY  = 'saldoReal_ErrorLog';
const MAX_LOGS = 50;
const lerLogs   = () => { try { return JSON.parse(localStorage.getItem(LOG_KEY) || '[]'); } catch { return []; } };
const gravarLog = (entrada) => {
  try {
    const logs = lerLogs();
    logs.unshift(entrada);
    localStorage.setItem(LOG_KEY, JSON.stringify(logs.slice(0, MAX_LOGS)));
  } catch { /* localStorage cheio */ }
};

const Sobre = ({ setRoute }) => {
    const [toast, setToast]             = useState({ open: false, message: '', severity: 'success' });
  const [logErros, setLogErros]       = useState([]);

  const recarregarLogs = useCallback(() => setLogErros(lerLogs()), []);

  useEffect(() => {
    recarregarLogs();

    const onError = (msg, src, linha, col, erro) => {
      gravarLog({ tipo: 'JS_ERROR', data: new Date().toLocaleString('pt-BR'), mensagem: String(msg), fonte: src ? `${src.split('/').pop()}:${linha}:${col}` : 'desconhecido', stack: erro?.stack || null });
      recarregarLogs();
      return false;
    };
    const onUnhandled = (e) => {
      const erro = e.reason;
      gravarLog({ tipo: 'PROMISE_REJECTION', data: new Date().toLocaleString('pt-BR'), mensagem: erro?.message || String(erro) || 'Promise rejeitada', fonte: 'async/promise', stack: erro?.stack || null });
      recarregarLogs();
    };
    const onDexieError = (e) => {
      if (e.target instanceof IDBRequest || e.target instanceof IDBTransaction) {
        gravarLog({ tipo: 'DEXIE_ERROR', data: new Date().toLocaleString('pt-BR'), mensagem: e.target?.error?.message || 'Erro IndexedDB', fonte: 'IndexedDB/Dexie', stack: null });
        recarregarLogs();
      }
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandled);
    window.addEventListener('error', onDexieError, true);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandled);
      window.removeEventListener('error', onDexieError, true);
    };
  }, [recarregarLogs]);

  const showToast  = (message, severity = 'success') => setToast({ open: true, message, severity });
  const closeToast = () => setToast({ ...toast, open: false });

  const handleClearLog = () => { localStorage.removeItem(LOG_KEY); setLogErros([]); showToast('Log de diagnóstico limpo!', 'success'); };
  const handleCopyLog  = () => {
    if (logErros.length === 0) return showToast('Nenhum erro para copiar.', 'warning');
    const texto = logErros.map((e, i) =>
      `── ERRO ${i + 1} ──────────────\nTipo:    ${e.tipo}\nData:    ${e.data}\nMensagem: ${e.mensagem}\nFonte:   ${e.fonte || 'N/A'}\n${e.stack ? `Stack:\n${e.stack}\n` : ''}`
    ).join('\n');
    navigator.clipboard.writeText(texto)
      .then(() => showToast('📋 Log copiado!', 'success'))
      .catch(() => showToast('Erro ao copiar. Tente manualmente.', 'error'));
  };

  const changelog = [
    {
      v: 'beta.8.4',
      icon: '🤖',
      title: 'Android pronto para APIs 24 a 36',
      desc: 'Temas e barras do sistema foram separados por nível de API, mantendo compatibilidade a partir do Android 7 sem esconder erros do Android Lint.',
    },
    {
      v: 'beta.8.2',
      icon: '🚀',
      title: 'Preparação para publicação',
      desc: 'Camada Android atualizada para API 36, AAB de release, assinatura por secrets, privacidade no app, hardening, safe areas modernas e recuperação mais segura.',
    },
    {
      v: 'beta.7',
      icon: '✨',
      title: 'Polimento visual e consistência',
      desc: 'Home, Fluxo, lançamentos, compras, acordos e relatórios agora compartilham a mesma linguagem visual, com identidade roxa, cards mais leves, ícones consistentes, melhor tipografia, espaçamento e responsividade.',
    },
    {
      v: 'beta.6',
      icon: '🧩',
      title: 'Sincronização e experiência refinada',
      desc: 'Lista e Fluxo permanecem sincronizados ao remover itens pagos, edição pelo Fluxo foi corrigida, Home e perfil ganharam informações mais úteis, categorias podem ser criadas no lançamento e campos monetários ficaram mais fáceis no celular.',
    },
    {
      v: 'beta.5',
      icon: '✨',
      title: 'UI/UX e integração Android',
      desc: 'Interface responsiva refinada, identidade roxa padronizada, Lista de Compras mais legível e ícone oficial integrado ao Android com barras do sistema alinhadas ao tema.',
    },
    {
      v: 'beta.4',
      icon: '📒',
      title: 'Razão financeiro unificado',
      desc: 'Dinheiro efetivamente recebido ou pago agora passa por um único fluxo, com origem visível para lançamentos manuais, compras, acordos e renda.',
    },
    {
      v: 'beta.4',
      icon: '↩️',
      title: 'Estorno individual de acordos',
      desc: 'Cada pagamento tem identidade própria: é possível estornar uma parcela sem alterar as demais, preservando competência e histórico.',
    },
    {
      v: 'beta.3',
      icon: '🛒',
      title: 'Compras com fluxo financeiro imediato',
      desc: 'A Lista de Compras ganhou identidade própria. Cada item pago entra imediatamente no financeiro e finalizar ou reabrir a lista não duplica nem apaga o histórico.',
    },
    {
      v: 'beta.3',
      icon: '🤝',
      title: 'Acordos consolidados no fluxo',
      desc: 'Parcelas atrasadas acumulam corretamente e relatórios usam o valor realmente pago, inclusive múltiplos pagamentos no mesmo mês.',
    },
    {
      v: 'beta.2',
      icon: '📅',
      title: 'Vencimentos por data real',
      desc: 'Acordos respeitam o mês do primeiro vencimento, parcelas atrasadas são identificadas corretamente e dias 29/30/31 se ajustam aos meses curtos.',
    },
    {
      v: 'beta.2',
      icon: '🛡️',
      title: 'Backup completo e restauração segura',
      desc: 'O backup agora inclui gastos, acordos, configurações, listas e itens. A restauração usa uma única transação para evitar dados pela metade.',
    },
    {
      v: 'beta.2',
      icon: '💰',
      title: 'Saldo mais claro',
      desc: 'A tela inicial separa saldo disponível, pendências e saldo projetado, evitando contar a renda mensal duas vezes.',
    },
    {
      v: 'beta.2',
      icon: '🛒',
      title: 'Lista de compras consolidada',
      desc: 'Uma única regra de negócio controla listas e itens, com proteção contra lançamentos duplicados ao concluir uma compra.',
    },
    {
      v: 'beta.1',
      icon: '🤝',
      title: 'Finanças, acordos e compras',
      desc: 'Base do SaldoReal com lançamentos, acordos parcelados, relatórios, alertas, lista de compras e funcionamento offline.',
    },
  ];

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', pb: 4, pt: 2, px: { xs: 2, sm: 0 } }}>
      <Box sx={{ mb: 2 }}>
        <Button variant="outlined" onClick={() => setRoute('home')} sx={{ fontWeight: 700 }}>
          ← Voltar
        </Button>
      </Box>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={closeToast} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} sx={{ mt: 7 }}>
        <Alert onClose={closeToast} severity={toast.severity} variant="filled" sx={{ width: '100%', fontWeight: 'bold' }}>{toast.message}</Alert>
      </Snackbar>

      {/* Cabeçalho do app */}
      <Card sx={{ mb: 3, overflow: 'hidden' }}>
        <Box sx={{ background: 'linear-gradient(135deg, #2D0B5E 0%, #7B2CBF 58%, #F72585 100%)', p: 3, textAlign: 'center' }}>
          <Box component="img" src="/saldoreal-icon.png" alt="SaldoReal" sx={{ width: 70, height: 70, borderRadius: '20px', objectFit: 'cover', mb: 1, boxShadow: '0 10px 24px rgba(20,4,42,.22)' }} />
          <Typography sx={{ fontWeight: 900, color: '#fff', fontSize: '1.45rem' }}>SaldoReal</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', mt: 0.3 }}>Seu assistente pessoal de compras e gastos</Typography>
        </Box>
        <Box sx={{ p: 2.5, textAlign: 'center' }}>
          <Chip label="Beta 8.4" sx={{ bgcolor: 'rgba(123,44,191,0.10)', color: '#6A23A7', border: '1px solid rgba(123,44,191,0.20)', fontWeight: 700, mb: 1.5 }} />
          <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', lineHeight: 1.6 }}>
            Um app simples e poderoso para você organizar dívidas, controlar gastos, acompanhar entradas e sair no azul todo mês. Tudo salvo no seu dispositivo, sem precisar de internet.
          </Typography>
        </Box>
      </Card>

      {/* Changelog */}
      <Card sx={{ mb: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>📋 O que há de novo</Typography>
        </Box>
        <Box sx={{ p: 2 }}>
          <List disablePadding>
            {changelog.map((item, idx) => (
              <React.Fragment key={idx}>
                <ListItem sx={{ alignItems: 'flex-start', px: 0, pb: 2 }}>
                  <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                    <Typography sx={{ fontSize: '1.4rem' }}>{item.icon}</Typography>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Chip label={item.v} size="small" sx={{ bgcolor: 'rgba(123,44,191,0.10)', color: '#6A23A7', border: '1px solid rgba(123,44,191,0.20)', fontWeight: 700, height: 20, fontSize: '0.65rem' }} />
                        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: 'text.primary' }}>{item.title}</Typography>
                      </Box>
                    }
                    secondary={
                      <Typography component="span" sx={{ fontSize: '0.8rem', color: 'text.secondary', lineHeight: 1.5 }}>
                        {item.desc}
                      </Typography>
                    }
                  />
                </ListItem>
                {idx < changelog.length - 1 && <Divider sx={{ mb: 2 }} />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Card>

      {/* Console de Diagnóstico */}
      <Card sx={{ mb: 3, overflow: 'hidden', border: '1.5px solid #FCA5A5' }}>
        <Box sx={{ bgcolor: '#FEF2F2', borderBottom: '1px solid #FCA5A5', p: 1.5, px: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#991B1B' }}>⚠️ Console de Diagnóstico</Typography>
          <Chip
            label={`${logErros.length} evento${logErros.length !== 1 ? 's' : ''}`}
            size="small"
            sx={{ bgcolor: logErros.length === 0 ? '#F0FDF4' : '#FEF2F2', color: logErros.length === 0 ? '#166534' : '#991B1B', fontWeight: 700, fontSize: '0.7rem' }}
          />
        </Box>
        <Box sx={{ p: 2, bgcolor: '#0F172A', minHeight: '80px' }}>
          {logErros.length === 0 ? (
            <Typography sx={{ color: '#22C55E', fontFamily: 'monospace', fontSize: '0.82rem', textAlign: 'center', py: 1.5 }}>
              ✔ Sistema estável. Nenhum erro registrado.
            </Typography>
          ) : (
            <>
              <Box sx={{ maxHeight: '240px', overflowY: 'auto', mb: 2 }}>
                {logErros.map((erro, index) => (
                  <Box key={index} sx={{ mb: 1.5, pb: 1.5, borderBottom: '1px solid #1E293B' }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5, flexWrap: 'wrap' }}>
                      <Chip label={erro.tipo || 'ERRO'} size="small" sx={{ bgcolor: '#1E293B', color: '#F59E0B', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.6rem', height: 18 }} />
                      <Typography sx={{ color: '#64748B', fontFamily: 'monospace', fontSize: '0.65rem' }}>{erro.data}</Typography>
                      {erro.fonte && <Typography sx={{ color: '#F59E0B', fontFamily: 'monospace', fontSize: '0.65rem' }}>@ {erro.fonte}</Typography>}
                    </Box>
                    <Typography sx={{ color: '#F87171', fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 600, wordBreak: 'break-all' }}>{erro.mensagem}</Typography>
                    {erro.stack && <Typography sx={{ color: '#475569', fontFamily: 'monospace', fontSize: '0.65rem', mt: 0.5, wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>{erro.stack.substring(0, 200)}{erro.stack.length > 200 ? '…' : ''}</Typography>}
                  </Box>
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="contained" size="small" onClick={handleCopyLog} sx={{ flex: 1, fontWeight: 700, fontFamily: 'monospace', fontSize: '0.75rem', bgcolor: '#7B2CBF' }}>
                  📋 Copiar log
                </Button>
                <Button variant="outlined" size="small" onClick={handleClearLog} sx={{ flex: 1, fontWeight: 700, fontFamily: 'monospace', fontSize: '0.75rem', color: '#EF4444', borderColor: '#EF4444' }}>
                  🗑️ Limpar
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Card>

      {/* Dados e privacidade */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <Card sx={{ height: '100%', cursor: 'pointer', transition: 'all .15s', '&:active': { transform: 'scale(.97)' } }} onClick={() => setRoute('backup')}>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '1.6rem', mb: .5 }}>🛡️</Typography>
              <Typography sx={{ color: '#6A23A7', fontWeight: 800, fontSize: '.86rem' }}>Backup e dados</Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card sx={{ height: '100%', cursor: 'pointer', transition: 'all .15s', '&:active': { transform: 'scale(.97)' } }} onClick={() => setRoute('privacidade')}>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '1.6rem', mb: .5 }}>🔐</Typography>
              <Typography sx={{ color: '#6A23A7', fontWeight: 800, fontSize: '.86rem' }}>Privacidade</Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ p: 2, bgcolor: '#F8FAFC', border: '1.5px dashed #CBD5E1', borderRadius: '12px', textAlign: 'center' }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: 'text.primary', mb: 0.5 }}>
          Desenvolvimento Independente
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem', lineHeight: 1.5 }}>
          Este app não tem vínculo com o Serasa, SPC ou qualquer banco. Todos os dados ficam salvos localmente no seu dispositivo.
        </Typography>
      </Box>
    </Box>
  );
};

export default Sobre;
