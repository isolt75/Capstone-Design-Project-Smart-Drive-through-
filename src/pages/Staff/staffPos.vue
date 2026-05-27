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
    <h1>직원 화면</h1>

    <div v-if="loading" class="state-msg">주문 목록 불러오는 중...</div>

    <div v-else-if="error" class="state-msg err">
      {{ error }}
    </div>

    <div v-else-if="orders.length === 0" class="state-msg">
      현재 대기 주문이 없습니다.
    </div>

    <div v-else v-for="order in orders" :key="order.orderNum" class="order-box">
      <div class="order-header">
        <h2>주문번호 {{ order.orderNum }}</h2>
        <p>{{ order.customerId }}</p>
      </div>

      <div v-for="item in order.items" :key="item.id" class="item-row">
        <span>{{ item.name }}</span>
        <span>{{ item.quantity }}개</span>
      </div>
    </div>

    <button class="home-btn" @click="$router.push('/')">
      처음 화면으로 돌아가기
    </button>
  </div>
</template>

<style scoped>
.staff-page {
  max-width: 900px;
  padding: 20px;
}

.staff-page h1 {
  margin-bottom: 24px;
  font-size: 2rem;
}

.order-box {
  margin-bottom: 20px;
  padding: 20px;
  border-radius: 16px;
  background: #f4f4f4;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ddd;
}

.order-header h2 {
  margin: 0;
  font-size: 1.4rem;
}

.order-header p {
  margin: 0;
  font-size: 1.1rem;
  color: #555;
}

.item-row {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  padding: 10px 0;
  font-size: 1.1rem;
}

.state-msg {
  margin: 60px 0;
  font-size: 1.2rem;
}

.err {
  color: #d63031;
}

.home-btn {
  display: block;
  padding: 0;
  border: none;
  border-radius: 12px;
  background: var(--bg-littlelight);
  font-size: 1.1rem;
  font-weight: 600;
}
</style>
