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
  <div class="welcome">
    <div class="welcome-card">
      <div class="logo">☕</div>
      <h1 class="status">{{ status }}</h1>
      <p class="sub">잠시만 기다려 주세요</p>
      <div class="dots">
        <span></span><span></span><span></span>
      </div>
    </div>
    <p class="brand">SMART DRIVE-THROUGH</p>
  </div>
</template>

<style scoped>
.welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  gap: 28px;
  background: radial-gradient(
    120% 120% at 50% 0%,
    #fff6ea 0%,
    var(--bg) 55%
  );
}

.welcome-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 520px;
  padding: 56px 32px;
  border-radius: 28px;
  background: var(--surface);
  box-shadow: var(--shadow);
  text-align: center;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  margin-bottom: 24px;
  border-radius: 50%;
  background: var(--primary-soft);
  font-size: 3rem;
  animation: float 2.4s ease-in-out infinite;
}

.status {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: var(--text);
}

.sub {
  margin: 12px 0 0;
  font-size: 1.15rem;
  color: var(--text-muted);
}

.dots {
  display: flex;
  gap: 10px;
  margin-top: 28px;
}

.dots span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--primary);
  opacity: 0.35;
  animation: pulse 1.2s ease-in-out infinite;
}
.dots span:nth-child(2) {
  animation-delay: 0.2s;
}
.dots span:nth-child(3) {
  animation-delay: 0.4s;
}

.brand {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.3em;
  color: var(--text-muted);
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(0.85);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
