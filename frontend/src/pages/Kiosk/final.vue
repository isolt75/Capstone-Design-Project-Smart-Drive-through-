<script setup lang="ts">
import axios from 'axios';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useOrderStore } from '@/stores/store';
import { createOrder, getPayStatus, payOrder } from '@/api/order';

const store = useOrderStore();
const router = useRouter();
const remaining = ref(5);
const error = ref<string | null>(null);
const payStatus = ref<'PENDING' | 'PAID' | null>(null);
const totalPrice = ref(0);

// 등록 카드 자동 결제(하이패스 방식)를 흉내내는 지연 — "결제 중" 스피너를 잠깐 보여준다.
const AUTO_PAY_DELAY_MS = 2000;

let pollTimer: number | null = null;
let autoPayTimer: number | null = null;
let countdownInterval: number | null = null;
let redirectTimeout: number | null = null;

const markPaid = () => {
  if (payStatus.value === 'PAID') return;
  payStatus.value = 'PAID';
  if (pollTimer) clearInterval(pollTimer);
  startCountdown();
};

const startCountdown = () => {
  const endTime = Date.now() + 5000;
  countdownInterval = window.setInterval(() => {
    const sec = Math.ceil((endTime - Date.now()) / 1000);
    remaining.value = sec <= 0 ? 0 : sec;
    if (sec <= 0 && countdownInterval) clearInterval(countdownInterval);
  }, 1000);
  redirectTimeout = window.setTimeout(() => router.push('/'), 5000);
};

// 등록 카드로 자동 결제. 백엔드 /pay 를 직접 호출한다(직원 버튼과 동일, 멱등).
const autoPay = (orderNo: string) => {
  autoPayTimer = window.setTimeout(async () => {
    autoPayTimer = null;
    try {
      await payOrder(orderNo);
      markPaid();
    } catch {
      /* 자동 결제 실패 시 폴링(직원 수동 결제)이 백업으로 동작 */
    }
  }, AUTO_PAY_DELAY_MS);
};

// 백업 경로: 백엔드나 직원이 먼저 PAID 로 바꾼 경우도 반영.
const startPolling = (orderNo: string) => {
  pollTimer = window.setInterval(async () => {
    try {
      const res = await getPayStatus(orderNo);
      if (res.payStatus === 'PAID') markPaid();
    } catch {
      /* 폴링 실패는 무시하고 계속 시도 */
    }
  }, 2000);
};

onMounted(async () => {
  if (!store.orderItems || store.orderItems.length === 0) {
    router.replace('/');
    return;
  }
  if (!store.customerId) store.customerId = `손님-${String(Date.now()).slice(-8)}`;

  totalPrice.value = store.totalPrice;

  try {
    const items = store.orderItems.map((item) => ({
      menuId: item.id,
      quantity: item.quantity,
    }));

    const data = await createOrder({
      plate: store.customerId,
      customerName: store.customerName ?? store.customerId!,
      items,
    });

    store.orderNum = data.orderNumber;
    if (data.success) {
      store.saveCompletedOrder();
      store.clearCart();
      payStatus.value = 'PENDING';
      autoPay(data.orderNumber);   // 등록 카드 자동 결제
      startPolling(data.orderNumber);  // 백업(직원 수동 결제 등)
    } else {
      error.value = '주문 처리에 실패했습니다.';
    }
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      error.value = err.response?.data?.message ?? '주문에 실패했습니다.';
    } else {
      error.value = '서버 연결에 실패했습니다.';
    }
  }
});

onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer);
  if (autoPayTimer) clearTimeout(autoPayTimer);
  if (countdownInterval) clearInterval(countdownInterval);
  if (redirectTimeout) clearTimeout(redirectTimeout);
});
</script>

<template>
  <div class="order-complete">
    <div class="complete-card">
      <template v-if="!error">

        <!-- 결제 대기 -->
        <template v-if="payStatus === 'PENDING'">
          <div class="spinner"></div>
          <h1>결제 대기 중</h1>
          <p class="thanks">직원이 결제를 처리하고 있습니다 ☕</p>
          <div class="order-no">
            <span>주문 번호</span>
            <strong>{{ store.orderNum }}</strong>
          </div>
          <div class="price-box">
            <span>결제 금액</span>
            <strong>{{ totalPrice.toLocaleString('ko-KR') }}원</strong>
          </div>
        </template>

        <!-- 결제 완료 -->
        <template v-else-if="payStatus === 'PAID'">
          <div class="check">✓</div>
          <h1>결제 완료!</h1>
          <p class="thanks">맛있게 준비해 드릴게요 ☕</p>
          <div class="order-no">
            <span>주문 번호</span>
            <strong>{{ store.orderNum }}</strong>
          </div>
          <div class="price-box paid">
            <span>결제 금액</span>
            <strong>{{ totalPrice.toLocaleString('ko-KR') }}원</strong>
          </div>
          <div class="count-down">
            <p class="cd-title">🚗 차량을 픽업 창구로 이동해 주세요</p>
            <p v-if="remaining > 0" class="cd-sec">{{ remaining }}초 후 처음 화면으로 돌아갑니다</p>
          </div>
        </template>

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

.spinner {
  width: 80px;
  height: 80px;
  margin: 0 auto 22px;
  border: 8px solid var(--surface-2);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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
  margin: 28px 0 12px;
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

.price-box {
  margin: 0 0 20px;
  padding: 16px 20px;
  border-radius: var(--radius);
  background: var(--surface-2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.price-box span {
  font-size: 1rem;
  color: var(--text-muted);
}
.price-box strong {
  font-size: 1.6rem;
  font-weight: 900;
  color: var(--text-muted);
}
.price-box.paid strong {
  color: var(--primary-strong);
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
  0% { transform: scale(0.4); opacity: 0; }
  70% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}
</style>
