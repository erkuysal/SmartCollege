import type { RouteRecordRaw } from 'vue-router';
import RFIDTagsView from '@/views/rfid/RFIDTagsView.vue';

export const infrastructureRoutes: RouteRecordRaw[] = [
  { path: 'rfid-tags', component: RFIDTagsView }
];
