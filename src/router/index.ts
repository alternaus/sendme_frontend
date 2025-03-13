import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import { useBreadcrumbStore } from '@/stores/breadcrumbStore'

import campaignRoutes from './campaignRoutes'
import contactRoutes from './contactRoutes'
import settingRoutes from './settingRoutes'
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/home/HomePage.vue'),
    meta: { layout: 'DashboardLayout', requiresAuth: true },
  },
  contactRoutes,
  campaignRoutes,
  settingRoutes,
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
  const breadcrumbStore = useBreadcrumbStore();
  const breadcrumbs = Array.isArray(to.meta.breadcrumb) ? to.meta.breadcrumb : [];

  breadcrumbStore.setBreadcrumbs(breadcrumbs);

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
