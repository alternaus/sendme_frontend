import { type RouteRecordRaw } from 'vue-router'

const baseBreadcrumb = {
  text: 'general.buy',
  to: { name: 'buy.index' },
  active: false,
}

const buyRoutes: RouteRecordRaw = {
  path: '/buy',
  name: 'buy',
  meta: {
    layout: 'DashboardLayout',
    requiresAuth: true,
    breadcrumb: [baseBreadcrumb],
    title: 'buy_credits'
  },
  children: [
    {
      path: '',
      name: 'buy.index',
      component: () => import('@/pages/buy/BuyPage.vue'),
      meta: { title: 'plans_and_pricing' }
    },

  ],
}
export default buyRoutes
