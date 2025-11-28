import {
  type NavigationGuardNext,
  type RouteLocationNormalized,
  type RouteLocationNormalizedLoaded,
  type RouteRecordRaw,
} from 'vue-router'

const baseBreadcrumb = {
  text: 'custom_clients.clients',
  to: { name: 'custom-clients.index' },
  active: false,
}

const generateBreadcrumb = (text: string, name: string, id?: string) => [
  baseBreadcrumb,
  {
    text,
    to: id ? { name, params: { id } } : { name },
    active: true,
  },
]

const beforeEnterWithBreadcrumb =
  (action: string, name: string) =>
  (to: RouteLocationNormalized, from: RouteLocationNormalizedLoaded, next: NavigationGuardNext) => {
    to.meta.breadcrumb = generateBreadcrumb(action, name, to.params.id as string)
    next()
  }

const customClientRoutes: RouteRecordRaw = {
  path: '/admin/clients',
  name: 'custom-clients',
  meta: {
    layout: 'DashboardLayout',
    requiresAuth: true,
    requiresAdmin: true,
    breadcrumb: [baseBreadcrumb],
    title: 'common.titles.custom_clients',
  },
  children: [
    {
      path: '',
      name: 'custom-clients.index',
      component: () => import('@/pages/admin/custom-clients/CustomClientsPage.vue'),
      meta: { title: 'common.titles.custom_clients_list' },
    },
    {
      path: 'create',
      name: 'custom-clients.create',
      component: () => import('@/pages/admin/custom-clients/CreateCustomClientPage.vue'),
      meta: {
        breadcrumb: generateBreadcrumb('common.actions.create', 'custom-clients.create'),
        title: 'common.titles.create_custom_client',
      },
    },
    {
      path: 'edit/:id',
      name: 'custom-clients.edit',
      component: () => import('@/pages/admin/custom-clients/CreateCustomClientPage.vue'),
      beforeEnter: beforeEnterWithBreadcrumb('common.actions.edit', 'custom-clients.edit'),
      meta: { title: 'common.titles.edit_custom_client' },
    },
    {
      path: 'view/:id',
      name: 'custom-clients.view',
      component: () => import('@/pages/admin/custom-clients/CustomClientDetailPage.vue'),
      beforeEnter: beforeEnterWithBreadcrumb('common.actions.view', 'custom-clients.view'),
      meta: { title: 'common.titles.view_custom_client' },
    },
  ],
}

export default customClientRoutes
