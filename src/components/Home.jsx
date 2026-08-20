// src/components/Home.jsx — beta.8.2
// Navbar e modais Add/Config removidos daqui — vivem no App.jsx global.
// Home mantém apenas: TelaPerfil, modal de alertas, conteúdo do dashboard.

import React, { useState, useEffect, useMemo } from 'react';
import Box           from '@mui/material/Box';
import Typography    from '@mui/material/Typography';
import Button        from '@mui/material/Button';
import Chip          from '@mui/material/Chip';
import TextField     from '@mui/material/TextField';
import Dialog        from '@mui/material/Dialog';
import DialogTitle   from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Snackbar      from '@mui/material/Snackbar';
import Alert         from '@mui/material/Alert';
import Slide         from '@mui/material/Slide';
import Paper         from '@mui/material/Paper';
import Divider       from '@mui/material/Divider';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';

import FinanceiroService from '../services/FinanceiroService';
import FinanceiroUtils   from '../utils/financeiro';
import TelaOnboarding    from './home/TelaOnboarding';
import CardHero          from './home/CardHero';
import InsightStrip      from './home/InsightStrip';
import GraficoMensal     from './home/GraficoMensal';
import QuickMenuCards    from './home/QuickMenuCards';
import ResumoAtividadeMes from './home/ResumoAtividadeMes';
import { money, saudacao } from './home/constants';
import { parseMoedaInput, formatMoedaInput, propsInputMoeda } from '../utils/moedaInput';

