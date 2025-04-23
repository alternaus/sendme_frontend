import {
  type NavigationGuardNext,
  type RouteLocationNormalized,
  type RouteLocationNormalizedLoaded,
  type RouteRecordRaw,
} from 'vue-router'

const baseBreadcrumb = {
  text: 'campaign.campaigns',
  to: { name: 'campaigns.index' },
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

const campaignRoutes: RouteRecordRaw = {
  path: '/campaigns',
  name: 'campaigns',
  meta: {
    layout: 'DashboardLayout',
    requiresAuth: true,
    breadcrumb: [baseBreadcrumb],
    title: 'campaigns'
  },
  children: [
    {
      path: '',
      name: 'campaigns.index',
      component: () => import('@/pages/campaigns/CampaignPage.vue'),
      meta: { title: 'campaigns_list' }
    },
    {
      path: 'create',
      name: 'campaigns.create',
      component: () => import('@/pages/campaigns/form/CampaignFormPage.vue'),
      meta: {
        breadcrumb: generateBreadcrumb('actions.create', 'campaigns.create'),
        title: 'create_campaign'
      },
    },
    {
      path: 'edit/:id',
      name: 'campaigns.edit',
      component: () => import('@/pages/campaigns/form/CampaignFormPage.vue'),
      beforeEnter: beforeEnterWithBreadcrumb('actions.edit', 'campaigns.edit'),
      meta: { title: 'edit_campaign' }
    },
  ],
}

export default campaignRoutes
