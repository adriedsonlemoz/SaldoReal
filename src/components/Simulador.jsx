import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';

const money = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

const Simulador = ({ acordos }) => {
  const [simulAcordoId, setSimulAcordoId] = useState('');
  const [simulValor, setSimulValor] = useState(0);

  const handleMoeda = (e) => {
    const num = parseFloat(e.target.value.replace(/\D/g, '')) / 100;
    setSimulValor(isNaN(num) ? 0 : num);
  };

  const resultado = useMemo(() => {
    if (!simulAcordoId || simulValor <= 0) return null;
    const acordo = acordos.find(a => a.id === simulAcordoId);
    if (!acordo || acordo.valorParcela <= 0) return null;

    const parcelasRestantes = acordo.parcelas - acordo.parcelasPagas;
    const valorRestanteTotal = parcelasRestantes * acordo.valorParcela;

    if (simulValor >= valorRestanteTotal) {
      return { acordo, qtd: parcelasRestantes, troco: simulValor - valorRestanteTotal, parcelasRestantes, novoRestanteParcelas: 0, valorRestanteTotal, novoValorRestante: 0, quitacaoTotal: true, progressoAtual: Math.round((acordo.parcelasPagas / acordo.parcelas) * 100), progressoNovo: 100 };
    }

    const qtdAbatida = Math.floor(simulValor / acordo.valorParcela);
    const pagasNestaSimulacao = Math.min(qtdAbatida, parcelasRestantes);
    const novoRestanteParcelas = parcelasRestantes - pagasNestaSimulacao;

    return {
      acordo, qtd: pagasNestaSimulacao,
      troco: simulValor - (pagasNestaSimulacao * acordo.valorParcela),
      parcelasRestantes, novoRestanteParcelas, valorRestanteTotal,
      novoValorRestante: novoRestanteParcelas * acordo.valorParcela,
      quitacaoTotal: novoRestanteParcelas === 0,
      progressoAtual: Math.round((acordo.parcelasPagas / acordo.parcelas) * 100),
      progressoNovo: Math.round(((acordo.parcelasPagas + pagasNestaSimulacao) / acordo.parcelas) * 100),
    };
  }, [simulAcordoId, simulValor, acordos]);

  const acordosElegiveis = acordos.filter(a => a.situacao === 'acordo' && a.parcelasPagas < a.parcelas);
  const fieldBg = { bgcolor: 'rgba(123,44,191,0.05)', '& fieldset': { borderColor: 'primary.main' } };

  return (
    <Card sx={{ p: { xs: 2, sm: 3 }, border: '2px solid', borderColor: 'primary.main', bgcolor: 'background.paper', borderRadius: '12px' }}>
      <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>🧮 Simular Antecipação</Typography>
      <Typography sx={{ mb: 3, color: 'text.secondary', fontSize: '0.85rem', lineHeight: 1.4 }}>
        Descubra quanto tempo de dívida consegue eliminar se injetar um valor extra (13º salário, bônus, renda extra).
      </Typography>

      <TextField select fullWidth label="Selecione o Acordo Ativo" value={simulAcordoId}
        onChange={e => { setSimulAcordoId(e.target.value); setSimulValor(0); }}
        sx={{ mb: 2, ...fieldBg }}>
        {acordosElegiveis.length === 0
          ? <MenuItem disabled value="">Nenhum acordo ativo com saldo devedor.</MenuItem>
          : acordosElegiveis.map(a => (
            <MenuItem key={a.id} value={a.id}>
              {a.empresa.toUpperCase()} (Faltam {a.parcelas - a.parcelasPagas}x de {money(a.valorParcela)})
            </MenuItem>
          ))}
      </TextField>

      {simulAcordoId && (
        <TextField fullWidth label="Valor Extra Disponível (R$)"
          value={simulValor === 0 ? '' : money(simulValor)} onChange={handleMoeda}
          inputProps={{ inputMode: 'numeric' }}
          sx={{ mb: 2, ...fieldBg }} />
      )}

      {resultado && (
        <Box sx={{ mt: 2, p: 2, bgcolor: resultado.quitacaoTotal ? 'rgba(34,197,94,0.08)' : 'rgba(123,44,191,0.08)', border: '2px dashed', borderColor: resultado.quitacaoTotal ? 'success.main' : 'primary.main', borderRadius: '8px' }}>
          <Typography sx={{ fontWeight: '900', color: resultado.quitacaoTotal ? 'success.main' : 'primary.main', fontSize: '1.2rem', textTransform: 'uppercase', textAlign: 'center', mb: 2, lineHeight: 1.2 }}>
            {resultado.quitacaoTotal ? '🎉 QUITAÇÃO TOTAL DA DÍVIDA!' : `⏳ AVANÇA ${resultado.qtd} MESES NO TEMPO!`}
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6} sx={{ textAlign: 'center', borderRight: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" sx={{ fontWeight: '900', color: 'text.secondary', textTransform: 'uppercase' }}>Cenário Atual</Typography>
              <Typography sx={{ fontWeight: '900', color: 'error.main', fontSize: '1.1rem', mt: 0.5 }}>Faltam {resultado.parcelasRestantes}x</Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>Dívida: {money(resultado.valorRestanteTotal)}</Typography>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: '900', color: 'text.secondary', textTransform: 'uppercase' }}>Novo Cenário</Typography>
              <Typography sx={{ fontWeight: '900', color: 'success.main', fontSize: '1.1rem', mt: 0.5 }}>Faltarão {resultado.novoRestanteParcelas}x</Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>Dívida: {money(resultado.novoValorRestante)}</Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: '900', color: 'text.primary', mb: 0.5, display: 'block', textTransform: 'uppercase' }}>Salto no Progresso:</Typography>
            <Box sx={{ width: '100%', bgcolor: 'rgba(123,44,191,0.15)', borderRadius: '6px', height: '24px', overflow: 'hidden', position: 'relative', display: 'flex' }}>
              <Box sx={{ width: `${resultado.progressoAtual}%`, bgcolor: 'primary.main', height: '100%' }} />
              <Box sx={{ width: `${resultado.progressoNovo - resultado.progressoAtual}%`, bgcolor: 'success.main', height: '100%' }} />
              <Typography sx={{ position: 'absolute', top: 0, left: 0, right: 0, textAlign: 'center', fontSize: '0.8rem', fontWeight: '900', color: '#fff', lineHeight: '24px', textShadow: '1px 1px 2px rgba(0,0,0,0.4)' }}>
                De {resultado.progressoAtual}% para {resultado.progressoNovo}%
              </Typography>
            </Box>
          </Box>
          <Box sx={{ bgcolor: 'rgba(123,44,191,0.06)', p: 1, borderRadius: '6px', border: '1px solid', borderColor: 'primary.main', textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 'bold', color: 'text.primary' }}>
              O seu Troco será de: <Box component="span" sx={{ color: 'primary.main', fontWeight: '900', fontSize: '1.1rem' }}>{money(resultado.troco)}</Box>
            </Typography>
          </Box>
        </Box>
      )}
    </Card>
  );
};

export default Simulador;
