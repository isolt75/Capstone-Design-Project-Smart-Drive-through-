<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { storeToRefs } from 'pinia';
import { useOrderStore, type menuItem } from '@/stores/store';
import { getMenus, getPopularMenus } from '@/api/menu';
import orderCart from '@/components/orderCart.vue';
import sttPanel from '@/stt/sttPanel.vue';
import { getMenuImage } from '@/components/menuImages';

const store = useOrderStore();
const { totalPrice } = storeToRefs(store);

const activeTab = ref('추천');
const recommendMenus = ref<menuItem[]>([]);
const menuCategories = ref<{ name: string; items: menuItem[] }[]>([]);
const showPopup = ref(false);

// 로컬 테스트 목업 데이터
const USE_MOCK = true;
const mockRecMenu: menuItem[] = [
  {
    id: 1,
    name: '아메리카노',
    price: 3000,
    category: '커피',
    image: getMenuImage(1),
  },
  {
    id: 6,
    name: '카페라떼',
    price: 4000,
    category: '커피',
    image: getMenuImage(6),
  },
  {
    id: 8,
    name: '밀크쉐이크',
    price: 4000,
    category: '아이스 블렌디드',
    image: getMenuImage(8),
  },
  {
    id: 9,
    name: '딸기요거트스무디',
    price: 4500,
    category: '아이스 블렌디드',
    image: getMenuImage(9),
  },
  {
    id: 11,
    name: '레몬에이드',
    price: 3500,
    category: '에이드, 주스',
    image: getMenuImage(11),
  },
  {
    id: 16,
    name: '아이스티',
    price: 2000,
    category: '티',
    image: getMenuImage(16),
  },
];
const mockMenu: { name: string; items: menuItem[] }[] = [
  { name: '추천', items: mockRecMenu },
  {
    name: '커피',
    items: [
      {
        id: 1,
        name: '아메리카노',
        price: 3000,
        category: '커피',
        image: getMenuImage(1),
      },
      {
        id: 2,
        name: '콜드브루',
        price: 4500,
        category: '커피',
        image: getMenuImage(2),
      },
      {
        id: 3,
        name: '카라멜 마키아또',
        price: 4000,
        category: '커피',
        image: getMenuImage(3),
      },
      {
        id: 4,
        name: '카푸치노',
        price: 4000,
        category: '커피',
        image: getMenuImage(4),
      },
      {
        id: 5,
        name: '카페모카',
        price: 4000,
        category: '커피',
        image: getMenuImage(5),
      },
      {
        id: 6,
        name: '카페라떼',
        price: 4000,
        category: '커피',
        image: getMenuImage(6),
      },
    ],
  },
  {
    name: '아이스 블렌디드',
    items: [
      {
        id: 7,
        name: '자바칩 프라페',
        price: 4000,
        category: '아이스 블렌디드',
        image: getMenuImage(7),
      },
      {
        id: 8,
        name: '밀크쉐이크',
        price: 4000,
        category: '아이스 블렌디드',
        image: getMenuImage(8),
      },
      {
        id: 9,
        name: '딸기요거트스무디',
        price: 4500,
        category: '아이스 블렌디드',
        image: getMenuImage(9),
      },
      {
        id: 10,
        name: '망고요거트스무디',
        price: 4500,
        category: '아이스 블렌디드',
        image: getMenuImage(10),
      },
    ],
  },
  {
    name: '에이드, 주스',
    items: [
      {
        id: 11,
        name: '레몬에이드',
        price: 3500,
        category: '에이드, 주스',
        image: getMenuImage(11),
      },
      {
        id: 12,
        name: '오렌지주스',
        price: 3000,
        category: '에이드, 주스',
        image: getMenuImage(12),
      },
      {
        id: 13,
        name: '라임모히또에이드',
        price: 3500,
        category: '에이드, 주스',
        image: getMenuImage(13),
      },
    ],
  },
  {
    name: '티',
    items: [
      {
        id: 14,
        name: '녹차',
        price: 2500,
        category: '티',
        image: getMenuImage(14),
      },
      {
        id: 15,
        name: '자몽허니블랙티',
        price: 4000,
        category: '티',
        image: getMenuImage(15),
      },
      {
        id: 16,
        name: '아이스티',
        price: 2000,
        category: '티',
        image: getMenuImage(16),
      },
      {
        id: 17,
        name: '말차라떼',
        price: 3500,
        category: '티',
        image: getMenuImage(17),
      },
      {
        id: 18,
        name: '초코라떼',
        price: 3000,
        category: '티',
        image: getMenuImage(18),
      },
      {
        id: 19,
        name: '우유',
        price: 2000,
        category: '티',
        image: getMenuImage(19),
      },
    ],
  },
];

let timer: number | null = null;

