import api from './http';
import type { STTRes } from './dtApi';

export const requestSTT = async (audio: Blob): Promise<STTRes> => {
  const formData = new FormData();
  formData.append('audio', audio);
  const { data } = await api.post<STTRes>('/stt', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};
