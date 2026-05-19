import { defineStore } from 'pinia';
import type { customerRes, lastOrderItem } from '@/api';

function getToday(): string {
  const today = new Date();
  const year = String(today.getFullYear()).slice(-2);
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function getNumofCar(carId: string) {
  return carId.slice(-4);
}

// 백엔드로 넘길 것/로컬 테스트시 살리기
// function getNextSequence(): string {
//   const key = 'orderCounter-' + getToday();
//   const current = Number(localStorage.getItem(key) || '0') + 1;
//   localStorage.setItem(key, String(current));
//   return String(current).padStart(3, '0');
// }

// 메뉴 옵션
type selectedOption = {
  group: string;
  option: string;
  addPrice: number;
};

export type menuItem = {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  caffeine?: boolean;
  quantity?: number;
};

export interface completedOrder {
  orderNum: string;
  customerId: string;
  items: {
    id: number;
    name: string;
    quantity: number;
  }[];
}

export const useOrderStore = defineStore('order', {
  state: () => ({
    // customerId: null as string | null,
    customerId: '12가3456' as string | null, //테스트용
    customerName: null as string | null,
    isNew: true as boolean,
    lastOrder: [] as lastOrderItem[],

    orderNum: null as string | null,
    seq: null as string | null,
    orderItems: [] as menuItem[],
    completedOrders: [] as completedOrder[],
    voiceText: null as string | null,
  }),

  getters: {
    // 차 번호 기반 고객 ID 생성
    carPart(state): string | null {
      return state.customerId ? getNumofCar(state.customerId) : null;
    },

    //실시간 주문 반영
    orderCart(state): any[] {
      const list = state.orderItems;
      if (list.length === 0) return [];

      const uniqueIds = Array.from(new Set(list.map((item) => item.id)));
      return uniqueIds.map((id) => {
        const sameItems = list.filter((item) => item.id === id);
        return {
          ...sameItems[0],
          quantity: sameItems.length,
          itemTotal: sameItems.reduce((sum, i) => sum + i.price, 0),
        };
      });
    },

    // 총 합계 계산 -> 프론트는 화면 표시용 합계, 백엔드에 totalprice 대신 menuid+quantity 보내기
    totalPrice(state): number {
      return state.orderItems.reduce((sum, item) => sum + item.price, 0);
    },
  },

  actions: {
    setCustomer(id: string) {
      this.customerId = id;
    },

    setCustomerInfo(res: customerRes) {
      this.isNew = res.isNew;
      if (res.plate) this.customerId = res.plate;
      if (res.customerName) this.customerName = res.customerName;
      this.lastOrder = res.lastOrder ?? [];
    },

    addItem(item: menuItem) {
      this.orderItems.push(item);
    },

    // 수량 증가
    increaseItem(id: number) {
      const item = this.orderItems.find((i) => i.id === id);
      if (item) {
        this.orderItems.push({ ...item });
        console.log('추가 성공:', this.orderItems.length);
      }
    },

    // 수량 감소
    decreaseItem(id: number) {
      const lastIndex = this.orderItems.map((item) => item.id).lastIndexOf(id);
      if (lastIndex !== -1) {
        this.orderItems.splice(lastIndex, 1);
        console.log('삭제 성공:', this.orderItems.length);
      }
    },

    // 항목 삭제
    removeItem(id: number) {
      this.orderItems = this.orderItems.filter((item) => item.id !== id);
      console.log('항목 삭제 완료');
    },

    setVoiceText(text: string) {
      this.voiceText = text;
    },

    // 최종 주문 번호 생성
    // orderComplete() {
    //   if (!this.customerId) return false;
    //   this.seq = getNextSequence();
    //   this.orderNum = `${getToday()}-${getNumofCar(this.customerId)}-${this.seq}`;
    //   return true;
    // },

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
      this.customerId = null;
      this.customerName = null;
      this.orderItems = [];
      this.voiceText = '';
      this.orderNum = null;
    },
  },
});
