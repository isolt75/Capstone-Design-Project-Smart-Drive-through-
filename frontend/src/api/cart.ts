import api from './http';
import type { CartRes, CheckoutRes } from './dtApi';

const base = (eventId: string) => `/api/v1/drivethrough/cart/${eventId}`;

export const getCart = (eventId: string) =>
  api.get<CartRes>(base(eventId)).then((r) => r.data);

export const confirmCart = (eventId: string) =>
  api.post<{ success: boolean }>(base(eventId) + '/confirm').then((r) => r.data);

export const checkoutCart = (eventId: string) =>
  api.post<CheckoutRes>(base(eventId) + '/checkout').then((r) => r.data);
