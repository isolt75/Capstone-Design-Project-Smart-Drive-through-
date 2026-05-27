import { defineStore } from 'pinia';
import type { CustomerRes, LastOrderItem } from '@/api';

function getCarNum(carId: string) {
  return carId.slice(-4);
}

// 메뉴 옵션
type SelectedOption = {
  group: string;
  option: string;
  addPrice: number;
};

export type MenuItem = {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  caffeine?: boolean;
  quantity: number;
};

export interface CompletedOrder {
  orderNum: string;
  customerId: string;
  items: CompletedOrderItem[];
}

export interface CompletedOrderItem {
  id: number;
  name: string;
  quantity: number;
}

export const useOrderStore = defineStore('order', {
  state: () => ({
    customerId: null as string | null,
    customerName: null as string | null,
    isNew: true,
    lastOrder: [] as LastOrderItem[],

    orderNum: null as string | null,
    seq: null as string | null,
    orderItems: [] as MenuItem[],
    completedOrders: [] as CompletedOrder[],
    voiceText: null as string | null,
    availableMenus: [] as MenuItem[],
  }),

  getters: {
    // 차 번호 기반 고객 ID 생성
    carNum(state): string | null {
      return state.customerId ? getCarNum(state.customerId) : null;
    },

    //실시간 주문 반영
    orderCart(state) {
      return state.orderItems.map((item) => ({
        ...item,
        itemTotal: item.price * item.quantity,
      }));
    },

    // 총 금액
    totalPrice(state): number {
      return state.orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
    },
  },

  actions: {
    setCustomer(id: string) {
      this.customerId = id;
    },

    setCustomerInfo(res: CustomerRes) {
      if (res.isNew) {
        Object.assign(this, {
          isNew: true,
          customerName: null,
          lastOrder: [],
        });
      } else
        Object.assign(this, {
          isNew: res.isNew,
          customerId: res.plate ?? this.customerId,
          customerName: res.customerName ?? null,
          lastOrder: res.lastOrder ?? [],
        });
    },

    parseVoiceOrder(text: string) {
      const numberMap: Record<string, number> = {
        한: 1,
        하나: 1,
        두: 2,
        둘: 2,
        세: 3,
        셋: 3,
        네: 4,
        넷: 4,
        다섯: 5,
        여섯: 6,
        일곱: 7,
        여덟: 8,
        아홉: 9,
        열: 10,
      };

      const lowerText = text.replace(/\s+/g, '');

      // 메뉴 목록 기준 탐색
      const menuList = this.availableMenus ?? []; // 메뉴 저장 필요

      menuList.forEach((menu) => {
        if (lowerText.includes(menu.name.replace(/\s+/g, ''))) {
          let quantity = 1;

          // 숫자 찾기
          const match = text.match(
            /(\d+|한|하나|두|둘|세|셋|네|넷|다섯|여섯|일곱|여덟|아홉|열)\s*잔/,
          );

          if (match?.[1]) {
            const value = match[1];

            if (!isNaN(Number(value))) {
              quantity = Number(value);
            } else {
              quantity = numberMap[value] ?? 1;
            }
          }

          this.addItem(menu, quantity);
        }
      });
    },

    setMenus(menus: MenuItem[]) {
      this.availableMenus = menus;
    },

    addItem(item: MenuItem, qty = 1) {
      const existing = this.orderItems.find((i) => i.id === item.id);

      if (existing) {
        existing.quantity += qty;
      } else {
        this.orderItems.push({
          ...item,
          quantity: qty,
        });
      }
    },

    // 수량 증가
    increaseItem(id: number) {
      const item = this.orderItems.find((i) => i.id === id);
      if (item) item.quantity++;
    },

    // 수량 감소
    decreaseItem(id: number) {
      const item = this.orderItems.find((i) => i.id === id);
      if (!item) return;
      if (item.quantity > 1) {
        item.quantity--;
      } else {
        this.removeItem(id);
      }
    },

    // 항목 삭제
    removeItem(id: number) {
      this.orderItems = this.orderItems.filter((item) => item.id !== id);
    },

    setVoiceText(text: string) {
      this.voiceText = text;
    },

    // staffPos에 주문 내역 전달
    saveCompletedOrder() {
      if (!this.orderNum || !this.customerId) return;
      this.completedOrders.push({
        orderNum: this.orderNum,
        customerId: this.customerId,

        items: this.orderCart.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
        })),
      });
    },

    // 초기화
    clear() {
      Object.assign(this, {
        customerId: null,
        customerName: null,
        orderItems: [],
        voiceText: '',
        orderNum: null,
        lastOrder: [],
        isNew: true,
      });
    },
  },
});
