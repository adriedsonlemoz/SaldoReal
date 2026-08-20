import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import CloudOffRoundedIcon from '@mui/icons-material/CloudOffRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';

const Bloco = ({ Icon, titulo, children }) => (
  <Box sx={{ display: 'flex', gap: 1.3, py: 1.5 }}>
    <Box sx={{ width: 38, height: 38, borderRadius: '12px', bgcolor: 'rgba(123,44,191,.09)', color: 'primary.main', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
      <Icon sx={{ fontSize: 20 }} />
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontWeight: 900, fontSize: '.91rem', mb: .3 }}>{titulo}</Typography>
      <Typography sx={{ color: 'text.secondary', fontSize: '.8rem', lineHeight: 1.55 }}>{children}</Typography>
    </Box>
  </Box>
);

const Privacidade = ({ setRoute }) => (
  <Box sx={{ maxWidth: 620, mx: 'auto', px: { xs: 1.5, sm: 2 }, py: 1.5 }}>
    <Button variant="outlined" onClick={() => setRoute('home')} sx={{ mb: 1.5 }}>← Voltar</Button>
    <Card sx={{ overflow: 'hidden' }}>
      <Box sx={{ p: 2.2, background: 'linear-gradient(135deg,#2D0B5E,#7B2CBF)', color: '#fff' }}>
        <ShieldRoundedIcon sx={{ fontSize: 30, mb: .7 }} />
        <Typography sx={{ fontWeight: 900, fontSize: '1.2rem' }}>Privacidade e seus dados</Typography>
        <Typography sx={{ opacity: .78, fontSize: '.78rem', mt: .35 }}>Última atualização: 20 de agosto de 2026</Typography>
      </Box>
      <Box sx={{ p: 2 }}>
        <Chip label="Dados ficam no aparelho" color="success" size="small" sx={{ mb: 1 }} />
        <Bloco Icon={StorageRoundedIcon} titulo="Armazenamento local">
          Seus lançamentos, acordos, listas de compras, configurações e movimentações ficam armazenados localmente no dispositivo. O SaldoReal não exige conta e não envia esses dados ao desenvolvedor.
        </Bloco>
        <Divider />
        <Bloco Icon={CloudOffRoundedIcon} titulo="Sem analytics, anúncios ou rastreamento">
          Esta versão não possui publicidade, ferramentas de analytics, login remoto ou serviço de sincronização em nuvem. O funcionamento principal é offline.
        </Bloco>
        <Divider />
        <Bloco Icon={ContentCopyRoundedIcon} titulo="Backup e área de transferência">
          O backup é gerado somente quando você solicita. Copiar um backup, relatório ou diagnóstico usa a área de transferência por uma ação explícita sua. O código de backup é codificado para transporte, mas não é criptografado; guarde-o em local seguro.
        </Bloco>
        <Divider sx={{ my: 1 }} />
        <Typography sx={{ color: 'text.secondary', fontSize: '.76rem', lineHeight: 1.55 }}>
          Se uma versão futura adicionar serviços online, coleta de dados, publicidade ou novas permissões, esta política deverá ser atualizada antes da publicação dessa versão.
        </Typography>
      </Box>
    </Card>
  </Box>
);

export default Privacidade;
