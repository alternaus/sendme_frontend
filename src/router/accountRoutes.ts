import { type RouteRecordRaw } from 'vue-router'

const baseBreadcrumb = {
  text: 'common.general.account',
  to: { name: 'account.index' },
  active: false
}

const accountRoutes: RouteRecordRaw = {
  path: '/account',
  name: 'account',
  meta: {
    layout: 'DashboardLayout',
    requiresAuth: true,
    breadcrumb: [baseBreadcrumb],
    title: 'common.titles.account'
  },
  children: [
    {
      path: '',
      name: 'account.index',
      component: () => import('@/pages/account/AccountPage.vue'),
      meta: { title: 'common.titles.account_settings' }
    },
  ],
}
export default accountRoutes
