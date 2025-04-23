import { type RouteRecordRaw } from 'vue-router'

const baseBreadcrumb = {
  text: 'general.account',
  to: { name: 'account.index' },
  active: false
}

// const generateBreadcrumb = (text: string, name: string) => [
//   baseBreadcrumb,
//   {
//     text,
//     to: { name },
//     active: true
//   }
// ]

const accountRoutes: RouteRecordRaw = {
  path: '/account',
  name: 'account',
  meta: {
    layout: 'DashboardLayout',
    requiresAuth: true,
    breadcrumb: [baseBreadcrumb],
    title: 'account'
  },
  children: [
    {
      path: '',
      name: 'account.index',
      component: () => import('@/pages/account/AccountPage.vue'),
      meta: { title: 'account_settings' }
    },
  ],
}
export default accountRoutes
