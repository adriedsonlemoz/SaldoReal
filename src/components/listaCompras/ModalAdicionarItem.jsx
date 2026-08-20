import React, { useState, useMemo, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Slide from '@mui/material/Slide';
import CloseIcon from '@mui/icons-material/Close';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import TagRoundedIcon from '@mui/icons-material/TagRounded';
import ScaleRoundedIcon from '@mui/icons-material/ScaleRounded';
import WaterDropRoundedIcon from '@mui/icons-material/WaterDropRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import SeletorCategoria from './SeletorCategoria';
import { UNIDADES, money, calcularValorItem } from './constants';
import { parseMoedaInput, formatMoedaInput, propsInputMoeda } from '../../utils/moedaInput';
import ListaComprasService from '../../services/ListaComprasService';

const Transition = React.forwardRef(function Transition(props, ref) { return <Slide direction="up" ref={ref} {...props} />; });
const FORM_VAZIO = { nome: '', categoria: 'Outros', quantidade: '1', unidade: 'un', precoPorMedida: '' };
const GRUPOS_UNIDADE = [...new Set(UNIDADES.map(u => u.grupo))];
const GRUPO_META = {
  Contagem: { Icon: TagRoundedIcon, descricao: 'unidades e dúzias' },
  Massa: { Icon: ScaleRoundedIcon, descricao: 'kg e gramas' },
  Volume: { Icon: WaterDropRoundedIcon, descricao: 'litros e ml' },
  Embalagem: { Icon: Inventory2RoundedIcon, descricao: 'caixas e pacotes' },
};
const UNIDADE_DESC = { un: 'unidade', dz: 'dúzia', kg: 'quilograma', g: 'grama', '500g': 'meio quilo', L: 'litro', ml: 'mililitro', '500ml': 'meio litro', cx: 'caixa', pct: 'pacote' };

const ModalAdicionarItem = ({ open, onClose, onAdicionar }) => {
  const [form, setForm] = useState(FORM_VAZIO);
  const [saving, setSaving] = useState(false);
  const [grupoUnidade, setGrupoUnidade] = useState('Contagem');
  const [sugestoes, setSugestoes] = useState([]);
  useEffect(() => {
    if (!open) return;
    setForm(FORM_VAZIO); setGrupoUnidade('Contagem');
    ListaComprasService.sugestoesProdutos().then(setSugestoes).catch(() => setSugestoes([]));
  }, [open]);
  const setField = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));
  const setQuantidade = (e) => {
    const valor = e.target.value.replace(',', '.').replace(/[^0-9.]/g, '');
    const partes = valor.split('.');
    const normalizado = partes.length > 1 ? `${partes[0]}.${partes.slice(1).join('')}` : valor;
    setForm(prev => ({ ...prev, quantidade: normalizado }));
  };
  const setPreco = (e) => setForm(prev => ({ ...prev, precoPorMedida: parseMoedaInput(e.target.value) }));
  const unidadesFiltradas = UNIDADES.filter(u => u.grupo === grupoUnidade);
  const valorTotal = useMemo(() => calcularValorItem({ quantidade: form.quantidade, unidade: form.unidade, precoPorMedida: form.precoPorMedida }), [form.quantidade, form.unidade, form.precoPorMedida]);
  const handleGrupoChange = (novoGrupo) => {
    if (!novoGrupo) return; setGrupoUnidade(novoGrupo);
    const primeira = UNIDADES.find(u => u.grupo === novoGrupo);
    if (primeira) setForm(prev => ({ ...prev, unidade: primeira.id }));
  };
  const handleAdicionar = async () => {
    if (!form.nome.trim()) return; setSaving(true);
    try {
      await onAdicionar({ nome: form.nome.trim(), categoria: form.categoria, quantidade: parseFloat(form.quantidade) || 1, unidade: form.unidade, precoPorMedida: parseFloat(form.precoPorMedida) || 0, valorTotal });
      onClose();
    } finally { setSaving(false); }
  };
  const podeSalvar = form.nome.trim().length > 0;
  return (
    <Dialog fullScreen open={open} onClose={onClose} TransitionComponent={Transition} PaperProps={{ sx: { bgcolor: 'background.default', backgroundImage: 'none' } }}>
      <AppBar position="sticky" elevation={0} sx={{ background: 'linear-gradient(135deg,#2D0B5E 0%,#5A189A 58%,#7B2CBF 100%)', color: '#fff', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <Toolbar sx={{ minHeight: '58px !important', px: '12px !important', pt: 'var(--app-safe-top)' }}>
          <IconButton edge="start" onClick={onClose} aria-label="Fechar" sx={{ color: '#fff', width: 40, height: 40, bgcolor: 'rgba(255,255,255,.08)' }}><CloseIcon /></IconButton>
          <Box sx={{ flex: 1, ml: 1.25, minWidth: 0 }}>
            <Typography sx={{ fontSize: '.61rem', fontWeight: 800, opacity: .72, lineHeight: 1.05 }}>LISTA DE COMPRAS</Typography>
            <Typography sx={{ fontWeight: 900, fontSize: '.96rem', lineHeight: 1.2, mt: .2 }}>Adicionar item</Typography>
          </Box>
          <Button variant="contained" size="small" disabled={!podeSalvar || saving} onClick={handleAdicionar} startIcon={<AddShoppingCartIcon sx={{ fontSize: '18px !important' }} />} sx={{
            minHeight: 40, borderRadius: '11px', px: 1.45, fontWeight: 900,
            background: 'linear-gradient(135deg,#D82B8B 0%,#F72585 100%)', boxShadow: '0 5px 16px rgba(247,37,133,.25)',
            '&.Mui-disabled': { color: 'rgba(255,255,255,.55)', background: 'rgba(255,255,255,.12)' },
          }}>{saving ? 'Salvando…' : 'Adicionar'}</Button>
        </Toolbar>
      </AppBar>
      <DialogContent sx={{ px: { xs: 1.25, sm: 2.5 }, py: 1.35, pb: 'calc(16px + var(--app-safe-bottom))', maxWidth: 560, mx: 'auto', width: '100%' }}>
        <Typography sx={sectionLabel}>Produto</Typography>
        <Autocomplete
          freeSolo autoSelect options={sugestoes}
          getOptionLabel={(op) => typeof op === 'string' ? op : op.nome}
          filterOptions={(options, state) => {
            const q = state.inputValue.trim().toLocaleLowerCase('pt-BR');
            return options.filter(op => !q || op.nome.toLocaleLowerCase('pt-BR').includes(q)).slice(0, 5);
          }}
          onInputChange={(_, value) => setForm(prev => ({ ...prev, nome: value }))}
          onChange={(_, op) => {
            if (!op || typeof op === 'string') return;
            const unidade = op.unidade || 'un';
            const meta = UNIDADES.find(u => u.id === unidade);
            setForm(prev => ({ ...prev, nome: op.nome, categoria: op.categoria || 'Outros', unidade }));
            if (meta?.grupo) setGrupoUnidade(meta.grupo);
          }}
          ListboxProps={{ style: { maxHeight: 220 } }}
          renderInput={(params) => <TextField {...params} autoFocus placeholder="Ex.: arroz, carne moída, detergente…" sx={inputSx} inputProps={{ ...params.inputProps, maxLength: 80, autoComplete: 'off' }} helperText={sugestoes.length ? 'Sugestões aprendidas com seus itens anteriores.' : 'Digite o produto normalmente.'} />}
        />
        <Divider sx={{ my: 1.35 }} />
        <Typography sx={sectionLabel}>Categoria</Typography>
        <Box sx={{ mt: .8 }}><SeletorCategoria value={form.categoria} onChange={(id) => setForm(prev => ({ ...prev, categoria: id }))} /></Box>
        <Divider sx={{ my: 1.35 }} />
        <Box sx={{ mb: 1.1 }}>
          <Typography sx={sectionLabel}>Quantidade e unidade</Typography>
          <Typography sx={{ fontSize: '.75rem', color: 'text.secondary', mt: .25 }}>Primeiro escolha o tipo de medida e depois a unidade.</Typography>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0,1fr))', sm: 'repeat(4, minmax(0,1fr))' }, gap: .65, mb: 1 }}>
          {GRUPOS_UNIDADE.map(g => { const ativo = grupoUnidade === g; const meta = GRUPO_META[g] || { Icon: TagRoundedIcon, descricao: '' }; const Icon = meta.Icon; return (
            <Box key={g} role="button" tabIndex={0} aria-pressed={ativo} onClick={() => handleGrupoChange(g)} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleGrupoChange(g)} sx={{ minHeight: 48, px: .75, py: .6, borderRadius: '12px', border: `1.3px solid ${ativo ? '#7B2CBF' : 'rgba(72,45,91,.10)'}`, bgcolor: ativo ? 'rgba(123,44,191,.07)' : '#fff', display: 'flex', alignItems: 'center', gap: .6, cursor: 'pointer', userSelect: 'none', boxShadow: ativo ? '0 3px 10px rgba(123,44,191,.07)' : 'none', '&:active': { transform: 'scale(.98)' } }}>
              <Box sx={{ width: 28, height: 28, borderRadius: '9px', flexShrink: 0, display: 'grid', placeItems: 'center', bgcolor: ativo ? 'rgba(123,44,191,.12)' : 'rgba(80,55,100,.045)', color: ativo ? 'primary.main' : 'text.secondary' }}><Icon sx={{ fontSize: 16 }} /></Box>
              <Box sx={{ minWidth: 0 }}><Typography sx={{ fontSize: '.7rem', fontWeight: 900, color: ativo ? 'primary.dark' : 'text.primary', lineHeight: 1.05 }}>{g}</Typography><Typography sx={{ fontSize: '.59rem', color: 'text.secondary', mt: .12, lineHeight: 1.05 }}>{meta.descricao}</Typography></Box>
            </Box>
          ); })}
        </Box>
        <Box sx={{ p: 1, borderRadius: '15px', bgcolor: 'rgba(123,44,191,.035)', border: '1px solid rgba(123,44,191,.10)', mb: 1.4 }}>
          <Typography sx={{ fontSize: '.68rem', fontWeight: 900, color: '#6A23A7', textTransform: 'uppercase', letterSpacing: '.55px', mb: .7 }}>Unidade</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: .7 }}>
            {unidadesFiltradas.map(u => { const ativo = form.unidade === u.id; return (
              <Box key={u.id} role="button" tabIndex={0} aria-pressed={ativo} onClick={() => setForm(prev => ({ ...prev, unidade: u.id }))} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setForm(prev => ({ ...prev, unidade: u.id }))} sx={{
                minHeight: 50, px: .6, py: .55, borderRadius: '12px', border: '1.5px solid', borderColor: ativo ? '#7B2CBF' : '#E3DCE9',
                background: ativo ? 'linear-gradient(135deg,#6A23A7,#8D42C9)' : '#fff', color: ativo ? '#fff' : 'text.primary',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', userSelect: 'none',
                boxShadow: ativo ? '0 5px 14px rgba(123,44,191,.20)' : 'none', '&:active': { transform: 'scale(.97)' },
              }}>
                {ativo && <CheckRoundedIcon sx={{ position: 'absolute', top: 4, right: 4, fontSize: 14, opacity: .9 }} />}
                <Typography sx={{ fontSize: '.82rem', fontWeight: 900, lineHeight: 1 }}>{u.label}</Typography>
                <Typography sx={{ fontSize: '.61rem', fontWeight: 700, opacity: ativo ? .82 : .62, mt: .3, lineHeight: 1.05, textAlign: 'center' }}>{UNIDADE_DESC[u.id] || u.base}</Typography>
              </Box>
            ); })}
          </Box>
        </Box>
        <TextField fullWidth label={`Quantidade (${form.unidade})`} placeholder="Ex.: 1, 500, 2.5" value={form.quantidade} onChange={setQuantidade} inputProps={{ inputMode: 'decimal', autoComplete: 'off' }} sx={inputSx} />
        <Divider sx={{ my: 1.35 }} />
        <Typography sx={sectionLabel}>Preço por {form.unidade}</Typography>
        <TextField fullWidth label={`R$ por ${form.unidade}`} placeholder="Ex.: 35,90" value={formatMoedaInput(form.precoPorMedida)} onChange={setPreco} inputProps={propsInputMoeda} sx={{ ...inputSx, mt: .8 }} InputProps={{ startAdornment: <Typography sx={{ mr: .6, color: 'text.secondary', fontWeight: 900 }}>R$</Typography> }} />
        {valorTotal > 0 && <Box sx={{ mt: 1.3, p: 1.35, borderRadius: '15px', background: 'linear-gradient(135deg, rgba(123,44,191,.08), rgba(247,37,133,.055))', border: '1px solid rgba(123,44,191,.16)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
          <Box sx={{ minWidth: 0 }}><Typography sx={{ fontSize: '.61rem', fontWeight: 900, color: '#6A23A7', textTransform: 'uppercase', letterSpacing: .45 }}>Total estimado</Typography><Typography sx={{ fontSize: '.7rem', color: 'text.secondary', mt: .15 }}>{form.quantidade || 1} {form.unidade} × {money(Number(form.precoPorMedida) || 0)}/{form.unidade}</Typography></Box>
          <Typography sx={{ fontWeight: 900, fontSize: '1.28rem', color: '#7B2CBF', whiteSpace: 'nowrap' }}>{money(valorTotal)}</Typography>
        </Box>}
        <Button fullWidth variant="contained" size="large" disabled={!podeSalvar || saving} onClick={handleAdicionar} startIcon={<AddShoppingCartIcon />} sx={{ mt: 2.2, py: 1.25, fontWeight: 900, fontSize: '.95rem', borderRadius: '15px' }}>{saving ? 'Adicionando…' : `Adicionar ${form.nome ? `“${form.nome}”` : 'item'} à lista`}</Button>
      </DialogContent>
    </Dialog>
  );
};
const sectionLabel = { fontSize: '.7rem', fontWeight: 900, color: '#6F6479', letterSpacing: '.75px', textTransform: 'uppercase' };
const inputSx = { mt: .8, '& .MuiOutlinedInput-root': { borderRadius: '14px', fontWeight: 700 } };
export default ModalAdicionarItem;
