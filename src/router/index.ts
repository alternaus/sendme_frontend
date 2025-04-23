import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import { useBreadcrumbStore } from '@/stores/breadcrumbStore'

import accountRoutes from './accountRoutes'
import buyRoutes from './buyRoutes'
import campaignRoutes from './campaignRoutes'
import contactRoutes from './contactRoutes'
import reportRoutes from './reportRoutes'
import sendRoutes from './sendRoutes'
import settingRoutes from './settingRoutes'
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/home/HomePage.vue'),
    meta: { layout: 'DashboardLayout', requiresAuth: true, title: 'home' },
  },
  contactRoutes,
  campaignRoutes,
  settingRoutes,
  sendRoutes,
  reportRoutes,
  accountRoutes,
  buyRoutes,
  {
    path: '/auth',
    name: 'auth',
    meta: { layout: 'AuthLayout', requiresAuth: false, title: 'auth' },
    redirect: '/auth/sign-in',
    children: [
      {
        path: 'sign-in',
        name: 'sign-in',
        component: () => import('@/pages/auth/sign-in/SignInPage.vue'),
        meta: { title: 'sign_in' },
      },
      {
        path: 'sign-up',
        name: 'sign-up',
        component: () => import('@/pages/auth/sign-up/SignUpPage.vue'),
        meta: { title: 'sign_up' },
      },
    ],
  },
  {
    path: '/auth/google/callback',
    name: 'sign-in-google',
    component: () => import('@/pages/auth/sign-in/SignInGooglePage.vue'),
    meta: { layout: 'AuthLayout', requiresAuth: false, title: 'sign_in_with_google' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/not-found/NotFoundPage.vue'),
    meta: { layout: 'DefaultLayout', requiresAuth: false, title: 'not_found' },
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

  if (to.name === 'not-found') {
    return next()
  }


  if (to.matched.length === 0) {
    console.warn('⚠️ Ruta no encontrada. Redirigiendo a /not-found')
    return next({ name: 'not-found' })
  }

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
