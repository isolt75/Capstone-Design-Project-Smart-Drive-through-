import { createRouter, createWebHistory } from 'vue-router';

import menuHome from '@/pages/Kiosk/recmdNWhole.vue';
import orderConfirm from '@/pages/Kiosk/orderConfirm.vue';
import staffDisplay from '@/pages/Staff/staffDisplay.vue';
import final from '@/pages/Kiosk/final.vue';

// '/' 를 곧바로 메뉴 화면으로. 기존의 환영 팝업(kioskHome)·별도 음성 페이지(voiceOrder)·
// 임시 sttPanel 은 폐기. 음성은 menuHome 안에서 항상 켜져 있음.
const routes = [
  { path: '/', component: menuHome },
  { path: '/confirm', component: orderConfirm },
  { path: '/staff', component: staffDisplay },
  // 직원 화면은 /staff 로 통합. 기존 /pos 북마크는 리다이렉트로 호환.
  { path: '/pos', redirect: '/staff' },
  { path: '/final', component: final },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
