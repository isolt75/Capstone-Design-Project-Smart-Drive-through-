import { createRouter, createWebHistory } from 'vue-router';

import menuHome from '@/pages/Kiosk/recmdNWhole.vue';
import orderConfirm from '@/pages/Kiosk/orderConfirm.vue';
import pos from '@/pages/Staff/staffPos.vue';
import final from '@/pages/Kiosk/final.vue';
import voiceCart from '@/pages/Kiosk/voiceCart.vue';

// '/' 를 곧바로 메뉴 화면으로. 기존의 환영 팝업(kioskHome)·별도 음성 페이지(voiceOrder)·
// 임시 sttPanel 은 폐기. 음성은 menuHome 안에서 항상 켜져 있음.
const routes = [
  { path: '/', component: menuHome },
  { path: '/confirm', component: orderConfirm },
  { path: '/pos', component: pos },
  { path: '/final', component: final },
  { path: '/voice-cart/:eventId', component: voiceCart },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
