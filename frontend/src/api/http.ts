import axios from 'axios';

// 백엔드 주소 결정:
//  1) frontend/.env 의 VITE_API_BASE_URL 이 있으면 그 값(운영/원격 고정용).
//  2) 없으면 "페이지를 연 호스트" 기준 → localhost 로 열면 localhost:8000,
//     LAN IP(예: 192.168.1.50)로 열면 그 IP:8000.
//  덕분에 손님(노트북)·직원(맥)이 같은 빌드로 각자 접속해도 알아서 맞는 백엔드를 찾는다.
const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  `http://${window.location.hostname}:8000/api`;

// WebSocket 주소. baseURL(http(s)://host[/api]) 에서 '/api' 를 떼고 http→ws 로 바꾼다.
// 예: http://localhost:8000/api + '/ws/staff' → ws://localhost:8000/ws/staff
export const wsURL = (path: string): string => {
  const origin = baseURL.replace(/\/api\/?$/, '');
  return `${origin.replace(/^http/, 'ws')}${path}`;
};

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
