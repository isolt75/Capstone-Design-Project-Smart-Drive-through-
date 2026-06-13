
# Smart Drive Kiosk — 스타일 가이드

> IoT 드라이브스루 카페 키오스크 / 직원 POS 프론트엔드의 디자인 시스템 문서.
> 모든 값은 현재 코드(`src/App.vue`의 `:root` 토큰 + 각 컴포넌트 `<style scoped>`)에서 추출한 **실제 사용 값**입니다.
> 출처가 토큰화되어 있지 않은 값은 "(인라인)"으로 표기하고, 마지막 **개선 제안** 절에서 정리 방향을 제시합니다.

---

## 1. 개요 (Overview)

- **콘셉트**: "따뜻한 카페 팔레트 (앰버/크림)" — 코드 주석 그대로. 크림빛 배경 위에 단일 앰버 포인트 컬러.
- **타깃 환경**: 차 안 / 드라이브스루 키오스크 + 직원 POS 대시보드. 큰 터치 타깃, 큰 글씨, 낮은 채도.
- **인터랙션 특징**:
  - 입력 폼이 거의 없음 — 음성(Pi 마이크) + 터치 버튼 중심. 그래서 **Input 컴포넌트 스타일이 현재 정의되어 있지 않음** (5절 참고).
  - 전 화면 `user-select: none` (키오스크 텍스트 드래그 방지).
  - 버튼은 `:active`에서 `scale(0.97)`로 눌림 피드백.
- **토큰 정의 위치**: `src/App.vue`의 전역 `:root`. 컴포넌트는 모두 `var(--*)`를 참조 (일부 인라인 값 예외).
- **레거시 별칭**: `--primary-color`, `--bg-base`, `--text-primary` 는 구 컴포넌트 호환용 alias이며 신규 코드에서는 사용 금지.

---

## 2. 색상 팔레트 (Color Palette)

### 2.1 Primary (앰버)
| 토큰 | 값 | 용도 |
|---|---|---|
| `--primary` | `#e8843a` | 주 버튼 배경, 활성 탭, 카운트 배지, 체크 원형, LIVE 카운트 |
| `--primary-strong` | `#d9722a` | 강조 텍스트(가격·주문번호·수량), 매칭 라벨, hover/대비용 |
| `--primary-soft` | `#fbead8` | 보조 pill 배경(+담기, qty 버튼), 로고 원형, 듣는 중 칩 그라데이션 |

### 2.2 중립 / 그레이 (Neutrals)
| 토큰 | 값 | 용도 |
|---|---|---|
| `--bg` | `#faf6f0` | 페이지 배경(크림) |
| `--surface` | `#ffffff` | 카드·칩·버튼 기본 표면 |
| `--surface-2` | `#f4ede2` | 보조 표면(합계 박스, 주문번호 박스, plate 칩) |
| `--border` | `#ebe3d6` | 모든 1px 테두리·구분선 |
| `--text` | `#2a2521` | 본문 기본 텍스트 |
| `--text-muted` | `#998d7d` | 보조 설명·라벨·placeholder 성격 텍스트 |

### 2.3 시스템 컬러 (System)
| 토큰 | 값 | 용도 |
|---|---|---|
| `--danger` | `#e26d5c` | 에러 텍스트/테두리, 삭제(×) 버튼 |
| `--success` | `#3fbf6f` | 직원 POS의 LIVE 점 |
| `--danger-soft` | `#fbe7e3` | `.del` 연한 적색 배경 |
| `--scrollbar` | `#e0d6c6` | 커스텀 스크롤바 |

### 2.4 그라데이션
- 듣는 중 음성 칩: `linear-gradient(to right, var(--primary-soft), var(--surface))`
- plate 번호 텍스트: `linear-gradient(180deg, var(--primary), var(--primary-strong))` + `background-clip: text`
- 완료 화면 배경: `radial-gradient(120% 120% at 50% 0%, #fff6ea 0%, var(--bg) 55%)`
- 액션바 페이드: `linear-gradient(to top, var(--bg) 70%, transparent)`

### 2.5 그림자에 쓰이는 RGBA (참고)
- 갈색 계열 그림자 베이스: `rgba(120, 80, 30, …)` (토큰 그림자)
- 앰버 글로우(버튼/체크): `rgba(232, 132, 58, …)` = `--primary`의 rgb
- 위험 글로우: `rgba(226, 109, 92, …)` = `--danger`의 rgb

---

## 3. 타이포그래피 (Typography)

### 3.1 폰트 패밀리
```css
font-family:
  'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont,
  'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
```
- 스무딩: `-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;`

