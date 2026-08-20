// src/App.jsx — v4
// Navbar global + modal "Adicionar" centralizados aqui.
// Nenhuma tela interna foi alterada.

import React, { useState } from 'react';
import Container  from '@mui/material/Container';
import Box        from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button     from '@mui/material/Button';
import Dialog     from '@mui/material/Dialog';
import DialogTitle    from '@mui/material/DialogTitle';
import DialogContent  from '@mui/material/DialogContent';
import DialogActions  from '@mui/material/DialogActions';

import Home        from './components/Home';
import Acordos     from './components/Acordos';
import Gastos      from './components/Gastos';
import NovaConta   from './components/NovaConta';
import Sobre       from './components/Sobre';
import Backup      from './components/Backup';
import Relatorio   from './components/Relatorio';
import ListaCompras from './components/listaCompras';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import HandshakeRoundedIcon from '@mui/icons-material/HandshakeRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';

// ─────────────────────────────────────────────────────────────────────────────
// SVG Icons — mesmo conjunto da Home, copiados aqui para não criar dep circular
// ─────────────────────────────────────────────────────────────────────────────
const IcoHome = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H15v-6H9v6H4a1 1 0 01-1-1V9.5z"
      stroke={active ? '#7B2CBF' : '#A59DAB'} strokeWidth="2" strokeLinejoin="round"
      fill={active ? 'rgba(123,44,191,0.12)' : 'none'} />
  </svg>
);
const IcoGastos = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="6" width="18" height="14" rx="2"
      stroke={active ? '#7B2CBF' : '#A59DAB'} strokeWidth="2"
      fill={active ? 'rgba(123,44,191,0.10)' : 'none'} />
    <path d="M3 10h18M8 3v3M16 3v3" stroke={active ? '#7B2CBF' : '#A59DAB'} strokeWidth="2" strokeLinecap="round" />
    <circle cx="8" cy="15" r="1.2" fill={active ? '#7B2CBF' : '#A59DAB'} />
    <circle cx="12" cy="15" r="1.2" fill={active ? '#7B2CBF' : '#A59DAB'} />
    <circle cx="16" cy="15" r="1.2" fill={active ? '#7B2CBF' : '#A59DAB'} />
  </svg>
);
const IcoRelatorio = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="2"
      stroke={active ? '#7B2CBF' : '#A59DAB'} strokeWidth="2"
      fill={active ? 'rgba(123,44,191,0.09)' : 'none'} />
    <path d="M7 17l3-4 3 2 4-6" stroke={active ? '#7B2CBF' : '#A59DAB'}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IcoConfig = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" stroke={active ? '#7B2CBF' : '#A59DAB'} strokeWidth="2" />
    <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
      stroke={active ? '#7B2CBF' : '#A59DAB'} strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const IcoAdd = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// BottomNav global
// ─────────────────────────────────────────────────────────────────────────────
// Rotas que recebem nav — "home" já tem sua própria, mas vamos unificar aqui.
// Rotas modais (novaConta) não recebem nav pois são "telas de formulário".
const ROTAS_COM_NAV = ['home', 'gastos', 'relatorio', 'acordos', 'lista', 'sobre', 'backup'];

