<script setup lang="ts">
// 키오스크 첫 화면 = 전체 메뉴 그리드. 더 이상 환영/추천 팝업 없음.
// 음성은 진입 즉시 항상 켜져 있고, 말하면 NLU 가 음료+수량을 뽑아 장바구니에 자동 담음.
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useOrderStore, type MenuItem } from '@/stores/store';
import { getMenus, getPopularMenus, getRecommendMenus } from '@/api/menu';
import { getPlate, getCustomer } from '@/api/customer';
import { DEFAULT_MENUS } from '@/data/defaultMenus';
import orderCart from '@/components/orderCart.vue';
import voiceIndicator from '@/components/voiceIndicator.vue';
import { getMenuImage } from '@/components/menuImages';
import { useVoiceOrder } from '@/stt/useVoiceOrder';

const store = useOrderStore();
const { totalPrice, carNum, customerName } = storeToRefs(store);

const activeTab = ref('추천');
const menuCategories = ref<{ name: string; items: MenuItem[] }[]>([]);
const lastMatch = ref<string | null>(null);

const fPrice = (p: number) => p.toLocaleString('ko-KR');
const addMenu = (menu: MenuItem) => store.addItem(menu);

// 음성 인식 → 파싱·장바구니 반영은 모두 store.parseVoiceOrder 가 담당.
const { supported, listening, transcript, error: voiceError } = useVoiceOrder(
  (text) => {
    const added = store.parseVoiceOrder(text);
    if (added.length) {
      lastMatch.value = added.map((a) => `${a.name} ×${a.qty}`).join(', ');
    }
  },
);

function buildCategories(menus: MenuItem[], recommended: MenuItem[]) {
  const grouped = menus.reduce<Record<string, MenuItem[]>>((acc, m) => {
    (acc[m.category] ??= []).push(m);
    return acc;
  }, {});
  return [
    {
      name: '추천',
      items: recommended.length ? recommended : menus.slice(0, 3),
    },
    ...Object.entries(grouped).map(([name, items]) => ({ name, items })),
  ];
}

onMounted(async () => {
  // 0) 즉시 DEFAULT_MENUS 로 화면을 채운다 — 백엔드/DB 상태와 무관하게
  //    메뉴판이 빈 채로 보이는 일이 없도록.
  store.setMenus(DEFAULT_MENUS);
  menuCategories.value = buildCategories(DEFAULT_MENUS, DEFAULT_MENUS.slice(0, 3));
  activeTab.value = menuCategories.value[0].name;

  // 1) 번호판 silent 조회 — 있으면 store.customerId 세팅(=상단 뒷자리 4자리 표시).
  //    실패는 무시(키오스크는 메뉴부터 그대로 진행).
  try {
    const plateRes = await getPlate();
    if (plateRes.plate) {
      store.setCustomer(plateRes.plate);
      try {
        const cust = await getCustomer(plateRes.plate);
        store.setCustomerInfo(cust);
      } catch {
        /* 고객 조회 실패는 무시 */
      }
    }
  } catch (err) {
    console.warn('번호판 조회 실패 (백엔드 OCR 미준비?)', err);
  }

  // 2) 백엔드 /menus 응답이 비어있지 않으면 그걸로 덮어쓴다(가격·메뉴 갱신 반영).
  //    실패/빈응답이면 위 0번에서 깐 DEFAULT_MENUS 가 그대로 유지된다.
  try {
    const fetched = await getMenus();
    if (fetched.length) {
      store.setMenus(fetched);
      let recommended: MenuItem[] = [];
      try {
        recommended = await getRecommendMenus(store.customerId);
      } catch {
        try {
          recommended = await getPopularMenus();
        } catch {
          /* 추천 폴백 = 메뉴 앞 3개 */
        }
      }
      menuCategories.value = buildCategories(fetched, recommended);
    }
  } catch (err) {
    console.warn('백엔드 /menus 실패 → DEFAULT_MENUS 로 표시 중', err);
  }
});
</script>

<template>
  <div class="menu-page">
    <header class="topbar">
      <div class="title">
        <span class="logo">☕</span>
        <h1>오늘의 메뉴</h1>
      </div>
      <div class="right-cluster">
        <span v-if="carNum" class="plate-chip" :title="customerName ?? ''">
          <span class="plate-tag">차량</span>
          ····{{ carNum }}
          <span v-if="customerName" class="plate-name">{{ customerName }}님</span>
        </span>
        <div class="total-chip">
          합계 <strong>{{ fPrice(totalPrice) }}원</strong>
        </div>
      </div>
    </header>

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

    <section class="order-summary">
      <div class="summary-head">
        <h2>주문 내역</h2>
        <span class="total-price">{{ fPrice(totalPrice) }}원</span>
      </div>
      <orderCart />
    </section>

    <div class="action-bar">
      <button class="btn-primary" @click="$router.push('/confirm')">
        주문 완료 ▸
      </button>
    </div>

    <voiceIndicator
      :listening="listening"
      :transcript="transcript"
      :last-match="lastMatch"
      :error="voiceError"
      :supported="supported"
    />
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

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.title {
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--primary-soft);
  font-size: 1.6rem;
}
.title h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
}
.right-cluster {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.plate-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  border-radius: 999px;
  background: var(--primary-soft);
  border: 1px solid var(--primary);
  color: var(--primary-strong);
  font-size: 0.95rem;
  font-weight: 700;
  white-space: nowrap;
  letter-spacing: 0.05em;
}
.plate-tag {
  font-size: 0.7rem;
  letter-spacing: 0.15em;
  background: var(--primary);
  color: #fff;
  padding: 2px 8px;
  border-radius: 999px;
}
.plate-name {
  margin-left: 4px;
  color: var(--text);
  font-weight: 600;
  letter-spacing: 0;
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
.btn-primary {
  flex: 1;
  padding: 18px;
  border-radius: 14px;
  font-size: 1.2rem;
  font-weight: 700;
  background: var(--primary);
  color: #fff;
  box-shadow: 0 8px 20px rgba(232, 132, 58, 0.4);
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
