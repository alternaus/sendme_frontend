import { type RouteRecordRaw } from 'vue-router'

const baseBreadcrumb = {
  text: 'common.general.settings',
  to: { name: 'settings.index' },
  active: false,
}

const settingRoutes: RouteRecordRaw = {
  path: '/settings',
  name: 'settings',
  meta: {
    layout: 'DashboardLayout',
    requiresAuth: true,
    breadcrumb: [baseBreadcrumb],
    title: 'common.titles.settings'
  },
  children: [
    {
      path: '',
      name: 'settings.index',
      component: () => import('@/pages/settings/SettingsPage.vue'),
      meta: { title: 'common.titles.general_settings' }
    },
    {
      path: 'custom-fields',
      name: 'settings.custom-fields',
      component: () => import('@/pages/settings/pages/custom-fields/CustomFieldsPage.vue'),
      meta: { title: 'common.titles.custom_fields' }
    },
    {
      path: 'users',
      name: 'settings.users',
      component: () => import('@/pages/settings/pages/users/UsersPage.vue'),
      meta: { title: 'common.titles.users' }
    },
    {
      path: 'integrations',
      name: 'settings.integrations',
      component: () => import('@/pages/settings/pages/integrations/IntegrationsPage.vue'),
      meta: { title: 'common.titles.integrations' }
    },
    {
      path: 'general',
      name: 'settings.general',
      component: () => import('@/pages/settings/pages/general/ConfigGeneralPage.vue'),
      meta: { title: 'common.titles.general' }
    }
  ],
}
export default settingRoutes
