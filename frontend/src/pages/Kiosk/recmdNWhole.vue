<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { storeToRefs } from 'pinia';
import { useOrderStore, type MenuItem } from '@/stores/store';
import { getMenus, getPopularMenus, getRecommendMenus } from '@/api/menu';
import orderCart from '@/components/orderCart.vue';
import sttPanel from '@/stt/sttPanel.vue';
import { getMenuImage } from '@/components/menuImages';

const store = useOrderStore();
const { totalPrice } = storeToRefs(store);

const activeTab = ref();
// activeTab.value = menuCategories.value[0]?.name ?? '';
const recommendMenus = ref<MenuItem[]>([]);
const menuCategories = ref<{ name: string; items: MenuItem[] }[]>([]);
const showPopup = ref(false);

let timer: number | null = null;

const fPrice = (p: number) => p.toLocaleString('ko-KR');
const addMenu = (menu: MenuItem) => store.addItem(menu);
const closePopup = () => (showPopup.value = false);

onMounted(async () => {
  try {
    // 재방문 고객(번호판 보유)이면 개인화 추천, 아니면 시간대 인기.
    // /recommend 실패 시 /popular 로 폴백.
    const [allMenus, recommended] = await Promise.all([
      getMenus(),
      getRecommendMenus(store.customerId).catch(() => getPopularMenus()),
    ]);
    recommendMenus.value = recommended;

    const grouped = allMenus.reduce<Record<string, MenuItem[]>>((acc, menu) => {
      (acc[menu.category] ??= []).push(menu);
      return acc;
    }, {});

    menuCategories.value = [
      { name: '추천', items: recommendMenus.value },
      ...Object.entries(grouped).map(([name, items]) => ({ name, items })),
    ];
    activeTab.value = menuCategories.value[0]?.name ?? '추천';
  } catch (err) {
    console.error('메뉴 로딩 실패', err);
  }

  showPopup.value = true;
  timer = window.setTimeout(closePopup, 3000);
});

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer);
});
</script>

<template>
  <div class="menu-page">
    <!-- 추천 팝업 -->
    <transition name="fade">
      <div v-if="showPopup" class="popup-overlay" @click.self="closePopup">
        <div class="popup-content">
          <div class="popup-head">
            <div>
              <p class="popup-eyebrow">{{ store.customerName ?? store.carNum }}님을 위한</p>
              <h2>추천 메뉴</h2>
            </div>
            <button class="popup-close" @click="closePopup">&times;</button>
          </div>
          <div class="menu-grid">
            <button
              v-for="item in recommendMenus"
              :key="item.id"
              class="menu-btn"
              @click="addMenu(item)"
            >
              <span class="badge-reco">추천</span>
              <img :src="getMenuImage(item.id)" :alt="item.name" class="menu-img" />
              <div class="menu-info">
                <span class="menu-name">{{ item.name }}</span>
                <span class="menu-price">{{ fPrice(item.price) }}원</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 헤더 -->
    <header class="topbar">
      <div class="greet">
        <span class="greet-emoji">☕</span>
        <div>
          <p class="greet-sub">환영합니다</p>
          <h1 class="greet-name">{{ store.customerName ?? store.carNum }}님</h1>
        </div>
      </div>
      <div class="total-chip">
        합계 <strong>{{ fPrice(totalPrice) }}원</strong>
      </div>
    </header>

    <!-- 카테고리 탭 -->
    <nav class="category-tabs">
      <button
        v-for="cat in menuCategories"
        :key="cat.name"
        :class="{ active: activeTab === cat.name }"
        @click="activeTab = cat.name"
      >
        {{ cat.name }}
      </button>
    </nav>

    <!-- 메뉴 -->
    <main class="menu-content">
      <section v-for="category in menuCategories" :key="category.name">
        <div v-if="activeTab === category.name" class="menu-grid">
          <button
            v-for="item in category.items"
            :key="item.id"
            class="menu-btn"
            @click="addMenu(item)"
          >
            <span v-if="category.name === '추천'" class="badge-reco">추천</span>
            <img :src="getMenuImage(item.id)" :alt="item.name" class="menu-img" />
            <div class="menu-info">
              <span class="menu-name">{{ item.name }}</span>
              <span class="menu-price">{{ fPrice(item.price) }}원</span>
            </div>
            <span class="add-pill">+ 담기</span>
          </button>
        </div>
      </section>
    </main>

    <!-- 음성 주문 패널 -->
    <sttPanel />

    <!-- 주문 내역 -->
    <section class="order-summary">
      <div class="summary-head">
        <h2>주문 내역</h2>
        <span class="total-price">{{ fPrice(totalPrice) }}원</span>
      </div>
      <orderCart />
    </section>

    <!-- 액션 -->
    <div class="action-bar">
      <button class="btn-ghost" @click="$router.push('/voice')">🎤 음성 주문</button>
      <button class="btn-primary" @click="$router.push('/confirm')">
        주문 완료 ▸
      </button>
    </div>
  </div>
