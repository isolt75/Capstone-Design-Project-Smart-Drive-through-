<script setup lang="ts">
import { useOrderStore } from '@/stores/store';
import { storeToRefs } from 'pinia';

const store = useOrderStore();
const { orderCart } = storeToRefs(store);

const fPrice = (p: number) => p.toLocaleString('ko-KR');
const decrease = (id: number) => store.decreaseItem(id);
const increase = (id: number) => store.increaseItem(id);
const remove = (id: number) => store.removeItem(id);
</script>

<template>
  <div class="order-list">
    <div v-if="orderCart.length === 0" class="cart-empty">
      🛒 담긴 메뉴가 없습니다
    </div>

    <ul v-else class="cart-rows">
      <li v-for="item in orderCart" :key="item.id" class="cart-row">
        <span class="c-name">{{ item.name }}</span>
        <div class="qty-control">
          <button class="qty-btn" @click="decrease(item.id)">&minus;</button>
          <span class="qty-num">{{ item.quantity }}</span>
          <button class="qty-btn" @click="increase(item.id)">+</button>
        </div>
        <span class="c-total">{{ fPrice(item.itemTotal) }}원</span>
        <button class="del" @click="remove(item.id)" aria-label="삭제">
          &times;
        </button>
      </li>
    </ul>
  </div>
</template>

<style>
.order-list {
  border-radius: var(--radius-sm);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.cart-empty {
  padding: 28px 16px;
  text-align: center;
  color: var(--text-muted);
  font-size: 1.05rem;
}

.cart-rows {
  list-style: none;
  margin: 0;
  padding: 6px 8px;
}

.cart-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 8px;
  border-bottom: 1px solid var(--border);
}
.cart-row:last-child {
  border-bottom: none;
}

.c-name {
  flex: 1;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text);
}

.qty-control {
  display: flex;
  align-items: center;
  gap: 14px;
}
.qty-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: var(--primary-soft);
  color: var(--primary-strong);
  font-size: 1.3rem;
  line-height: 1;
}
.qty-num {
  min-width: 22px;
  text-align: center;
  font-size: 1.1rem;
  font-weight: 700;
}

.c-total {
  min-width: 84px;
  text-align: right;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text);
}

.del {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #fbe7e3;
  color: var(--danger);
  font-size: 1.2rem;
  line-height: 1;
}
</style>
