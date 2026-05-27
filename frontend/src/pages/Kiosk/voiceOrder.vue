<script setup lang="ts">
import { useOrderStore } from '@/stores/store';

const store = useOrderStore();
const fakeSTT = () => store.setVoiceText('아메리카노 한 잔'); //임시 텍스트
</script>

<template>
  <div class="voice-page">
    <header class="v-head">
      <button class="back" @click="$router.push('/recmd')">‹ 메뉴</button>
      <h1>음성 주문</h1>
      <span class="spacer" />
    </header>

    <div class="v-body">
      <button class="mic" @click="fakeSTT">
        <span class="mic-ring"></span>
        <span class="mic-ico">🎤</span>
      </button>
      <p class="mic-guide">버튼을 누르고 주문을 말씀해 주세요</p>

      <div class="transcript" :class="{ filled: store.voiceText }">
        {{ store.voiceText || '예: 아메리카노 두 잔 주세요' }}
      </div>
    </div>

    <button class="btn-primary" @click="$router.push('/confirm')">
      주문 확인 ▸
    </button>
  </div>
</template>

<style scoped>
.voice-page {
  max-width: 640px;
  margin: 0 auto;
  min-height: 100vh;
  padding: 20px 20px 28px;
  display: flex;
  flex-direction: column;
}

.v-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.v-head h1 {
  margin: 0;
  font-size: 1.6rem;
}
.back {
  background: transparent;
  color: var(--text-muted);
  font-size: 1.1rem;
  font-weight: 600;
}
.spacer {
  width: 48px;
}

.v-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 22px;
}

.mic {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 168px;
  height: 168px;
  border-radius: 50%;
  background: var(--primary);
  box-shadow: 0 14px 36px rgba(232, 132, 58, 0.45);
}
.mic-ico {
  font-size: 4rem;
  filter: grayscale(1) brightness(3);
}
.mic-ring {
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  border: 3px solid var(--primary);
  opacity: 0.4;
  animation: ring 1.8s ease-out infinite;
}

.mic-guide {
  margin: 0;
  font-size: 1.15rem;
  color: var(--text-muted);
}

.transcript {
  width: 100%;
  padding: 22px;
  border-radius: var(--radius);
  background: var(--surface);
  border: 1px dashed var(--border);
  text-align: center;
  font-size: 1.3rem;
  color: var(--text-muted);
}
.transcript.filled {
  border-style: solid;
  border-color: var(--primary);
  color: var(--text);
  font-weight: 700;
}

.btn-primary {
  padding: 18px;
  border-radius: 14px;
  background: var(--primary);
  color: #fff;
  font-size: 1.2rem;
  font-weight: 700;
  box-shadow: 0 8px 20px rgba(232, 132, 58, 0.4);
}

@keyframes ring {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  100% {
    transform: scale(1.35);
    opacity: 0;
  }
}
</style>
