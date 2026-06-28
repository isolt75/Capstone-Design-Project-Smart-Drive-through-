// 메뉴
export interface Menu {
  menuId: number;
  menuName: string;
  price: number;
  category: string;
  cafYn: 'Y' | 'N';
  temp: 'Hot' | 'Cold';
}

// 주문
export interface OrderItem {
  menuId: number;
  quantity: number;
}

export interface OrderPayload {
  plate: string;
  customerName: string;
  // orderNum: string;
  items: OrderItem[];
}

export interface OrderRes {
  success: boolean;
  customerId: number;
  customerName: string;
  plate: string;
  orderTime: string;
  orderNumber: string;
}

// 고객
export interface LastOrderItem {
  menuId: number;
  menuName: string;
  quantity: number;
}

type NewCustomer = {
  isNew: true;
};

type ExistingCustomer = {
  isNew: false;
  plate: string;
  customerId: number;
  customerName: string;
  lastOrder: LastOrderItem[];
};

export type CustomerRes = NewCustomer | ExistingCustomer;

// STT
export interface STTRes {
  text: string;
}

// 음성 주문 장바구니
export interface CartEntry {
  cartItemId: number;
  menuNum: number;
  menuName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  status: 'OPEN' | 'CONFIRMED' | 'PAID';
}

export interface CartRes {
  event_id: string | null;
  status: 'OPEN' | 'CONFIRMED' | 'PAID' | 'EMPTY';
  items: CartEntry[];
  total: number;
  orderNumber?: string | null;
}

export interface CheckoutRes {
  success: boolean;
  event_id: string;
  orderNumber: string;
  customerId: number;
  paidAt: string;
}

// 직원 대기 주문
export interface StaffOrder {
  orderNum: string;
  customerId: string;
  items: StaffOrderItem[];
}

export interface StaffOrderItem {
  id: number;
  name: string;
  quantity: number;
}
