import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import EcoRoundedIcon from '@mui/icons-material/EcoRounded';
import LocalDrinkRoundedIcon from '@mui/icons-material/LocalDrinkRounded';
import BakeryDiningRoundedIcon from '@mui/icons-material/BakeryDiningRounded';
import SportsBarRoundedIcon from '@mui/icons-material/SportsBarRounded';
import CleanHandsRoundedIcon from '@mui/icons-material/CleanHandsRounded';
import CleaningServicesRoundedIcon from '@mui/icons-material/CleaningServicesRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import SetMealRoundedIcon from '@mui/icons-material/SetMealRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';

export const LIST_CATEGORY_ICONS = {
  Carnes: RestaurantRoundedIcon,
  Hortifruti: EcoRoundedIcon,
  Laticinios: LocalDrinkRoundedIcon,
  Padaria: BakeryDiningRoundedIcon,
  Bebidas: SportsBarRoundedIcon,
  Higiene: CleanHandsRoundedIcon,
  Limpeza: CleaningServicesRoundedIcon,
  Mercearia: ShoppingCartRoundedIcon,
  Acougue: SetMealRoundedIcon,
  Outros: Inventory2RoundedIcon,
};

export const getListCategoryIcon = (id) => LIST_CATEGORY_ICONS[id] || Inventory2RoundedIcon;
