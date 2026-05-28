import axios from 'axios';

// VITE_API_BASE_URL 가 .env 에 없어도 같은 머신의 메인서버를 보도록 폴백.
// 운영/원격은 frontend/.env 에 명시하면 그 값이 우선.
const baseURL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

if (import.meta.env.DEV) {
  // 어떤 baseURL 로 요청 나가는지 즉시 확인 — 빈 응답 디버그용
  // eslint-disable-next-line no-console
  console.log(`[API] baseURL = ${baseURL}`);
  api.interceptors.request.use((config) => {
    // eslint-disable-next-line no-console
    console.log(
      `[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
    );
    return config;
  });
}

export default api;
