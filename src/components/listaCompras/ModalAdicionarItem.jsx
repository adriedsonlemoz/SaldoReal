// src/components/listaCompras/ModalAdicionarItem.jsx
//
// Modal FULL-SCREEN para adicionar um item à lista.
// Suporte a: nome, categoria, quantidade, unidade de medida dinâmica,
// preço por medida e cálculo automático do valor total.

import React, { useState, useMemo, useEffect } from 'react';
import Dialog         from '@mui/material/Dialog';
import DialogContent  from '@mui/material/DialogContent';
import AppBar         from '@mui/material/AppBar';
import Toolbar        from '@mui/material/Toolbar';
import IconButton     from '@mui/material/IconButton';
import Typography     from '@mui/material/Typography';
import Box            from '@mui/material/Box';
import TextField      from '@mui/material/TextField';
import Button         from '@mui/material/Button';
import ToggleButton   from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Divider        from '@mui/material/Divider';
import Slide          from '@mui/material/Slide';
import CloseIcon      from '@mui/icons-material/Close';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

import SeletorCategoria              from './SeletorCategoria';
import { UNIDADES, money, calcularValorItem } from './constants';

// Animação de entrada do dialog (slide from bottom)
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const FORM_VAZIO = {
  nome:           '',
  categoria:      'Outros',
  quantidade:     '1',
  unidade:        'un',
  precoPorMedida: '',
};

// Agrupa unidades por grupo para o seletor
const GRUPOS_UNIDADE = [...new Set(UNIDADES.map(u => u.grupo))];

/**
 * @param {boolean}  open
 * @param {Function} onClose   - () => void
 * @param {Function} onAdicionar - (dadosItem) => Promise<void>
 */