const fPrice = (p: number) => p.toLocaleString('ko-KR');
const addMenu = (menu: menuItem) => store.addItem(menu);
const closePopup = () => (showPopup.value = false);

onMounted(async () => {
  try {
    if (USE_MOCK) {
      recommendMenus.value = mockRecMenu;
      menuCategories.value = mockMenu;
    } else {
      const [allMenus, popular] = await Promise.all([
        getMenus(),
        getPopularMenus(),
      ]);
      recommendMenus.value = popular;

      // 카테고리별 그룹화
      const grouped: Record<string, menuItem[]> = {};
      allMenus.forEach((m) => {
        const list = grouped[m.category] ?? (grouped[m.category] = []);
        list.push(m);
      });

      menuCategories.value = [
        { name: '추천', items: recommendMenus.value },
        ...Object.entries(grouped).map(([name, items]) => ({ name, items })),
      ];
    }
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
      <div v-if="showPopup" class="popup-overlay">
        <div class="popup-content">
          <button class="popup-close" @click="closePopup">&times;</button>
          <h2>추천 메뉴</h2>
          <div class="menu-grid">
            <button
              v-for="item in recommendMenus"
              :key="item.id"
              class="menu-btn"
              @click="addMenu(item)"
            >
              <img
                :src="getMenuImage(item.id)"
                :alt="item.name"
                class="menu-img"
              />
              <div class="menu-info">
                <span class="menu-name">{{ item.name }}</span
                ><br />
                <span class="menu-price">{{ fPrice(item.price) }}원</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <h1>환영합니다, {{ store.customerName ?? store.carPart }}님!</h1>
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
        <div v-if="activeTab === category.name" class="category">
          <div class="menu-grid">
            <button
              v-for="item in category.items"
              :key="item.id"
              class="menu-btn"
              @click="addMenu(item)"
            >
              <img
                :src="getMenuImage(item.id)"
                :alt="item.name"
                class="menu-img"
              />
              <div class="menu-info">
                <span class="menu-name">{{ item.name }}</span
                ><br />
                <span class="menu-price">{{ fPrice(item.price) }}원</span>
              </div>
            </button>
          </div>
        </div>
      </section>
    </main>
    <sttPanel />
    <div class="order-summary">
      <h2>주문 내역</h2>
      <span class="total-price">합계: {{ fPrice(totalPrice) }}원</span>
      <orderCart />
    </div>

    <div class="action-btn">
      <button class="voice" @click="$router.push('/voice')">음성 주문</button>
      <button class="confirm" @click="$router.push('/confirm')">
        주문 완료
      </button>
    </div>
  </div>
</template>

<style scoped>
button {
  font-weight: 500;
}

.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  background: rgba(0, 0, 0, 0.5);

  display: flex;
  justify-content: center;
  align-items: center;

  z-index: 999;
}

.popup-content {
  background: white;
  padding: 20px;
  border-radius: 12px;
  width: 80%;
  height: 80%;
  overflow-y: auto;
}

.popup-close {
  float: right;
  font-size: 1.5rem;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.menu-page {
  display: flex;
  height: auto;
  padding: 20px;
  flex-direction: column;
}

.category-tabs {
  display: flex;
  align-items: center;
  padding: 10px;
  gap: 10px;
  overflow-x: auto;
}

.category-tabs button {
  display: flex;
  align-items: center;
  justify-content: center;

  height: 42px;
  padding: 0 25px;
  border-radius: 12px;
  background: #dcdcdc;

  font-size: 1.2rem;
  white-space: nowrap;
}

.category-tabs .active {
  height: 45px;
  background-color: gray;
  color: var(--bg-base);
  font-size: 1.3rem;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.menu-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: auto;
  padding: 10px;
  gap: 10px;

  border-radius: 10px;
  background: var(--bg-light);
  box-shadow: 0 4px 6px var(--bg-shadow);
  font-size: 1rem;
  line-height: 1.5;
}

.menu-img {
  height: 200px;
  object-fit: contain;
  border-radius: 10px;
}

.menu-name {
  font-size: 1.3rem;
}

.menu-price {
  font-size: 1rem;
}

.order-summary {
  margin: 20px 0;
  padding: 0 20px;
  border-radius: 20px;
  background: var(--bg-list);
}

.order-summary h2 {
  margin: 10px 0;
  font-size: 2rem;
}

.total-price {
  float: right;
  margin: 5px 10px 5px 0;
  font-size: 1.5rem;
  font-weight: 500;
}

.action-btn {
  display: flex;
  gap: 15px;
}

.action-btn button {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;

  padding: 20px;
  border: none;
  border-radius: 12px;
  font-size: 1.3rem;
  font-weight: bold;
}

.voice {
  background: #dcdde1;
  color: var(--text-primary);
}

.confirm {
  background: var(--primary-color);
  color: var(--bg-base);
}
</style>
