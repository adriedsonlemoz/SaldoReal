import React from 'react';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import MovieRoundedIcon from '@mui/icons-material/MovieRounded';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import WorkRoundedIcon from '@mui/icons-material/WorkRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import CheckroomRoundedIcon from '@mui/icons-material/CheckroomRounded';
import PetsRoundedIcon from '@mui/icons-material/PetsRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import HandshakeRoundedIcon from '@mui/icons-material/HandshakeRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';

const NORMALIZE = (v = '') => String(v)
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .trim().toLowerCase();

const MAP = {
  moradia: HomeRoundedIcon,
  casa: HomeRoundedIcon,
  contas: LightbulbRoundedIcon,
  alimentacao: RestaurantRoundedIcon,
  mercado: ShoppingCartRoundedIcon,
  carnes: RestaurantRoundedIcon,
  transporte: DirectionsCarRoundedIcon,
  lazer: MovieRoundedIcon,
  saude: LocalHospitalRoundedIcon,
  educacao: SchoolRoundedIcon,
  vestuario: CheckroomRoundedIcon,
  salario: WorkRoundedIcon,
  investimento: TrendingUpRoundedIcon,
  'renda extra': RocketLaunchRoundedIcon,
  renda: SavingsRoundedIcon,
  academia: FitnessCenterRoundedIcon,
  pets: PetsRoundedIcon,
  'acordos/dividas': HandshakeRoundedIcon,
  'saldo acumulado': AccountBalanceWalletRoundedIcon,
  outros: CategoryRoundedIcon,
};

const COLOR = {
  moradia: '#7B2CBF', casa: '#7B2CBF', contas: '#8A5CF5', alimentacao: '#C23AAE',
  mercado: '#8A5CF5', carnes: '#A94BD5', transporte: '#6956D9', lazer: '#B23AB2',
  saude: '#9A43C8', educacao: '#6D5BD0', vestuario: '#B0409C', salario: '#119C72',
  investimento: '#119C72', 'renda extra': '#119C72', renda: '#119C72', academia: '#7B2CBF',
  pets: '#9D4EDD', 'acordos/dividas': '#7B2CBF', 'saldo acumulado': '#6D5BD0', outros: '#8D7C9E',
};

export const categoriaMeta = (categoria) => {
  const key = NORMALIZE(categoria);
  return {
    Icon: MAP[key] || Inventory2RoundedIcon,
    color: COLOR[key] || '#7B2CBF',
  };
};

export const CategoryIcon = ({ categoria, size = 20, color, ...props }) => {
  const meta = categoriaMeta(categoria);
  const Icon = meta.Icon;
  return <Icon {...props} sx={{ fontSize: size, color: color || meta.color, ...(props.sx || {}) }} />;
};

export default CategoryIcon;
