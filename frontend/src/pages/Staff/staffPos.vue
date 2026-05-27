<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { getWaitingOrders, type StaffOrder } from '@/api';
const orders = ref<StaffOrder[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

let poll: number;

const fetchOrders = async () => {
  try {
    orders.value = await getWaitingOrders();
  } catch (err: any) {
    error.value =
      err.response?.data?.message ?? '주문 목록을 불러오지 못했습니다.';
  }
};

onMounted(async () => {
  fetchOrders();
  poll = window.setInterval(fetchOrders, 5000);

  try {
    orders.value = await getWaitingOrders();
  } catch (err) {
    console.error(err);
    error.value = '주문 목록을 불러오는 중 오류가 발생했습니다.';
  } finally {
    loading.value = false;
  }
});

onBeforeUnmount(() => {
  clearInterval(poll);
});
</script>

<template>
  <div class="staff-page">
    <header class="staff-head">
      <div>
        <h1>대기 주문</h1>
        <p class="sub">5초마다 자동 갱신</p>
      </div>
      <div class="head-right">
        <span class="live"><span class="dot"></span>LIVE</span>
        <span class="count">{{ orders.length }}건</span>
      </div>
    </header>

    <div v-if="loading" class="state-msg">주문 목록 불러오는 중…</div>
    <div v-else-if="error" class="state-msg err">{{ error }}</div>
    <div v-else-if="orders.length === 0" class="state-msg empty">
      ☕ 현재 대기 중인 주문이 없습니다
    </div>

    <div v-else class="order-grid">
      <article v-for="order in orders" :key="order.orderNum" class="order-box">
        <div class="order-header">
          <span class="order-no">No. {{ order.orderNum }}</span>
          <span class="plate">{{ order.customerId }}</span>
        </div>
        <ul class="items">
          <li v-for="item in order.items" :key="item.id" class="item-row">
            <span class="i-name">{{ item.name }}</span>
            <span class="i-qty">{{ item.quantity }}개</span>
          </li>
        </ul>
      </article>
    </div>

    <button class="home-btn" @click="$router.push('/')">처음 화면으로</button>
  </div>
</template>

<style scoped>
.staff-page {
  max-width: 1080px;
  margin: 0 auto;
  padding: 24px 20px 90px;
}

.staff-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.staff-head h1 {
  margin: 0;
  font-size: 2rem;
}
.sub {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 0.95rem;
}
.head-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.live {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 14px;
  border-radius: 999px;
  background: var(--surface);
  border: 1px solid var(--border);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-muted);
}
.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #3fbf6f;
  animation: blink 1.4s ease-in-out infinite;
}
.count {
  padding: 7px 16px;
  border-radius: 999px;
  background: var(--primary);
  color: #fff;
  font-weight: 700;
}

.order-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 18px;
}

.order-box {
  padding: 20px;
  border-radius: var(--radius);
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}
.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}
.order-no {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--primary-strong);
}
.plate {
  padding: 4px 12px;
  border-radius: 8px;
  background: var(--surface-2);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-muted);
}
.items {
  list-style: none;
  margin: 0;
  padding: 0;
}
.item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  font-size: 1.1rem;
}
.item-row + .item-row {
  border-top: 1px dashed var(--border);
}
.i-name {
  font-weight: 600;
}
.i-qty {
  color: var(--primary-strong);
  font-weight: 700;
}

.state-msg {
  margin: 80px 0;
  text-align: center;
  font-size: 1.2rem;
  color: var(--text-muted);
}
.state-msg.err {
  color: var(--danger);
}

.home-btn {
  position: fixed;
  left: 50%;
  bottom: 20px;
  transform: translateX(-50%);
  padding: 14px 32px;
  border-radius: 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text);
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