### 3.2 자간 (Letter-spacing)
| 대상 | 값 |
|---|---|
| `body` (기본) | `-0.01em` |
| `h1, h2, h3` | `-0.02em` |
| plate 번호 / 주문번호 강조 | `+0.05em ~ 0.06em` (숫자 가독성용 양수 자간) |

### 3.3 폰트 굵기 (Weight)
실제 사용되는 굵기는 **4단계**:
| 굵기 | 용도 |
|---|---|
| `600` (Semibold) | 본문 강조, 메뉴명, 라벨 |
| `700` (Bold) | 버튼, 가격, 칩, 제목 |
| `800` (Extrabold) | 주문번호, 강한 강조 수치 |
| (기본 400) | 거의 사용 안 함 |

### 3.4 타입 스케일 (실제 등장하는 rem 값)
> 디자인 토큰이 아닌 인라인 `font-size` 값들을 작은 것부터 정리. 굵기/용도와 함께 봐야 함.

| rem | px(≈) | 대표 용도 |
|---|---|---|
| 0.75 | 12 | "추천" 배지 |
| 0.85 | 13.6 | 매칭 라벨, LIVE 라벨 |
| 0.90 | 14.4 | 부가 설명, +담기 pill, 음성 칩 본문 |
| 0.95 | 15.2 | 서브 텍스트, plate 칩 |
| 1.00 | 16 | 칩 기본, 라벨 |
| 1.05 | 16.8 | 빈 카트 안내, 홈 버튼 |
| 1.10 | 17.6 | 카트 항목명, 주문 항목 행 |
| 1.15 | 18.4 | 메뉴명, 합계 라벨, 안내문 |
| 1.20 | 19.2 | 상태 메시지, 주 버튼 텍스트 |
| 1.30 | 20.8 | 총액, 직원 주문번호 |
| 1.40 | 22.4 | "주문 내역" h2 |
| 1.60 | 25.6 | 총액 강조, 로고 |
| 1.70 | 27.2 | 인사 h1 ("환영합니다") |
| 2.00 | 32 | 페이지 제목 h1 |
| 2.10 | 33.6 | plate 번호 |
| 2.20 | 35.2 | "주문 완료!" h1 |
| 2.40 | 38.4 | 완료 화면 주문번호 |
| 3.00 | 48 | 체크 ✓ 마크 |

### 3.5 조합 예시 (실사용 패턴)
- **페이지 제목**: `2rem / 700~800 / -0.02em`
- **강조 수치(가격·번호)**: `1.3~2.4rem / 700~800 / color: --primary-strong`
- **보조 라벨**: `0.9~1.05rem / 600~700 / color: --text-muted`
- **버튼 라벨**: `1.1~1.2rem / 700`

---

## 4. 간격 시스템 (Spacing System)

> 현재 간격은 **토큰 없이 인라인 px** 로 들어가 있으며, 대부분 **2px 단위**(주로 4px 배수에 6/7/22 같은 변칙 혼재).

### 4.1 실제 등장하는 간격 값 (px)
`2, 4, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 48`

### 4.2 빈도 높은 용법
| 용도 | 대표 값 |
|---|---|
| 아이콘/텍스트 사이 gap | `7~12px` |
| 카드 내부 패딩 | `16~24px` |
| 카드 간 grid gap | `16~18px` |
| 섹션 상하 여백 | `18~28px` |
| 페이지 좌우 패딩 | `20px` (고정에 가까움) |
| 페이지 상단 패딩 | `20~28px` |
| 하단 고정 액션바 여백 확보 | `padding-bottom: 90~110px` |
| pill 내부 패딩 | `7px 14px ~ 12px 18px` |
| 주 버튼 패딩 | `16~18px` |

### 4.3 컨테이너 최대 폭 (max-width)
| 화면 | 값 |
|---|---|
| 키오스크 메뉴(`recmdNWhole`) | `960px` |
| 주문 확인(`orderConfirm`) | `640px` |
| 완료(`final`) 카드 | `520px` |
| 직원 POS(`staffPos`) | `1080px` |
| 음성 칩 | `360px` (말풍선 said `280px`) |

### 4.4 safe-area
- 하단 고정 액션바: `padding-bottom: calc(14px + env(safe-area-inset-bottom))` — 노치/홈바 대응.

---

## 5. 컴포넌트 스타일 (Component Styles)

### 5.1 버튼 (Buttons)
전역 `button` 리셋(`App.vue`):
```css
button { border: none; cursor: pointer; font-family: inherit; color: inherit;
  transition: transform .08s ease, background .15s ease, box-shadow .15s ease, border-color .15s ease; }
button:active { transform: scale(0.97); }
```

