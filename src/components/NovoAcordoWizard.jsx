// ─────────────────────────────────────────────────────────────────────────────
// src/components/NovoAcordoWizard.jsx
// BUG FIX #2 — Novo campo "Valor já pago" na etapa de parcelamento.
//              O valor pago é abatido do cálculo do saldo restante.
// BUG FIX #1 — Vencimento agora aceita Mês/Ano completo (não só o dia).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Fade from '@mui/material/Fade';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';

import FinanceiroService from '../services/FinanceiroService';
import FinanceiroUtils   from '../utils/financeiro';

// ── helpers ──────────────────────────────────────────────────────────────────
const money = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

const parseMoeda = (str) => {
  const num = parseFloat(String(str).replace(/\D/g, '')) / 100;
  return isNaN(num) ? 0 : num;
};

const BANCOS = [
  'Nubank', 'Itaú', 'Bradesco', 'Santander', 'Caixa Econômica',
  'Banco do Brasil', 'C6 Bank', 'Inter', 'BTG Pactual', 'Safra',
];
const ADMS = [
  'Recovery', 'JCS', 'Paschoalotto', 'Itapeva', 'Hoepers', 'Serasa',
  'Boa Vista', 'SPC', 'Acordo Certo', 'Quero Quitar',
];
const CATEGORIAS = [
  { id: 'Cartão de Crédito',  emoji: '💳' },
  { id: 'Empréstimo Pessoal', emoji: '🏦' },
  { id: 'Financiamento',      emoji: '📋' },
  { id: 'Imobiliário',        emoji: '🏠' },
  { id: 'Veículo',            emoji: '🚗' },
  { id: 'Serviços',           emoji: '📱' },
  { id: 'Outros',             emoji: '📂' },
];
const FORMAS_PAG = ['Boleto Bancário', 'Pix', 'Cartão de Crédito', 'Débito Automático'];

// ── Subcomponentes de apoio ───────────────────────────────────────────────────

const OptionCard = ({ selected, onClick, emoji, label, sub }) => (
  <Box role="button" tabIndex={0} aria-pressed={selected} onClick={onClick} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick()} sx={{
    p: 2, borderRadius: '16px', cursor: 'pointer', textAlign: 'center',
    border: '2px solid',
    borderColor: selected ? 'primary.main' : 'rgba(0,0,0,0.12)',
    bgcolor:     selected ? 'rgba(123,44,191,0.09)' : 'rgba(255,255,255,0.6)',
    transition: 'all .18s',
    transform:  selected ? 'scale(1.03)' : 'scale(1)',
    boxShadow:  selected ? '0 4px 20px rgba(123,44,191,0.18)' : 'none',
  }}>
    {emoji && <Typography sx={{ fontSize: '1.8rem', mb: 0.5 }}>{emoji}</Typography>}
    <Typography sx={{ fontWeight: 800, fontSize: '0.88rem',
      color: selected ? 'primary.main' : 'text.primary', lineHeight: 1.2 }}>
      {label}
    </Typography>
    {sub && (
      <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', mt: 0.4 }}>{sub}</Typography>
    )}
  </Box>
);

const ChipOption = ({ label, selected, onClick }) => (
  <Chip label={label} onClick={onClick} sx={{
    fontWeight: 700, fontSize: '0.82rem', px: 0.5, border: '2px solid',
    borderColor: selected ? 'primary.main' : 'rgba(0,0,0,0.15)',
    bgcolor:     selected ? 'rgba(123,44,191,0.1)' : 'rgba(255,255,255,0.7)',
    color:       selected ? 'primary.main' : 'text.primary',
    transition: 'all .15s',
    '&:hover': { bgcolor: 'rgba(123,44,191,0.12)', borderColor: 'primary.main' },
  }} />
);

const MoneyInput = ({ label, value, onChange, placeholder, helper }) => (
  <Box>
    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary', mb: 1 }}>
      {label}
    </Typography>
    <TextField
      fullWidth
      value={value === 0 ? '' : money(value)}
      onChange={(e) => onChange(parseMoeda(e.target.value))}
      placeholder={placeholder || 'R$ 0,00'}
      inputProps={{ inputMode: 'numeric' }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '14px', fontSize: '1.5rem', fontWeight: 800,
          bgcolor: 'rgba(255,255,255,0.7)',
        },
      }}
    />
    {helper && (
      <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', mt: 0.6, textAlign: 'center' }}>
        {helper}
      </Typography>
    )}
  </Box>
);

