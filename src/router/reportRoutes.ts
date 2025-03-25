import { type RouteRecordRaw } from 'vue-router'

const baseBreadcrumb = {
  text: 'report.reports',
  to: { name: 'report.index' },
  active: false
}

const generateBreadcrumb = (text: string, name: string) => [
  baseBreadcrumb,
  {
    text,
    to: { name },
    active: true
  }
]

const sendRoutes: RouteRecordRaw = {
  path: '/report',
  name: 'report',
  meta: { layout: 'DashboardLayout', requiresAuth: true, breadcrumb: [baseBreadcrumb] },
  children: [
    {
      path: '',
      name: 'report.index',
      component: () => import('@/pages/reports/ReportsPage.vue'),
    },
    {
      path: 'audit',
      name: 'report.audit',
      component: () => import('@/pages/reports/pages/audit/AuditPage.vue'),
      meta: { breadcrumb: generateBreadcrumb('report.audit', 'report.audit') },
    },
  ],
}
export default sendRoutes