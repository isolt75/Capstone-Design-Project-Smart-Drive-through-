// 브라우저 Web Speech API 를 켜둔 채 한국어 발화를 받아, parseOrder 로 음료+수량을
// 뽑아내고 콜백으로 넘긴다. Chrome/Edge 에서만 동작 (Safari 미지원).
//
// onMounted 에서 자동 시작하고, onBeforeUnmount 에서 중단한다. Chrome 은 연속 모드라도
// 가끔 onend 가 호출되어 끊기는데, listening 상태면 자동 재시작.

import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue';
import type { MenuItem } from '@/stores/store';
import { parseOrder, type ParsedOrder } from './parseOrder';

export function useVoiceOrder(
  menus: Ref<MenuItem[]>,
  onMatch: (results: ParsedOrder[], transcript: string) => void,
) {
  const supported = ref(true);
  const listening = ref(false);
  const transcript = ref('');
  const lastMatch = ref<string | null>(null);
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
        const matches = parseOrder(final, menus.value);
        if (matches.length) {
          lastMatch.value = matches
            .map((m) => `${m.menu.name} ×${m.qty}`)
            .join(', ');
          onMatch(matches, final);
        }
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

  return { supported, listening, transcript, lastMatch, error, start, stop };
}
