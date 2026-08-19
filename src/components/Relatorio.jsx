import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import Chip from '@mui/material/Chip';

import FinanceiroUtils from '../utils/financeiro';
import FinanceiroService from '../services/FinanceiroService';

const money = (v) => FinanceiroUtils.money(v);
const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const ORIGENS = { manual: '✍️ Manual', lista_compras: '🛒 Compras', acordo: '🤝 Acordo', renda: '💰 Renda' };

const GraficoBarras = ({ dados }) => {
  const maxVal = Math.max(...dados.map(d => Math.max(d.entradas, d.saidas)), 1);
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: { xs: '4px', sm: '8px' }, height: 160, px: 1, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        {dados.map((d, i) => {
          const hEnt = Math.round((d.entradas / maxVal) * 140);
          const hSai = Math.round((d.saidas   / maxVal) * 140);
          return (
            <Box key={i} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: 140 }}>
                <Box title={`Entradas: ${money(d.entradas)}`} sx={{ width: { xs: '10px', sm: '14px' }, height: `${hEnt}px`, bgcolor: '#22C55E', borderRadius: '3px 3px 0 0', minHeight: d.entradas > 0 ? 3 : 0 }} />
                <Box title={`Saídas: ${money(d.saidas)}`}     sx={{ width: { xs: '10px', sm: '14px' }, height: `${hSai}px`, bgcolor: '#EF4444', borderRadius: '3px 3px 0 0', minHeight: d.saidas  > 0 ? 3 : 0 }} />
              </Box>
              <Typography sx={{ fontSize: { xs: '0.64rem', sm: '0.68rem' }, fontWeight: 700, color: 'text.secondary', mt: 0.5 }}>{d.label}</Typography>
            </Box>
          );
        })}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 1.5 }}>
        {[{ cor: '#22C55E', label: 'Entradas' }, { cor: '#EF4444', label: 'Saídas' }].map(l => (
          <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Box sx={{ width: 10, height: 10, bgcolor: l.cor, borderRadius: '3px' }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}>{l.label}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const Relatorio = ({ setRoute }) => {
  const [mesOffset, setMesOffset]       = useState(0);
  const [dados, setDados]               = useState(null);
  const [dadosGrafico, setDadosGrafico] = useState([]);
  const [toast, setToast]               = useState({ open: false, texto: '' });

  const mesAlvo      = FinanceiroUtils.mesComOffset(mesOffset);
  const mesAnoTarget = FinanceiroUtils.dateParaMesAno(mesAlvo);
  const nomeMes      = `${MESES[mesAlvo.getMonth()]} / ${mesAlvo.getFullYear()}`;

  const calcular = useCallback(async () => {
    const [relatorio, grafico] = await Promise.all([
      FinanceiroService.dadosRelatorio(mesOffset),
      FinanceiroService.dadosGrafico(6),
    ]);
    setDados(relatorio);
    setDadosGrafico(grafico);
  }, [mesOffset]);

  useEffect(() => { calcular(); }, [calcular]);

  const copiarRelatorio = () => {
    if (!dados) return;
    let txt = `📊 RELATÓRIO — ${nomeMes.toUpperCase()}\n${'─'.repeat(38)}\n`;
    txt += `Entradas: ${money(dados.totalEnt)}\nSaídas: ${money(dados.totalSai)}\nSaldo: ${money(dados.totalEnt - dados.totalSai)}\n\n`;
    if (dados.entradasPagas.length || dados.entradas.length) {
      txt += `🔺 ENTRADAS\n`;
      [...dados.entradasPagas.map(g => ({...g,_p:true})), ...dados.entradas.map(g => ({...g,_p:false}))].forEach(g => {
        txt += `  ${g._p ? '✅' : '⏳'} ${g.nome} — ${money(g.valor)}\n`;
      });
      txt += '\n';
    }
    if (dados.despesasPagas.length || dados.despesas.length) {
      txt += `🔻 GASTOS\n`;
      [...dados.despesasPagas.map(g => ({...g,_p:true})), ...dados.despesas.map(g => ({...g,_p:false}))].forEach(g => {
        txt += `  ${g._p ? '✅' : '⏳'} ${g.nome} — ${money(g.valor)}\n`;
      });
      txt += '\n';
    }
    if (dados.acordosPagos.length || dados.acordosPendentes.length) {
      txt += `🤝 ACORDOS\n`;
      [...dados.acordosPagos.map(a => ({...a,_p:true})), ...dados.acordosPendentes.map(a => ({...a,_p:false}))].forEach(a => {
        txt += `  ${a._p ? '✅' : '⏳'} ${a.empresa} — ${money(a.valorFluxo ?? a.valorParcela)} (${a._p ? `${a.pagamentosMes || 1} pagamento(s) no mês` : `${a.parcelasDevidas || 1} parcela(s) devida(s)`})\n`;
      });
    }
    txt += '\n📱 Gerado por SaldoReal';
    navigator.clipboard.writeText(txt)
      .then(() => setToast({ open: true, texto: '📋 Relatório copiado!' }))
      .catch(() => setToast({ open: true, texto: '❌ Erro ao copiar.' }));
  };

  const saldo     = dados ? dados.totalEnt - dados.totalSai : 0;
  const saldoPago = dados ? dados.totalEntPago - dados.totalSaiPago : 0;

  const SecaoLista = ({ titulo, itens, cor }) => (
    itens.length > 0 && (
      <Card sx={{ mb: 2, overflow: 'hidden', border: `1.5px solid ${cor}20` }}>
        <Box sx={{ bgcolor: cor, p: 1.2, px: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>{titulo}</Typography>
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>
            {money(itens.reduce((s, i) => s + (i.valorFluxo ?? i.valor ?? i.valorParcela ?? 0), 0))}
          </Typography>
        </Box>
        <Box sx={{ p: 1.5 }}>
          {itens.map((item, i) => (
            <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.8, borderBottom: i < itens.length - 1 ? '1px dashed' : 'none', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography>{item._pago ? '✅' : '⏳'}</Typography>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: 'text.primary', textDecoration: item._pago ? 'line-through' : 'none' }}>
                      {item.nome || item.empresa}
                    </Typography>
                    {item.origem && ORIGENS[item.origem] && (
                      <Chip label={ORIGENS[item.origem]} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }} />
                    )}
                  </Box>
                  <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                    {item.empresa
                      ? `Dia ${item.vencimentoDia} · ${item._pago ? `${item.pagamentosMes || 1} pagamento(s) no mês` : `${item.parcelasDevidas || 1} parcela(s) devida(s)`}`
                      : `Dia ${item.dia} · ${item.categoria}`}
                  </Typography>
                </Box>
              </Box>
              <Typography sx={{ fontWeight: 700, color: cor, fontSize: '0.9rem', textDecoration: item._pago ? 'line-through' : 'none' }}>
                {money(item.valorFluxo ?? item.valor ?? item.valorParcela)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Card>
    )
  );

  return (
    <Box sx={{ maxWidth: 620, margin: 'auto', pb: { xs: 1.5, sm: 2.5 }, px: { xs: 1.5, sm: 2 } }}>
      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Box sx={{ background: 'linear-gradient(135deg,#2D0B5E,#5A189A)', color: '#fff', px: 3, py: 1.5, borderRadius: '12px', fontWeight: 600 }}>{toast.texto}</Box>
      </Snackbar>

      {/* Gráfico */}
      <Card sx={{ mb: 2, overflow: 'hidden' }}>
        <Box sx={{ bgcolor: 'primary.main', p: 1.2, px: 2 }}>
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>📊 Evolução — Últimos 6 meses</Typography>
        </Box>
        <Box sx={{ p: 2 }}>
          {dadosGrafico.length > 0
            ? <GraficoBarras dados={dadosGrafico} />
            : <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 3 }}>Sem dados suficientes.</Typography>}
        </Box>
      </Card>

      {/* Navegação mês */}
      <Card sx={{ mb: 2, p: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button aria-label="Mês anterior" onClick={() => setMesOffset(v => v - 1)} sx={{ minWidth: 44, width: 44, height: 44, p: 0, fontSize: '1.2rem', color: 'text.primary', borderRadius: '12px' }}>◀</Button>
          <Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.95rem' }}>
            📄 {FinanceiroUtils.nomeMesOffset(mesOffset)}
          </Typography>
          <Button aria-label="Próximo mês" onClick={() => setMesOffset(v => v + 1)} sx={{ minWidth: 44, width: 44, height: 44, p: 0, fontSize: '1.2rem', color: 'text.primary', borderRadius: '12px' }}>▶</Button>
        </Box>
      </Card>

      {dados && (
        <>
          {/* Resumo */}
          <Card sx={{ mb: 2, overflow: 'hidden' }}>
            <Box sx={{ background: 'linear-gradient(135deg,#2D0B5E,#5A189A)', p: 1.2, px: 2 }}>
              <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>💰 Resumo do mês</Typography>
            </Box>
            <Grid container>
              {[
                { label: 'Entradas Prev.',  val: dados.totalEnt,  cor: '#22C55E', border: true  },
                { label: 'Saídas Prev.',    val: dados.totalSai,  cor: '#EF4444', border: false },
                { label: 'Saldo Previsto',  val: saldo,           cor: saldo     >= 0 ? 'primary.main' : '#EF4444', border: true,  bg: true },
                { label: 'Saldo Pago',      val: saldoPago,       cor: saldoPago >= 0 ? 'primary.main' : '#EF4444', border: false, bg: true },
              ].map((c, i) => (
                <Grid item xs={6} key={i} sx={{ p: 1.5, textAlign: 'center', borderRight: c.border ? '1px solid' : 'none', borderTop: c.bg ? '1px solid' : 'none', borderColor: 'divider', bgcolor: c.bg ? '#F8FAFC' : 'transparent' }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: c.cor, textTransform: 'uppercase', mb: 0.3 }}>{c.label}</Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: c.cor }}>{money(c.val)}</Typography>
                </Grid>
              ))}
            </Grid>
          </Card>

          <SecaoLista
            titulo="🔺 Entradas"
            itens={[...dados.entradasPagas.map(g => ({...g, _pago: true})), ...dados.entradas.map(g => ({...g, _pago: false}))]}
            cor="#22C55E"
          />
          <SecaoLista
            titulo="🔻 Gastos mensais"
            itens={[...dados.despesasPagas.map(g => ({...g, _pago: true})), ...dados.despesas.map(g => ({...g, _pago: false}))]}
            cor="#EF4444"
          />
          <SecaoLista
            titulo="🤝 Acordos"
            itens={[...dados.acordosPagos.map(a => ({...a, _pago: true})), ...dados.acordosPendentes.map(a => ({...a, _pago: false}))]}
            cor="#7B2CBF"
          />

          {dados.totalEnt === 0 && dados.totalSai === 0 && dados.acordosPendentes.length === 0 && dados.acordosPagos.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography sx={{ fontSize: '3rem' }}>📭</Typography>
              <Typography sx={{ fontWeight: 600, color: 'text.secondary' }}>Nenhum lançamento neste mês.</Typography>
            </Box>
          )}

          <Button fullWidth variant="contained" onClick={copiarRelatorio}
            sx={{ py: 1.5, fontWeight: 700, borderRadius: '12px', mt: 1 }}>
            📋 Copiar relatório (WhatsApp / E-mail)
          </Button>
        </>
      )}
    </Box>
  );
};

export default Relatorio;
