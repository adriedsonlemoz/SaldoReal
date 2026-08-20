// src/components/Acordos.jsx — REDESIGN
// Toda a lógica original preservada. Apenas visual reformulado.

import React, { useState, useEffect } from 'react';
import Box        from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button     from '@mui/material/Button';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import HandshakeRoundedIcon from '@mui/icons-material/HandshakeRounded';

import { useAcordos }    from '../hooks/useAcordos';
import Carteira          from './Carteira';
import NovoAcordoWizard  from './NovoAcordoWizard';
import Simulador         from './Simulador';

// ─────────────────────────────────────────────────────────────────────────────
// Tab item
// ─────────────────────────────────────────────────────────────────────────────
const TabBtn = ({ label, Icon, active, onClick }) => (
  <Box
    role="button" tabIndex={0} aria-pressed={active}
    onClick={onClick}
    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick()}
    sx={{
      flex: 1, minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: .6, px: .8, cursor: 'pointer', borderRadius: '12px',
      bgcolor: active ? 'primary.main' : 'transparent',
      color: active ? '#fff' : 'text.secondary',
      transition: 'background-color .16s ease, color .16s ease, transform .12s ease',
      userSelect: 'none', WebkitTapHighlightColor: 'transparent',
      '&:active': { transform: 'scale(.98)' },
    }}
  >
    <Icon sx={{ fontSize: '1.08rem' }} />
    <Typography sx={{ fontSize: '.72rem', fontWeight: 850, color: 'inherit' }}>{label}</Typography>
  </Box>
);

// ─────────────────────────────────────────────────────────────────────────────
// Acordos
// ─────────────────────────────────────────────────────────────────────────────
const Acordos = ({ setRoute }) => {
  const { acordos, carregar } = useAcordos();
  const [abaGeral,      setAbaGeral]      = useState('carteira');
  const [wizardAberto,  setWizardAberto]  = useState(false);
  const [editandoId,    setEditandoId]    = useState(null);
  const [editForm,      setEditForm]      = useState(null);

  useEffect(() => { carregar(); }, [carregar]);

  const abrirNovo = () => {
    setEditandoId(null);
    setEditForm(null);
    setWizardAberto(true);
  };

  const abrirEditar = (acordo) => {
    setEditandoId(acordo.id);
    setEditForm({ ...acordo });
    setWizardAberto(true);
  };

  const fecharWizard = async () => {
    setWizardAberto(false);
    setEditandoId(null);
    setEditForm(null);
    await carregar();
  };

  // Wizard sobrepõe tudo quando aberto
  if (wizardAberto) {
    return (
      <NovoAcordoWizard
        editandoId={editandoId}
        editForm={editForm}
        onConcluir={fecharWizard}
        onCancelar={() => {
          setWizardAberto(false);
          setEditandoId(null);
          setEditForm(null);
        }}
      />
    );
  }

  // Estatísticas rápidas para o header
  const ativos   = acordos.filter(a => a.situacao === 'acordo');
  const vencidas = acordos.filter(a => a.situacao === 'vencida');
  const quitados = acordos.filter(a => a.situacao === 'quitado');
  const totalPendente = ativos.reduce((s, a) =>
    s + (parseInt(a.parcelas || 0) - parseInt(a.parcelasPagas || 0)) * (a.valorParcela || 0), 0);

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', px: { xs: 1.5, sm: 2 }, pt: 1.2, pb: 1.5 }}>

      {/* ── HEADER CARD ──────────────────────────────────────────────── */}
      <Box sx={{
        borderRadius: '22px', overflow: 'hidden', mb: 1.2,
        background: 'linear-gradient(145deg, #1A0533 0%, #2D0B5E 50%, #6B1FA8 100%)',
        boxShadow: '0 10px 28px rgba(45,11,94,.18)',
        position: 'relative', p: 0,
      }}>
        {/* Orb decorativo */}
        <Box sx={{
          position: 'absolute', top: -15, right: -15, width: 80, height: 80,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(247,37,133,0.4), transparent 70%)',
          filter: 'blur(12px)', pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', bottom: -10, left: 20, width: 60, height: 60,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(157,78,221,0.28), transparent 70%)',
          filter: 'blur(10px)', pointerEvents: 'none',
        }} />

        <Box sx={{ px: 2.5, pt: 2, pb: 2, position: 'relative', zIndex: 1 }}>
          {/* Título */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Box>
              <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem', fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase' }}>
                Livro Razão
              </Typography>
              <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '1.3rem', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
                Acordos & Dívidas
              </Typography>
            </Box>
            <Box sx={{ width: 42, height: 42, borderRadius: '13px', bgcolor: 'rgba(255,255,255,.10)', display: 'grid', placeItems: 'center' }}><HandshakeRoundedIcon /></Box>
          </Box>

          {/* Stats 3 colunas */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {[
              { label: 'Ativos', valor: ativos.length, cor: '#D8B4FE', bg: 'rgba(255,255,255,.08)', borda: 'rgba(255,255,255,.10)' },
              { label: 'Vencidas', valor: vencidas.length, cor: '#FDA4AF', bg: 'rgba(255,255,255,.08)', borda: 'rgba(255,255,255,.10)' },
              { label: 'Quitados', valor: quitados.length, cor: '#86EFAC', bg: 'rgba(255,255,255,.08)', borda: 'rgba(255,255,255,.10)' },
            ].map(s => (
              <Box key={s.label} sx={{
                flex: 1, textAlign: 'center', py: 0.9,
                bgcolor: s.bg, border: `1px solid ${s.borda}`, borderRadius: '11px',
              }}>
                <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                  {s.valor}
                </Typography>
                <Typography sx={{ fontSize: '0.66rem', fontWeight: 700, color: s.cor, textTransform: 'uppercase', letterSpacing: '0.5px', mt: 0.2 }}>
                  {s.label}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Total pendente */}
          {totalPendente > 0 && (
            <Box sx={{
              mt: 1.2, px: 1.2, py: 0.8,
              bgcolor: 'rgba(255,255,255,0.06)', borderRadius: '10px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', fontWeight: 700 }}>
                Total ainda a pagar
              </Typography>
              <Typography sx={{ color: '#FB7185', fontWeight: 900, fontSize: '0.9rem' }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPendente)}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* ── ABAS ─────────────────────────────────────────────────────── */}
      <Box sx={{
        display: 'flex', gap: .35, mb: 1.25,
        bgcolor: 'background.paper', borderRadius: '16px',
        p: .4,
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 4px 14px rgba(45,11,94,.045)',
      }}>
        <TabBtn label="Carteira" Icon={AccountBalanceWalletRoundedIcon} active={abaGeral === 'carteira'} onClick={() => setAbaGeral('carteira')} />
        <TabBtn label="Novo" Icon={AddRoundedIcon} active={false} onClick={abrirNovo} />
        <TabBtn label="Simulador" Icon={CalculateRoundedIcon} active={abaGeral === 'simulador'} onClick={() => setAbaGeral('simulador')} />
      </Box>

      {/* ── CONTEÚDO ─────────────────────────────────────────────────── */}
      {abaGeral === 'carteira'  && (
        <Carteira
          acordos={acordos}
          carregarDados={carregar}
          setAbaGeral={setAbaGeral}
          abrirEditar={abrirEditar}
        />
      )}
      {abaGeral === 'simulador' && <Simulador acordos={acordos} />}
    </Box>
  );
};

export default Acordos;
