// ─────────────────────────────────────────────────────────────────────────────
// src/components/NovaConta.jsx
// BUG FIX #1 — Substituído o seletor de "dia" por input de data completa
// (DD/MM/AAAA). A data é armazenada como campo ISO no banco; o mesAno é
// derivado da data escolhida, permitindo lançamentos em meses passados/futuros.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Collapse from '@mui/material/Collapse';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';

import FinanceiroService from '../services/FinanceiroService';

// ── dados de categorias ───────────────────────────────────────────────────────
const categoriasDespesas = [
  { id: 'Moradia',     label: 'Moradia',     emoji: '🏠' },
  { id: 'Contas',      label: 'Contas',      emoji: '💡' },
  { id: 'Alimentacao', label: 'Alimentação', emoji: '🍔' },
  { id: 'Transporte',  label: 'Transporte',  emoji: '🚗' },
  { id: 'Lazer',       label: 'Lazer',       emoji: '🍿' },
  { id: 'Saude',       label: 'Saúde',       emoji: '🏥' },
  { id: 'Outros',      label: 'Outros',      emoji: '🛒' },
];
const categoriasEntradas = [
  { id: 'Salario',      label: 'Salário',     emoji: '💼' },
  { id: 'Investimento', label: 'Invest.',     emoji: '📈' },
  { id: 'Renda Extra',  label: 'Renda Extra', emoji: '🚀' },
  { id: 'Outros',       label: 'Outros',      emoji: '💰' },
];

const FREQUENCIAS = [
  { id: 'unica',     label: 'Única',     emoji: '1×', desc: 'Apenas este mês' },
  { id: 'fixa',      label: 'Fixa',      emoji: '🔁', desc: 'Todo mês'       },
  { id: 'parcelada', label: 'Parcelada', emoji: '📊', desc: 'Nº de vezes'    },
];

const money = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

// ── Converte Date → "YYYY-MM-DD" para input type=date ────────────────────────
const toInputDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// ── "YYYY-MM-DD" → { dia, mesAno } para gravar no Dexie ──────────────────────
const parseInputDate = (isoStr) => {
  if (!isoStr) return { dia: new Date().getDate(), mesAno: null };
  const [y, m, d] = isoStr.split('-').map(Number);
  return {
    dia:    d,
    mesAno: `${String(m).padStart(2, '0')}/${y}`,
  };
};

// ── Seletor de data completa ──────────────────────────────────────────────────
const SeletorData = ({ value, onChange, label, corAtiva }) => (
  <Box>
    <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', mb: 0.8 }}>
      {label || 'Data de vencimento'}
    </Typography>
    <TextField
      fullWidth
      type="date"
      value={value}
      onChange={e => onChange(e.target.value)}
      InputLabelProps={{ shrink: true }}
      inputProps={{ style: { fontSize: '1rem', fontWeight: 700 } }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px',
          bgcolor: 'rgba(255,255,255,0.8)',
          '&.Mui-focused fieldset': { borderColor: corAtiva, borderWidth: 2 },
        },
      }}
    />
    {value && (
      <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary', mt: 0.5, fontWeight: 600 }}>
        📅 {value.split('-').reverse().join('/')}
      </Typography>
    )}
  </Box>
);

// ── Seletor de categoria ──────────────────────────────────────────────────────
const SeletorCategoria = ({ categorias, value, onChange, corAtiva }) => (
  <Box>
    <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', mb: 0.8 }}>
      Categoria
    </Typography>
    <Grid container spacing={0.8}>
      {categorias.map(cat => {
        const ativo = value === cat.id;
        return (
          <Grid item key={cat.id} xs={3}>
            <Box onClick={() => onChange(cat.id)} sx={{
              p: 1, borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
              border: '2px solid', transition: 'all .15s',
              borderColor: ativo ? corAtiva : 'rgba(0,0,0,0.08)',
              bgcolor:     ativo ? `${corAtiva}15` : 'rgba(0,0,0,0.02)',
            }}>
              <Typography sx={{ fontSize: '1.35rem', mb: 0.3, lineHeight: 1 }}>{cat.emoji}</Typography>
              <Typography sx={{ fontSize: '0.58rem', fontWeight: 700, lineHeight: 1.2,
                color: ativo ? corAtiva : 'text.secondary' }}>
                {cat.label}
              </Typography>
            </Box>
          </Grid>
        );
      })}
    </Grid>
  </Box>
);