const StepWrapper = ({ emoji, pergunta, sub, children }) => (
  <Box sx={{ width: '100%', maxWidth: 520, mx: 'auto' }}>
    <Box sx={{ textAlign: 'center', mb: { xs: 1.6, sm: 2.2 } }}>
      {emoji && <Typography sx={{ fontSize: { xs: '1.55rem', sm: '1.8rem' }, mb: .55, lineHeight: 1 }}>{emoji}</Typography>}
      <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.08rem', sm: '1.2rem' }, color: 'text.primary', lineHeight: 1.25, mb: .45 }}>
        {pergunta}
      </Typography>
      {sub && <Typography sx={{ fontSize: '.78rem', color: 'text.secondary', lineHeight: 1.35 }}>{sub}</Typography>}
    </Box>
    {children}
  </Box>
);

const ResumoRow = ({ icon, label, value, highlight }) => (
  <Box sx={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    p: 1.2, borderRadius: '12px',
    bgcolor:     highlight ? 'rgba(34,197,94,0.08)'    : 'rgba(123,44,191,0.04)',
    border:      '1px solid',
    borderColor: highlight ? 'rgba(34,197,94,0.3)'     : 'rgba(123,44,191,0.1)',
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography sx={{ fontSize: '1rem' }}>{icon}</Typography>
      <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary', fontWeight: 600 }}>{label}</Typography>
    </Box>
    <Typography sx={{ fontSize: '0.9rem', fontWeight: 800,
      color: highlight ? '#16a34a' : 'text.primary' }}>
      {value}
    </Typography>
  </Box>
);

const mesAtualInput = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

// ════════════════════════════════════════════════════════════════════════════
const NovoAcordoWizard = ({ onConcluir, onCancelar, editandoId, editForm }) => {
  const [step,   setStep]   = useState(0);
  const [show,   setShow]   = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast,  setToast]  = useState('');

  const [form, setForm] = useState({
    situacao:             'acordo',
    empresa:              '',
    isAdministradora:     null,
    adm:                  '',
    categoria:            '',
    formaPagamento:       'Boleto Bancário',
    notas:                '',
    original:             0,
    valorNegociado:       0,
    valorJaPago:          0,     // ← NOVO: valor que o usuário já pagou da dívida
    temEntrada:           false,
    entrada:              0,
    parcelas:             1,
    valorParcela:         0,
    vencimentoDia:        10,
    vencimentoMesAno:     mesAtualInput(), // mês/ano do 1.º vencimento (YYYY-MM)
    parcelasPagas:        0,
    dataDivida:           '',
    dataAcordo:           FinanceiroUtils.dateParaISOInput(new Date()),
    historicoPagamentos:  [],
  });
  const parcelaManual = useRef(false);

  useEffect(() => {
    if (editForm) {
      setForm({
        ...editForm,
        isAdministradora: editForm.adm ? true : false,
        vencimentoMesAno: editForm.vencimentoMesAno || editForm.dataAcordo?.slice(0, 7) || mesAtualInput(),
      });
    }
  }, [editForm]);

  // ── cálculo da parcela base ───────────────────────────────────────────────
  /**
   * Base = (valorNegociado - valorJaPago - entrada) / parcelas
   * O campo "valorJaPago" abate o que já foi pago antes do acordo formal.
   */
  const parcelaBase = () => {
    let base = parseFloat(form.valorNegociado) || 0;
    base    -= parseFloat(form.valorJaPago)    || 0;
    if (form.temEntrada) base -= parseFloat(form.entrada) || 0;
    const n = parseInt(form.parcelas) || 1;
    return base > 0 ? base / n : 0;
  };

  useEffect(() => {
    if (parcelaManual.current) return;
    const base = parcelaBase();
    if (base > 0) setForm(prev => ({ ...prev, valorParcela: base }));
  }, [form.valorNegociado, form.valorJaPago, form.entrada, form.parcelas, form.temEntrada]);

  const economia = () => {
    const orig = parseFloat(form.original)        || 0;
    const neg  = parseFloat(form.valorNegociado)  || 0;
    return orig > neg && neg > 0 ? (((orig - neg) / orig) * 100).toFixed(0) : 0;
  };

  const saldoRestante = () => {
    const neg    = parseFloat(form.valorNegociado) || 0;
    const pago   = parseFloat(form.valorJaPago)    || 0;
    return Math.max(0, neg - pago);
  };

  const isAcordo = form.situacao === 'acordo';

  // ── lista de passos dinâmica ──────────────────────────────────────────────
  const steps = [
    'situacao',
    'credor_tipo',
    'credor_nome',
    ...(form.isAdministradora ? ['adm_nome'] : []),
    'categoria',
    'valor_original',
    ...(isAcordo ? ['valor_negociado', 'valor_ja_pago', 'parcelamento'] : ['vencimento_dia']),
    ...(isAcordo ? ['forma_pagamento'] : []),
    'data_divida',
    'notas',
    'resumo',
  ];

  const currentStep = steps[step];
  const progress    = (step / (steps.length - 1)) * 100;

  const goTo = (nextStep) => {
    setShow(false);
    setTimeout(() => { setStep(nextStep); setShow(true); }, 180);
  };
  const next = () => goTo(Math.min(step + 1, steps.length - 1));
  const back = () => goTo(Math.max(step - 1, 0));
  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  // ── salvar ────────────────────────────────────────────────────────────────
  const salvar = async () => {
    setSaving(true);
    try {
      const base    = parcelaBase();
      const parcela = parseFloat(form.valorParcela) || base;
      const obj     = { ...form };
      delete obj.isAdministradora;

      if (isAcordo) {
        // Dados legados podem não ter vencimentoMesAno. Ao salvar, normalizamos
        // para uma origem explícita das parcelas.
        obj.vencimentoMesAno = obj.vencimentoMesAno || obj.dataAcordo?.slice(0, 7) || mesAtualInput();
        obj.desconto        = economia();
        obj.valorParcela    = parcela > 0 ? parcela : base;
        obj.valorTotalReal  =
          (obj.temEntrada ? parseFloat(obj.entrada) : 0) +
          parseInt(obj.parcelas) * obj.valorParcela;
        // Registra os pagamentos já feitos no histórico
        if (obj.valorJaPago > 0 && obj.parcelasPagas === 0) {
          obj.historicoPagamentos = [{
            parcela:   0,
            data:      new Date().toLocaleDateString('pt-BR'),
            valorPago: obj.valorJaPago,
            descricao: 'Valor pago antes do acordo',
          }];
        }
      } else {
        obj.parcelas = 0; obj.valorParcela = 0; obj.parcelasPagas = 0;
        obj.valorTotalReal = obj.valorNegociado;
      }

      if (editandoId) await FinanceiroService.atualizarAcordo(editandoId, obj);
      else            await FinanceiroService.criarAcordo(obj);

      onConcluir();
    } catch (e) {
      console.error(e);
      setToast('❌ Erro ao salvar. Tente novamente.');
      setSaving(false);
    }
  };

  // ── renderização de cada passo ────────────────────────────────────────────
  const renderStep = () => {
    switch (currentStep) {

      case 'situacao':
        return (
          <StepWrapper emoji="🤝" pergunta="Você já negociou essa dívida?"
            sub="Isso vai definir como vamos registrá-la">
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: 1 }}>
              <OptionCard emoji="✅" label="Sim, está negociada" sub="Tenho parcelas a pagar"
                selected={form.situacao === 'acordo'}
                onClick={() => { update('situacao', 'acordo'); setTimeout(next, 200); }} />
              <OptionCard emoji="🔴" label="Não, está em aberto" sub="Dívida vencida sem acordo"
                selected={form.situacao === 'vencida'}
                onClick={() => { update('situacao', 'vencida'); setTimeout(next, 200); }} />
            </Box>
          </StepWrapper>
        );

      case 'credor_tipo':
        return (
          <StepWrapper emoji="🏢"
            pergunta="Essa dívida é com um banco/empresa ou com uma administradora de crédito?"
            sub="Administradoras: Recovery, Serasa, Paschoalotto...">
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: 1 }}>
              <OptionCard emoji="🏦" label="Banco ou empresa" sub="Ex: Nubank, Bradesco..."
                selected={form.isAdministradora === false}
                onClick={() => { update('isAdministradora', false); update('adm', ''); setTimeout(next, 200); }} />
              <OptionCard emoji="📋" label="Administradora" sub="Ex: Recovery, Serasa..."
                selected={form.isAdministradora === true}
                onClick={() => { update('isAdministradora', true); setTimeout(next, 200); }} />
            </Box>
          </StepWrapper>
        );

      case 'credor_nome':
        return (
          <StepWrapper emoji="🏷️"
            pergunta={form.isAdministradora ? 'Qual banco originou essa dívida?' : 'Com qual banco/empresa você tem essa dívida?'}
            sub="Digite o nome ou escolha abaixo">
            <Autocomplete
              freeSolo autoSelect options={BANCOS} value={form.empresa || ''}
              onInputChange={(_, value) => update('empresa', value)}
              onChange={(_, value) => update('empresa', value || '')}
              filterOptions={(options, state) => {
                const q = state.inputValue.trim().toLocaleLowerCase('pt-BR');
                const filtradas = q ? options.filter(v => v.toLocaleLowerCase('pt-BR').includes(q)) : options.slice(0, 5);
                return filtradas.slice(0, 5);
              }}
              ListboxProps={{ style: { maxHeight: 220 } }}
              renderInput={(params) => <TextField {...params} autoFocus placeholder="Digite Nubank, Itaú, Magazine Luiza..." helperText="Digite qualquer empresa ou selecione uma sugestão." />}
            />
          </StepWrapper>
        );

      case 'adm_nome':
        return (
          <StepWrapper emoji="📋" pergunta="Qual é a administradora responsável?" sub="Digite ou escolha abaixo">
            <Autocomplete
              freeSolo autoSelect options={ADMS} value={form.adm || ''}
              onInputChange={(_, value) => update('adm', value)}
              onChange={(_, value) => update('adm', value || '')}
              filterOptions={(options, state) => {
                const q = state.inputValue.trim().toLocaleLowerCase('pt-BR');
                const filtradas = q ? options.filter(v => v.toLocaleLowerCase('pt-BR').includes(q)) : options.slice(0, 5);
                return filtradas.slice(0, 5);
              }}
              ListboxProps={{ style: { maxHeight: 220 } }}
              renderInput={(params) => <TextField {...params} autoFocus placeholder="Digite Recovery, Serasa..." helperText="Você também pode informar outra administradora." />}
            />
          </StepWrapper>
        );

      case 'categoria':
        return (
          <StepWrapper emoji="🗂️" pergunta="Qual é o tipo dessa dívida?" sub="Escolha a categoria que melhor representa">
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.2, mt: 1 }}>
              {CATEGORIAS.map(c => (
                <OptionCard key={c.id} emoji={c.emoji} label={c.id}
                  selected={form.categoria === c.id}
                  onClick={() => { update('categoria', c.id); setTimeout(next, 200); }} />
              ))}
            </Box>
          </StepWrapper>
        );

      case 'valor_original':
        return (
          <StepWrapper emoji="💸" pergunta="Qual era o valor total dessa dívida?"
            sub={isAcordo ? 'O valor antes da negociação' : 'O valor atual da dívida'}>
            <MoneyInput
              label="Valor da dívida"
              value={form.original || form.valorNegociado}
              onChange={v => { update('original', v); if (!isAcordo) update('valorNegociado', v); }}
              helper="Deixe em branco se não souber o valor original"
            />
          </StepWrapper>
        );

      case 'valor_negociado':
        return (
          <StepWrapper emoji="🤑" pergunta="Por quanto você fechou o acordo?" sub="O valor total negociado">
            <MoneyInput
              label="Valor fechado no acordo"
              value={form.valorNegociado}
              onChange={v => update('valorNegociado', v)}
            />
            {economia() > 0 && (
              <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(34,197,94,0.1)', border: '1.5px solid #22C55E', borderRadius: '14px', textAlign: 'center' }}>
                <Typography sx={{ fontSize: '1.4rem' }}>🎉</Typography>
                <Typography sx={{ fontWeight: 900, color: '#16a34a', fontSize: '1rem' }}>
                  Você economizou {economia()}%!
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
                  {money(form.original - form.valorNegociado)} de desconto
                </Typography>
              </Box>
            )}
          </StepWrapper>
        );

      // ── NOVO PASSO: valor já pago ─────────────────────────────────────────
      case 'valor_ja_pago':
        return (
          <StepWrapper emoji="💵" pergunta="Você já pagou alguma parte dessa dívida?"
            sub="Informe o valor já pago para calcularmos o saldo correto">
            <MoneyInput
              label="Valor já pago (opcional)"
              value={form.valorJaPago}
              onChange={v => update('valorJaPago', v)}
              placeholder="R$ 0,00"
              helper="Este valor será abatido do cálculo das parcelas restantes"
            />
            {form.valorJaPago > 0 && form.valorNegociado > 0 && (
              <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(123,44,191,0.08)', border: '1.5px solid #7B2CBF', borderRadius: '14px', textAlign: 'center' }}>
                <Typography sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.78rem', mb: 0.3 }}>
                  Saldo restante a pagar
                </Typography>
                <Typography sx={{ fontWeight: 900, color: '#7B2CBF', fontSize: '1.4rem' }}>
                  {money(saldoRestante())}
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
                  {money(form.valorNegociado)} − {money(form.valorJaPago)} já pago
                </Typography>
              </Box>
            )}
            <Button variant="text" size="small" onClick={next}
              sx={{ mt: 1.5, display: 'block', mx: 'auto', fontSize: '0.78rem', color: 'text.secondary' }}>
              Pular (não paguei nada ainda)
            </Button>
          </StepWrapper>
        );

      case 'parcelamento':
        return (
          <StepWrapper emoji="📅" pergunta="Como vai ser o pagamento?"
            sub="Informe parcelas, entrada e vencimento">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

              {/* tem entrada? */}
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: 'text.secondary', mb: 1 }}>Possui entrada?</Typography>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  {[{ v: true, l: 'Sim' }, { v: false, l: 'Não' }].map(opt => (
                    <Box key={opt.l} role="button" tabIndex={0} aria-pressed={form.temEntrada === opt.v} onClick={() => update('temEntrada', opt.v)} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && update('temEntrada', opt.v)} sx={{
                      flex: 1, p: 1.2, borderRadius: '12px', cursor: 'pointer', textAlign: 'center',
                      border: '2px solid', transition: 'all .15s', fontWeight: 800, fontSize: '0.9rem',
                      borderColor: form.temEntrada === opt.v ? 'primary.main' : 'rgba(0,0,0,0.12)',
                      bgcolor:     form.temEntrada === opt.v ? 'rgba(123,44,191,0.08)' : 'transparent',
                      color:       form.temEntrada === opt.v ? 'primary.main' : 'text.primary',
                    }}>{opt.l}</Box>
                  ))}
                </Box>
              </Box>

              {form.temEntrada && (
                <MoneyInput label="Valor da entrada" value={form.entrada}
                  onChange={v => update('entrada', v)} />
              )}

              {/* nº parcelas */}
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: 'text.secondary', mb: 1 }}>
                  Número de parcelas
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.7)',
                  border: '1.5px solid rgba(0,0,0,0.2)', borderRadius: '14px', overflow: 'hidden', height: 56 }}>
                  <IconButton onClick={() => update('parcelas', Math.max(1, (parseInt(form.parcelas) || 1) - 1))}
                    sx={{ px: 2, fontSize: '1.5rem', color: 'primary.main' }}>−</IconButton>
                  <Typography sx={{ flex: 1, textAlign: 'center', fontWeight: 900, fontSize: '1.4rem' }}>
                    {form.parcelas}x
                  </Typography>
                  <IconButton onClick={() => update('parcelas', (parseInt(form.parcelas) || 1) + 1)}
                    sx={{ px: 2, fontSize: '1.5rem', color: 'primary.main' }}>+</IconButton>
                </Box>
                {parcelaBase() > 0 && (
                  <Typography sx={{ mt: 0.8, textAlign: 'center', fontSize: '0.8rem', color: 'primary.main', fontWeight: 700 }}>
                    ≈ {money(parcelaBase())} por parcela
                  </Typography>
                )}
              </Box>

              {/* ── vencimento: dia + mês/ano de início ── */}
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: 'text.secondary', mb: 1 }}>
                  Dia de vencimento de cada parcela
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 1.5 }}>
                  {[1, 5, 7, 10, 12, 15, 20, 25, 28, 30, 31].map(d => (
                    <Chip key={d} label={`Dia ${d}`} onClick={() => update('vencimentoDia', d)}
                      sx={{
                        fontWeight: 700, border: '2px solid',
                        borderColor: form.vencimentoDia === d ? 'primary.main' : 'rgba(0,0,0,0.15)',
                        bgcolor:     form.vencimentoDia === d ? 'rgba(123,44,191,0.1)' : 'rgba(255,255,255,0.7)',
                        color:       form.vencimentoDia === d ? 'primary.main' : 'text.primary',
                      }} />
                  ))}
                </Box>

                {/* Mês/Ano do 1.º vencimento — BUG FIX #1 */}
                <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: 'text.secondary', mb: 1 }}>
                  Mês/Ano do 1.º vencimento
                </Typography>
                <TextField
                  fullWidth type="month"
                  value={form.vencimentoMesAno || ''}
                  onChange={e => update('vencimentoMesAno', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.7)' } }}
                />
                <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', mt: 0.5, fontWeight: 600 }}>
                  O primeiro vencimento será calculado a partir deste mês
                </Typography>
              </Box>

              {/* data do acordo */}
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: 'text.secondary', mb: 1 }}>
                  Data em que o acordo foi feito
                </Typography>
                <TextField fullWidth type="date"
                  value={form.dataAcordo}
                  onChange={e => update('dataAcordo', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.7)' } }}
                />
              </Box>
            </Box>
          </StepWrapper>
        );

      case 'vencimento_dia':
        return (
          <StepWrapper emoji="📅" pergunta="Todo dia quanto vence essa dívida?" sub="Dia do mês em que cai o pagamento">
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mt: 1 }}>
              {[1, 5, 7, 10, 12, 15, 20, 25, 28, 30, 31].map(d => (
                <Chip key={d} label={`Dia ${d}`} onClick={() => update('vencimentoDia', d)}
                  sx={{
                    fontWeight: 700, fontSize: '0.9rem', p: '4px 8px', border: '2px solid',
                    borderColor: form.vencimentoDia === d ? 'primary.main' : 'rgba(0,0,0,0.15)',
                    bgcolor:     form.vencimentoDia === d ? 'rgba(123,44,191,0.1)' : 'rgba(255,255,255,0.7)',
                    color:       form.vencimentoDia === d ? 'primary.main' : 'text.primary',
                  }} />
              ))}
            </Box>
          </StepWrapper>
        );

      case 'forma_pagamento':
        return (
          <StepWrapper emoji="💳" pergunta="Como você vai pagar as parcelas?" sub="Forma de pagamento combinada">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mt: 1 }}>
              {FORMAS_PAG.map(f => (
                <Box key={f} role="button" tabIndex={0} aria-pressed={form.formaPagamento === f} onClick={() => update('formaPagamento', f)} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && update('formaPagamento', f)} sx={{
                  p: 1.5, borderRadius: '14px', cursor: 'pointer',
                  border: '2px solid',
                  borderColor: form.formaPagamento === f ? 'primary.main' : 'rgba(0,0,0,0.12)',
                  bgcolor:     form.formaPagamento === f ? 'rgba(123,44,191,0.08)' : 'rgba(255,255,255,0.6)',
                  fontWeight: 700, fontSize: '0.9rem',
                  color:  form.formaPagamento === f ? 'primary.main' : 'text.primary',
                  display: 'flex', alignItems: 'center', gap: 1, transition: 'all .15s',
                }}>
                  <Typography sx={{ fontSize: '1.3rem' }}>
                    {{ 'Boleto Bancário': '🎫', 'Pix': '⚡', 'Cartão de Crédito': '💳', 'Débito Automático': '🏦' }[f]}
                  </Typography>
                  {f}
                </Box>
              ))}
            </Box>
          </StepWrapper>
        );

      case 'data_divida':
        return (
          <StepWrapper emoji="📆" pergunta="Desde quando essa dívida existe?"
            sub="Opcional — ajuda a calcular a prescrição de 5 anos">
            <TextField fullWidth type="date"
              value={form.dataDivida || ''}
              onChange={e => update('dataDivida', e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px', fontSize: '1.1rem', bgcolor: 'rgba(255,255,255,0.7)' } }}
            />
            {form.dataDivida && (() => {
              const anos = (new Date() - new Date(form.dataDivida + 'T00:00:00')) / (1000 * 60 * 60 * 24 * 365.25);
              if (anos >= 5) return (
                <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(108,99,255,0.08)', border: '1.5px solid #6C63FF', borderRadius: '12px', textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '1.3rem' }}>⚖️</Typography>
                  <Typography sx={{ fontWeight: 800, color: '#6C63FF', fontSize: '0.9rem' }}>Dívida pode estar prescrita!</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>Acima de 5 anos — vale consultar um advogado</Typography>
                </Box>
              );
              if (anos >= 4) return (
                <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(245,158,11,0.08)', border: '1.5px solid #F59E0B', borderRadius: '12px', textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '1.3rem' }}>⚠️</Typography>
                  <Typography sx={{ fontWeight: 800, color: '#B45309', fontSize: '0.9rem' }}>Atenção: prescreve em menos de 1 ano</Typography>
                </Box>
              );
              return null;
            })()}
            <Button variant="text" size="small" onClick={next}
              sx={{ mt: 1.5, display: 'block', mx: 'auto', fontSize: '0.78rem', color: 'text.secondary' }}>
              Pular (não sei a data)
            </Button>
          </StepWrapper>
        );

      case 'notas':
        return (
          <StepWrapper emoji="📝" pergunta="Alguma observação sobre essa dívida?"
            sub="Opcional — anote protocolos, contatos...">
            <TextField fullWidth multiline rows={4} autoFocus
              value={form.notas || ''}
              onChange={e => update('notas', e.target.value)}
              placeholder="Ex: Protocolo #12345, falar com João..."
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px', bgcolor: 'rgba(255,255,255,0.7)' } }}
            />
            <Button variant="text" size="small" onClick={next}
              sx={{ mt: 1, display: 'block', mx: 'auto', fontSize: '0.78rem', color: 'text.secondary' }}>
              Pular
            </Button>
          </StepWrapper>
        );

      case 'resumo': {
        const base    = parcelaBase();
        const parcela = parseFloat(form.valorParcela) || base;
        const totalAcordo = isAcordo
          ? (form.temEntrada ? (parseFloat(form.entrada) || 0) : 0) + parseInt(form.parcelas) * parcela
          : form.valorNegociado;
        return (
          <StepWrapper emoji="✅" pergunta="Tudo certo! Revise antes de salvar" sub="">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              <ResumoRow icon="🏢" label="Credor"    value={form.empresa || '—'} />
              {form.adm && <ResumoRow icon="📋" label="Administradora" value={form.adm} />}
              <ResumoRow icon="🗂️" label="Categoria" value={form.categoria || '—'} />
              <ResumoRow icon="📌" label="Situação"  value={isAcordo ? '🤝 Acordo Ativo' : '🔴 Dívida Vencida'} />
              {form.original > 0 && <ResumoRow icon="💸" label="Valor original" value={money(form.original)} />}
              <ResumoRow icon="💰" label={isAcordo ? 'Valor negociado' : 'Valor da dívida'} value={money(form.valorNegociado)} />
              {isAcordo && <>
                {form.valorJaPago > 0 && <ResumoRow icon="💵" label="Já pago"  value={money(form.valorJaPago)} />}
                {saldoRestante() < form.valorNegociado && <ResumoRow icon="📉" label="Saldo restante" value={money(saldoRestante())} highlight />}
                {economia() > 0 && <ResumoRow icon="🎉" label="Desconto obtido" value={`${economia()}%`} highlight />}
                {form.temEntrada && <ResumoRow icon="💵" label="Entrada" value={money(form.entrada)} />}
                <ResumoRow icon="📅" label="Parcelamento" value={`${form.parcelas}x ${money(parcela)}`} />
                <ResumoRow icon="📆" label="Vencimento" value={`Todo dia ${form.vencimentoDia}${form.vencimentoMesAno ? ` · a partir de ${form.vencimentoMesAno.split('-').reverse().join('/')}` : ''}`} />
                <ResumoRow icon="💳" label="Forma de pagamento" value={form.formaPagamento} />
                <ResumoRow icon="🧾" label="Total do acordo" value={money(totalAcordo)} />
              </>}
            </Box>
          </StepWrapper>
        );
      }

      default:
        return null;
    }
  };

  const canAdvance = () => {
    switch (currentStep) {
      case 'credor_nome':    return form.empresa.trim().length > 0;
      case 'valor_negociado': return form.valorNegociado > 0;
      default:               return true;
    }
  };

  const isLastStep     = step === steps.length - 1;
  const isAutoAdvance  = ['situacao', 'credor_tipo', 'categoria'].includes(currentStep);

  return (
    <Box sx={{
      position: 'fixed', left: 0, right: 0, top: 'var(--app-safe-top)', bottom: 'var(--app-safe-bottom)', zIndex: 1300,
      bgcolor: 'background.default',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* header */}
      <Box sx={{
        px: { xs: 1.25, sm: 2 }, pt: .8, pb: .8,
        bgcolor: 'background.paper',
        borderBottom: '1px solid', borderColor: 'divider',
        display: 'flex', alignItems: 'center', gap: { xs: .75, sm: 1.2 },
      }}>
        <IconButton onClick={step === 0 ? onCancelar : back} size="small"
          sx={{ bgcolor: 'rgba(0,0,0,0.05)', borderRadius: '10px', width: 40, height: 40 }}>
          ←
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary' }}>
              {editandoId ? 'Editando registro' : 'Novo acordo'} · Passo {step + 1} de {steps.length}
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'primary.main' }}>
              {Math.round(progress)}%
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress}
            sx={{ height: 4, borderRadius: 3, bgcolor: 'rgba(123,44,191,0.1)',
              '& .MuiLinearProgress-bar': { bgcolor: 'primary.main', borderRadius: 3 } }} />
        </Box>
        <Button size="small" variant="text" onClick={onCancelar}
          sx={{ fontSize: '0.72rem', color: 'text.secondary', minWidth: 0 }}>
          Cancelar
        </Button>
      </Box>

      {/* conteúdo */}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: { xs: 1.25, sm: 2 }, py: { xs: 1.2, sm: 2 }, display: 'flex', flexDirection: 'column', justifyContent: { xs: 'flex-start', sm: 'center' }, '@media (min-height: 650px)': { justifyContent: 'center' }, '@media (max-height: 649px)': { justifyContent: 'flex-start' } }}>
        <Fade in={show} timeout={180}>
          <Box sx={{ width: '100%', my: 'auto' }}>{renderStep()}</Box>
        </Fade>
        {toast && (
          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'error.light', borderRadius: '12px', textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 700, color: 'error.dark' }}>{toast}</Typography>
          </Box>
        )}
      </Box>

      {/* footer */}
      {!isAutoAdvance && (
        <Box sx={{ px: { xs: 1.25, sm: 2 }, pb: 1.2, pt: .8, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
          {isLastStep ? (
            <Button fullWidth variant="contained" size="large" onClick={salvar} disabled={saving}
              sx={{ fontWeight: 900, borderRadius: '16px', py: 1.15, fontSize: '.92rem', letterSpacing: 0.5 }}>
              {saving ? '💾 Salvando...' : (editandoId ? '💾 Salvar alterações' : '✅ Salvar na carteira')}
            </Button>
          ) : (
            <Button fullWidth variant="contained" size="large" onClick={next} disabled={!canAdvance()}
              sx={{ fontWeight: 900, borderRadius: '16px', py: 1.15, fontSize: '.92rem' }}>
              Continuar →
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default NovoAcordoWizard;
