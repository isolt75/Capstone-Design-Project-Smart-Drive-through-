<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useOrderStore } from '@/stores/store';
import { getCustomer, getPlate } from '@/api/customer';

const router = useRouter();
const store = useOrderStore();
const status = ref('차량 인식 중...');

onMounted(async () => {
  // store.clear();
  try {
    const plateRes = await getPlate();
    const plate = plateRes.plate;
    console.log('plate = ', plate);

    if (!plate) {
      status.value = '차량 번호 인식 실패';
      return;
    }

    store.setCustomer(plate);
    const res = await getCustomer(plate);
    store.setCustomerInfo(res);

    status.value = res.isNew
      ? '신규 고객님, 환영합니다!'
      : `${res.plate}님, 다시 오셨네요!`; //
  } catch (err) {
    console.error('고객 조회 실패', err);
    status.value = '고객 정보를 불러오지 못했습니다.';
  }

  setTimeout(() => {
    router.push('/recmd');
  }, 3000); // 3초
});
</script>

<template>
  <div>
    <h1>{{ status }}</h1>
    <p>잠시만 기다려 주세요</p>
  </div>
</template>
