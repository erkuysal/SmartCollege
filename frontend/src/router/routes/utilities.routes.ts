import type { RouteRecordRaw } from 'vue-router';

const utilityRoutes: RouteRecordRaw[] = [
  {
    path: 'cards',
    name: 'cards',
    component: () => import('@/pages/utilities/Cards.vue'),
    meta: {
      title: 'Cards'
    }
  },
  {
    path: 'cards/:id',
    name: 'card-details',
    component: () => import('@/pages/utilities/details/CardDetails.vue'),
    props: true,
    meta: {
      title: 'Card Details'
    }
  },
];

export default utilityRoutes;
