import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/home/HomePage.vue'),
    meta: { layout: 'DashboardLayout', requiresAuth: true },
  },
  {
    path: '/contacts',
    name: 'contacts',
    meta: { layout: 'DashboardLayout', requiresAuth: true },
    children: [
      {
        path: '',
        name: 'contacts.index',
        component: () => import('@/pages/contacts/ContactsPage.vue'),
      },
      {
        path: 'create',
        name: 'contacts.create',
        component: () => import('@/pages/contacts/form/ContactFormPage.vue'),
      },
      {
        path: 'edit/:id',
        name: 'contacts.edit',
        component: () => import('@/pages/contacts/form/ContactFormPage.vue'),
      },
    ],
  },
  {
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
  },
  {
    path: '/auth',
    name: 'auth',
    meta: { layout: 'AuthLayout', requiresAuth: false },
    redirect: '/auth/sign-in',
    children: [
      {
        path: 'sign-in',
        name: 'sign-in',
        component: () => import('@/pages/auth/sign-in/SignInPage.vue'),
      },
      {
        path: 'sign-up',
        name: 'sign-up',
        component: () => import('@/pages/auth/sign-up/SignUpPage.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/not-found/NotFoundPage.vue'),
    meta: { layout: 'DefaultLayout', requiresAuth: false },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    console.warn('⛔ Usuario no autenticado. Redirigiendo a /auth/sign-in')
    return next('/auth/sign-in')
  }

  if (!to.meta.requiresAuth && token) {
    console.info('🔄 Usuario autenticado intentando acceder a una ruta pública. Redirigiendo a /')
    return next('/')
  }

  next()
})

export default router
