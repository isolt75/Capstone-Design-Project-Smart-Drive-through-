<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useOrderStore } from '@/stores/store';

const store = useOrderStore();
const router = useRouter();
const remaining = ref(5);

onMounted(() => {
  if (!store.orderItems || store.orderItems.length === 0) {
    router.replace('/');
    return;
  }

  store.orderComplete();

  //카운트다운 출력
  const endTime = Date.now() + 5000;
  const interval = setInterval(() => {
    const sec = Math.ceil((endTime - Date.now()) / 1000);
    if (sec <= 0) {
      clearInterval(interval);
      remaining.value = 0;
      return;
    }

    remaining.value = sec;
  }, 1000);

  setTimeout(() => {
    router.push('/');
  }, 5000);
});
</script>

<template>
  <div class="order-complete">
    <h1>주문 완료!</h1>
    <h3>고객님의 주문 번호: {{ store.seq }}</h3>

    <div class="count-down">
      <p>차량 이동 →</p>
      <p v-if="remaining > 0">{{ remaining }}초 후 초기 화면으로 이동합니다</p>
      <p v-else></p>
    </div>
    <button @click="$router.push('/')">처음 화면으로 돌아가기</button>
  </div>
</template>

<style scoped>
button {
  display: block;

  margin: auto;
  padding: 20px;

  border-radius: 15px;
  background: var(--bg-littlelight);

  font-size: 1.3rem;
}

.order-complete {
  padding: 100px 20px;
  color: var(--text-primary);
  text-align: center;
}

.order-complete h1 {
  font-size: 3rem;
}

.order-complete h3 {
  margin-top: 50px;
  font-size: 2rem;
}

.count-down {
  margin: 100px 20px;
  padding: 20px;

  border-radius: 15px;
  background: var(--bg-littlelight);

  font-size: 1.5rem;
  text-align: center;
}
</style>
