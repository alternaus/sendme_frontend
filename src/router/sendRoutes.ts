import { type RouteRecordRaw } from 'vue-router'

const baseBreadcrumb = {
  text: 'general.settings',
  to: { name: 'settings.index' },
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

const sendRoutes: RouteRecordRaw = {
  path: '/send',
  name: 'send',
  meta: { layout: 'DashboardLayout', requiresAuth: true, breadcrumb: [baseBreadcrumb] },
  children: [
    {
      path: '',
      name: 'send.index',
      component: () => import('@/pages/send/SendPage.vue'),
    },
  ],
}
export default sendRoutes