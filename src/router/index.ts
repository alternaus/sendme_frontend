import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import { useBreadcrumbStore } from '@/stores/breadcrumbStore'

import accountRoutes from './accountRoutes'
import authRoutes from './authRoutes'
import buyRoutes from './buyRoutes'
import campaignRoutes from './campaignRoutes'
import contactRoutes from './contactRoutes'
import enrollmentRoutes from './enrollmentRoutes'
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
  authRoutes,
  enrollmentRoutes,
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
    return next({ name: 'not-found' })
  }

  if (to.meta.requiresAuth && !token) {
    return next('/auth/sign-in')
  }

  // Permitir acceso a rutas de enrollment incluso si el usuario está autenticado
  if (!to.meta.requiresAuth && token && !to.path.startsWith('/enrollment')) {
    return next('/')
  }

  next()
})



export default router
