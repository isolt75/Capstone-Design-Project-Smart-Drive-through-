<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useOrderStore } from '@/stores/store';
import orderCart from '@/components/orderCart.vue';
import { storeToRefs } from 'pinia';

const store = useOrderStore();
const { totalPrice } = storeToRefs(store);
const router = useRouter();
const fPrice = (price: number) => price.toLocaleString('ko-KR');

onMounted(() => {
  if (store.orderItems.length === 0) router.replace('/');
});
</script>

<template>
  <div class="confirm-menu">
    <h1>주문 확인</h1>
    <orderCart />
    <div class="total">
      <h3>총 주문 금액: {{ fPrice(totalPrice) }}원</h3>
    </div>

    <div class="btn-group">
      <button class="recmd" @click="router.push('/recmd')">주문 화면</button>
      <button class="final" @click="router.push('/final')">주문 완료</button>
    </div>
  </div>
</template>

<style>
.confirm-menu {
  display: flex;
  flex-direction: column;
  min-height: 90vh;
  padding: 20px;
}

.confirm-menu h1 {
  margin-bottom: 30px;
  color: var(--text-primary);
  font-size: 2rem;
  text-align: center;
}

.total {
  margin: 20px 0;
  padding: 20px;
  border-radius: 12px;

  background: #363636;
  color: var(--bg-base);
  text-align: right;
}

.total h3 {
  margin: 0;
  font-size: 1.4rem;
}

.btn-group {
  display: flex;
  margin-top: auto;
  gap: 15px;
}

.btn-group button {
  flex: 1;
  padding: 20px;
  border: none;
  border-radius: 12px;

  font-size: 1.3rem;
  font-weight: bold;
}

.recmd {
  background: #dcdde1;
}

.final {
  background: var(--primary-color);
  color: var(--bg-base);
}
</style>
