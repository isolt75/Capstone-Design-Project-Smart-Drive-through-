import api from './http';
import type { menu } from './dtApi';
import type { menuItem } from '@/stores/store';
import { getMenuImage } from '@/components/menuImages';

const toMenuItem = (m: menu): menuItem => ({
  id: m.menuId,
  name: m.menuName,
  price: m.price,
  category: m.category,
  image: getMenuImage(m.menuId),
});

export const getMenus = async (): Promise<menuItem[]> => {
  const { data } = await api.get<{ menus: menu[] }>('/menus');
  console.log('menus ok:', data);
  return data.menus.map(toMenuItem);
};

export const getPopularMenus = async (): Promise<menuItem[]> => {
  const { data } = await api.get<{ top3: menu[] }>('/popular');
  console.log('menus ok:', data);
  return data.top3.map(toMenuItem);
};
