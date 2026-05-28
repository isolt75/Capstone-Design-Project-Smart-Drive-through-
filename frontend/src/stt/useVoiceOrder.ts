// 브라우저 Web Speech API 항상 켜둠 컴포저블. 인식된 최종 문장을 콜백으로 넘기는 게 전부 —
// 파싱·장바구니 반영은 호출 측(=store.parseVoiceOrder)이 책임진다.
// Chrome/Edge 에서만 동작 (Safari 미지원).

import { onBeforeUnmount, onMounted, ref } from 'vue';

export function useVoiceOrder(onFinal: (text: string) => void) {
  const supported = ref(true);
  const listening = ref(false);
  const transcript = ref('');
  const error = ref<string | null>(null);

  let recognition: any = null;
  let restartTimer: number | null = null;

  function start() {
    const Ctor: any =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!Ctor) {
      supported.value = false;
      error.value = '음성 인식 미지원 (Chrome/Edge 권장)';
      return;
    }

    recognition = new Ctor();
    recognition.lang = 'ko-KR';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t;
        else interim += t;
      }
      if (final) {
        transcript.value = final.trim();
        onFinal(final);
      } else if (interim) {
        transcript.value = interim.trim();
      }
    };

    recognition.onerror = (e: any) => {
      // 'no-speech' / 'aborted' 는 일상 — 무시
      if (e.error && e.error !== 'no-speech' && e.error !== 'aborted') {
        error.value = `음성 오류: ${e.error}`;
      }
    };

    recognition.onend = () => {
      if (listening.value) {
        restartTimer = window.setTimeout(() => {
          try {
            recognition?.start();
          } catch {
            /* 이미 시작됐으면 무시 */
          }
        }, 250);
      }
    };

    try {
      recognition.start();
      listening.value = true;
      error.value = null;
    } catch (e: any) {
      error.value = `음성 시작 실패: ${e?.message ?? e}`;
    }
  }

  function stop() {
    listening.value = false;
    if (restartTimer) {
      window.clearTimeout(restartTimer);
      restartTimer = null;
    }
    try {
      recognition?.stop();
    } catch {
      /* noop */
    }
    recognition = null;
  }

  onMounted(start);
  onBeforeUnmount(stop);

  return { supported, listening, transcript, error, start, stop };
}
