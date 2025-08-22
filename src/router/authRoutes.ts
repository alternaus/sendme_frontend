import { type RouteRecordRaw } from 'vue-router'


const authRoutes: RouteRecordRaw = {
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
    {
      path: 'google/callback',
      name: 'sign-in-google',
      component: () => import('@/pages/auth/sign-in/SignInGooglePage.vue'),
      meta: { layout: 'AuthLayout', requiresAuth: false, title: 'sign_in_with_google' },
    },
  ],
}

export default authRoutes
