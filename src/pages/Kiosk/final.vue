<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useOrderStore } from '@/stores/store';
import { createOrder } from '@/api';

const store = useOrderStore();
const router = useRouter();
const remaining = ref(5);
const error = ref<string | null>(null);

onMounted(async () => {
  if (!store.orderItems || store.orderItems.length === 0) {
    router.replace('/');
    return;
  }

  if (!store.customerId) {
    error.value = '차량 정보가 없습니다.';
    return;
  }
  const success = store.orderComplete();

  if (!success) {
    error.value = '주문번호 생성 실패';
    return;
  }

  // 백엔드로 보낼 주문 항목 (id+수량으로 집계)
  const counts = new Map<number, number>();
  store.orderItems.forEach((i) => {
    counts.set(i.id, (counts.get(i.id) ?? 0) + 1);
  });
  const items = Array.from(counts, ([menuId, quantity]) => ({
    menuId,
    quantity,
  }));

  try {
    const data = await createOrder({
      orderNum: store.orderNum!,
      plate: store.customerId,
      customerName: store.customerName ?? store.customerId!, // 번호판 = 이름 정책
      items: [
        {
          menuId: 1,
          quantity: 2,
          success: undefined,
        },
      ],
    });
    if (data.success) {
      alert('주문 성공');
    }
  } catch (err: any) {
    console.error(err);
    if (err.response) {
      alert(err.response.data.message ?? '주문 실패');
    } else {
      alert('서버 연결 실패');
    }
    // catch (err) {
    //   console.error('주문 실패', err);
    error.value = '주문 처리 중 오류가 발생했습니다.';
    return;
  }

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
    <h1 v-if="!error">주문 완료!</h1>
    <h1 v-else class="err">{{ error }}</h1>

    <h3 v-if="!error">고객님의 주문 번호: {{ store.seq }}</h3>

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
