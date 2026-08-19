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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import FinanceiroService from '../services/FinanceiroService';
import { parseMoedaInput, formatMoedaInput, propsInputMoeda } from '../utils/moedaInput';

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
const SeletorCategoria = ({ categorias, value, onChange, corAtiva, onAdd }) => (
  <Box>
    <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', mb: 0.8 }}>
      Categoria
    </Typography>
    <Grid container spacing={0.8}>
      {categorias.map(cat => {
        const ativo = value === cat.id;
        return (
          <Grid item key={cat.id} xs={4} sm={3}>
            <Box role="button" tabIndex={0} aria-pressed={ativo} onClick={() => onChange(cat.id)} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onChange(cat.id)} sx={{
              p: 1, borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
              border: '2px solid', transition: 'all .15s',
              borderColor: ativo ? corAtiva : 'rgba(0,0,0,0.08)',
              bgcolor:     ativo ? `${corAtiva}15` : 'rgba(0,0,0,0.02)',
            }}>
              <Typography sx={{ fontSize: '1.35rem', mb: 0.3, lineHeight: 1 }}>{cat.emoji}</Typography>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, lineHeight: 1.2, wordBreak: 'break-word',
                color: ativo ? corAtiva : 'text.secondary' }}>
                {cat.label}
              </Typography>
            </Box>
          </Grid>
        );
      })}
      {onAdd && (
        <Grid item xs={4} sm={3}>
          <Box role="button" tabIndex={0} aria-label="Criar nova categoria" onClick={onAdd} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onAdd()} sx={{
            p: 1, minHeight: 74, borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
            border: '1.5px dashed', borderColor: 'rgba(123,44,191,.38)', bgcolor: 'rgba(123,44,191,.035)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            '&:active': { transform: 'scale(.97)' },
          }}>
            <Typography sx={{ fontSize: '1.05rem', lineHeight: 1, color: 'primary.main', fontWeight: 900 }}>＋</Typography>
            <Typography sx={{ fontSize: '.7rem', fontWeight: 900, color: 'primary.main', mt: .35 }}>Nova</Typography>
          </Box>
        </Grid>
      )}
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
            <Box role="button" tabIndex={0} aria-pressed={ativo} onClick={() => onChange(f.id)} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onChange(f.id)} sx={{
              p: 1.2, borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
              border: '2px solid', transition: 'all .15s',
              borderColor: ativo ? 'primary.main' : 'rgba(0,0,0,0.08)',
              bgcolor:     ativo ? 'rgba(123,44,191,0.08)' : 'rgba(0,0,0,0.02)',
            }}>
              <Typography sx={{ fontSize: '1.1rem', mb: 0.3, lineHeight: 1 }}>{f.emoji}</Typography>
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, mb: 0.1,
                color: ativo ? 'primary.main' : 'text.primary' }}>{f.label}</Typography>
              <Typography sx={{ fontSize: '0.66rem', color: 'text.secondary', lineHeight: 1.2 }}>{f.desc}</Typography>
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
  const [categoriasCustom, setCategoriasCustom] = useState([]);
  const [modalCategoria, setModalCategoria] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState('');

  // pré-preenche ao editar
  useEffect(() => {
    if (editItem) {
      // reconstrói a data a partir do dia + mesAno guardados
      let dataVenc = hoje;
      if (editItem.dia && /^\d{2}\/\d{4}$/.test(String(editItem.mesAno || ''))) {
        const [m, y] = String(editItem.mesAno).split('/');
        const maxDia = new Date(Number(y), Number(m), 0).getDate();
        const diaSeguro = Math.min(Math.max(Number(editItem.dia) || 1, 1), maxDia);
        dataVenc = `${y}-${m}-${String(diaSeguro).padStart(2, '0')}`;
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

  useEffect(() => {
    let ativo = true;
    FinanceiroService.getCategoriasPersonalizadas(form.tipo).then(lista => {
      if (ativo) setCategoriasCustom(lista);
    });
    return () => { ativo = false; };
  }, [form.tipo]);

  const handleValorChange = (e) => {
    setForm(prev => ({ ...prev, valor: parseMoedaInput(e.target.value) }));
  };

  const criarCategoria = async () => {
    const nome = novaCategoria.trim();
    if (!nome) return;
    try {
      const criada = await FinanceiroService.adicionarCategoriaPersonalizada(form.tipo, nome);
      const lista = await FinanceiroService.getCategoriasPersonalizadas(form.tipo);
      setCategoriasCustom(lista);
      setForm(prev => ({ ...prev, categoria: criada }));
      setNovaCategoria('');
      setModalCategoria(false);
      setToast({ open: true, texto: `✅ Categoria “${criada}” criada.` });
    } catch (e) {
      setToast({ open: true, texto: '❌ Não foi possível criar a categoria.' });
    }
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
  const categoriasBase = isEntrada ? categoriasEntradas : categoriasDespesas;
  const categoriasAtuais = [
    ...categoriasBase,
    ...categoriasCustom
      .filter(nome => !categoriasBase.some(cat => cat.id.toLocaleLowerCase('pt-BR') === String(nome).toLocaleLowerCase('pt-BR')))
      .map(nome => ({ id: nome, label: nome, emoji: isEntrada ? '🏷️' : '🏷️' })),
  ];

  return (
    <Box sx={{ maxWidth: 500, margin: 'auto', px: { xs: 1.5, sm: 2 }, pt: 1, pb: 2 }}>
      <Snackbar open={toast.open} autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Box sx={{ bgcolor: '#1E293B', color: '#fff', px: 3, py: 1.5, borderRadius: '12px', fontWeight: 600 }}>
          {toast.texto}
        </Box>
      </Snackbar>

      <Card sx={{ p: { xs: 1.7, sm: 2.5 }, borderRadius: '20px', border: '1.5px solid', borderColor: 'rgba(123,44,191,.16)',
        boxShadow: '0 8px 28px rgba(45,11,94,.06)' }}>

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
            value={formatMoedaInput(form.valor, { comSimbolo: true })}
            onChange={handleValorChange} inputProps={propsInputMoeda}
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
            corAtiva="#7B2CBF"
            onAdd={() => setModalCategoria(true)}
          />
        </Box>

        {/* ── DATA COMPLETA (BUG FIX) ────────────────────────────── */}
        <Box sx={{ mb: 2.5 }}>
          <SeletorData
            value={form.dataVenc}
            onChange={v => setForm({ ...form, dataVenc: v })}
            label={editItem ? 'Data de vencimento' : 'Data / mês do lançamento'}
            corAtiva="#7B2CBF"
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
            sx={{ fontWeight: 900, borderRadius: '12px', py: 1.2,
              background: 'linear-gradient(135deg,#7B2CBF 0%,#C026D3 100%)',
              boxShadow: '0 8px 20px rgba(123,44,191,.2)', '&:hover': { opacity: .94 } }}>
            {editItem ? 'Atualizar' : 'Salvar'}
          </Button>
        </Box>
      </Card>

      <Dialog open={modalCategoria} onClose={() => setModalCategoria(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 900 }}>Nova categoria</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '.78rem', color: 'text.secondary', mb: 1.5 }}>
            Crie sem sair deste lançamento. A categoria ficará disponível nos próximos cadastros.
          </Typography>
          <TextField
            fullWidth autoFocus label="Nome da categoria" placeholder="Ex.: Academia, Pets, Freelance…"
            value={novaCategoria} onChange={e => setNovaCategoria(e.target.value.slice(0, 28))}
            onKeyDown={e => e.key === 'Enter' && criarCategoria()}
          />
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button color="inherit" onClick={() => setModalCategoria(false)}>Cancelar</Button>
          <Button variant="contained" disabled={!novaCategoria.trim()} onClick={criarCategoria}>Criar e selecionar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NovaConta;
