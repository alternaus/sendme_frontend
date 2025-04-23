import { type RouteRecordRaw } from 'vue-router'

const baseBreadcrumb = {
  text: 'general.settings',
  to: { name: 'settings.index' },
  active: false,
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
  meta: {
    layout: 'DashboardLayout',
    requiresAuth: true,
    breadcrumb: [baseBreadcrumb],
    title: 'settings'
  },
  children: [
    {
      path: '',
      name: 'settings.index',
      component: () => import('@/pages/settings/SettingsPage.vue'),
      meta: { title: 'general_settings' }
    },
    {
      path: 'custom-fields',
      name: 'settings.custom-fields',
      component: () => import('@/pages/settings/pages/custom-fields/CustomFieldsPage.vue'),
      meta: { title: 'custom_fields' }
    },
    {
      path: 'users',
      name: 'settings.users',
      component: () => import('@/pages/settings/pages/users/UsersPage.vue'),
      meta: { title: 'users' }
    },
    {
      path: 'integrations',
      name: 'settings.integrations',
      component: () => import('@/pages/settings/pages/integrations/IntegrationsPage.vue'),
      meta: { title: 'integrations' }
    },
  ],
}
export default settingRoutes