// ── Seletor de frequência ─────────────────────────────────────────────────────
const SeletorFrequencia = ({ value, onChange }) => (
  <Box>
    <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', mb: 0.8 }}>
      Frequência
    </Typography>
    <Grid container spacing={0.8}>
      {FREQUENCIAS.map(f => {
        const ativo = value === f.id;
        return (
          <Grid item xs={4} key={f.id}>
            <Box onClick={() => onChange(f.id)} sx={{
              p: 1.2, borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
              border: '2px solid', transition: 'all .15s',
              borderColor: ativo ? 'primary.main' : 'rgba(0,0,0,0.08)',
              bgcolor:     ativo ? 'rgba(123,44,191,0.08)' : 'rgba(0,0,0,0.02)',
            }}>
              <Typography sx={{ fontSize: '1.1rem', mb: 0.3, lineHeight: 1 }}>{f.emoji}</Typography>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, mb: 0.1,
                color: ativo ? 'primary.main' : 'text.primary' }}>{f.label}</Typography>
              <Typography sx={{ fontSize: '0.58rem', color: 'text.secondary', lineHeight: 1.2 }}>{f.desc}</Typography>
            </Box>
          </Grid>
        );
      })}
    </Grid>
  </Box>
);

// ── Stepper de parcelas ───────────────────────────────────────────────────────
const StepperParcelas = ({ value, onChange }) => (
  <Box>
    <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', mb: 0.8 }}>
      Número de parcelas
    </Typography>
    <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'rgba(123,44,191,0.05)',
      borderRadius: '12px', border: '1px solid rgba(0,0,0,0.12)', overflow: 'hidden', height: 46 }}>
      <Button onClick={() => onChange(Math.max(2, value - 1))}
        sx={{ minWidth: 44, height: '100%', p: 0, fontSize: '1.3rem', fontWeight: 900,
          color: 'primary.main', '&:active': { transform: 'scale(0.8)' } }}>−</Button>
      <Typography sx={{ flex: 1, textAlign: 'center', fontWeight: 800, fontSize: '1.1rem',
        color: 'text.primary' }}>{value}×</Typography>
      <Button onClick={() => onChange(value + 1)}
        sx={{ minWidth: 44, height: '100%', p: 0, fontSize: '1.3rem', fontWeight: 900,
          color: 'primary.main', '&:active': { transform: 'scale(0.8)' } }}>+</Button>
    </Box>
  </Box>
);