const BottomNav = ({ route, setRoute, onAddPress }) => {
  const LEFT  = [
    { id: 'home',      label: 'Início',    Icon: IcoHome     },
    { id: 'gastos',    label: 'Fluxo',     Icon: IcoGastos   },
  ];
  const RIGHT = [
    { id: 'relatorio', label: 'Relatório', Icon: IcoRelatorio },
    { id: 'config',    label: 'Config',    Icon: IcoConfig    },
  ];

  // Quais itens laterais ficam "ativos"
  const activeColor = () => '#7B2CBF';

  const NavItem = ({ id, label, Icon }) => {
    const active = route === id || (id === 'config' && (route === 'sobre' || route === 'backup'));
    return (
      <Box
        role="button" tabIndex={0} aria-label={label}
        onClick={() => id === 'config' ? setRoute('__config__') : setRoute(id)}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && (id === 'config' ? setRoute('__config__') : setRoute(id))}
        sx={{
          flex: 1, py: 0.75, display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 0.35, cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent', position: 'relative',
          transition: 'all 0.15s',
          '&:active': { transform: 'scale(0.88)' },
        }}
      >
        <Icon active={active} />
        <Typography sx={{
          fontSize: '0.66rem', fontWeight: active ? 800 : 600,
          color: active ? activeColor(id) : '#9A92A1',
          letterSpacing: '0.1px', lineHeight: 1,
        }}>
          {label}
        </Typography>
        {active && (
          <Box sx={{
            position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
            width: 22, height: 3, borderRadius: '2px 2px 0 0',
            bgcolor: activeColor(id),
          }} />
        )}
      </Box>
    );
  };

  return (
    <Box sx={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 300,
      bgcolor: 'background.paper',
      borderTop: '1px solid rgba(0,0,0,0.07)',
      boxShadow: '0 -6px 24px rgba(45,11,94,0.08)',
      display: 'flex', alignItems: 'center', minHeight: 62,
      pb: 'env(safe-area-inset-bottom, 0px)',
    }}>
      {LEFT.map(item => <NavItem key={item.id} {...item} />)}

      {/* FAB central */}
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', py: 0.6 }}>
        <Box
          role="button" tabIndex={0} aria-label="Adicionar"
          onClick={onAddPress} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onAddPress()}
          sx={{
            width: 46, height: 46, borderRadius: '15px',
            background: 'linear-gradient(135deg, #7B2CBF 0%, #F72585 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(123,44,191,0.28)',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
            transition: 'all 0.18s ease',
            '&:hover': { boxShadow: '0 8px 24px rgba(123,44,191,0.36)', transform: 'translateY(-2px)' },
            '&:active': { transform: 'scale(0.92)' },
          }}
        >
          <IcoAdd />
        </Box>
      </Box>

      {RIGHT.map(item => <NavItem key={item.id} {...item} />)}
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Modal "O que deseja adicionar?"
// ─────────────────────────────────────────────────────────────────────────────
const ModalAddOpcoes = ({ open, onClose, setRoute }) => {
  const OPCOES = [
    { Icon: EditNoteRoundedIcon, label: 'Novo lançamento', sub: 'Registrar despesa ou entrada', route: 'novaConta', cor: '#7B2CBF' },
    { Icon: HandshakeRoundedIcon, label: 'Novo acordo', sub: 'Parcelamento ou dívida', route: 'acordos', cor: '#7B2CBF' },
    { Icon: ShoppingCartRoundedIcon, label: 'Nova lista de compras', sub: 'Criar uma compra planejada', route: 'lista', cor: '#8B5CF6' },
  ];
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs"
      PaperProps={{ sx: { borderRadius: '24px', pb: 1 } }}>
      <DialogTitle sx={{ fontWeight: 900, fontSize: '1.05rem', pb: .5, display: 'flex', alignItems: 'center', gap: .7 }}><AddCircleOutlineRoundedIcon color="primary" /> O que deseja adicionar?</DialogTitle>
      <DialogContent sx={{ pt: 1, pb: 0 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {OPCOES.map(op => (
            <Box key={op.route}
              onClick={() => { onClose(); setRoute(op.route); }}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                px: 1.5, py: 1.3, borderRadius: '14px',
                border: `1.5px solid ${op.cor}22`, bgcolor: `${op.cor}08`,
                cursor: 'pointer', transition: 'all 0.15s',
                WebkitTapHighlightColor: 'transparent',
                '&:hover': { bgcolor: `${op.cor}14`, borderColor: `${op.cor}44` },
                '&:active': { transform: 'scale(0.97)' },
              }}>
              <Box sx={{
                width: 42, height: 42, borderRadius: '13px',
                bgcolor: `${op.cor}18`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0,
              }}>
                {React.createElement(op.Icon, { sx: { fontSize: 21, color: op.cor } })}
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', lineHeight: 1.2 }}>
                  {op.label}
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', mt: 0.2 }}>
                  {op.sub}
                </Typography>
              </Box>
              <Box sx={{ ml: 'auto', color: op.cor, fontSize: '1.1rem', opacity: 0.5 }}>›</Box>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 2, pt: 1, pb: 1.5 }}>
        <Button fullWidth variant="outlined" color="inherit" onClick={onClose}
          sx={{ borderRadius: '12px', borderColor: 'divider', color: 'text.secondary', fontWeight: 700 }}>
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Modal Configurações
// ─────────────────────────────────────────────────────────────────────────────
const ModalConfig = ({ open, onClose, setRoute }) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs"
    PaperProps={{ sx: { borderRadius: '24px', pb: 1 } }}>
    <DialogTitle sx={{ fontWeight: 900, fontSize: '1.05rem', pb: .5, display: 'flex', alignItems: 'center', gap: .7 }}><SettingsRoundedIcon color="primary" /> Configurações</DialogTitle>
    <DialogContent sx={{ pt: 0.5, pb: 0 }}>
      {[
        { Icon: InfoRoundedIcon, label: 'Sobre o app', sub: 'Versão, créditos e informações', route: 'sobre', cor: '#7B2CBF' },
        { Icon: ShieldRoundedIcon, label: 'Backup e dados', sub: 'Exportar ou importar seus dados', route: 'backup', cor: '#8B5CF6' },
      ].map(op => (
        <Box key={op.route}
          onClick={() => { onClose(); setRoute(op.route); }}
          sx={{
            display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1.4,
            borderRadius: '14px', border: `1.5px solid ${op.cor}22`, bgcolor: `${op.cor}06`,
            cursor: 'pointer', mb: 1, transition: 'all 0.15s',
            '&:hover': { bgcolor: `${op.cor}12` }, '&:active': { transform: 'scale(0.97)' },
          }}>
          <Box sx={{
            width: 42, height: 42, borderRadius: '13px', bgcolor: `${op.cor}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem', flexShrink: 0,
          }}>
            {React.createElement(op.Icon, { sx: { fontSize: 21, color: op.cor } })}
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '0.88rem', lineHeight: 1.2 }}>{op.label}</Typography>
            <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', mt: 0.2 }}>{op.sub}</Typography>
          </Box>
          <Box sx={{ ml: 'auto', color: op.cor, fontSize: '1.1rem', opacity: 0.5 }}>›</Box>
        </Box>
      ))}
    </DialogContent>
    <DialogActions sx={{ px: 2, pt: 0, pb: 1.5 }}>
      <Button fullWidth variant="outlined" color="inherit" onClick={onClose}
        sx={{ borderRadius: '12px', borderColor: 'divider', color: 'text.secondary', fontWeight: 700 }}>
        Fechar
      </Button>
    </DialogActions>
  </Dialog>
);

// ─────────────────────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────────────────────
const App = () => {
  const [route,    setRoute]    = useState('home');
  const [editItem, setEditItem] = useState(null);
  const [modalAdd,    setModalAdd]    = useState(false);
  const [modalConfig, setModalConfig] = useState(false);

  // Intercepta rota especial __config__
  const handleSetRoute = (r) => {
    if (r === '__config__') { setModalConfig(true); return; }
    // Ao abrir o formulário de edição, preserve o registro selecionado.
    // Nas demais navegações limpamos o estado para nunca reaproveitar uma edição antiga.
    if (r !== 'novaConta') setEditItem(null);
    setRoute(r);
  };

  const showNav = ROTAS_COM_NAV.includes(route);

  const renderComponent = () => {
    switch (route) {
      case 'home':      return <Home setRoute={handleSetRoute} />;
      case 'acordos':   return <Acordos setRoute={handleSetRoute} />;
      case 'gastos':    return <Gastos setRoute={handleSetRoute} setEditItem={setEditItem} />;
      case 'novaConta': return <NovaConta setRoute={handleSetRoute} editItem={editItem} setEditItem={setEditItem} />;
      case 'sobre':     return <Sobre setRoute={handleSetRoute} />;
      case 'backup':    return <Backup setRoute={handleSetRoute} />;
      case 'relatorio': return <Relatorio setRoute={handleSetRoute} />;
      case 'lista':     return <ListaCompras setRoute={handleSetRoute} />;
      default:          return <Home setRoute={handleSetRoute} />;
    }
  };

  return (
    <>
      <Container maxWidth={false} disableGutters sx={{ minHeight: '100dvh' }}>
        {/* Wrapper com pb para não ficar atrás da navbar */}
        <Box sx={{ pb: showNav ? 'calc(62px + env(safe-area-inset-bottom, 0px))' : 0 }}>
          {renderComponent()}
        </Box>
      </Container>

      {/* Navbar global — aparece em todas as rotas exceto formulários */}
      {showNav && (
        <BottomNav
          route={route}
          setRoute={handleSetRoute}
          onAddPress={() => setModalAdd(true)}
        />
      )}

      {/* Modais globais */}
      <ModalAddOpcoes
        open={modalAdd}
        onClose={() => setModalAdd(false)}
        setRoute={handleSetRoute}
      />
      <ModalConfig
        open={modalConfig}
        onClose={() => setModalConfig(false)}
        setRoute={handleSetRoute}
      />
    </>
  );
};

export default App;
