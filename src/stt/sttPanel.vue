<script setup lang="ts">
import { ref } from 'vue';
import { useOrderStore } from '@/stores/store';
import { requestSTT } from '@/api';

const store = useOrderStore();

const sttText = ref('');
const recording = ref(false);

let mediaRecorder: MediaRecorder;
let audioChunks: Blob[] = [];

const startSTT = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

      try {
        const res = await requestSTT(audioBlob);

        sttText.value = res.text;
        store.setVoiceText(res.text);
        store.parseVoiceOrder(res.text);
      } catch (err) {
        console.error('STT 실패', err);
        sttText.value = '음성 인식 실패';
      }
    };

    mediaRecorder.start();
    recording.value = true;

    setTimeout(() => {
      mediaRecorder.stop();
      recording.value = false;
    }, 15000);
  } catch (err) {
    console.error(err);
    sttText.value = '마이크 접근 실패';
  }
};
</script>

<template>
  <section class="stt-panel">
    <h2>음성 주문</h2>
    <textarea
      v-model="sttText"
      placeholder="예: 아메리카노 두 잔 주세요"
      readonly
    ></textarea>
    <button class="stt-btn" @click="startSTT">
      {{ recording ? '녹음 중...' : '🎤 음성 입력' }}
    </button>
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
