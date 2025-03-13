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

const settingRoutes: RouteRecordRaw = {
  path: '/settings',
  name: 'settings',
  meta: { layout: 'DashboardLayout', requiresAuth: true, breadcrumb: [baseBreadcrumb] },
  children: [
    {
      path: '',
      name: 'settings.index',
      component: () => import('@/pages/settings/SettingsPage.vue'),
    },
  ],
}
export default settingRoutes