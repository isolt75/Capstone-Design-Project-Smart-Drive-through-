// 메뉴
export interface menu {
  menuId: number;
  menuName: string;
  price: number;
  category: string;
  caffeine: 'Y' | 'N';
  temp: 'Hot' | 'Cold';
}

// 주문
export interface orderItem {
  menuId: number;
  quantity: number;
}

export interface orderPayload {
  plate: string;
  customerName: string;
  // orderNum: string;
  items: orderItem[];
}

export interface orderRes {
  success: boolean;
  customerId: number;
  customerName: string;
  plate: string;
  orderTime: string;
  orderNumber: string;
}

// 고객
export interface lastOrderItem {
  menuId: number;
  menuName: string;
  quantity: number;
}

export interface customerRes {
  plate?: string;
  lastOrder?: lastOrderItem[];
  isNew: boolean;
  customerId?: number;
  customerName?: string;
}

// STT
export interface STTRes {
  text: string;
}

// 직원 대기 주문
export interface staffOrder {
  orderNum: string;
  customerId: string;
  items: staffOrderItem[];
}

export interface staffOrderItem {
  id: number;
  name: string;
  quantity: number;
}
