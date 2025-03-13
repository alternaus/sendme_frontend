import { type RouteRecordRaw } from 'vue-router'

const campaignRoutes: RouteRecordRaw = {
  path: '/campaigns',
  name: 'campaigns',
  meta: { layout: 'DashboardLayout', requiresAuth: true },
  children: [
    {
      path: '',
      name: 'campaigns.index',
      component: () => import('@/pages/campaigns/CampaignPage.vue'),
    },
    {
      path: 'create',
      name: 'campaigns.create',
      component: () => import('@/pages/campaigns/form/CampaignFormPage.vue'),
    },
    {
      path: 'edit/:id',
      name: 'campaigns.edit',
      component: () => import('@/pages/campaigns/form/CampaignFormPage.vue'),
    },
  ],
}

export default campaignRoutes
