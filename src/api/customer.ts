import api from './http';
import type { CustomerRes } from './dtApi';

export interface PlateRes {
  success: boolean;
  plate: string;
}

// 번호판 받기
export const getPlate = async (): Promise<PlateRes> => {
  const { data } = await api.get<PlateRes>('/ocr/receive');
  return data;
};

// 고객 조회
export const getCustomer = async (plate: string): Promise<CustomerRes> => {
  const { data } = await api.get<CustomerRes>('/customer', {
    params: { plate },
  });
  return data;
};
