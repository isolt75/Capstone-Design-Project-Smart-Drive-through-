<script setup lang="ts">
import { useOrderStore, type menuItem } from '@/stores/store';

const store = useOrderStore();
</script>

<template>
  <h1>직원 화면</h1>
  <p>고객 ID: {{ store.customerId }}</p>
  <tr v-for="item in store" :key="item.id" class="qty">
    <td class="item-name">{{ item.name }}</td>
    <td class="item-quantity">주문 내역: {{ item.quantity }}</td>
  </tr>
</template>
