import { type RouteRecordRaw } from 'vue-router'

const baseBreadcrumb = {
  text: 'general.instant_message',
  to: { name: 'send.index' },
  active: false
}

//const generateBreadcrumb = (text: string, name: string) => [
//baseBreadcrumb,
//{
//text,
//to: { name },
//active: true
//}
//]

const sendRoutes: RouteRecordRaw = {
  path: '/send',
  name: 'send',
  meta: {
    layout: 'DashboardLayout',
    requiresAuth: true,
    breadcrumb: [baseBreadcrumb],
    title: 'instant_message'
  },
  children: [
    {
      path: '',
      name: 'send.index',
      component: () => import('@/pages/send/SendPage.vue'),
      meta: { title: 'send_instant_message' }
    },
  ],
}
export default sendRoutes
