<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useOrderStore, type MenuItem } from '@/stores/store';
import { getPopularMenus } from '@/api/menu';
import { getMenuImage } from '@/components/menuImages';

const store = useOrderStore();

const recommendMenus = ref<MenuItem[]>([]);
const showPopup = ref(false);

let timer: number | null = null;

const fPrice = (p: number) => p.toLocaleString('ko-KR');
const addMenu = (menu: MenuItem) => store.addItem(menu);
const closePopup = () => (showPopup.value = false);

onMounted(async () => {
  try {
    recommendMenus.value = await getPopularMenus();
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
</style>