| 변형 | 스펙 |
|---|---|
| **Primary** (`.btn-primary`, `.home`(완료)) | bg `--primary`, 텍스트 `#fff`, `--radius-btn`(14), `padding: 18px`, `font: 1.2rem/700`, `--shadow-primary` |
| **Ghost / Secondary** (`.btn-ghost`) | bg `--surface`, `1px --border`, 텍스트 `--text`, 동일 radius/패딩 |
| **홈/아웃라인** (`.home`, `.home-btn`) | bg `--surface`, `1px --border`, `--shadow`, `--radius-btn` |
| **메뉴 카드 버튼** (`.menu-btn`) | 세로 카드형, bg `--surface`, `1px --border`, `--shadow-sm`, radius `--radius`(18) |
| **수량 ±** (`.qty-btn`) | 32×32, radius 9px(인라인, 1회만 사용), bg `--primary-soft`, 텍스트 `--primary-strong`, `1.3rem` |
| **삭제** (`.del`) | 28×28 원형(50%), bg `--danger-soft`, 텍스트 `--danger` |
| **카테고리 탭** (`.category-tabs button`) | pill(999px), 비활성 `--surface`/`--text-muted`, 활성 `--primary`/`#fff` + `--shadow-tab` |

### 5.2 칩 / Pill
- 공통: `border-radius: 999px`, `bg --surface`, `1px --border`.
- 예: `.total-chip`(합계), `.voice-chip`(음성 상태), `.live`(LIVE), `.count`(건수 — bg `--primary`).

### 5.3 카드 (Cards)
| 카드 | radius | 패딩 | 그림자 |
|---|---|---|---|
| 메뉴 버튼 | `--radius`(18) | `16px 14px` | `--shadow-sm` |
| 직원 주문 박스 | `--radius`(18) | `20px` | `--shadow-sm` |
| 합계/주문번호 박스 | `--radius`(18) | `20~24px` | (bg `--surface-2`, 그림자 없음) |
| 완료 카드 | `--radius-lg`(28) | `48px 32px` | `--shadow` |

### 5.4 리스트 / 행 (List rows)
- 카트 행(`.cart-row`): 하단 `1px solid --border`, 마지막 행 제거.
- 직원 항목 행(`.item-row`): 행 사이 `1px dashed --border` (점선).

### 5.5 상태 표시 (Status / State)
- 빈 상태: 중앙 정렬, `--text-muted`, 이모지 + 안내(예: `🛒 담긴 메뉴가 없습니다`, `☕ 현재 대기 중인 주문이 없습니다`).
- 에러: 텍스트/테두리 `--danger`.
- LIVE 인디케이터: 초록 점(`#3fbf6f`) + `blink` 애니메이션.

### 5.6 입력 (Inputs) — ⚠️ 현재 미정의
현재 코드에 `<input>`/`<select>`/`<textarea>` 스타일이 **존재하지 않습니다** (음성·터치 UX라 폼이 없음).
신규 입력 추가 시 일관성을 위한 **권장 기본형**(제안):
```css
.input {
  height: 48px; padding: 0 16px;
  border: 1px solid var(--border); border-radius: var(--radius-sm);
  background: var(--surface); color: var(--text); font-size: 1.05rem;
}
.input::placeholder { color: var(--text-muted); }
.input:focus { outline: none; border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-soft); }
```

---

## 6. 그림자 및 깊이 (Shadows & Elevation)

| 레벨 | 토큰/값 | 용도 |
|---|---|---|
| **0 (flat)** | 그림자 없음 + `--surface-2` 배경 | 합계/주문번호 박스 (눌린 면) |
| **1 (sm)** | `--shadow-sm` = `0 2px 10px rgba(120,80,30,.06)` | 카드, 작은 표면 |
| **2 (base)** | `--shadow` = `0 8px 24px rgba(120,80,30,.08)` | 떠 있는 칩, 완료 카드, 고정 버튼 |
| **3 (브랜드 글로우)** | `--shadow-primary` = `0 8px 20px rgba(232,132,58,.4)` | 주 버튼(앰버 강조) |
| **3 (탭 글로우)** | `--shadow-tab` = `0 6px 16px rgba(232,132,58,.35)` | 활성 카테고리 탭 |
| **3 (대형 글로우)** | `--shadow-primary-lg` / `--shadow-danger-lg` = `0 12px 28px rgba(…,.4)` | 완료 체크 / 에러 마크 |

> 그림자 컬러는 두 갈래: **중립 갈색**(`120,80,30`)은 표면 깊이용, **브랜드 앰버**(`232,132,58`)는 강조 액션의 "발광"용. 위험은 `226,109,92`.

---

## 7. 애니메이션 및 전환 (Animations & Transitions)

### 7.1 전역 트랜지션
| 대상 | 값 |
|---|---|
| 모든 버튼 | `transform .08s, background .15s, box-shadow .15s, border-color .15s` (ease) |
| 버튼 누름 | `:active { transform: scale(0.97) }` |

