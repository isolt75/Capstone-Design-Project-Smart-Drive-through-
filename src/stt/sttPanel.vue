<script setup lang="ts">
import { ref } from 'vue';

const sttText = ref('');
</script>

<template>
  <section class="stt-panel">
    <h2>음성 주문</h2>
    <textarea v-model="sttText" placeholder="예: 아메리카노 두 잔 주세요" />
    <button class="stt-btn">🎤 음성 입력</button>
  </section>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.stt-panel {
  margin: 20px 0;
  padding: 20px;

  border-radius: 16px;
  background: #f5f5f5;
}

.stt-panel h2 {
  margin-bottom: 15px;
  font-size: 1.5rem;
}

textarea {
  width: 100%;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 12px;
  resize: none;

  font-family: 'Pretendard', sans-serif;
  font-size: 1.1rem;
  line-height: 1.5;
}

.stt-btn {
  width: 100%;
  margin-top: 15px;
  padding: 15px;
  border: none;
  border-radius: 12px;

  font-size: 1.1rem;
  font-weight: bold;

  background: var(--primary-color);
  color: white;
}
</style>
