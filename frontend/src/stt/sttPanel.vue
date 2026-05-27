<script setup lang="ts">
import { ref } from 'vue';

const sttText = ref('');
</script>

<template>
  <section class="stt-panel">
    <div class="stt-head">
      <span class="stt-ico">🎤</span>
      <h2>음성으로 주문하기</h2>
    </div>
    <textarea v-model="sttText" placeholder="예: 아메리카노 두 잔 주세요" />
    <button class="stt-btn">음성 입력 시작</button>
  </section>
</template>

<style scoped>
.stt-panel {
  padding: 20px;
  border-radius: var(--radius);
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}

.stt-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
.stt-ico {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--primary-soft);
  font-size: 1.1rem;
}
.stt-head h2 {
  margin: 0;
  font-size: 1.3rem;
}

textarea {
  width: 100%;
  min-height: 70px;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  resize: none;
  background: var(--bg);
  color: var(--text);
  font-family: inherit;
  font-size: 1.1rem;
  line-height: 1.5;
}
textarea:focus {
  outline: none;
  border-color: var(--primary);
}

.stt-btn {
  width: 100%;
  margin-top: 14px;
  padding: 15px;
  border-radius: var(--radius-sm);
  background: var(--primary);
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
  box-shadow: 0 6px 16px rgba(232, 132, 58, 0.32);
}
</style>
