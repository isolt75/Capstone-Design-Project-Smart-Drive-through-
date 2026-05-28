// Pi 마이크 → Clova STT 가 아니라 키오스크 브라우저 자체에서 Web Speech API 로
// 받은 한국어 발화를 메뉴+수량으로 변환하는 단순 NLU.
//
// "아이스 아메리카노 한 잔 주세요"  → [{menu:아메리카노, qty:1}]
// "콜드브루 두 잔이랑 라떼 세 잔"     → [{menu:콜드브루, qty:2}, {menu:카페라떼, qty:3}]
//
// 메뉴 사전은 백엔드 /menus 응답을 그대로 받아쓴다(하드코딩 금지).

import type { MenuItem } from '@/stores/store';

const KOREAN_NUM: Record<string, number> = {
  한: 1, 하나: 1, 일: 1,
  두: 2, 둘: 2, 이: 2,
  세: 3, 셋: 3, 삼: 3,
  네: 4, 넷: 4, 사: 4,
  다섯: 5, 오: 5,
  여섯: 6, 육: 6,
  일곱: 7, 칠: 7,
  여덟: 8, 팔: 8,
  아홉: 9, 구: 9,
  열: 10, 십: 10,
};

// 음료 온도/형태 수식어 — 메뉴명 매칭 전 제거
const STRIP = ['아이스', '뜨거운', '따뜻한', '핫', '아아', '뜨아'];

// 줄임말 → 정식 메뉴명 일부. 사용자가 짧게 말해도 잡히게.
const ALIAS: Record<string, string> = {
  아메: '아메리카노',
  라떼: '카페라떼',
  라테: '카페라떼',
  모카: '카페모카',
  카푸: '카푸치노',
  카라멜: '카라멜 마키아또',
  모히또: '라임모히또에이드',
  레모네이드: '레몬에이드',
  자몽: '자몽허니블랙티',
};

export interface ParsedOrder {
  menu: MenuItem;
  qty: number;
}

const compact = (s: string) => s.replace(/\s+/g, '').toLowerCase();

/** 한국어 수량 표현을 숫자로. 못 찾으면 1. */
function extractQty(window: string): number {
  const m = window.match(/(\d+)/);
  if (m) {
    const n = parseInt(m[1], 10);
    if (n > 0 && n < 100) return n;
  }
  // 긴 단어부터 (다섯/여섯/일곱 등이 한/두/세보다 우선)
  const words = Object.keys(KOREAN_NUM).sort((a, b) => b.length - a.length);
  for (const w of words) {
    if (window.includes(w)) return KOREAN_NUM[w];
  }
  return 1;
}

export function parseOrder(text: string, menus: MenuItem[]): ParsedOrder[] {
  if (!text || !menus.length) return [];

  // 1) 온도 수식어 제거
  let cleaned = text;
  for (const p of STRIP) cleaned = cleaned.split(p).join('');

  // 2) 줄임말 → 정식 메뉴명으로 치환 (긴 별칭 우선)
  const aliases = Object.keys(ALIAS).sort((a, b) => b.length - a.length);
  for (const a of aliases) cleaned = cleaned.split(a).join(ALIAS[a]);

  const haystack = compact(cleaned);

  // 3) 메뉴명을 긴 것부터 매칭 (카페라떼가 라떼보다 먼저, 카라멜 마키아또 우선 등)
  const ranked = [...menus].sort((a, b) => b.name.length - a.name.length);
  const results: ParsedOrder[] = [];
  const seen = new Set<number>();

  for (const menu of ranked) {
    const needle = compact(menu.name);
    if (needle.length < 2 || seen.has(menu.id)) continue;
    const idx = haystack.indexOf(needle);
    if (idx < 0) continue;

    // 메뉴명 앞 8자 + 뒤 12자 윈도우에서 수량 추출
    const before = haystack.slice(Math.max(0, idx - 8), idx);
    const after = haystack.slice(idx + needle.length, idx + needle.length + 12);
    const qty = extractQty(before + ' ' + after);

    results.push({ menu, qty });
    seen.add(menu.id);
  }
  return results;
}
