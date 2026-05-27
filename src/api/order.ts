import api from './http';
import type { OrderPayload, OrderRes, StaffOrder } from './dtApi';

export const createOrder = async (payload: OrderPayload) => {
  const { data } = await api.post<OrderRes>('/orders', payload);
  return data;
};

export const getWaitingOrders = async (): Promise<StaffOrder[]> => {
  const { data } = await api.get<StaffOrder[]>('/orders');
  return data;
};
