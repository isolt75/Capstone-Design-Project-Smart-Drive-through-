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
    // /menus 응답을 보관해 음성 파서가 항상 최신 메뉴 기준으로 매칭하도록.
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
      this.isNew = res.isNew;
      if (res.isNew) {
        this.customerName = null;
        this.lastOrder = [];
      } else {
        this.customerId = res.plate ?? this.customerId;
        this.customerName = res.customerName ?? null;
        this.lastOrder = res.lastOrder ?? [];
      }
    },

    addItem(item: MenuItem, qty = 1) {
      const existing = this.orderItems.find((i) => i.id === item.id);
      if (existing) existing.quantity += qty;
      else {
        this.orderItems.push({
          ...item,
          quantity: qty,
        });
      }
    },

    setMenus(menus: MenuItem[]) {
      this.availableMenus = menus;
    },

    /**
     * 한국어 발화에서 메뉴 + 수량을 뽑아 장바구니에 담는다.
     *
     * 규칙(단순·검증가능):
     *  - 발화 텍스트에서 공백 제거 → 등록된 메뉴 이름(공백 제거)이 부분문자열로 포함되면 매칭.
     *  - 긴 메뉴명 우선(카페라떼가 라떼 부분과 충돌하지 않도록).
     *  - 수량은 매칭된 메뉴 이름의 앞 8자/뒤 12자 윈도우에서 따로 추출.
     *    "아메리카노 두 잔이랑 콜드브루 세 잔" 처럼 메뉴별 수량 분리.
     *  - 한글 수사(한/두/세/...) 또는 아라비아 숫자 둘 다 인식. 없으면 1.
     *
     * 반환: 담은 항목 목록 — UI에서 "방금 담은 거" 표시용.
     */
    parseVoiceOrder(text: string): Array<{ name: string; qty: number }> {
      if (!text) return [];
      const numberMap: Record<string, number> = {
        // 접미사 포함 형태 먼저 (길이 우선 매칭에서 이기도록)
        한개: 1, 한잔: 1, 하나: 1,
        두개: 2, 두잔: 2, 둘: 2,
        세개: 3, 세잔: 3, 셋: 3,
        네개: 4, 네잔: 4, 넷: 4,
        다섯개: 5, 다섯잔: 5, 다섯: 5,
        여섯개: 6, 여섯잔: 6, 여섯: 6,
        일곱개: 7, 일곱잔: 7, 일곱: 7,
        여덟개: 8, 여덟잔: 8, 여덟: 8,
        아홉개: 9, 아홉잔: 9, 아홉: 9,
        열개: 10, 열잔: 10, 열: 10,
        한: 1, 두: 2, 세: 3, 네: 4,
      };
      const numberWords = Object.keys(numberMap).sort((a, b) => b.length - a.length);

      const compact = text.replace(/\s+/g, '');
      const menuList = this.availableMenus ?? [];
      if (!menuList.length) return [];

      // 긴 메뉴명부터 — '카페라떼'가 '라떼' 단독보다 먼저 매칭되도록.
      const ranked = [...menuList].sort((a, b) => b.name.length - a.name.length);
      const added: Array<{ name: string; qty: number }> = [];
      const seen = new Set<number>();

      for (const menu of ranked) {
        if (seen.has(menu.id)) continue;
        const needle = menu.name.replace(/\s+/g, '');
        if (needle.length < 2) continue;
        const idx = compact.indexOf(needle);
        if (idx < 0) continue;

        // before 3자 / after 5자 — 좁게 잡아야 인접 메뉴의 수량이 섞이지 않음
        const before = compact.slice(Math.max(0, idx - 3), idx);
        const after = compact.slice(idx + needle.length, idx + needle.length + 5);
        const windowText = before + after;

        // 1) 아라비아 숫자 우선
        let qty = 1;
        const num = windowText.match(/\d+/);
        if (num) {
          const n = Number(num[0]);
          if (n > 0 && n < 100) qty = n;
        } else {
          // 2) 한글 수사 (긴 것부터 — "두개"가 "두"보다 먼저 매칭)
          for (const w of numberWords) {
            if (windowText.includes(w)) { qty = numberMap[w]; break; }
          }
        }

        this.addItem(menu, qty);
        added.push({ name: menu.name, qty });
        seen.add(menu.id);
      }
      return added;
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
