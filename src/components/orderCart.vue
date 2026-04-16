<script setup lang="ts">
import { useOrderStore } from '@/stores/store';
import { storeToRefs } from 'pinia';

const store = useOrderStore();
const { orderCart } = storeToRefs(store);

const fPrice = (p: number) => p.toLocaleString('ko-KR');
</script>

<template>
  <div class="order-list">
    <table class="order-table">
      <thead>
        <tr>
          <th>메뉴명</th>
          <th>수량(개)</th>
          <th>금액(원)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in orderCart" :key="item.id" class="qty">
          <td class="item-name">{{ item.name }}</td>
          <td class="item-count">
            <div class="qty-control">
              <button @click="store.decreaseItem(item.id)">&minus;</button>
              <span>{{ item.count }}</span>
              <button @click="store.increaseItem(item.id)">+</button>
            </div>
          </td>
          <td class="item-total">
            {{ fPrice(item.itemTotal) }}
            <button class="del" @click="store.removeItem(item.id)">
              &times;
            </button>
          </td>
        </tr>
        <tr v-if="orderCart.length === 0">
          <td colspan="3" class="empty">담긴 메뉴가 없습니다.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style>
.order-list {
  margin-bottom: 10px;
  padding: 5px 10px;

  border-radius: 12px;
  background: var(--bg-base);
  box-shadow: 0 4px 15px var(--bg-shadow);

  font-size: 1.2rem;
}

.order-table {
  width: 100%;
  margin-top: 10px;

  border-collapse: collapse;
  border-radius: 10px;
  overflow: hidden;
}

.order-table th {
  width: 33.3%;
  padding: 10px;
  background: #323640;
  color: var(--bg-base);
}

.order-table td {
  padding: 15px 10px;
  border-bottom: 1px solid var(--bg-list);
  text-align: center;
}

.qty button {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 25px;
  height: 25px;
  border-radius: 5px;

  font-size: 1.4rem;
  line-height: 1;
}

.qty-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.qty-control button {
  background: var(--bg-list);
}

.item-total {
  position: relative;
}

.del {
  position: absolute;
  top: 50%;
  right: 10px;

  background: #ff7575;
  color: var(--bg-base);
  transform: translateY(-50%);
}

.empty {
  height: 30px;
  vertical-align: middle;
}
</style>