</template>

<style scoped>
.menu-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 20px 20px 110px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* ── 헤더 ── */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.greet {
  display: flex;
  align-items: center;
  gap: 14px;
}
.greet-emoji {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--primary-soft);
  font-size: 1.6rem;
}
.greet-sub {
  margin: 0;
  font-size: 0.95rem;
  color: var(--text-muted);
}
.greet-name {
  margin: 2px 0 0;
  font-size: 1.6rem;
  font-weight: 700;
}
.total-chip {
  padding: 10px 18px;
  border-radius: 999px;
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  font-size: 1rem;
  color: var(--text-muted);
  white-space: nowrap;
}
.total-chip strong {
  margin-left: 6px;
  color: var(--primary-strong);
}

/* ── 탭 ── */
.category-tabs {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
}
.category-tabs button {
  flex: 0 0 auto;
  height: 46px;
  padding: 0 22px;
  border-radius: 999px;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 1.05rem;
  font-weight: 600;
  white-space: nowrap;
}
.category-tabs .active {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
  box-shadow: 0 6px 16px rgba(232, 132, 58, 0.35);
}

/* ── 메뉴 그리드 ── */
.menu-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.menu-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 14px;
  border-radius: var(--radius);
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}
.menu-btn:active {
  box-shadow: 0 2px 6px rgba(120, 80, 30, 0.1);
}
.menu-img {
  height: 140px;
  width: 100%;
  object-fit: contain;
}
.menu-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.menu-name {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text);
}
.menu-price {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--primary-strong);
}
.add-pill {
  margin-top: 4px;
  padding: 6px 16px;
  border-radius: 999px;
  background: var(--primary-soft);
  color: var(--primary-strong);
  font-size: 0.9rem;
  font-weight: 700;
}
.badge-reco {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--primary);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
}

/* ── 주문 내역 ── */
.order-summary {
  padding: 18px;
  border-radius: var(--radius);
  background: var(--surface-2);
}
.summary-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
}
.summary-head h2 {
  margin: 0;
  font-size: 1.4rem;
}
.total-price {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--primary-strong);
}

/* ── 액션 바 (하단 고정) ── */
.action-bar {
  position: fixed;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 100%;
  max-width: 960px;
  display: flex;
  gap: 12px;
  padding: 14px 20px calc(14px + env(safe-area-inset-bottom));
  background: linear-gradient(to top, var(--bg) 70%, transparent);
}
.action-bar button {
  flex: 1;
  padding: 18px;
  border-radius: 14px;
  font-size: 1.2rem;
  font-weight: 700;
}
.btn-ghost {
  flex: 0 0 38% !important;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text);
}
.btn-primary {
  background: var(--primary);
  color: #fff;
  box-shadow: 0 8px 20px rgba(232, 132, 58, 0.4);
}

/* ── 추천 팝업 ── */
.popup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(42, 37, 33, 0.45);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  padding: 20px;
}
.popup-content {
  width: 100%;
  max-width: 640px;
  max-height: 82vh;
  padding: 24px;
  border-radius: 24px;
  background: var(--surface);
  box-shadow: var(--shadow);
  overflow-y: auto;
}
.popup-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 18px;
}
.popup-eyebrow {
  margin: 0 0 2px;
  font-size: 0.95rem;
  color: var(--primary-strong);
  font-weight: 600;
}
.popup-head h2 {
  margin: 0;
  font-size: 1.7rem;
}
.popup-close {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--surface-2);
  font-size: 1.4rem;
  color: var(--text-muted);
  line-height: 1;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 600px) {
  .menu-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .menu-img {
    height: 110px;
  }
}
</style>