> 표준 전환 길이: **빠름 0.08s**(즉각 반응), **기본 0.15s**(색/그림자). 모두 `ease`.

### 7.2 키프레임 (3종)
| 이름 | 길이/타이밍 | 동작 | 사용처 |
|---|---|---|---|
| `pulse` | `1.4s ease-in-out infinite` | `scale 1→1.18`, `opacity 1→0.7` (50%) | 음성 듣는 중 🎤 아이콘 |
| `blink` | `1.4s ease-in-out infinite` | `opacity 1→0.3` (50%) | 직원 POS LIVE 점 |
| `pop` | `0.4s ease` | `scale 0.4→1.1→1`, fade-in | 주문 완료 체크 마크 등장 |

> "살아있음" 신호(pulse/blink)는 동일 리듬 **1.4초**로 통일되어 있음.

---

## 8. 테두리 반경 (Border Radius)

| 토큰/값 | 크기 | 용도 |
|---|---|---|
| `--radius-lg` | `28px` | 완료 카드(특대) |
| `--radius` | `18px` | 카드, 박스 기본 |
| `--radius-btn` | `14px` | 주요 액션 버튼 / 홈 버튼 |
| `--radius-sm` | `12px` | 작은 표면, 리스트 컨테이너 |
| `--radius-xs` | `8px` | plate 칩, 스크롤바 |
| `9px` (인라인) | — | 수량 ± 버튼 (1회만 사용 — 미토큰화) |
| `999px` | full | 모든 pill/칩/탭 |
| `50%` | 원형 | 로고, LIVE 점, 체크 마크, 삭제 버튼 |

> 남은 인라인은 `.qty-btn`의 `9px` 하나뿐(단일 사용처라 보류). `--radius-sm`(12)과 `--radius-btn`(14)이 가깝지만, 버튼/표면을 구분하려 의도적으로 분리 유지.

---

## 9. 기타 세부사항

- **레이어 / z-index**: 음성 칩 `z-index: 50`. 고정 액션바·홈 버튼은 `position: fixed`이나 z-index 미지정(자연 순서). → 충돌 가능, 스케일 정의 권장.
- **고정 요소 패턴**: 하단 액션바·홈 버튼은 `left:50%; transform:translateX(-50%)`로 중앙 정렬 + `max-width` 일치.
- **그리드**: 메뉴 `repeat(3,1fr)` → `@media(max-width:600px)` 에서 `repeat(2,1fr)`, 이미지 높이 `140px→110px`. 직원 주문은 `repeat(auto-fill, minmax(260px,1fr))` 반응형.
- **이미지**: 메뉴 이미지 `object-fit: contain`, 고정 높이.
- **반응형 브레이크포인트**: 코드상 유일하게 `max-width: 600px` 1개. (태블릿/데스크톱 분기 없음.)
- **스크롤바**: 8px, thumb `#e0d6c6` radius 8px (webkit 전용).

---

## 10. 개선 제안 (Refinement Backlog)

UI를 다듬을 때 우선순위 높은 정리 항목:

1. ✅ **반경 토큰 정리** (완료): `--radius-lg`(28)/`--radius-btn`(14)/`--radius-xs`(8) 신설, 인라인 치환. `.qty-btn` `9px`만 단일 사용처라 보류.
2. ✅ **브랜드 그림자 토큰화** (완료): `--shadow-primary` / `--shadow-primary-lg` / `--shadow-tab` / `--shadow-danger-lg` 추출, 중복 인라인 제거.
3. ✅ **시스템 컬러 토큰화** (완료): `--success` / `--danger-soft` / `--scrollbar` 추가.
4. **간격 스케일 도입**: `--space-1..8`(4px 기준: 4/8/12/16/20/24/32/48) 정의 후 인라인 px를 점진 치환. 변칙값(6/7/22)은 가장 가까운 스텝으로 흡수.
5. **타입 스케일 토큰화**: 자주 쓰는 `0.9 / 1.0 / 1.15 / 1.3 / 1.7 / 2.0`rem을 `--fs-*`로 정의, 18단계 난립 축소.
6. **transition 토큰**: `--t-fast: .08s`, `--t-base: .15s` 정의.
7. **z-index 스케일**: `--z-fixed: 40`, `--z-chip: 50`, `--z-modal: 100` 식 정의.
8. **포커스 가시성**: 키오스크라 마우스 포커스는 약하지만, 접근성/터치 외 입력 대비 `:focus-visible` 링(예: `box-shadow: 0 0 0 3px var(--primary-soft)`) 표준화.
9. **레거시 alias 제거 로드맵**: `--primary-color/--bg-base/--text-primary` 사용처 정리 후 삭제.
