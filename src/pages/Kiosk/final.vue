<script setup lang="ts">
import axios from 'axios';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useOrderStore } from '@/stores/store';
import { createOrder } from '@/api/order';

const store = useOrderStore();
const router = useRouter();
const remaining = ref(5);
const error = ref<string | null>(null);

let interval: number | null = null;
let timeout: number | null = null;

onMounted(async () => {
  if (!store.orderItems || store.orderItems.length === 0) {
    router.replace('/');
    return;
  }

  if (!store.customerId) {
    error.value = '차량 정보가 없습니다.';
    return;
  }

  try {
    const items = store.orderItems.map((item) => ({
      menuId: item.id,
      quantity: item.quantity,
    }));

    const data = await createOrder({
      plate: store.customerId,
      customerName: store.customerName ?? store.customerId!, // 번호판 = 이름
      items,
    });

    store.orderNum = data.orderNumber;
    if (data.success) {
      store.saveCompletedOrder();
      console.log('completedOrders:', store.completedOrders);
      alert('주문 성공'); // 배포 이전 삭제
    } else {
      error.value = '주문 처리에 실패했습니다.';
      return;
    }
  } catch (err: unknown) {
    console.error(err);

    if (axios.isAxiosError(err)) {
      alert(err.response?.data.message ?? '주문 실패');
    } else {
      alert('서버 연결 실패');
    }
    return;
  }

  //카운트다운 출력
  const endTime = Date.now() + 5000;
  interval = window.setInterval(() => {
    const sec = Math.ceil((endTime - Date.now()) / 1000);
    if (sec <= 0) {
      if (interval) clearInterval(interval);
      remaining.value = 0;
      return;
    }
    remaining.value = sec;
  }, 1000);

  timeout = window.setTimeout(() => {
    // store.clear();
    router.push('/');
  }, 5000);
});

onBeforeUnmount(() => {
  if (interval) clearInterval(interval);
  if (timeout) clearTimeout(timeout);
});
</script>

<template>
  <div class="order-complete">
    <h1 v-if="!error">주문 완료!</h1>
    <h1 v-else class="err">{{ error }}</h1>
    <h3 v-if="!error">고객님의 주문 번호: {{ store.orderNum }}</h3>
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
