import api from './http';
import type { Menu } from './dtApi';
import type { MenuItem } from '@/stores/store';
import { getMenuImage } from '@/components/menuImages';

const toMenuItem = ({ menuId, menuName, price, category }: Menu): MenuItem => ({
  id: menuId,
  name: menuName,
  price: price,
  category: category,
  image: getMenuImage(menuId),
  quantity: 1,
});

export const getMenus = async (): Promise<MenuItem[]> => {
  const { data } = await api.get<{ menus: Menu[] }>('/menus');
  return data.menus.map(toMenuItem);
};

export const getPopularMenus = async (): Promise<MenuItem[]> => {
  const { data } = await api.get<{ top3: Menu[] }>('/popular');
  return data.top3.map(toMenuItem);
};

// 추천: plate 이력이 있으면 개인화, 없으면 시간대 인기 (백엔드가 판단)
export const getRecommendMenus = async (
  plate?: string | null,
): Promise<MenuItem[]> => {
  const { data } = await api.get<{ top3: Menu[] }>('/recommend', {
    params: plate ? { plate } : undefined,
  });
  return data.top3.map(toMenuItem);
};
