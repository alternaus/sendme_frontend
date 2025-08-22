import { type RouteRecordRaw } from 'vue-router'

const enrollmentRoutes: RouteRecordRaw = {
  path: '/enrollment',
  name: 'enrollment',
  component: () => import('@/pages/enrollment/EnrollmentPage.vue'),
  meta: { layout: 'DefaultLayout', requiresAuth: false, title: 'enrollment' },
  children: [
    {
      path: 'plans',
      name: 'enrollment-plans',
      component: () => import('@/pages/enrollment/PlansPage.vue'),
      meta: {
        layout: 'DefaultLayout',
        requiresAuth: false,
        title: 'enrollment_plans',
        breadcrumb: [
          { name: 'enrollment.plans', path: '/enrollment/plans' }
        ]
      }
    },
    {
      path: 'payment/:planId',
      name: 'enrollment-payment',
      component: () => import('@/pages/enrollment/PaymentPage.vue'),
      meta: {
        layout: 'DefaultLayout',
        requiresAuth: false,
        title: 'enrollment_payment',
        breadcrumb: [
          { name: 'enrollment.plans', path: '/enrollment/plans' },
          { name: 'enrollment.payment', path: '/enrollment/payment' }
        ]
      }
    },
    {
      path: 'confirmation',
      name: 'enrollment-confirmation',
      component: () => import('@/pages/enrollment/PaymentConfirmationPage.vue'),
      meta: {
        layout: 'DefaultLayout',
        requiresAuth: false,
        title: 'enrollment_confirmation',
        breadcrumb: [
          { name: 'enrollment.plans', path: '/enrollment/plans' },
          { name: 'enrollment.confirmation', path: '/enrollment/confirmation' }
        ]
      }
    }
  ]
}

export default enrollmentRoutes
