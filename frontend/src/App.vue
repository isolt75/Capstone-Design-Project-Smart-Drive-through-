<template>
  <router-view />
</template>

<style>
:root {
  /* 따뜻한 카페 팔레트 (앰버/크림) */
  --bg: #faf6f0;
  --surface: #ffffff;
  --surface-2: #f4ede2;
  --border: #ebe3d6;
  --text: #2a2521;
  --text-muted: #998d7d;
  --primary: #e8843a;
  --primary-strong: #d9722a;
  --primary-soft: #fbead8;
  --danger: #e26d5c;

  /* 시스템 컬러 */
  --success: #3fbf6f;
  --danger-soft: #fbe7e3;
  --scrollbar: #e0d6c6;

  --radius-lg: 28px;
  --radius: 18px;
  --radius-btn: 14px;
  --radius-sm: 12px;
  --radius-xs: 8px;

  --shadow: 0 8px 24px rgba(120, 80, 30, 0.08);
  --shadow-sm: 0 2px 10px rgba(120, 80, 30, 0.06);
  /* 브랜드 앰버 글로우 (강조 액션) */
  --shadow-primary: 0 8px 20px rgba(232, 132, 58, 0.4);
  --shadow-primary-lg: 0 12px 28px rgba(232, 132, 58, 0.4);
  --shadow-tab: 0 6px 16px rgba(232, 132, 58, 0.35);
  --shadow-danger-lg: 0 12px 28px rgba(226, 109, 92, 0.4);

  /* 레거시 별칭 (구 컴포넌트 호환) */
  --primary-color: var(--primary);
  --bg-base: var(--surface);
  --text-primary: var(--text);
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  min-height: 100%;
}

body {
  background-color: var(--bg);
  color: var(--text);
  font-family:
    'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont,
    'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  user-select: none;
  letter-spacing: -0.01em;
}

button {
  border: none;
  cursor: pointer;
  font-family: inherit;
  color: inherit;
  transition:
    transform 0.08s ease,
    background 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease;
}

button:active {
  transform: scale(0.97);
}

h1,
h2,
h3 {
  letter-spacing: -0.02em;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-thumb {
  background: var(--scrollbar);
  border-radius: var(--radius-xs);
}
</style>
