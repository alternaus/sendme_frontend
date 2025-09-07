import { type RouteRecordRaw } from 'vue-router'

const baseBreadcrumb = {
  text: 'send.instant_message',
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
    title: 'common.titles.instant_message'
  },
  children: [
    {
      path: '',
      name: 'send.index',
      component: () => import('@/pages/send/SendPage.vue'),
      meta: { title: 'common.titles.send_instant_message' }
    },
  ],
}
export default sendRoutes
