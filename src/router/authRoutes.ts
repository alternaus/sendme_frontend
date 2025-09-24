import { type RouteRecordRaw } from 'vue-router'


const authRoutes: RouteRecordRaw = {
  path: '/auth',
  name: 'auth',
  meta: { layout: 'AuthLayout', requiresAuth: false, title: 'common.titles.auth' },
  redirect: '/auth/sign-in',
  children: [
    {
      path: 'sign-in',
      name: 'sign-in',
      component: () => import('@/pages/auth/sign-in/SignInPage.vue'),
      meta: { title: 'common.titles.sign_in' },
    },
    {
      path: 'sign-up',
      name: 'sign-up',
      component: () => import('@/pages/auth/sign-up/SignUpPage.vue'),
      meta: { title: 'common.titles.sign_up' },
    },
    {
      path: 'oauth/:provider/callback',
      name: 'oauth-callback',
      component: () => import('@/pages/auth/sign-in/SignInOAuthPage.vue'),
      meta: { layout: 'AuthLayout', requiresAuth: false, title: 'common.titles.oauth_callback' },
    },
    {
      path: 'google/callback',
      name: 'sign-in-google',
      redirect: to => `/auth/oauth/google/callback${to.fullPath.split('/callback')[1] || ''}`,
      meta: { layout: 'AuthLayout', requiresAuth: false, title: 'common.titles.oauth_callback' },
    },
    {
      path: 'forgot-password',
      name: 'forgot-password',
      component: () => import('@/pages/auth/forgot-password/ForgotPasswordPage.vue'),
      meta: { title: 'common.titles.forgot_password' },
    },
    {
      path: 'reset-password',
      name: 'reset-password',
      component: () => import('@/pages/auth/reset-password/ResetPasswordPage.vue'),
      meta: { title: 'common.titles.reset_password' },
    },
  ],
}

export default authRoutes
