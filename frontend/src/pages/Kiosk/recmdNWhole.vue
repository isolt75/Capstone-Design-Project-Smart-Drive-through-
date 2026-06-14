<script setup lang="ts">
// 키오스크 첫 화면 = 전체 메뉴 그리드. 더 이상 환영/추천 팝업 없음.
// 음성은 진입 즉시 항상 켜져 있고, 말하면 NLU 가 음료+수량을 뽑아 장바구니에 자동 담음.
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
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
const router = useRouter();
const { totalPrice, carNum, customerName } = storeToRefs(store);

const activeTab = ref('추천');
const menuCategories = ref<{ name: string; items: MenuItem[] }[]>([]);
const lastMatch = ref<string | null>(null);

const fPrice = (p: number) => p.toLocaleString('ko-KR');
const addMenu = (menu: MenuItem) => store.addItem(menu);

// 장바구니에 뭔가 담긴 상태에서 이 키워드가 발화되면 /confirm 으로 자동 이동.
const CHECKOUT_KEYWORDS = ['주문할게', '결제할게', '이걸로할게', '이걸로요', '주문완료', '결제해줘', '됐어', '끝이'];

// 카페인 없는 메뉴를 원한다는 의도 키워드.
const DECAF_KEYWORDS = ['카페인없는', '카페인안들어간', '카페인없어도', '디카페인', '카페인빼고'];

// 음성 인식 → 파싱·장바구니 반영은 모두 store.parseVoiceOrder 가 담당.
// 메뉴 담으면서 "주세요" 포함 → 담은 뒤 바로 confirm.
// 또는 장바구니에 항목이 있는 상태에서 완료 키워드 → confirm.
// "카페인없는거" 발화 → 추천탭을 카페인 없는 메뉴로 교체.
const { supported, listening, transcript, error: voiceError } = useVoiceOrder(
  (text) => {
    const added = store.parseVoiceOrder(text);
    if (added.length) {
      lastMatch.value = added.map((a) => `${a.name} ×${a.qty}`).join(', ');
    }
    const compact = text.replace(/\s+/g, '');

    // 카페인 의도 감지 → 추천탭 교체
    if (DECAF_KEYWORDS.some((kw) => compact.includes(kw))) {
      const decafItems = store.availableMenus.filter((m) => m.caffeine === false);
      const idx = menuCategories.value.findIndex((c) => c.name === '추천');
      if (idx >= 0 && decafItems.length) {
        menuCategories.value.splice(idx, 1, { name: '추천', items: decafItems });
        activeTab.value = '추천';
        lastMatch.value = '카페인 없는 메뉴로 추천 변경됨';
      }
      return;
    }

    const hasCheckoutKw = CHECKOUT_KEYWORDS.some((kw) => compact.includes(kw));
    const hasJuseyo = compact.includes('주세요');
    if ((hasJuseyo && added.length > 0) || (hasCheckoutKw && store.orderItems.length > 0)) {
      router.push('/confirm');
    }
  },
);

let platePoll: number | null = null;

async function refreshPlate() {
  try {
    const { plate } = await getPlate();
    const current = store.customerId;
    const next = plate || null;

    // 같으면 no-op (둘 다 null 인 idle 상태 포함)
    if (next === current) return;

    // 신선한 차량이 사라짐 (freshness 만료) — 헤더만 'IoT cafe'로 되돌림.
    // 카트·주문 정보는 손님이 마저 주문할 수 있게 보존.
    if (!next && current) {
      store.customerId = null;
      store.customerName = null;
      return;
    }

    // 새 차량 진입 (또는 다른 차량으로 교체) — 이전 손님 카트 비우고 갱신
    if (current) store.clear();
    store.setCustomer(next!);
    try {
      const cust = await getCustomer(next!);
      store.setCustomerInfo(cust);
    } catch {
      /* 고객 조회 실패는 무시 — 뒷자리 4자리는 여전히 표시됨 */
    }
  } catch {
    /* 백엔드 잠깐 끊김 등은 다음 폴링에서 다시 시도 */
  }
}

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

  // 1) 번호판 폴링 — 2초마다 /ocr/latest 확인. 새 차량이면 이전 카트 비우고 갱신.
  //    Pi 가 vehicle-entry 를 보내자마자 키오스크 상단에 "0000님 환영합니다" 가 즉시 뜨도록.
  await refreshPlate();
  platePoll = window.setInterval(refreshPlate, 2000);

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

onBeforeUnmount(() => {
  if (platePoll) {
    window.clearInterval(platePoll);
    platePoll = null;
  }
});
</script>

<template>
  <div class="menu-page">
    <header class="topbar">
      <div class="title">
        <span class="logo">☕</span>
        <div class="title-text">
          <h1 v-if="carNum" class="greet">
            <span class="plate-num">{{ carNum }}</span>님 환영합니다
          </h1>
          <h1 v-else class="greet">IoT cafe</h1>
          <p v-if="customerName" class="sub-name">{{ customerName }}님</p>
          <p v-else-if="carNum" class="sub-name">차량 인식됨</p>
          <p v-else class="sub-name">차량 인식 대기 중…</p>
        </div>
      </div>
      <div class="total-chip">
        합계 <strong>{{ fPrice(totalPrice) }}원</strong>
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
.title-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.greet {
  margin: 0;
  font-size: 1.7rem;
  font-weight: 700;
  color: var(--text);
  line-height: 1.1;
}
.plate-num {
  color: var(--primary-strong);
  font-size: 2.1rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  margin-right: 4px;
  background: linear-gradient(180deg, var(--primary), var(--primary-strong));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.sub-name {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-muted);
  font-weight: 600;
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
