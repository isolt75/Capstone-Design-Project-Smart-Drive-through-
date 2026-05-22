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
      Object.assign(this, {
        isNew: res.isNew,
        customerId: res.plate ?? this.customerId,
        customerName: res.customerName ?? null,
        lastOrder: res.lastOrder ?? [],
      });
    },

    addItem(item: MenuItem) {
      const existing = this.orderItems.find((i) => i.id === item.id);
      if (existing) existing.quantity++;
      else {
        this.orderItems.push({
          ...item,
          quantity: 1,
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
