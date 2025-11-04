import type { RouteRecordRaw } from 'vue-router'

const whatsappRoutes: RouteRecordRaw = {
  path: '/whatsapp',
  name: 'whatsapp',
  children: [
    {
      path: 'signup',
      name: 'whatsapp-signup',
      component: () => import('@/pages/whatsapp/EmbeddedSignupPage.vue'),
      meta: {
        layout: 'DashboardLayout',
        requiresAuth: true,
        title: 'WhatsApp Business Signup',
      }
    }
  ]
}

export default whatsappRoutes
