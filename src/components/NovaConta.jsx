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
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import MovieRoundedIcon from '@mui/icons-material/MovieRounded';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import WorkRoundedIcon from '@mui/icons-material/WorkRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import LooksOneRoundedIcon from '@mui/icons-material/LooksOneRounded';
import RepeatRoundedIcon from '@mui/icons-material/RepeatRounded';
import ViewWeekRoundedIcon from '@mui/icons-material/ViewWeekRounded';

import FinanceiroService from '../services/FinanceiroService';
import { parseMoedaInput, formatMoedaInput, propsInputMoeda } from '../utils/moedaInput';

// ── dados visuais de categorias ─────────────────────────────────────────────
const categoriasDespesas = [
  { id: 'Moradia', label: 'Moradia', Icon: HomeRoundedIcon },
  { id: 'Contas', label: 'Contas', Icon: LightbulbRoundedIcon },
  { id: 'Alimentacao', label: 'Alimentação', Icon: RestaurantRoundedIcon },
  { id: 'Transporte', label: 'Transporte', Icon: DirectionsCarRoundedIcon },
  { id: 'Lazer', label: 'Lazer', Icon: MovieRoundedIcon },
  { id: 'Saude', label: 'Saúde', Icon: LocalHospitalRoundedIcon },
  { id: 'Outros', label: 'Outros', Icon: CategoryRoundedIcon },
];
const categoriasEntradas = [
  { id: 'Salario', label: 'Salário', Icon: WorkRoundedIcon },
  { id: 'Investimento', label: 'Invest.', Icon: TrendingUpRoundedIcon },
  { id: 'Renda Extra', label: 'Renda Extra', Icon: RocketLaunchRoundedIcon },
  { id: 'Outros', label: 'Outros', Icon: SavingsRoundedIcon },
];
const FREQUENCIAS = [
  { id: 'unica', label: 'Única', Icon: LooksOneRoundedIcon, desc: 'Só este mês' },
  { id: 'fixa', label: 'Fixa', Icon: RepeatRoundedIcon, desc: 'Todo mês' },
  { id: 'parcelada', label: 'Parcelada', Icon: ViewWeekRoundedIcon, desc: 'Nº de vezes' },
];

const toInputDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parseInputDate = (isoStr) => {
  if (!isoStr) return { dia: new Date().getDate(), mesAno: null };
  const [y, m, d] = isoStr.split('-').map(Number);
  return { dia: d, mesAno: `${String(m).padStart(2, '0')}/${y}` };
};

const LabelSecao = ({ children }) => <Typography sx={{ fontSize: '.66rem', fontWeight: 850, color: 'text.secondary', mb: .65, letterSpacing: '.2px' }}>{children}</Typography>;

const SeletorData = ({ value, onChange, label }) => (
  <Box>
    <LabelSecao>{label || 'Data de vencimento'}</LabelSecao>
    <TextField fullWidth type="date" value={value} onChange={e => onChange(e.target.value)} InputLabelProps={{ shrink: true }}
      InputProps={{ startAdornment: <EventRoundedIcon sx={{ mr: .7, color: 'primary.main', fontSize: 19 }} /> }}
      inputProps={{ style: { fontSize: '.92rem', fontWeight: 800 } }} />
  </Box>
);

const SeletorCategoria = ({ categorias, value, onChange, onAdd }) => (
  <Box>
    <LabelSecao>Categoria</LabelSecao>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(4,minmax(0,1fr))', '@media (max-width:360px)': 'repeat(3,minmax(0,1fr))' }, gap: .65 }}>
      {categorias.map(cat => {
        const ativo = value === cat.id;
        const Icon = cat.Icon || CategoryRoundedIcon;
        return <Box key={cat.id} role="button" tabIndex={0} aria-pressed={ativo} onClick={() => onChange(cat.id)} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onChange(cat.id)} sx={{
          minWidth: 0, minHeight: 64, px: .45, py: .65, borderRadius: '13px', textAlign: 'center', cursor: 'pointer',
          border: `1.4px solid ${ativo ? '#7B2CBF' : 'rgba(72,45,91,.09)'}`, bgcolor: ativo ? 'rgba(123,44,191,.075)' : '#fff',
          boxShadow: ativo ? '0 4px 12px rgba(123,44,191,.09)' : 'none', transition: 'all .15s', '&:active': { transform: 'scale(.97)' },
        }}>
          <Box sx={{ mx: 'auto', width: 29, height: 29, borderRadius: '9px', display: 'grid', placeItems: 'center', bgcolor: ativo ? 'rgba(123,44,191,.12)' : 'rgba(80,55,100,.045)', color: ativo ? 'primary.main' : 'text.secondary' }}><Icon sx={{ fontSize: 17 }} /></Box>
          <Typography sx={{ mt: .35, fontSize: '.63rem', fontWeight: 850, lineHeight: 1.1, color: ativo ? 'primary.dark' : 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.label}</Typography>
        </Box>;
      })}
      {onAdd && <Box role="button" tabIndex={0} aria-label="Criar nova categoria" onClick={onAdd} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onAdd()} sx={{ minHeight: 64, px: .45, py: .65, borderRadius: '13px', textAlign: 'center', cursor: 'pointer', border: '1.4px dashed rgba(123,44,191,.28)', bgcolor: 'rgba(123,44,191,.025)', '&:active': { transform: 'scale(.97)' } }}>
        <Box sx={{ mx: 'auto', width: 29, height: 29, borderRadius: '9px', display: 'grid', placeItems: 'center', bgcolor: 'rgba(123,44,191,.09)', color: 'primary.main' }}><AddRoundedIcon sx={{ fontSize: 18 }} /></Box>
        <Typography sx={{ mt: .35, fontSize: '.63rem', fontWeight: 900, color: 'primary.main' }}>Nova</Typography>
      </Box>}
    </Box>
  </Box>
);

