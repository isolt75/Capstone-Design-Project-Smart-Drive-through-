<script setup lang="ts">
// 라즈베리파이 모니터용 직원 화면 (/staff).
// 대기 주문을 큰 카드로 보여주고, 음료를 만든 뒤 '완료' 버튼으로 대기열에서 제거한다.
// 완료 처리는 백엔드 POST /orders/{orderNo}/done 을 호출한다.
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { getWaitingOrders, completeOrder, type StaffOrder } from '@/api';
import { wsURL } from '@/api/http';

const orders = ref<StaffOrder[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const completing = ref<Set<string>>(new Set()); // 중복 클릭 방지
const now = ref(new Date());

let poll: number; // WS 끊김 대비 안전망 폴링
let clock: number;
let ws: WebSocket | null = null;
let reconnect: number | undefined;
let unmounted = false;

const fetchOrders = async () => {
  try {
    orders.value = await getWaitingOrders();
    error.value = null;
  } catch (err: any) {
    error.value =
      err?.response?.data?.message ?? '주문 목록을 불러오지 못했습니다.';
  }
};

// 실시간 갱신: 서버가 주문 생성/완료 때마다 갱신된 대기열을 push.
const connectWs = () => {
  if (unmounted) return;
  ws = new WebSocket(wsURL('/ws/staff'));
  ws.onmessage = (e) => {
    try {
      const msg = JSON.parse(e.data);
      if (msg.type === 'waiting' && Array.isArray(msg.orders)) {
        orders.value = msg.orders;
        error.value = null;
      }
    } catch {
      /* 형식 오류 메시지는 무시 */
    }
  };
  ws.onclose = () => {
    ws = null;
    if (!unmounted) reconnect = window.setTimeout(connectWs, 3000); // 끊기면 재연결
  };
  ws.onerror = () => ws?.close();
};

const onComplete = async (orderNo: string) => {
  if (completing.value.has(orderNo)) return;
  completing.value.add(orderNo);
  try {
    await completeOrder(orderNo);
    // 낙관적 제거 — 즉시 화면에서 뺀다. 서버도 곧 WebSocket 으로 갱신된
    // 대기열을 보내 다른 직원 화면과 동기화된다.
    orders.value = orders.value.filter((o) => o.orderNum !== orderNo);
  } catch (err: any) {
    error.value =
      err?.response?.data?.message ?? '완료 처리에 실패했습니다. 다시 시도하세요.';
    await fetchOrders(); // 실패 시 서버 상태로 되돌림
  } finally {
    completing.value.delete(orderNo);
  }
};

const fClock = (d: Date) =>
  d.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

onMounted(async () => {
  await fetchOrders(); // 첫 화면 즉시 표시
  loading.value = false;
  connectWs(); // 실시간 push
  poll = window.setInterval(fetchOrders, 15000); // WS 끊김 대비 안전망
  clock = window.setInterval(() => (now.value = new Date()), 1000);
});

onBeforeUnmount(() => {
  unmounted = true;
  clearInterval(poll);
  clearInterval(clock);
  if (reconnect) clearTimeout(reconnect);
  ws?.close();
});
</script>

<template>
  <div class="staff-display">
    <header class="bar">
      <div class="bar-left">
        <h1>주문 대기 현황</h1>
        <span class="clock">{{ fClock(now) }}</span>
      </div>
      <div class="bar-right">
        <span class="live"><span class="dot"></span>LIVE</span>
        <span class="count">대기 {{ orders.length }}건</span>
      </div>
    </header>

    <p v-if="error" class="banner err">{{ error }}</p>

    <div v-if="loading" class="state">주문 목록 불러오는 중…</div>
    <div v-else-if="orders.length === 0" class="state empty">
      ☕ 현재 대기 중인 주문이 없습니다
    </div>

    <div v-else class="grid">
      <article v-for="order in orders" :key="order.orderNum" class="card">
        <div class="card-head">
          <span class="no">No. {{ order.orderNum }}</span>
          <span class="plate">{{ order.customerId }}</span>
        </div>
        <ul class="items">
          <li v-for="item in order.items" :key="item.id" class="row">
            <span class="name">{{ item.name }}</span>
            <span class="qty">{{ item.quantity }}개</span>
          </li>
        </ul>
        <button
          class="done-btn"
          :disabled="completing.has(order.orderNum)"
          @click="onComplete(order.orderNum)"
        >
          {{ completing.has(order.orderNum) ? '처리 중…' : '✓ 완료' }}
        </button>
      </article>
    </div>
  </div>
</template>

<style scoped>
/* 모니터 전체화면 기준 — 멀리서도 보이게 큰 글자/큰 버튼 */
.staff-display {
  min-height: 100vh;
  padding: 24px 28px 40px;
  background: var(--bg);
}

.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--border);
}
.bar-left {
  display: flex;
  align-items: baseline;
  gap: 18px;
}
.bar-left h1 {
  margin: 0;
  font-size: 2.4rem;
  font-weight: 800;
}
.clock {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}
.bar-right {
  display: flex;
  align-items: center;
  gap: 14px;
}
.live {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  border-radius: 999px;
  background: var(--surface);
  border: 1px solid var(--border);
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-muted);
}
.dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--success);
  animation: blink 1.4s ease-in-out infinite;
}
.count {
  padding: 9px 20px;
  border-radius: 999px;
  background: var(--primary);
  color: #fff;
  font-size: 1.2rem;
  font-weight: 800;
}

.banner {
  margin: 0 0 16px;
  padding: 12px 18px;
  border-radius: var(--radius);
  font-size: 1.05rem;
  font-weight: 600;
}
.banner.err {
  background: color-mix(in srgb, var(--danger) 12%, var(--surface));
  color: var(--danger);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 22px;
}

.card {
  display: flex;
  flex-direction: column;
  padding: 22px 22px 18px;
  border-radius: var(--radius);
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border);
}
.no {
  font-size: 1.7rem;
  font-weight: 900;
  color: var(--primary-strong);
}
.plate {
  padding: 6px 14px;
  border-radius: var(--radius-xs);
  background: var(--surface-2);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-muted);
}
.items {
  list-style: none;
  margin: 0 0 18px;
  padding: 0;
  flex: 1;
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  font-size: 1.45rem;
}
.row + .row {
  border-top: 1px dashed var(--border);
}
.name {
  font-weight: 600;
}
.qty {
  color: var(--primary-strong);
  font-weight: 800;
}

.done-btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: var(--radius-btn);
  background: var(--success, #2e9e5b);
  color: #fff;
  font-size: 1.35rem;
  font-weight: 800;
  cursor: pointer;
}
.done-btn:disabled {
  opacity: 0.55;
  cursor: default;
}

.state {
  margin: 120px 0;
  text-align: center;
  font-size: 1.7rem;
  color: var(--text-muted);
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}
</style>
