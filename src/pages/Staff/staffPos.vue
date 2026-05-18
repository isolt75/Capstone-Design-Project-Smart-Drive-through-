<script setup lang="ts">
import { useOrderStore } from '@/stores/store';

const store = useOrderStore();
</script>

<template>
  <div class="staff-page">
    <h1>직원 화면</h1>
    <div v-if="store.completedOrders.length === 0" class="empty">
      현재 완료된 주문이 없습니다.
    </div>
    <div
      v-for="order in store.completedOrders"
      :key="order.orderNum"
      class="order-box"
    >
      <h2>주문번호: {{ order.orderNum }}</h2>
      <p>차량번호: {{ order.customerId }}</p>
      <div v-for="item in order.items" :key="item.id" class="item-row">
        <span>{{ item.name }}</span>
        <span>{{ item.quantity }}개</span>
      </div>
    </div>
    <button @click="$router.push('/')">처음 화면으로 돌아가기</button>
  </div>
</template>

<style scoped>
.staff-page {
  padding: 20px;
}

.order-box {
  margin-bottom: 20px;
  padding: 20px;

  border-radius: 12px;
  background: #f4f4f4;
}

.item-row {
  display: flex;
  justify-content: space-between;

  margin-top: 10px;
}

.empty {
  margin-top: 30px;

  text-align: center;
}
</style>
