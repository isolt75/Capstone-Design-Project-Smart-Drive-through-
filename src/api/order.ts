import api from './http';
import type { orderPayload, orderRes, staffOrder } from './dtApi';

export const createOrder = async (payload: orderPayload) => {
  const { data } = await api.post<orderRes>('/orders', payload);
  return data;
};

export const getWaitingOrders = async (): Promise<staffOrder[]> => {
  const { data } = await api.get<staffOrder[]>('/orders/waiting');
  return data;
};