const SeletorFrequencia = ({ value, onChange }) => (
  <Box>
    <LabelSecao>Frequência</LabelSecao>
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: .65 }}>
      {FREQUENCIAS.map(f => {
        const ativo = value === f.id; const Icon = f.Icon;
        return <Box key={f.id} role="button" tabIndex={0} aria-pressed={ativo} onClick={() => onChange(f.id)} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onChange(f.id)} sx={{ minWidth: 0, p: .7, borderRadius: '13px', textAlign: 'center', cursor: 'pointer', border: `1.4px solid ${ativo ? '#7B2CBF' : 'rgba(72,45,91,.09)'}`, bgcolor: ativo ? 'rgba(123,44,191,.065)' : '#fff', transition: 'all .15s', '&:active': { transform: 'scale(.97)' } }}>
          <Icon sx={{ fontSize: 18, color: ativo ? 'primary.main' : 'text.secondary' }} />
          <Typography sx={{ fontSize: '.66rem', fontWeight: 900, color: ativo ? 'primary.dark' : 'text.primary', lineHeight: 1.1 }}>{f.label}</Typography>
          <Typography sx={{ mt: .12, fontSize: '.59rem', color: 'text.disabled', lineHeight: 1.05 }}>{f.desc}</Typography>
        </Box>;
      })}
    </Box>
  </Box>
);

