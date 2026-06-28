<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { checkoutCart, getCart, getLatestCart } from '@/api/cart';
import type { CartRes } from '@/api/dtApi';

const route = useRoute();
const router = useRouter();

// eventId 파라미터가 없거나 'latest'이면 항상 최신 카트를 폴링
const paramId = route.params.eventId as string | undefined;
const useLatest = !paramId || paramId === 'latest';
const activeEventId = ref<string | null>(useLatest ? null : paramId);

const cart = ref<CartRes | null>(null);
const error = ref<string | null>(null);
const paying = ref(false);
const orderNumber = ref<string | null>(null);

const fPrice = (n: number) => n.toLocaleString('ko-KR');

let pollTimer: number | null = null;

async function fetchCart() {
  try {
    const data = useLatest
      ? await getLatestCart()
      : await getCart(activeEventId.value!);

    if (data.status === 'PAID' && cart.value?.status !== 'PAID') {
      // 백엔드에서 이미 자동 결제 완료된 경우
      orderNumber.value = null; // 주문번호는 cart API에 없으므로 표시 생략
    }

    if (data.event_id) activeEventId.value = data.event_id;
    cart.value = data;

    if (data.status === 'PAID') stopPolling();
  } catch {
    error.value = '장바구니를 불러오지 못했습니다.';
  }
}

function startPolling() {
  fetchCart();
  pollTimer = window.setInterval(fetchCart, 2000);
}

function stopPolling() {
  if (pollTimer !== null) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

async function handleCheckout() {
  if (!cart.value?.items.length || paying.value || !activeEventId.value) return;
  paying.value = true;
  try {
    const res = await checkoutCart(activeEventId.value);
    orderNumber.value = res.orderNumber;
    cart.value = await getCart(activeEventId.value);
    stopPolling();
  } catch {
    error.value = '결제에 실패했습니다. 다시 시도해 주세요.';
  } finally {
    paying.value = false;
  }
}

onMounted(startPolling);
onBeforeUnmount(stopPolling);
</script>

<template>
  <div class="voice-cart">
    <!-- 결제 완료 화면 -->
    <template v-if="cart?.status === 'PAID' || orderNumber">
      <div class="complete-card">
        <div class="check">✓</div>
        <h1>결제 완료!</h1>
        <p class="sub">맛있게 준비해 드릴게요 ☕</p>
        <div class="order-no">
          <span>주문 번호</span>
          <strong>{{ orderNumber }}</strong>
        </div>
        <p class="hint">🚗 차량을 픽업 창구로 이동해 주세요</p>
        <button class="btn-home" @click="router.push('/')">처음 화면으로</button>
      </div>
    </template>

    <!-- 장바구니 화면 -->
    <template v-else>
      <h1 class="title">음성 주문 장바구니</h1>
      <p class="event-id">세션 ID: {{ eventId }}</p>

      <div v-if="error" class="error">{{ error }}</div>

      <div v-if="!cart || cart.items.length === 0" class="empty">
        <p>아직 담긴 메뉴가 없습니다.</p>
        <p class="hint">음성으로 메뉴를 말씀해 주세요.</p>
      </div>

      <ul v-else class="item-list">
        <li v-for="item in cart.items" :key="item.cartItemId" class="item-row">
          <span class="item-name">{{ item.menuName }}</span>
          <span class="item-qty">× {{ item.quantity }}</span>
          <span class="item-price">{{ fPrice(item.subtotal) }}원</span>
        </li>
      </ul>

      <div v-if="cart && cart.items.length > 0" class="total-row">
        <span>총 금액</span>
        <strong>{{ fPrice(cart.total) }}원</strong>
      </div>

      <div class="status-badge" :class="cart?.status?.toLowerCase()">
        {{ cart?.status ?? '...' }}
      </div>

      <button
        class="btn-checkout"
        :disabled="!cart?.items.length || paying"
        @click="handleCheckout"
      >
        {{ paying ? '결제 중...' : '결제하기' }}
      </button>
    </template>
  </div>
</template>

<style scoped>
.voice-cart {
  max-width: 600px;
  margin: 0 auto;
  padding: 32px 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 1.8rem;
  margin: 0 0 4px;
  text-align: center;
}

.event-id {
  font-size: 0.78rem;
  color: var(--text-muted);
  text-align: center;
  margin: 0 0 24px;
}

.error {
  background: #fdecea;
  color: var(--danger);
  padding: 12px 16px;
  border-radius: var(--radius);
  margin-bottom: 16px;
}

.empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-muted);
  font-size: 1.1rem;
}

.hint {
  font-size: 0.95rem;
  color: var(--text-muted);
  text-align: center;
}

.item-list {
  list-style: none;
  padding: 0;
  margin: 0 0 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item-row {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  gap: 12px;
}

.item-name {
  flex: 1;
  font-weight: 600;
}

.item-qty {
  color: var(--text-muted);
  font-size: 0.95rem;
  min-width: 40px;
  text-align: center;
}

.item-price {
  font-weight: 700;
  color: var(--primary-strong);
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  background: var(--surface-2);
  border-radius: var(--radius);
  margin-bottom: 16px;
  font-size: 1.1rem;
}

.total-row strong {
  font-size: 1.5rem;
  color: var(--primary-strong);
}

.status-badge {
  text-align: center;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 4px 12px;
  border-radius: 99px;
  display: inline-block;
  align-self: center;
  margin-bottom: 20px;
  background: #e8f5e9;
  color: #388e3c;
}

.status-badge.confirmed {
  background: #fff8e1;
  color: #f57f17;
}

.status-badge.paid {
  background: #e3f2fd;
  color: #1565c0;
}

.btn-checkout {
  margin-top: auto;
  padding: 18px;
  width: 100%;
  border-radius: 14px;
  background: var(--primary);
  color: #fff;
  font-size: 1.2rem;
  font-weight: 700;
  box-shadow: 0 8px 20px rgba(232, 132, 58, 0.4);
}

.btn-checkout:disabled {
  opacity: 0.45;
  box-shadow: none;
  cursor: not-allowed;
}

/* 결제 완료 카드 */
.complete-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 32px;
  background: var(--surface);
  border-radius: 28px;
  box-shadow: var(--shadow);
  text-align: center;
  margin: auto;
  width: 100%;
}

.check {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  font-size: 2.8rem;
  font-weight: 700;
  margin-bottom: 20px;
  box-shadow: 0 12px 28px rgba(232, 132, 58, 0.4);
  animation: pop 0.4s ease;
}

.complete-card h1 {
  margin: 0;
  font-size: 2rem;
}

.complete-card .sub {
  color: var(--text-muted);
  margin: 8px 0 24px;
}

.order-no {
  padding: 18px 32px;
  background: var(--surface-2);
  border-radius: var(--radius);
  margin-bottom: 20px;
  width: 100%;
}

.order-no span {
  display: block;
  font-size: 0.95rem;
  color: var(--text-muted);
}

.order-no strong {
  font-size: 2.2rem;
  color: var(--primary-strong);
  letter-spacing: 0.06em;
}

.btn-home {
  margin-top: 24px;
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text);
  font-size: 1.05rem;
  font-weight: 600;
}

@keyframes pop {
  0% { transform: scale(0.4); opacity: 0; }
  70% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}
</style>
