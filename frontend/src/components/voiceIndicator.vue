<script setup lang="ts">
// 우하단에 떠 있는 음성 상태 칩 — Pi 마이크에서 들어온 마지막 발화/매칭 결과 표시.
defineProps<{
  listening: boolean;
  transcript: string;
  lastMatch: string | null;
  error: string | null;
  supported: boolean;
}>();
</script>

<template>
  <div class="voice-chip" :class="{ listening, err: !!error || !supported }">
    <span class="voice-ico">🚗🎤</span>
    <div class="voice-body">
      <div v-if="error" class="status fail">{{ error }}</div>
      <template v-else>
        <div class="status">
          {{ listening ? 'Pi 마이크 연결됨 — 차에서 말씀하세요' : '대기 중' }}
        </div>
        <div v-if="transcript" class="said">"{{ transcript }}"</div>
        <div v-if="lastMatch" class="matched">+ {{ lastMatch }}</div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.voice-chip {
  position: fixed;
  right: 20px;
  bottom: 110px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  border-radius: 999px;
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  max-width: 360px;
  z-index: 50;
}
.voice-chip.listening {
  border-color: var(--primary);
  background: linear-gradient(to right, var(--primary-soft), var(--surface));
}
.voice-chip.err {
  border-color: var(--danger);
}

.voice-ico {
  font-size: 1.5rem;
}
.voice-chip.listening .voice-ico {
  animation: pulse 1.4s ease-in-out infinite;
}

.voice-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  font-size: 0.9rem;
}
.status {
  color: var(--text-muted);
  font-weight: 700;
}
.status.fail {
  color: var(--danger);
}
.said {
  color: var(--text);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
}
.matched {
  color: var(--primary-strong);
  font-weight: 700;
  font-size: 0.85rem;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.18);
    opacity: 0.7;
  }
}
</style>