const ModalAdicionarItem = ({ open, onClose, onAdicionar }) => {
  const [form, setForm]     = useState(FORM_VAZIO);
  const [saving, setSaving] = useState(false);
  const [grupoUnidade, setGrupoUnidade] = useState('Contagem');

  // Reseta ao abrir
  useEffect(() => {
    if (open) {
      setForm(FORM_VAZIO);
      setGrupoUnidade('Contagem');
    }
  }, [open]);

  const setField = (key) => (e) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  // Filtra unidades pelo grupo selecionado
  const unidadesFiltradas = UNIDADES.filter(u => u.grupo === grupoUnidade);

  // Recalcula valor total em tempo real
  const valorTotal = useMemo(() =>
    calcularValorItem({
      quantidade:     form.quantidade,
      unidade:        form.unidade,
      precoPorMedida: form.precoPorMedida,
    }),
  [form.quantidade, form.unidade, form.precoPorMedida]);

  const handleGrupoChange = (_, novoGrupo) => {
    if (!novoGrupo) return;
    setGrupoUnidade(novoGrupo);
    // Seleciona automaticamente a primeira unidade do grupo
    const primeira = UNIDADES.find(u => u.grupo === novoGrupo);
    if (primeira) setForm(prev => ({ ...prev, unidade: primeira.id }));
  };

  const handleAdicionar = async () => {
    if (!form.nome.trim()) return;
    setSaving(true);
    try {
      await onAdicionar({
        nome:           form.nome.trim(),
        categoria:      form.categoria,
        quantidade:     parseFloat(form.quantidade) || 1,
        unidade:        form.unidade,
        precoPorMedida: parseFloat(form.precoPorMedida) || 0,
        valorTotal,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const podeSalvar = form.nome.trim().length > 0;

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          bgcolor: 'background.default',
          backgroundImage: 'none',
        },
      }}
    >
      {/* ── AppBar do modal ───────────────────────────────────────────────── */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg,#0F766E 0%,#06B6D4 100%)',
          borderBottom: 'none',
          color: '#fff',
        }}
      >
        <Toolbar>
          <IconButton edge="start" onClick={onClose} sx={{ color: '#fff' }}>
            <CloseIcon />
          </IconButton>
          <Typography
            sx={{ flex: 1, fontWeight: 800, fontSize: '1.05rem', ml: 1 }}
          >
            ➕ Adicionar Item
          </Typography>
          <Button
            variant="contained"
            size="small"
            disabled={!podeSalvar || saving}
            onClick={handleAdicionar}
            startIcon={<AddShoppingCartIcon />}
            sx={{
              fontWeight: 800,
              borderRadius: '10px',
              px: 2,
              py: 0.8,
            }}
          >
            {saving ? 'Adicionando…' : 'Adicionar'}
          </Button>
        </Toolbar>
      </AppBar>

      {/* ── Conteúdo ─────────────────────────────────────────────────────── */}
      <DialogContent sx={{ px: 2, py: 3, maxWidth: 560, mx: 'auto', width: '100%' }}>

        {/* 1 ── Nome do produto */}
        <Typography variant="overline" sx={sectionLabel}>
          Produto
        </Typography>
        <TextField
          fullWidth
          autoFocus
          placeholder="Ex: Carne Moída, Arroz, Detergente…"
          value={form.nome}
          onChange={setField('nome')}
          onKeyDown={(e) => e.key === 'Enter' && podeSalvar && handleAdicionar()}
          sx={inputSx}
          inputProps={{ maxLength: 80 }}
        />

        <Divider sx={{ my: 2.5 }} />

        {/* 2 ── Categoria */}
        <Typography variant="overline" sx={sectionLabel}>
          Categoria
        </Typography>
        <Box sx={{ mt: 1, mb: 0.5 }}>
          <SeletorCategoria
            value={form.categoria}
            onChange={(id) => setForm(prev => ({ ...prev, categoria: id }))}
          />
        </Box>

        <Divider sx={{ my: 2.5 }} />

        {/* 3 ── Quantidade + Unidade */}
        <Typography variant="overline" sx={sectionLabel}>
          Quantidade e unidade
        </Typography>

        {/* Grupo de unidade (Contagem / Massa / Volume / Embalagem) */}
        <ToggleButtonGroup
          value={grupoUnidade}
          exclusive
          onChange={handleGrupoChange}
          fullWidth
          size="small"
          sx={{ mt: 1, mb: 1.5, '& .MuiToggleButton-root': { fontWeight: 700, fontSize: '0.72rem', borderRadius: '10px', textTransform: 'none' } }}
        >
          {GRUPOS_UNIDADE.map(g => (
            <ToggleButton key={g} value={g}>{g}</ToggleButton>
          ))}
        </ToggleButtonGroup>

        {/* Unidades do grupo selecionado */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {unidadesFiltradas.map(u => {
            const ativo = form.unidade === u.id;
            return (
              <Box
                key={u.id}
                onClick={() => setForm(prev => ({ ...prev, unidade: u.id }))}
                sx={{
                  px: 1.8,
                  py: 0.8,
                  borderRadius: '12px',
                  border: '2px solid',
                  borderColor: ativo ? 'primary.main' : '#E0E0E0',
                  bgcolor: ativo ? 'primary.light' : 'background.paper',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  color: ativo ? 'primary.main' : 'text.secondary',
                  transition: 'all .15s',
                  userSelect: 'none',
                  '&:active': { transform: 'scale(0.92)' },
                }}
              >
                {u.label}
              </Box>
            );
          })}
        </Box>

        {/* Quantidade numérica */}
        <TextField
          fullWidth
          label={`Quantidade (${form.unidade})`}
          placeholder="Ex: 1, 500, 2.5"
          value={form.quantidade}
          onChange={setField('quantidade')}
          type="number"
          inputProps={{ min: 0, step: 'any', inputMode: 'decimal' }}
          sx={inputSx}
        />

        <Divider sx={{ my: 2.5 }} />

        {/* 4 ── Preço por medida */}
        <Typography variant="overline" sx={sectionLabel}>
          Preço por {form.unidade}
        </Typography>
        <TextField
          fullWidth
          label={`R$ por ${form.unidade}`}
          placeholder="Ex: 35.90"
          value={form.precoPorMedida}
          onChange={setField('precoPorMedida')}
          type="number"
          inputProps={{ min: 0, step: 'any', inputMode: 'decimal' }}
          sx={{ ...inputSx, mt: 1 }}
          InputProps={{
            startAdornment: (
              <Typography sx={{ mr: 0.5, color: 'text.secondary', fontWeight: 700 }}>
                R$
              </Typography>
            ),
          }}
        />

        {/* ── Preview do valor total ──────────────────────────────────── */}
        {valorTotal > 0 && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(15,118,110,.06) 0%, rgba(6,182,212,.07) 100%)',
              border: '1.5px solid rgba(13,148,136,.24)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Valor estimado total
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', mt: 0.2 }}>
                {form.quantidade || 1} {form.unidade} × {money(parseFloat(form.precoPorMedida) || 0)}/{form.unidade}
              </Typography>
            </Box>
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: '1.5rem',
                background: 'linear-gradient(135deg, #0D9488 0%, #06B6D4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {money(valorTotal)}
            </Typography>
          </Box>
        )}

        {/* Botão Adicionar (também na base do scroll) */}
        <Button
          fullWidth
          variant="contained"
          size="large"
          disabled={!podeSalvar || saving}
          onClick={handleAdicionar}
          startIcon={<AddShoppingCartIcon />}
          sx={{
            mt: 4,
            py: 1.6,
            fontWeight: 900,
            fontSize: '1rem',
            borderRadius: '16px',
          }}
        >
          {saving ? 'Adicionando…' : `Adicionar "${form.nome || 'Item'}" à lista`}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

// ── Estilos partilhados ─────────────────────────────────────────────────────
const sectionLabel = {
  fontSize: '0.68rem',
  fontWeight: 700,
  color: 'text.secondary',
  letterSpacing: '0.8px',
};

const inputSx = {
  mt: 1,
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    fontWeight: 600,
  },
};

export default ModalAdicionarItem;
