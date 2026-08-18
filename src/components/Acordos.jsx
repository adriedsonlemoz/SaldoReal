// src/components/Acordos.jsx — REDESIGN
// Toda a lógica original preservada. Apenas visual reformulado.

import React, { useState, useEffect } from 'react';
import Box        from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button     from '@mui/material/Button';

import { useAcordos }    from '../hooks/useAcordos';
import Carteira          from './Carteira';
import NovoAcordoWizard  from './NovoAcordoWizard';
import Simulador         from './Simulador';

// ─────────────────────────────────────────────────────────────────────────────
// Tab item
// ─────────────────────────────────────────────────────────────────────────────
const TabBtn = ({ label, icon, active, onClick, accent = '#7B2CBF' }) => (
  <Box onClick={onClick} sx={{
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 0.4, py: 1.1, px: 0.5, cursor: 'pointer',
    borderRadius: '12px',
    bgcolor: active ? `${accent}14` : 'transparent',
    border: active ? `1.5px solid ${accent}30` : '1.5px solid transparent',
    transition: 'all 0.18s',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    '&:active': { transform: 'scale(0.95)' },
  }}>
    <Typography sx={{ fontSize: '1.1rem', lineHeight: 1 }}>{icon}</Typography>
    <Typography sx={{
      fontSize: '0.62rem', fontWeight: active ? 800 : 600,
      color: active ? accent : 'text.secondary',
      letterSpacing: '0.2px',
    }}>
      {label}
    </Typography>
    {active && (
      <Box sx={{ width: 20, height: 2.5, borderRadius: 2, bgcolor: accent, mt: 0.2 }} />
    )}
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
    <Box sx={{ maxWidth: 600, margin: 'auto', px: 2, pt: 2 }}>

      {/* ── HEADER CARD ──────────────────────────────────────────────── */}
      <Box sx={{
        borderRadius: '20px', overflow: 'hidden', mb: 2,
        background: 'linear-gradient(145deg, #1A0533 0%, #2D0B5E 50%, #6B1FA8 100%)',
        boxShadow: '0 8px 28px rgba(107,31,168,0.35)',
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
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,180,216,0.3), transparent 70%)',
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
            <Typography sx={{ fontSize: '1.6rem' }}>🤝</Typography>
          </Box>

          {/* Stats 3 colunas */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {[
              { label: 'Ativos',   valor: ativos.length,   cor: '#A78BFA', bg: 'rgba(167,139,250,0.15)', borda: 'rgba(167,139,250,0.3)' },
              { label: 'Vencidas', valor: vencidas.length, cor: '#FB7185', bg: 'rgba(251,113,133,0.15)', borda: 'rgba(251,113,133,0.3)' },
              { label: 'Quitados', valor: quitados.length, cor: '#4ADE80', bg: 'rgba(74,222,128,0.15)',  borda: 'rgba(74,222,128,0.3)'  },
            ].map(s => (
              <Box key={s.label} sx={{
                flex: 1, textAlign: 'center', py: 0.9,
                bgcolor: s.bg, border: `1px solid ${s.borda}`, borderRadius: '11px',
              }}>
                <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                  {s.valor}
                </Typography>
                <Typography sx={{ fontSize: '0.57rem', fontWeight: 700, color: s.cor, textTransform: 'uppercase', letterSpacing: '0.5px', mt: 0.2 }}>
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
        display: 'flex', gap: 0.8, mb: 2,
        bgcolor: 'background.paper', borderRadius: '16px',
        p: 0.8,
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}>
        <TabBtn label="Carteira"   icon="💼" active={abaGeral === 'carteira'}  onClick={() => setAbaGeral('carteira')}  accent="#7B2CBF" />
        <TabBtn label="Novo"       icon="➕" active={false}                    onClick={abrirNovo}                      accent="#F72585" />
        <TabBtn label="Simulador"  icon="📊" active={abaGeral === 'simulador'} onClick={() => setAbaGeral('simulador')} accent="#00B4D8" />
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
