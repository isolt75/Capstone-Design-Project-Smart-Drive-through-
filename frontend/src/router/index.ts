import { createRouter, createWebHistory } from 'vue-router';

import kioskHome from '@/pages/Kiosk/kioskHome.vue';
import recmd from '@/pages/Kiosk/recmdNWhole.vue';
import voiceOrder from '@/pages/Kiosk/voiceOrder.vue';
import orderConfirm from '@/pages/Kiosk/orderConfirm.vue';
import pos from '@/pages/Staff/staffPos.vue';
import final from '@/pages/Kiosk/final.vue';

const routes = [
  { path: '/', component: kioskHome },
  { path: '/recmd', component: recmd },
  { path: '/voice', component: voiceOrder },
  { path: '/confirm', component: orderConfirm },
  { path: '/pos', component: pos },
  { path: '/final', component: final },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