const StepperParcelas = ({ value, onChange }) => (
  <Box>
    <LabelSecao>Número de parcelas</LabelSecao>
    <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'rgba(123,44,191,.035)', borderRadius: '13px', border: '1px solid rgba(123,44,191,.12)', overflow: 'hidden', height: 44 }}>
      <Button onClick={() => onChange(Math.max(2, value - 1))} sx={{ minWidth: 44, height: '100%', p: 0, fontSize: '1.2rem', fontWeight: 900 }}>−</Button>
      <Typography sx={{ flex: 1, textAlign: 'center', fontWeight: 900, fontSize: '.96rem' }}>{value}×</Typography>
      <Button onClick={() => onChange(value + 1)} sx={{ minWidth: 44, height: '100%', p: 0, fontSize: '1.2rem', fontWeight: 900 }}>+</Button>
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
  const corTipo           = isEntrada ? '#119C72' : '#E54862';
  const categoriasBase = isEntrada ? categoriasEntradas : categoriasDespesas;
  const categoriasAtuais = [
    ...categoriasBase,
    ...categoriasCustom
      .filter(nome => !categoriasBase.some(cat => cat.id.toLocaleLowerCase('pt-BR') === String(nome).toLocaleLowerCase('pt-BR')))
      .map(nome => ({ id: nome, label: nome, Icon: CategoryRoundedIcon })),
  ];

  return (
    <Box sx={{ maxWidth: 500, margin: 'auto', px: { xs: 1.25, sm: 2 }, pt: .8, pb: 1.2 }}>
      <Snackbar open={toast.open} autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Box sx={{ bgcolor: '#1E293B', color: '#fff', px: 3, py: 1.5, borderRadius: '12px', fontWeight: 600 }}>
          {toast.texto}
        </Box>
      </Snackbar>

      <Card sx={{ p: { xs: 1.25, sm: 1.8 }, borderRadius: '19px', border: '1px solid rgba(72,45,91,.08)', boxShadow: '0 8px 26px rgba(45,11,94,.055)' }}>

        <Typography sx={{ fontWeight: 900, textAlign: 'left', mb: 1.2, fontSize: '1rem', color: 'text.primary' }}>
          {editItem ? 'Editar registro' : 'Novo lançamento'}
        </Typography>

        {/* ── toggle entrada / saída ──────────────────────────────── */}
        <Box sx={{ mb: 1.15 }}>
          <ToggleButtonGroup value={form.tipo} exclusive onChange={(e, v) => v && setForm({ ...form, tipo: v, categoria: 'Outros' })} sx={{ bgcolor: 'rgba(80,55,100,.035)', border: '1px solid rgba(72,45,91,.08)', borderRadius: '13px', p: .35, width: '100%', gap: .35, '& .MuiToggleButton-root': { border: 'none !important' } }}>
            <ToggleButton value="despesa" sx={{ flex: 1, minHeight: 42, py: .65, borderRadius: '10px !important', fontWeight: 900, color: 'text.secondary', gap: .45, '&.Mui-selected': { bgcolor: '#fff !important', color: 'text.primary', boxShadow: '0 3px 10px rgba(45,11,94,.07)' } }}><ArrowDownwardRoundedIcon sx={{ fontSize: 18, color: '#E54862' }} />Saída</ToggleButton>
            <ToggleButton value="entrada" sx={{ flex: 1, minHeight: 42, py: .65, borderRadius: '10px !important', fontWeight: 900, color: 'text.secondary', gap: .45, '&.Mui-selected': { bgcolor: '#fff !important', color: 'text.primary', boxShadow: '0 3px 10px rgba(45,11,94,.07)' } }}><ArrowUpwardRoundedIcon sx={{ fontSize: 18, color: '#119C72' }} />Entrada</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* ── descrição ──────────────────────────────────────────── */}
        <TextField fullWidth label="Descrição" value={form.nome}
          onChange={e => setForm({ ...form, nome: e.target.value })}
          sx={{ mb: 1.15, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: '12px' }}
        />

        {/* ── valor ──────────────────────────────────────────────── */}
        <Box sx={{ mb: 1.25, p: 1.15, bgcolor: 'rgba(123,44,191,.025)', borderRadius: '14px', border: '1px solid rgba(72,45,91,.08)', transition: 'all .25s' }}>
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: corTipo,
            textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.8 }}>
            {isEntrada ? 'Valor a receber' : 'Valor a pagar'}
          </Typography>
          <TextField fullWidth label="Valor (R$)"
            value={formatMoedaInput(form.valor, { comSimbolo: true })}
            onChange={handleValorChange} inputProps={propsInputMoeda}
            sx={{
              '& .MuiInputBase-input': { fontWeight: 800, fontSize: '1.12rem', color: 'text.primary' },
              '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.7)' },
            }}
          />
        </Box>

        {/* ── categoria ──────────────────────────────────────────── */}
        <Box sx={{ mb: 1.25 }}>
          <SeletorCategoria
            categorias={categoriasAtuais}
            value={form.categoria}
            onChange={cat => setForm({ ...form, categoria: cat })}
            corAtiva="#7B2CBF"
            onAdd={() => setModalCategoria(true)}
          />
        </Box>

        {/* ── DATA COMPLETA (BUG FIX) ────────────────────────────── */}
        <Box sx={{ mb: 1.25 }}>
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
              <Box sx={{ mt: .7, p: .9, bgcolor: 'rgba(123,44,191,.045)', borderRadius: '11px', border: '1px solid rgba(123,44,191,.11)', display: 'flex', gap: .65, alignItems: 'center' }}>
                <EventRoundedIcon sx={{ fontSize: '1rem', color: 'primary.main' }} />
                <Typography sx={{ fontSize: '.7rem', fontWeight: 750, color: 'text.secondary' }}>
                  Este lançamento será registrado em {mesAno}
                </Typography>
              </Box>
            );
            return null;
          })()}
        </Box>

        {/* ── frequência (somente no modo criação) ────────────────── */}
        {!editItem && (
          <Box sx={{ mb: 1.25 }}>
            <SeletorFrequencia
              value={form.recorrencia}
              onChange={v => setForm({ ...form, recorrencia: v })}
            />
          </Box>
        )}

        {/* ── nº de parcelas ──────────────────────────────────────── */}
        <Collapse in={form.recorrencia === 'parcelada' && !editItem}>
          <Box sx={{ mb: 1.25 }}>
            <StepperParcelas
              value={form.qtdVezes}
              onChange={v => setForm({ ...form, qtdVezes: Math.max(2, v) })}
            />
          </Box>
        </Collapse>

        {/* ── botões ──────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', gap: .8 }}>
          <Button fullWidth variant="outlined" color="inherit" onClick={cancelar}
            sx={{ fontWeight: 600, color: 'text.secondary', borderRadius: '12px', py: .9 }}>
            Cancelar
          </Button>
          <Button fullWidth variant="contained" onClick={salvar}
            sx={{ fontWeight: 900, borderRadius: '12px', py: .9,
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
