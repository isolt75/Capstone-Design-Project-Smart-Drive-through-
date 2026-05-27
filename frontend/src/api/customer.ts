import api from './http';
import type { CustomerRes } from './dtApi';

export interface PlateRes {
  plate: string;
}

// 번호판 받기
export const getPlate = async (): Promise<PlateRes> => {
  const { data } = await api.get<PlateRes>('/ocr/latest');
  return data;
};

// 고객 조회
export const getCustomer = async (plate: string): Promise<CustomerRes> => {
  const { data } = await api.get<CustomerRes>('/customer', {
    params: { plate },
  });
  return data;
};
