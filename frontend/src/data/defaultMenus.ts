// 메뉴판은 백엔드 상태와 무관하게 항상 화면에 보여야 한다.
// 그래서 19개 메뉴를 프론트에 상수로 박아둔다(seed.py 의 MENUS 와 1:1, public/images/ 와 1:1).
// 백엔드 /menus 가 응답하면 그걸로 덮어쓰고, 못 받으면 이 리스트가 그대로 화면에 뜬다.

import { getMenuImage } from '@/components/menuImages';
import type { MenuItem } from '@/stores/store';

type Seed = Pick<MenuItem, 'id' | 'name' | 'price' | 'category'>;

const SEED: Seed[] = [
  { id: 1,  name: '아메리카노',        price: 3000, category: '커피' },
  { id: 2,  name: '콜드브루',          price: 4500, category: '커피' },
  { id: 3,  name: '카라멜 마키아또',    price: 4000, category: '커피' },
  { id: 4,  name: '카푸치노',          price: 4000, category: '커피' },
  { id: 5,  name: '카페모카',          price: 4000, category: '커피' },
  { id: 6,  name: '카페라떼',          price: 4000, category: '커피' },
  { id: 7,  name: '자바칩 프라페',      price: 4000, category: '아이스 블렌디드' },
  { id: 8,  name: '밀크쉐이크',        price: 4000, category: '아이스 블렌디드' },
  { id: 9,  name: '딸기요거트스무디',   price: 4500, category: '아이스 블렌디드' },
  { id: 10, name: '망고요거트스무디',   price: 4500, category: '아이스 블렌디드' },
  { id: 11, name: '레몬에이드',        price: 3500, category: '에이드, 주스' },
  { id: 12, name: '오렌지주스',        price: 3000, category: '에이드, 주스' },
  { id: 13, name: '라임모히또에이드',   price: 3500, category: '에이드, 주스' },
  { id: 14, name: '녹차',              price: 2500, category: '티' },
  { id: 15, name: '자몽허니블랙티',     price: 4000, category: '티' },
  { id: 16, name: '아이스티',          price: 2000, category: '티' },
  { id: 17, name: '말차라떼',          price: 3500, category: '티' },
  { id: 18, name: '초코라떼',          price: 3000, category: '티' },
  { id: 19, name: '우유',              price: 2000, category: '티' },
];

export const DEFAULT_MENUS: MenuItem[] = SEED.map((m) => ({
  ...m,
  image: getMenuImage(m.id),
  quantity: 1,
}));
