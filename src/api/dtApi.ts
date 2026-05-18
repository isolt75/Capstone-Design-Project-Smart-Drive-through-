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
  orderNum: string;
  items: orderItem[];
}

export interface orderRes {
  success: boolean;
  customerId: number;
  orderTime: string;
  orderNum: string;
  seq: string;
}

// 고객
export interface lastOrderItem {
  menuId: number;
  menuName: string;
  quantity: number;
}

export interface customerRes {
  isNew: boolean;
  customerId?: number;
  plate?: string;
  lastOrder?: lastOrderItem[];
}

// STT
export interface STTRes {
  text: string;
}