// ════════════════════════════════════════════════════════════════════════════
const NovaConta = ({ setRoute, editItem, setEditItem }) => {
  const hoje = toInputDate(new Date());

  const [form, setForm] = useState({
    tipo:        'despesa',
    nome:        '',
    valor:       0,
    dataVenc:    hoje,       // ← agora é data completa YYYY-MM-DD
    categoria:   'Outros',
    recorrencia: 'unica',
    qtdVezes:    2,
  });
  const [toast, setToast] = useState({ open: false, texto: '' });

  // pré-preenche ao editar
  useEffect(() => {
    if (editItem) {
      // reconstrói a data a partir do dia + mesAno guardados
      let dataVenc = hoje;
      if (editItem.dia && editItem.mesAno && editItem.mesAno !== 'fixo') {
        const [m, y] = editItem.mesAno.split('/');
        dataVenc = `${y}-${m.padStart(2, '0')}-${String(editItem.dia).padStart(2, '0')}`;
      }
      setForm({
        ...editItem,
        tipo:        editItem.tipoOperacao || 'despesa',
        dataVenc,
        recorrencia: editItem.mesAno === 'fixo' ? 'fixa' : (editItem.parcelaStr ? 'parcelada' : 'unica'),
        qtdVezes:    2,
      });
    }
  }, [editItem]);

  const handleValorChange = (e) => {
    const num = parseFloat(e.target.value.replace(/\D/g, '')) / 100;
    setForm({ ...form, valor: isNaN(num) ? 0 : num });
  };

  const salvar = async () => {
    if (!form.nome || form.valor <= 0) {
      setToast({ open: true, texto: '⚠️ Nome e valor são obrigatórios!' });
      return;
    }

    const { dia, mesAno: mesAnoSelecionado } = parseInputDate(form.dataVenc);

    try {
      if (editItem && editItem.id) {
        // Na edição, preservamos o mesAno original e atualizamos só o dia
        await FinanceiroService.atualizarGasto(editItem.id, {
          nome:          form.nome,
          valor:         form.valor,
          dia,
          categoria:     form.categoria,
          tipoOperacao:  form.tipo,
        });
        setToast({ open: true, texto: '✅ Registro atualizado!' });
      } else {
        // Criação — usa a data escolhida para derivar o mesAno das parcelas
        const registros = [];

        if (form.recorrencia === 'parcelada') {
          // Ponto de partida: ano/mês da data selecionada
          const [y, m] = form.dataVenc.split('-').map(Number);
          for (let i = 0; i < form.qtdVezes; i++) {
            const dAlvo = new Date(y, m - 1 + i, 1);
            registros.push({
              tipoOperacao:  form.tipo,
              nome:          form.nome,
              valor:         form.valor,
              dia,
              categoria:     form.categoria,
              mesAno:        `${String(dAlvo.getMonth() + 1).padStart(2, '0')}/${dAlvo.getFullYear()}`,
              parcelaStr:    `${i + 1}/${form.qtdVezes}`,
              pago:          false,
            });
          }
          await FinanceiroService.criarGastos(registros);
        } else {
          await FinanceiroService.criarGasto({
            tipoOperacao:  form.tipo,
            nome:          form.nome,
            valor:         form.valor,
            dia,
            categoria:     form.categoria,
            mesAno:        form.recorrencia === 'fixa' ? 'fixo' : mesAnoSelecionado,
            pago:          false,
            pagos:         [],
          });
        }

        setToast({ open: true, texto: '✅ Salvo com sucesso!' });
      }

      setTimeout(() => { if (setEditItem) setEditItem(null); setRoute('gastos'); }, 900);
    } catch (e) {
      setToast({ open: true, texto: '❌ Erro ao salvar.' });
      console.error(e);
    }
  };

  const cancelar = () => { if (setEditItem) setEditItem(null); setRoute('gastos'); };

  const isEntrada         = form.tipo === 'entrada';
  const corTipo           = isEntrada ? '#22C55E' : '#EF4444';
  const categoriasAtuais  = isEntrada ? categoriasEntradas : categoriasDespesas;

  return (
    <Box sx={{ maxWidth: 500, margin: 'auto', px: 2, pt: 1, pb: 6 }}>
      <Snackbar open={toast.open} autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Box sx={{ bgcolor: '#1E293B', color: '#fff', px: 3, py: 1.5, borderRadius: '12px', fontWeight: 600 }}>
          {toast.texto}
        </Box>
      </Snackbar>

      <Card sx={{ p: 2.5, borderRadius: '20px', border: '2px solid', borderColor: `${corTipo}40`,
        transition: 'border-color .25s' }}>

        <Typography sx={{ fontWeight: 800, textAlign: 'center', mb: 2.5, fontSize: '1.05rem', color: 'text.primary' }}>
          {editItem ? '📝 Editar Registro' : '➕ Novo Lançamento'}
        </Typography>

        {/* ── toggle entrada / saída ──────────────────────────────── */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2.5 }}>
          <ToggleButtonGroup
            value={form.tipo} exclusive
            onChange={(e, v) => v && setForm({ ...form, tipo: v, categoria: 'Outros' })}
            sx={{ bgcolor: '#F8FAFC', border: '1.5px solid', borderColor: 'divider',
              borderRadius: '14px', overflow: 'hidden', width: '100%' }}
          >
            <ToggleButton value="despesa" sx={{
              flex: 1, fontWeight: 700, py: 1.2, border: 'none',
              color:   form.tipo === 'despesa' ? '#fff !important' : '#EF4444',
              bgcolor: form.tipo === 'despesa' ? '#EF4444 !important' : 'transparent',
              borderRadius: '12px !important', transition: 'all .2s',
            }}>
              🔻 Saída
            </ToggleButton>
            <ToggleButton value="entrada" sx={{
              flex: 1, fontWeight: 700, py: 1.2, border: 'none',
              color:   form.tipo === 'entrada' ? '#fff !important' : '#22C55E',
              bgcolor: form.tipo === 'entrada' ? '#22C55E !important' : 'transparent',
              borderRadius: '12px !important', transition: 'all .2s',
            }}>
              🔺 Entrada
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* ── descrição ──────────────────────────────────────────── */}
        <TextField fullWidth label="Descrição" value={form.nome}
          onChange={e => setForm({ ...form, nome: e.target.value })}
          sx={{ mb: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: '12px' }}
        />

        {/* ── valor ──────────────────────────────────────────────── */}
        <Box sx={{ mb: 2.5, p: 2, bgcolor: `${corTipo}08`, borderRadius: '14px',
          border: '1.5px solid', borderColor: `${corTipo}30`, transition: 'all .25s' }}>
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: corTipo,
            textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.8 }}>
            {isEntrada ? '💰 Valor a receber' : '💸 Valor a pagar'}
          </Typography>
          <TextField fullWidth label="Valor (R$)"
            value={form.valor === 0 ? '' : money(form.valor)}
            onChange={handleValorChange} inputProps={{ inputMode: 'numeric' }}
            sx={{
              '& .MuiInputBase-input': { fontWeight: 800, fontSize: '1.2rem', color: corTipo },
              '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.7)' },
            }}
          />
        </Box>

        {/* ── categoria ──────────────────────────────────────────── */}
        <Box sx={{ mb: 2.5 }}>
          <SeletorCategoria
            categorias={categoriasAtuais}
            value={form.categoria}
            onChange={cat => setForm({ ...form, categoria: cat })}
            corAtiva={corTipo}
          />
        </Box>

        {/* ── DATA COMPLETA (BUG FIX) ────────────────────────────── */}
        <Box sx={{ mb: 2.5 }}>
          <SeletorData
            value={form.dataVenc}
            onChange={v => setForm({ ...form, dataVenc: v })}
            label={editItem ? 'Data de vencimento' : 'Data / mês do lançamento'}
            corAtiva={corTipo}
          />
          {!editItem && form.recorrencia === 'unica' && form.dataVenc && (() => {
            const { mesAno } = parseInputDate(form.dataVenc);
            const hoje2 = new Date();
            const mesAtual = `${String(hoje2.getMonth() + 1).padStart(2, '0')}/${hoje2.getFullYear()}`;
            if (mesAno !== mesAtual) return (
              <Box sx={{ mt: 0.8, p: 1, bgcolor: 'rgba(255,183,3,0.1)', borderRadius: '10px',
                border: '1px solid #FFB703', display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.85rem' }}>📅</Typography>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#B45309' }}>
                  Este lançamento será registrado em {mesAno}
                </Typography>
              </Box>
            );
            return null;
          })()}
        </Box>

        {/* ── frequência (somente no modo criação) ────────────────── */}
        {!editItem && (
          <Box sx={{ mb: 2.5 }}>
            <SeletorFrequencia
              value={form.recorrencia}
              onChange={v => setForm({ ...form, recorrencia: v })}
            />
          </Box>
        )}

        {/* ── nº de parcelas ──────────────────────────────────────── */}
        <Collapse in={form.recorrencia === 'parcelada' && !editItem}>
          <Box sx={{ mb: 2.5 }}>
            <StepperParcelas
              value={form.qtdVezes}
              onChange={v => setForm({ ...form, qtdVezes: Math.max(2, v) })}
            />
          </Box>
        </Collapse>

        {/* ── botões ──────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button fullWidth variant="outlined" color="inherit" onClick={cancelar}
            sx={{ fontWeight: 600, color: 'text.secondary', borderRadius: '12px', py: 1.2 }}>
            Cancelar
          </Button>
          <Button fullWidth variant="contained" onClick={salvar}
            sx={{ fontWeight: 800, bgcolor: corTipo, borderRadius: '12px', py: 1.2,
              '&:hover': { bgcolor: corTipo, opacity: 0.9 } }}>
            {editItem ? 'Atualizar' : 'Salvar'}
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default NovaConta;
