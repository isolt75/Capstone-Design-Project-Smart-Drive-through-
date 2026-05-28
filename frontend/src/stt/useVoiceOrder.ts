// Pi 마이크 → Clova STT → 메인서버 DT_TB_EDGE_EVENT.voice_text 가 진짜 음성 소스.
// 키오스크는 /api/voice/latest 를 2초 폴링해서 새 event_id 가 잡히면 그 텍스트를 콜백으로 넘긴다.
// 호출 측(=recmdNWhole)에서 store.parseVoiceOrder 로 장바구니에 반영한다.
//
// 첫 폴링은 "기준점 잡기" — 이미 DB 에 쌓여 있던 옛 voice 가 새로고침할 때마다 재반영되지 않게.

import { onBeforeUnmount, onMounted, ref } from 'vue';
import api from '@/api/http';

interface VoiceLatest {
  text: string;
  event_id: string;
  created_at: string;
}

const POLL_MS = 2000;

export function useVoiceOrder(onFinal: (text: string) => void) {
  const supported = ref(true); // Pi 경로는 항상 사용 가능 — 백엔드가 떠 있느냐만 변수
  const listening = ref(false);
  const transcript = ref('');
  const error = ref<string | null>(null);

  let pollInterval: number | null = null;
  // null = 첫 tick (기준점 잡기, 콜백 호출 X). 이후엔 마지막 처리한 event_id.
  let lastEventId: string | null = null;

  async function tick() {
    try {
      const { data } = await api.get<VoiceLatest>('/voice/latest');
      error.value = null;
      if (!data.event_id || !data.text) return;
      const isFirst = lastEventId === null;
      if (data.event_id === lastEventId) return;
      lastEventId = data.event_id;
      transcript.value = data.text;
      if (!isFirst) onFinal(data.text);
    } catch (e: any) {
      error.value = '백엔드 연결 끊김';
    }
  }

  function start() {
    listening.value = true;
    error.value = null;
    void tick();
    pollInterval = window.setInterval(tick, POLL_MS);
  }

  function stop() {
    listening.value = false;
    if (pollInterval) {
      window.clearInterval(pollInterval);
      pollInterval = null;
    }
  }

  onMounted(start);
  onBeforeUnmount(stop);

  return { supported, listening, transcript, error, start, stop };
}
