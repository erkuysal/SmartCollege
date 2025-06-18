import type { RouteRecordRaw } from 'vue-router';
import WalletManagementView from '@/views/wallet/WalletManagementView.vue';

export const walletRoutes: RouteRecordRaw[] = [
  { path: '/wallet-management', component: WalletManagementView }
]; 