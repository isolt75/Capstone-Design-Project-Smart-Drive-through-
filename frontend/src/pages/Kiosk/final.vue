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
    } else {
      error.value = '주문 처리에 실패했습니다.';
      return;
    }
  } catch (err: unknown) {
    console.error(err);

    if (axios.isAxiosError(err)) {
      error.value = err.response?.data?.message ?? '주문에 실패했습니다.';
    } else {
      error.value = '서버 연결에 실패했습니다.';
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
    <div class="complete-card">
      <template v-if="!error">
        <div class="check">✓</div>
        <h1>주문 완료!</h1>
        <p class="thanks">맛있게 준비해 드릴게요 ☕</p>

        <div class="order-no">
          <span>주문 번호</span>
          <strong>{{ store.orderNum }}</strong>
        </div>

        <div class="count-down">
          <p class="cd-title">🚗 차량을 픽업 창구로 이동해 주세요</p>
          <p v-if="remaining > 0" class="cd-sec">
            {{ remaining }}초 후 처음 화면으로 돌아갑니다
          </p>
        </div>
      </template>

      <template v-else>
        <div class="check err-mark">!</div>
        <h1 class="err">{{ error }}</h1>
      </template>

      <button class="home" @click="$router.push('/')">처음 화면으로</button>
    </div>
  </div>
</template>

<style scoped>
.order-complete {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  background: radial-gradient(120% 120% at 50% 0%, #fff6ea 0%, var(--bg) 55%);
}

.complete-card {
  width: 100%;
  max-width: 520px;
  padding: 48px 32px;
  border-radius: var(--radius-lg);
  background: var(--surface);
  box-shadow: var(--shadow);
  text-align: center;
}

.check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 92px;
  height: 92px;
  margin: 0 auto 22px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  font-size: 3rem;
  font-weight: 700;
  box-shadow: var(--shadow-primary-lg);
  animation: pop 0.4s ease;
}
.err-mark {
  background: var(--danger);
  box-shadow: var(--shadow-danger-lg);
}

.complete-card h1 {
  margin: 0;
  font-size: 2.2rem;
}
.thanks {
  margin: 10px 0 0;
  color: var(--text-muted);
  font-size: 1.15rem;
}

.order-no {
  margin: 28px 0;
  padding: 20px;
  border-radius: var(--radius);
  background: var(--surface-2);
}
.order-no span {
  display: block;
  font-size: 1rem;
  color: var(--text-muted);
}
.order-no strong {
  font-size: 2.4rem;
  color: var(--primary-strong);
  letter-spacing: 0.05em;
}

.count-down {
  margin-bottom: 28px;
}
.cd-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
}
.cd-sec {
  margin: 8px 0 0;
  color: var(--text-muted);
}

.home {
  width: 100%;
  padding: 16px;
  border-radius: var(--radius-btn);
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text);
  font-size: 1.1rem;
  font-weight: 600;
}

.err {
  color: var(--danger);
}

@keyframes pop {
  0% {
    transform: scale(0.4);
    opacity: 0;
  }
  70% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
