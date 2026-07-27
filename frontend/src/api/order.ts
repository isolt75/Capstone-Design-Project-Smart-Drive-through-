import api from './http';
import type { OrderPayload, OrderRes, PayStatusRes, StaffOrder } from './dtApi';

export const createOrder = async (payload: OrderPayload) => {
  const { data } = await api.post<OrderRes>('/orders', payload);
  return data;
};

export const getWaitingOrders = async (): Promise<StaffOrder[]> => {
  const { data } = await api.get<StaffOrder[]>('/orders/waiting');
  return data;
};

export const completeOrder = async (
  orderNo: string,
): Promise<{ success: boolean; updated: number }> => {
  const { data } = await api.post<{ success: boolean; updated: number }>(
    `/orders/${orderNo}/done`,
  );
  return data;
};

export const payOrder = async (
  orderNo: string,
): Promise<{ success: boolean; orderNum: string; payStatus: string }> => {
  const { data } = await api.post(`/orders/${orderNo}/pay`);
  return data;
};

export const getPayStatus = async (orderNo: string): Promise<PayStatusRes> => {
  const { data } = await api.get<PayStatusRes>(`/orders/${orderNo}/pay-status`);
  return data;
};
