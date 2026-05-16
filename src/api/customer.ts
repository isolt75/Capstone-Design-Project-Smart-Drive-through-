import api from './http';
import type { customerRes } from './dtApi';

export const getCustomer = async (plate: string): Promise<customerRes> => {
  const { data } = await api.get<customerRes>('/customer', {
    params: { plate },
  });
  return data;
};
