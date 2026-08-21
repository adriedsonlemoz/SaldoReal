import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import HandshakeRoundedIcon from '@mui/icons-material/HandshakeRounded';
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded';

import FinanceiroUtils from '../utils/financeiro';
import FinanceiroService from '../services/FinanceiroService';

const money = (v) => FinanceiroUtils.money(v);
const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const ORIGENS = { manual: { label: 'Manual', Icon: EditNoteRoundedIcon }, lista_compras: { label: 'Compras', Icon: ShoppingCartRoundedIcon }, acordo: { label: 'Acordo', Icon: HandshakeRoundedIcon }, renda: { label: 'Renda', Icon: SavingsRoundedIcon } };

const GraficoBarras = ({ dados }) => {
  const maxVal = Math.max(...dados.map(d => Math.max(d.entradas, d.saidas)), 1);
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: { xs: .45, sm: .8 }, height: 142, px: .25, pb: .8 }}>
        {dados.map((d, i) => {
          const hEnt = Math.round((d.entradas / maxVal) * 112);
          const hSai = Math.round((d.saidas / maxVal) * 112);
          return (
            <Box key={i} sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: .35 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: .25, height: 112, width: '100%' }}>
                <Box title={`Entradas: ${money(d.entradas)}`} sx={{ width: { xs: 8, sm: 12 }, height: `${hEnt}px`, bgcolor: 'success.main', borderRadius: '5px 5px 2px 2px', minHeight: d.entradas > 0 ? 3 : 0 }} />
                <Box title={`Saídas: ${money(d.saidas)}`} sx={{ width: { xs: 8, sm: 12 }, height: `${hSai}px`, bgcolor: 'error.main', borderRadius: '5px 5px 2px 2px', minHeight: d.saidas > 0 ? 3 : 0 }} />
              </Box>
              <Typography sx={{ fontSize: { xs: '.61rem', sm: '.67rem' }, fontWeight: 750, color: 'text.secondary' }}>{d.label}</Typography>
            </Box>
          );
        })}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2.4, pt: .8, borderTop: '1px solid', borderColor: 'divider' }}>
        {[{ cor: 'success.main', label: 'Entradas' }, { cor: 'error.main', label: 'Saídas' }].map(l => (
          <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: .55 }}>
            <Box sx={{ width: 8, height: 8, bgcolor: l.cor, borderRadius: '50%' }} />
            <Typography sx={{ fontSize: '.7rem', fontWeight: 700, color: 'text.secondary' }}>{l.label}</Typography>
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
    const aReceber = Math.max(0, dados.totalEnt - dados.totalEntPago);
    const aPagar = Math.max(0, dados.totalSai - dados.totalSaiPago);
    txt += `Entradas previstas: ${money(dados.totalEnt)}\nRecebidas: ${money(dados.totalEntPago)}\nA receber: ${money(aReceber)}\n`;
    txt += `Saídas previstas: ${money(dados.totalSai)}\nPagas: ${money(dados.totalSaiPago)}\nA pagar: ${money(aPagar)}\n`;
    txt += `Saldo previsto: ${money(dados.totalEnt - dados.totalSai)}\nFluxo realizado: ${money(dados.totalEntPago - dados.totalSaiPago)}\n\n`;
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
    txt += '\n📱 Gerado por Saldo Real';
    navigator.clipboard.writeText(txt)
      .then(() => setToast({ open: true, texto: 'Relatório copiado!' }))
      .catch(() => setToast({ open: true, texto: 'Não foi possível copiar.' }));
  };

  const saldo     = dados ? dados.totalEnt - dados.totalSai : 0;
  const saldoPago = dados ? dados.totalEntPago - dados.totalSaiPago : 0;

  const indicadores = (() => {
    if (!dados) return null;
    const aReceber = Math.max(0, dados.totalEnt - dados.totalEntPago);
    const aPagar = Math.max(0, dados.totalSai - dados.totalSaiPago);
    const pctEntradas = dados.totalEnt > 0 ? Math.min(100, Math.round((dados.totalEntPago / dados.totalEnt) * 100)) : 0;
    const pctSaidas = dados.totalSai > 0 ? Math.min(100, Math.round((dados.totalSaiPago / dados.totalSai) * 100)) : 0;
    const saidas = [
      ...dados.despesasPagas.map(i => ({ ...i, _pago: true })),
      ...dados.despesas.map(i => ({ ...i, _pago: false })),
      ...dados.acordosPagos.map(i => ({ ...i, _pago: true, categoria: 'Acordos/Dívidas', nome: i.empresa })),
      ...dados.acordosPendentes.map(i => ({ ...i, _pago: false, categoria: 'Acordos/Dívidas', nome: i.empresa })),
    ];
    const valor = i => Number(i.valorFluxo ?? i.valor ?? i.valorParcela ?? 0);
    const categorias = new Map();
    saidas.forEach(i => categorias.set(i.categoria || 'Outros', (categorias.get(i.categoria || 'Outros') || 0) + valor(i)));
    const topCategoria = [...categorias.entries()].sort((a, b) => b[1] - a[1])[0] || null;
    const maiorSaida = [...saidas].sort((a, b) => valor(b) - valor(a))[0] || null;
    const qtdPagos = dados.entradasPagas.length + dados.despesasPagas.length + dados.acordosPagos.length;
    const qtdPendentes = dados.entradas.length + dados.despesas.length + dados.acordosPendentes.length;
    return { aReceber, aPagar, pctEntradas, pctSaidas, topCategoria, maiorSaida, maiorSaidaValor: maiorSaida ? valor(maiorSaida) : 0, qtdPagos, qtdPendentes };
  })();

  const detalheLinha = (item) => {
    if (!item) return '';
    const prazo = !item._pago && item.dataVencimento instanceof Date
      ? FinanceiroUtils.resumoPrazo(item.dataVencimento)
      : null;
    if (item.empresa) {
      const parcelas = item._pago
        ? `${item.pagamentosMes || 1} pagamento(s) no mês`
        : `${item.parcelasDevidas || 1} parcela(s) devida(s)`;
      return `${prazo ? `Vence ${prazo}` : `Dia ${item.vencimentoDia}`} · ${parcelas}`;
    }
    return `${prazo ? `Vence ${prazo}` : `Dia ${item.dia}`} · ${item.categoria}`;
  };

  const SecaoLista = ({ titulo, itens, cor }) => (
    itens.length > 0 && (
      <Card sx={{ mb: 1.1, overflow: 'hidden', border: `1px solid ${cor}18`, boxShadow: 'none' }}>
        <Box sx={{ bgcolor: `${cor}0D`, p: 1.05, px: 1.35, display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${cor}12` }}>
          <Typography sx={{ color: cor, fontWeight: 900, fontSize: '.78rem', textTransform: 'uppercase', letterSpacing: '.45px' }}>{titulo}</Typography>
          <Typography sx={{ color: cor, fontWeight: 900, fontSize: '.8rem' }}>
            {money(itens.reduce((s, i) => s + (i.valorFluxo ?? i.valor ?? i.valorParcela ?? 0), 0))}
          </Typography>
        </Box>
        <Box sx={{ px: 1.2, py: .55 }}>
          {itens.map((item, i) => (
            <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: .75, borderBottom: i < itens.length - 1 ? '1px dashed' : 'none', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 30, height: 30, borderRadius: '10px', display: 'grid', placeItems: 'center', bgcolor: item._pago ? 'rgba(17,156,114,.08)' : 'rgba(123,44,191,.06)', color: item._pago ? 'success.main' : 'primary.main', flexShrink: 0 }}>{item._pago ? <CheckCircleRoundedIcon sx={{ fontSize: '1rem' }} /> : <ScheduleRoundedIcon sx={{ fontSize: '1rem' }} />}</Box>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: 'text.primary', textDecoration: item._pago ? 'line-through' : 'none' }}>
                      {item.nome || item.empresa}
                    </Typography>
                    {item.origem && ORIGENS[item.origem] && (() => {
                      const OrigemIcon = ORIGENS[item.origem].Icon;
                      return <Chip icon={<OrigemIcon />} label={ORIGENS[item.origem].label} size="small" sx={{ height: 22, fontSize: '.64rem', fontWeight: 800, bgcolor: 'rgba(123,44,191,.055)', color: 'primary.main', '& .MuiChip-icon': { color: 'inherit', fontSize: '.9rem' } }} />;
                    })()}
                  </Box>
                  <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                    {detalheLinha(item)}
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
    <Box sx={{ maxWidth: 620, margin: 'auto', pt: 1.1, pb: { xs: 1.2, sm: 2 }, px: { xs: 1.5, sm: 2 } }}>
      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Box sx={{ background: 'linear-gradient(135deg,#2D0B5E,#5A189A)', color: '#fff', px: 3, py: 1.5, borderRadius: '12px', fontWeight: 600 }}>{toast.texto}</Box>
      </Snackbar>

      {/* Gráfico */}
      <Card sx={{ mb: 1.2, overflow: 'hidden' }}>
        <Box sx={{ p: 1.35, pb: .4, display: 'flex', alignItems: 'center', gap: .8 }}>
          <Box sx={{ width: 34, height: 34, borderRadius: '11px', bgcolor: 'rgba(123,44,191,.07)', color: 'primary.main', display: 'grid', placeItems: 'center' }}><InsightsRoundedIcon sx={{ fontSize: '1.05rem' }} /></Box>
          <Box><Typography sx={{ fontWeight: 900, fontSize: '.88rem' }}>Evolução financeira</Typography><Typography sx={{ fontSize: '.68rem', color: 'text.secondary' }}>Entradas e saídas dos últimos 6 meses</Typography></Box>
        </Box>
        <Box sx={{ p: 1.35, pt: .8 }}>
          {dadosGrafico.length > 0
            ? <GraficoBarras dados={dadosGrafico} />
            : <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 3 }}>Sem dados suficientes.</Typography>}
        </Box>
      </Card>

      {/* Navegação mês */}
      <Card sx={{ mb: 1.2, p: .65 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button aria-label="Mês anterior" onClick={() => setMesOffset(v => v - 1)} sx={{ minWidth: 42, width: 42, height: 42, p: 0, color: 'text.secondary', borderRadius: '12px' }}><ArrowBackIosNewRoundedIcon sx={{ fontSize: '1rem' }} /></Button>
          <Box sx={{ textAlign: 'center' }}><Typography sx={{ fontSize: '.61rem', fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '.7px' }}>Período</Typography><Typography sx={{ fontWeight: 900, color: 'text.primary', fontSize: '.9rem' }}>{FinanceiroUtils.nomeMesOffset(mesOffset)}</Typography></Box>
          <Button aria-label="Próximo mês" onClick={() => setMesOffset(v => v + 1)} sx={{ minWidth: 42, width: 42, height: 42, p: 0, color: 'text.secondary', borderRadius: '12px' }}><ArrowForwardIosRoundedIcon sx={{ fontSize: '1rem' }} /></Button>
        </Box>
      </Card>

      {dados && (
        <>
          {/* Resumo */}
          <Card sx={{ mb: 1.2, overflow: 'hidden' }}>
            <Box sx={{ px: 1.4, pt: 1.25, pb: .75, display: 'flex', alignItems: 'center', gap: .7 }}>
              <AccountBalanceWalletRoundedIcon sx={{ color: 'primary.main', fontSize: '1.15rem' }} /><Typography sx={{ fontWeight: 900, fontSize: '.88rem' }}>Resumo do mês</Typography>
            </Box>
            <Grid container>
              {[
                { label: 'Entradas previstas', val: dados.totalEnt, cor: 'success.main', border: true },
                { label: 'Saídas previstas', val: dados.totalSai, cor: 'error.main', border: false },
                { label: 'Saldo Previsto',  val: saldo,           cor: saldo >= 0 ? 'primary.main' : 'error.main', border: true,  bg: true },
                { label: 'Saldo Pago',      val: saldoPago,       cor: saldoPago >= 0 ? 'primary.main' : 'error.main', border: false, bg: true },
              ].map((c, i) => (
                <Grid item xs={6} key={i} sx={{ p: 1.2, textAlign: 'center', borderRight: c.border ? '1px solid' : 'none', borderTop: c.bg ? '1px solid' : 'none', borderColor: 'divider', bgcolor: c.bg ? 'rgba(123,44,191,.025)' : 'transparent' }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: c.cor, textTransform: 'uppercase', mb: 0.3 }}>{c.label}</Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: c.cor }}>{money(c.val)}</Typography>
                </Grid>
              ))}
            </Grid>
          </Card>

          {/* Realização e pendências */}
          <Card sx={{ mb: 1.2, p: 1.35 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: .7, mb: 1.15 }}>
              <CheckCircleRoundedIcon sx={{ color: 'primary.main', fontSize: '1.1rem' }} />
              <Box>
                <Typography sx={{ fontWeight: 900, fontSize: '.88rem' }}>Realização do mês</Typography>
                <Typography sx={{ fontSize: '.68rem', color: 'text.secondary' }}>O que já entrou/saiu de verdade e o que ainda está pendente</Typography>
              </Box>
            </Box>

            <Grid container spacing={.8} sx={{ mb: 1.25 }}>
              {[
                { label: 'Recebido', valor: dados.totalEntPago, cor: 'success.main' },
                { label: 'A receber', valor: indicadores.aReceber, cor: 'primary.main' },
                { label: 'Pago', valor: dados.totalSaiPago, cor: 'error.main' },
                { label: 'A pagar', valor: indicadores.aPagar, cor: 'warning.main' },
              ].map(item => (
                <Grid item xs={6} key={item.label}>
                  <Box sx={{ p: 1, borderRadius: '12px', border: '1px solid', borderColor: 'divider', bgcolor: 'rgba(123,44,191,.018)' }}>
                    <Typography sx={{ fontSize: '.64rem', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>{item.label}</Typography>
                    <Typography sx={{ mt: .15, fontSize: '.9rem', fontWeight: 900, color: item.cor }}>{money(item.valor)}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mb: 1.05 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: .45 }}>
                <Typography sx={{ fontSize: '.69rem', fontWeight: 800, color: 'text.secondary' }}>Entradas realizadas</Typography>
                <Typography sx={{ fontSize: '.69rem', fontWeight: 900, color: 'success.main' }}>{indicadores.pctEntradas}%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={indicadores.pctEntradas} color="success" sx={{ height: 7, borderRadius: 99 }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: .45 }}>
                <Typography sx={{ fontSize: '.69rem', fontWeight: 800, color: 'text.secondary' }}>Saídas liquidadas</Typography>
                <Typography sx={{ fontSize: '.69rem', fontWeight: 900, color: 'error.main' }}>{indicadores.pctSaidas}%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={indicadores.pctSaidas} color="error" sx={{ height: 7, borderRadius: 99 }} />
            </Box>
          </Card>

          {/* Destaques do período */}
          <Card sx={{ mb: 1.2, p: 1.35 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: .7, mb: 1 }}>
              <InsightsRoundedIcon sx={{ color: 'primary.main', fontSize: '1.1rem' }} />
              <Typography sx={{ fontWeight: 900, fontSize: '.88rem' }}>Destaques do período</Typography>
            </Box>
            <Box sx={{ display: 'grid', gap: .8 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, p: .9, borderRadius: '11px', bgcolor: 'rgba(123,44,191,.035)' }}>
                <Box><Typography sx={{ fontSize: '.64rem', color: 'text.secondary', fontWeight: 800 }}>MAIOR CATEGORIA DE SAÍDA</Typography><Typography sx={{ fontSize: '.8rem', fontWeight: 850 }}>{indicadores.topCategoria?.[0] || 'Sem saídas'}</Typography></Box>
                <Typography sx={{ fontSize: '.82rem', fontWeight: 900, color: 'error.main', whiteSpace: 'nowrap' }}>{money(indicadores.topCategoria?.[1] || 0)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, p: .9, borderRadius: '11px', bgcolor: 'rgba(123,44,191,.035)' }}>
                <Box sx={{ minWidth: 0 }}><Typography sx={{ fontSize: '.64rem', color: 'text.secondary', fontWeight: 800 }}>MAIOR SAÍDA INDIVIDUAL</Typography><Typography sx={{ fontSize: '.8rem', fontWeight: 850, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{indicadores.maiorSaida?.nome || 'Sem saídas'}</Typography></Box>
                <Typography sx={{ fontSize: '.82rem', fontWeight: 900, color: 'error.main', whiteSpace: 'nowrap' }}>{money(indicadores.maiorSaidaValor)}</Typography>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: .8 }}>
                <Box sx={{ p: .9, borderRadius: '11px', border: '1px solid', borderColor: 'divider', textAlign: 'center' }}><Typography sx={{ fontSize: '.64rem', color: 'text.secondary', fontWeight: 800 }}>LIQUIDADOS</Typography><Typography sx={{ fontSize: '1rem', fontWeight: 900, color: 'success.main' }}>{indicadores.qtdPagos}</Typography></Box>
                <Box sx={{ p: .9, borderRadius: '11px', border: '1px solid', borderColor: 'divider', textAlign: 'center' }}><Typography sx={{ fontSize: '.64rem', color: 'text.secondary', fontWeight: 800 }}>PENDENTES</Typography><Typography sx={{ fontSize: '1rem', fontWeight: 900, color: 'warning.main' }}>{indicadores.qtdPendentes}</Typography></Box>
              </Box>
            </Box>
          </Card>

          <SecaoLista
            titulo="Entradas"
            itens={[...dados.entradasPagas.map(g => ({...g, _pago: true})), ...dados.entradas.map(g => ({...g, _pago: false}))]}
            cor="#119C72"
          />
          <SecaoLista
            titulo="Gastos mensais"
            itens={[...dados.despesasPagas.map(g => ({...g, _pago: true})), ...dados.despesas.map(g => ({...g, _pago: false}))]}
            cor="#E54862"
          />
          <SecaoLista
            titulo="Acordos"
            itens={[...dados.acordosPagos.map(a => ({...a, _pago: true})), ...dados.acordosPendentes.map(a => ({...a, _pago: false}))]}
            cor="#7B2CBF"
          />

          {dados.totalEnt === 0 && dados.totalSai === 0 && dados.acordosPendentes.length === 0 && dados.acordosPagos.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 3 }}><InboxRoundedIcon sx={{ fontSize: '2rem', color: 'primary.main', opacity: .7 }} /><Typography sx={{ mt: .5, fontWeight: 800 }}>Nenhum lançamento neste mês</Typography><Typography sx={{ fontSize: '.74rem', color: 'text.secondary', mt: .2 }}>Quando houver movimentações, o resumo aparece aqui.</Typography></Box>
          )}

          <Button fullWidth variant="outlined" startIcon={<ContentCopyRoundedIcon />} onClick={copiarRelatorio} sx={{ minHeight: 46, fontWeight: 850, borderRadius: '14px', mt: 1 }}>Copiar relatório</Button>
        </>
      )}
    </Box>
  );
};

export default Relatorio;
