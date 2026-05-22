// 메뉴
export interface Menu {
  menuId: number;
  menuName: string;
  price: number;
  category: string;
  caffeine: 'Y' | 'N';
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
