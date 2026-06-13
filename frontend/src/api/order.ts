import api from './http';
import type { OrderPayload, OrderRes, StaffOrder } from './dtApi';

export const createOrder = async (payload: OrderPayload) => {
  const { data } = await api.post<OrderRes>('/orders', payload);
  return data;
};

export const getWaitingOrders = async (): Promise<StaffOrder[]> => {
  const { data } = await api.get<StaffOrder[]>(
    // 'http://192.168.0.80:8080/customer',
    '/orders/waiting',
  );
  return data;
};

// 직원이 주문 묶음을 완료 처리 → 대기열에서 제거 (POST /orders/{orderNo}/done)
export const completeOrder = async (
  orderNo: string,
): Promise<{ success: boolean; updated: number }> => {
  const { data } = await api.post<{ success: boolean; updated: number }>(
    `/orders/${orderNo}/done`,
  );
  return data;
};
