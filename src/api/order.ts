import api from './http';
import type { orderPayload, orderRes } from './dtApi';

export const createOrder = async (payload: orderPayload) => {
  const { data } = await api.post<orderRes>('/orders', payload);
  return data;
};
