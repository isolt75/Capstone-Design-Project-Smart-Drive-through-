import api from './http';
import type { orderPayload, orderItem } from './dtApi';

export const createOrder = async (payload: orderPayload) => {
  const { data } = await api.post<orderItem>('/orders', payload);
  return data;
};