// ─────────────────────────────────────────────────────────────────────────────
// Tela Perfil — Dialog fullscreen com Slide de baixo para cima
// ─────────────────────────────────────────────────────────────────────────────
const TelaPerfil = ({
  open, onClose, usuario, renda, diaPagamento: diaPagamentoProp, onSaved,
  saldoResumo = {}, totalMes = 0, percentual = 0, setRoute,
}) => {
  const [nome, setNome] = useState('');
  const [inputRenda, setInputRenda] = useState(0);
  const [diaPag, setDiaPag] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!open) return;
    setNome(usuario || '');
    setInputRenda(Number(renda || 0));
    setDiaPag(diaPagamentoProp ? String(diaPagamentoProp) : '');
  }, [open, usuario, renda, diaPagamentoProp]);

  const salvar = async () => {
    setSalvando(true);
    try {
      const nomeFinal = nome.trim() || usuario || 'Usuário';
      const val = Number(inputRenda || 0);
      const dia = parseInt(diaPag, 10);
      const diaValido = dia >= 1 && dia <= 31 ? dia : null;
      await Promise.all([
        FinanceiroService.setUsuario(nomeFinal),
        FinanceiroService.setRenda(val),
        FinanceiroService.setDiaPagamento(diaValido),
      ]);
      onSaved({ nome: nomeFinal, renda: val, diaPagamento: diaValido });
      onClose();
    } finally {
      setSalvando(false);
    }
  };

  const navegar = (rota) => {
    onClose();
    setRoute?.(rota);
  };

  const stats = [
    { label: 'Disponível', value: money(saldoResumo.saldoDisponivel || 0), Icon: AccountBalanceWalletRoundedIcon, color: '#6A23A7' },
    { label: 'Pago no mês', value: money(saldoResumo.despesasPagas || 0), Icon: CheckCircleRoundedIcon, color: '#087A58' },
    { label: 'Pendente', value: money(totalMes || 0), Icon: ScheduleRoundedIcon, color: '#C22578' },
  ];

  return (
    <Dialog open={open} onClose={onClose} fullScreen TransitionComponent={Slide}
      TransitionProps={{ direction: 'up' }} PaperProps={{ sx: { bgcolor: 'background.default' } }}>
      <Box sx={{
        px: { xs: 2, sm: 2.5 }, pt: '18px', pb: 2,
        background: 'linear-gradient(145deg,#1A0533 0%,#2D0B5E 55%,#6B1FA8 100%)', color: '#fff',
      }}>
        <Box sx={{ maxWidth: 500, mx: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1, minWidth: 0 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: '16px', bgcolor: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.16)', display: 'grid', placeItems: 'center' }}><PersonRoundedIcon sx={{ fontSize: 24 }} /></Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: '.65rem', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', opacity: .62 }}>Meu perfil financeiro</Typography>
                <Typography sx={{ fontWeight: 900, fontSize: '1.25rem', lineHeight: 1.15, mt: .15, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{usuario || 'Usuário'}</Typography>
                <Typography sx={{ fontSize: '.68rem', opacity: .72, mt: .15 }}>{Math.round(percentual || 0)}% da renda usada neste mês</Typography>
              </Box>
            </Box>
            <Box onClick={onClose} onKeyDown={e => e.key === 'Enter' && onClose()} role="button" tabIndex={0} aria-label="Fechar perfil" sx={{ width: 40, height: 40, borderRadius: '13px', bgcolor: 'rgba(255,255,255,.11)', display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}><CloseRoundedIcon sx={{ fontSize: 20 }} /></Box>
          </Box>
        </Box>
      </Box>

      <Box sx={{ width: '100%', maxWidth: 500, mx: 'auto', px: { xs: 1.5, sm: 2 }, py: 1.5, pb: 'calc(24px + var(--app-safe-bottom))' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: .7, mb: 1.35 }}>
          {stats.map(st => (
            <Paper key={st.label} elevation={0} sx={{ p: .9, borderRadius: '14px', border: '1px solid rgba(80,55,100,.08)', minWidth: 0 }}>
              <Box sx={{ width: 27, height: 27, borderRadius: '9px', bgcolor: `${st.color}10`, display: 'grid', placeItems: 'center' }}>{React.createElement(st.Icon, { sx: { fontSize: 16, color: st.color } })}</Box>
              <Typography sx={{ fontSize: '.65rem', color: 'text.secondary', fontWeight: 800, mt: .4 }}>{st.label}</Typography>
              <Typography sx={{ fontSize: '.76rem', color: st.color, fontWeight: 900, mt: .15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{st.value}</Typography>
            </Paper>
          ))}
        </Box>

        <Paper elevation={0} sx={{ p: 1.5, borderRadius: '18px', border: '1px solid rgba(80,55,100,.08)', mb: 1.2 }}>
          <Typography sx={{ fontWeight: 900, fontSize: '.88rem', mb: .2 }}>Dados principais</Typography>
          <Typography sx={{ fontSize: '.69rem', color: 'text.secondary', mb: 1.3 }}>Essas informações alimentam o saldo e a previsão de pagamento.</Typography>
          <TextField fullWidth label="Nome" value={nome} onChange={e => setNome(e.target.value.slice(0, 40))} sx={{ mb: 1.2 }} />
          <TextField fullWidth label="Renda mensal" value={formatMoedaInput(inputRenda, { comSimbolo: true })}
            onChange={e => setInputRenda(parseMoedaInput(e.target.value))} inputProps={propsInputMoeda} sx={{ mb: 1.2 }} />
          <TextField fullWidth label="Dia do recebimento (1–31)" value={diaPag}
            onChange={e => { const v = e.target.value.replace(/\D/g, ''); if (v === '' || Number(v) <= 31) setDiaPag(v); }}
            inputProps={{ inputMode: 'numeric', maxLength: 2 }} helperText="Usado na contagem do próximo pagamento" />
          <Button fullWidth variant="contained" disabled={salvando} onClick={salvar} sx={{ mt: 1.35, py: 1.15, borderRadius: '14px', fontWeight: 900 }}>
            {salvando ? 'Salvando…' : 'Salvar alterações'}
          </Button>
        </Paper>

        <Paper elevation={0} sx={{ p: 1.25, borderRadius: '18px', border: '1px solid rgba(80,55,100,.08)' }}>
          <Typography sx={{ fontWeight: 900, fontSize: '.82rem' }}>Atalhos úteis</Typography>
          <Typography sx={{ fontSize: '.67rem', color: 'text.secondary', mb: .9 }}>Acesse suas informações sem voltar para a Home.</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: .7 }}>
            {[
              ['gastos', ReceiptLongRoundedIcon, 'Fluxo'], ['relatorio', InsightsRoundedIcon, 'Relatório'], ['backup', ShieldRoundedIcon, 'Backup'],
            ].map(([rota, Icon, label]) => (
              <Button key={rota} variant="outlined" color="inherit" onClick={() => navegar(rota)} sx={{ minWidth: 0, py: .8, px: .5, borderColor: 'divider', color: 'text.primary', fontSize: '.69rem', flexDirection: 'column', gap: .15 }}>
                <Icon sx={{ fontSize: 18, color: 'primary.main' }} />{label}
              </Button>
            ))}
          </Box>
          <Divider sx={{ my: 1 }} />
          <Typography sx={{ fontSize: '.66rem', color: 'text.disabled', textAlign: 'center' }}>Os dados financeiros permanecem armazenados no dispositivo.</Typography>
        </Paper>
      </Box>
    </Dialog>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// HOME
// ─────────────────────────────────────────────────────────────────────────────
const Home = ({ setRoute }) => {
  const [carregando,     setCarregando]     = useState(true);
  const [usuario,        setUsuario]        = useState('');

  const [renda,          setRenda]          = useState(0);
  const [diaPagamento,   setDiaPagamento]   = useState(null);
  const [totalMes,       setTotalMes]       = useState(0);
  const [saldoResumo,    setSaldoResumo]    = useState({
    saldoDisponivel: 0, saldoProjetado: 0, despesasPagas: 0, receitaConsiderada: 0,
  });
  const [percentual,     setPercentual]     = useState(0);
  const [alertas,        setAlertas]        = useState([]);
  const [insight,        setInsight]        = useState(null);

  const [modalAlertas,   setModalAlertas]   = useState(false);
  const [telaPerfilOpen, setTelaPerfilOpen] = useState(false);
  const [toast,          setToast]          = useState({ open: false, msg: '', sev: 'success' });

  const alertasUrgentes = useMemo(() => alertas.filter(a => a.atrasado || a.diff <= 2), [alertas]);

  // Calcula o próximo pagamento com dia seguro (ex.: dia 31 em fevereiro).
  const diasParaPagamento = useMemo(() => {
    if (!diaPagamento) return null;
    const hoje = new Date();
    const proximo = FinanceiroUtils.proximoVencimentoMensal(diaPagamento, hoje);
    return FinanceiroUtils.diferencaDias(proximo, hoje);
  }, [diaPagamento]);

  useEffect(() => {
    (async () => {
      const [nome, rendaDB, diaDB] = await Promise.all([
        FinanceiroService.getUsuario(),
        FinanceiroService.getRenda(),
        FinanceiroService.getDiaPagamento(),
      ]);
      setUsuario(nome);
      setRenda(rendaDB);
      setDiaPagamento(diaDB);
      setCarregando(false);
    })();
  }, []);

  useEffect(() => {
    if (!usuario || carregando) return;
    const carregar = async () => {
      const [dashboard, pct, ins] = await Promise.all([
        FinanceiroService.dadosDashboard(),
        FinanceiroService.calcularPercentualGasto(),
        FinanceiroService.gerarInsight(),
      ]);
      setTotalMes(dashboard.debito);
      setSaldoResumo({
        saldoDisponivel: dashboard.saldoDisponivel,
        saldoProjetado: dashboard.saldoProjetado,
        despesasPagas: dashboard.despesasPagas,
        receitaConsiderada: dashboard.receitaConsiderada,
      });
      setAlertas(dashboard.alertas);
      setPercentual(pct);
      setInsight(ins);
    };
    carregar();
    const onFocus   = () => carregar();
    const onVisible = () => { if (document.visibilityState === 'visible') carregar(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onFocus);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onFocus);
    };
  }, [usuario, renda, carregando]);

  if (carregando) return (
    <Box sx={{ minHeight: 'calc(100dvh - 62px - var(--app-safe-bottom))', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
      <Box sx={{ textAlign: 'center' }}>
        <Box sx={{ width: 44, height: 44, mx: 'auto', mb: 1, borderRadius: '14px', bgcolor: 'rgba(123,44,191,.08)', color: 'primary.main', display: 'grid', placeItems: 'center' }}><AccountBalanceWalletRoundedIcon /></Box>
        <Typography sx={{ color: 'text.secondary', fontSize: '.8rem', fontWeight: 700 }}>Carregando…</Typography>
      </Box>
    </Box>
  );

  if (!usuario) return <TelaOnboarding onConcluir={async (nome) => {
    const [rendaDB, diaDB] = await Promise.all([
      FinanceiroService.getRenda(),
      FinanceiroService.getDiaPagamento(),
    ]);
    setRenda(rendaDB);
    setDiaPagamento(diaDB);
    setUsuario(nome);
  }} />;

  const primeiroNome = usuario.split(' ')[0];

  return (
    <Box sx={{ minHeight: 'calc(100dvh - 62px - var(--app-safe-bottom))', bgcolor: 'background.default' }}>
      <Snackbar open={toast.open} autoHideDuration={3000}
        onClose={() => setToast(t => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={toast.sev} variant="filled" sx={{ borderRadius: '12px', fontWeight: 700 }}>
          {toast.msg}
        </Alert>
      </Snackbar>

      <Box sx={{ px: { xs: 1.5, sm: 2 }, pt: { xs: 1.05, sm: 1.5 }, pb: .7, maxWidth: 480, margin: 'auto' }}>

        {/* ── CABEÇALHO ─────────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: .85, animation: 'fadeDown .3s ease both', '@keyframes fadeDown': { '0%': { opacity: 0, transform: 'translateY(-6px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } } }}>
          <Box sx={{ minWidth: 0, pr: .7 }}>
            <Typography sx={{ color: 'text.secondary', fontSize: '.72rem', fontWeight: 700, lineHeight: 1 }}>{saudacao()},</Typography>
            <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.28rem', sm: '1.4rem' }, color: 'text.primary', lineHeight: 1.12, letterSpacing: '-.55px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: { xs: 150, sm: 210 } }}>{primeiroNome}</Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: .45, alignItems: 'center' }}>
            {diasParaPagamento !== null && (() => {
              const urgente = diasParaPagamento <= 3;
              const quando = diasParaPagamento === 0 ? 'Hoje' : diasParaPagamento === 1 ? 'Amanhã' : `${diasParaPagamento} dias`;
              return <Box aria-label={`Próximo pagamento: ${quando}`} sx={{ height: 38, px: .7, borderRadius: '12px', bgcolor: urgente ? 'rgba(247,37,133,.07)' : 'rgba(123,44,191,.06)', border: `1px solid ${urgente ? 'rgba(247,37,133,.18)' : 'rgba(123,44,191,.13)'}`, display: 'flex', alignItems: 'center', gap: .45 }}>
                <CalendarMonthRoundedIcon sx={{ fontSize: 17, color: urgente ? 'secondary.main' : 'primary.main' }} />
                <Box sx={{ minWidth: 0 }}><Typography sx={{ display: { xs: 'none', sm: 'block' }, fontSize: '.58rem', lineHeight: 1, color: 'text.secondary', fontWeight: 850 }}>PRÓXIMO</Typography><Typography sx={{ fontSize: '.69rem', lineHeight: 1.05, color: urgente ? 'secondary.dark' : 'primary.dark', fontWeight: 900, whiteSpace: 'nowrap' }}>{quando}</Typography></Box>
              </Box>;
            })()}
            <Box role="button" tabIndex={0} aria-label="Abrir alertas" onClick={() => setModalAlertas(true)} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setModalAlertas(true)} sx={{ width: 38, height: 38, borderRadius: '12px', bgcolor: alertasUrgentes.length ? 'rgba(247,37,133,.07)' : 'rgba(123,44,191,.045)', border: `1px solid ${alertasUrgentes.length ? 'rgba(247,37,133,.18)' : 'rgba(123,44,191,.10)'}`, display: 'grid', placeItems: 'center', cursor: 'pointer', position: 'relative', color: alertasUrgentes.length ? 'secondary.main' : 'text.secondary', '&:active': { transform: 'scale(.92)' } }}>
              <NotificationsRoundedIcon sx={{ fontSize: 19 }} />
              {alertasUrgentes.length > 0 && <Box sx={{ position: 'absolute', top: -3, right: -3, minWidth: 16, height: 16, px: .25, borderRadius: 99, bgcolor: 'secondary.main', border: '2px solid #F7F4FA', color: '#fff', fontSize: '.58rem', fontWeight: 900, display: 'grid', placeItems: 'center' }}>{alertasUrgentes.length}</Box>}
            </Box>
            <Box role="button" tabIndex={0} aria-label="Abrir perfil" onClick={() => setTelaPerfilOpen(true)} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setTelaPerfilOpen(true)} sx={{ width: 38, height: 38, borderRadius: '12px', bgcolor: 'rgba(123,44,191,.07)', border: '1px solid rgba(123,44,191,.14)', color: 'primary.main', display: 'grid', placeItems: 'center', cursor: 'pointer', '&:active': { transform: 'scale(.92)' } }}><PersonRoundedIcon sx={{ fontSize: 20 }} /></Box>
          </Box>
        </Box>

        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <CardHero debito={totalMes} percentual={percentual} renda={renda} {...saldoResumo} />

        {/* ── INSIGHT ───────────────────────────────────────────────────── */}
        <InsightStrip insight={insight} />

        {/* ── GRÁFICO ───────────────────────────────────────────────────── */}
        <GraficoMensal />

        {/* ── CARDS 2x2 ─────────────────────────────────────────────────── */}
        <QuickMenuCards setRoute={setRoute} />

        <ResumoAtividadeMes
          saldoDisponivel={saldoResumo.saldoDisponivel}
          despesasPagas={saldoResumo.despesasPagas}
          percentual={percentual}
        />

        <Box role="button" tabIndex={0} aria-label="Ver próximos compromissos" onClick={() => setModalAlertas(true)} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setModalAlertas(true)} sx={{
          mt: .8, p: .9, borderRadius: '14px', bgcolor: 'background.paper',
          border: '1px solid rgba(80,55,100,.07)', boxShadow: '0 4px 14px rgba(45,11,94,.035)',
          cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: '.63rem', fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '.7px' }}>Próximos compromissos</Typography>
              <Typography sx={{ fontSize: '.73rem', fontWeight: 900, mt: .15 }}>
                {alertas.length ? `${alertas.length} conta${alertas.length !== 1 ? 's' : ''} para acompanhar` : 'Nenhuma conta próxima'}
              </Typography>
            </Box>
            <Typography sx={{ color: 'primary.main', fontSize: '.67rem', fontWeight: 900, flexShrink: 0 }}>{alertas.length ? 'Ver alertas ›' : 'Tudo em dia'}</Typography>
          </Box>
          {alertas.length > 0 && (
            <Box sx={{ display: 'flex', gap: .6, mt: .8, overflow: 'hidden' }}>
              {alertas.slice(0, 2).map((a, i) => (
                <Box key={`${a.nome}-${i}`} sx={{ flex: 1, minWidth: 0, px: .8, py: .65, borderRadius: '11px', bgcolor: a.atrasado ? 'rgba(229,72,98,.07)' : 'rgba(123,44,191,.055)', border: `1px solid ${a.atrasado ? 'rgba(229,72,98,.15)' : 'rgba(123,44,191,.11)'}` }}>
                  <Typography sx={{ fontSize: '.67rem', fontWeight: 900, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{a.nome}</Typography>
                  <Typography sx={{ fontSize: '.65rem', color: a.atrasado ? 'error.main' : 'text.secondary', mt: .15 }}>{a.atrasado ? `${Math.abs(a.diff)}d atrasada` : a.diff === 0 ? 'vence hoje' : `vence em ${a.diff}d`}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>

      </Box>

      {/* ════ MODAIS DA HOME ════ */}

      <TelaPerfil
        open={telaPerfilOpen}
        onClose={() => setTelaPerfilOpen(false)}
        usuario={usuario}
        renda={renda}
        diaPagamento={diaPagamento}
        saldoResumo={saldoResumo}
        totalMes={totalMes}
        percentual={percentual}
        setRoute={setRoute}
        onSaved={({ nome, renda: r, diaPagamento: dp }) => {
          if (nome) setUsuario(nome);
          setRenda(r);
          setDiaPagamento(dp);
          setToast({ open: true, msg: '✅ Perfil atualizado!', sev: 'success' });
        }}
      />

      <Dialog open={modalAlertas} onClose={() => setModalAlertas(false)} fullWidth maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: .7 }}><NotificationsRoundedIcon color="primary" /> Alertas de vencimento</DialogTitle>
        <DialogContent>
          {alertas.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>🟢</Typography>
              <Typography sx={{ fontWeight: 700, color: 'success.main' }}>Tudo em dia!</Typography>
            </Box>
          ) : alertas.map((a, i) => (
            <Box key={i} sx={{
              mb: 1.5, p: 1.5, borderRadius: '12px', border: '1.5px solid',
              borderColor: a.atrasado ? 'error.light' : a.diff <= 2 ? 'warning.light' : 'divider',
              bgcolor: a.atrasado ? '#FFF1F3' : a.diff <= 2 ? '#FFFBEB' : 'background.paper',
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Chip label={a.tipo === 'acordo' ? 'Acordo' : 'Gasto'} size="small" color={a.tipo === 'acordo' ? 'secondary' : 'secondary'} />
                  <Typography sx={{ fontWeight: 700, fontSize: '0.88rem' }}>{a.nome}</Typography>
                </Box>
                <Typography sx={{ fontWeight: 800, color: 'error.main', fontSize: '0.88rem' }}>{money(a.valor)}</Typography>
              </Box>
              <Typography sx={{ fontSize: '0.72rem', mt: 0.5, color: a.atrasado ? 'error.main' : a.diff <= 2 ? 'warning.main' : 'text.secondary' }}>
                {a.atrasado ? `⚠️ Venceu em ${FinanceiroUtils.formatarDataDate(a.dataVencimento)} — ${Math.abs(a.diff)}d em atraso`
                  : a.diff === 0 ? `🔴 Vence HOJE — ${FinanceiroUtils.formatarDataDate(a.dataVencimento)}`
                  : `🟡 Vence em ${a.diff}d — ${FinanceiroUtils.formatarDataDate(a.dataVencimento)}`}
              </Typography>
            </Box>
          ))}
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button fullWidth variant="contained" onClick={() => setModalAlertas(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Home;
