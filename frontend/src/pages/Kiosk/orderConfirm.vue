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
    <p class="sub">주문하실 메뉴가 맞는지 확인해 주세요</p>

    <orderCart />

    <div class="total">
      <span>총 주문 금액</span>
      <strong>{{ fPrice(totalPrice) }}원</strong>
    </div>

    <div class="btn-group">
      <button class="btn-ghost" @click="router.push('/recmd')">＋ 메뉴 추가</button>
      <button class="btn-primary" @click="router.push('/final')">
        주문 완료 ▸
      </button>
    </div>
  </div>
</template>

<style scoped>
.confirm-menu {
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 28px 20px;
}

.confirm-menu h1 {
  margin: 0;
  font-size: 2rem;
  text-align: center;
}
.sub {
  margin: 8px 0 24px;
  text-align: center;
  color: var(--text-muted);
  font-size: 1.05rem;
}

.total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 18px 0;
  padding: 22px 24px;
  border-radius: var(--radius);
  background: var(--surface-2);
  font-size: 1.15rem;
  color: var(--text-muted);
}
.total strong {
  font-size: 1.6rem;
  color: var(--primary-strong);
}

.btn-group {
  display: flex;
  margin-top: auto;
  gap: 12px;
}
.btn-group button {
  flex: 1;
  padding: 18px;
  border-radius: var(--radius-btn);
  font-size: 1.2rem;
  font-weight: 700;
}
.btn-ghost {
  flex: 0 0 40%;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text);
}
.btn-primary {
  background: var(--primary);
  color: #fff;
  box-shadow: var(--shadow-primary);
}
</style>
