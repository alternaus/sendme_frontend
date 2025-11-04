import { type RouteRecordRaw } from 'vue-router'

const baseBreadcrumb = {
  text: 'reports.reports',
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
  meta: {
    layout: 'DashboardLayout',
    requiresAuth: true,
    breadcrumb: [baseBreadcrumb],
    title: 'common.titles.reports'
  },
  children: [
    {
      path: '',
      name: 'report.index',
      component: () => import('@/pages/reports/ReportsPage.vue'),
      meta: { title: 'common.titles.reports_list' }
    },
    {
      path: 'audit',
      name: 'report.audit',
      component: () => import('@/pages/reports/pages/audit/AuditPage.vue'),
      meta: {
        breadcrumb: generateBreadcrumb('report.audit', 'report.audit'),
        title: 'common.titles.audit_report'
      },
    },
    {
      path: 'message',
      name: 'report.message',
      component: () => import('@/pages/reports/pages/message/MessagePage.vue'),
      meta: {
        breadcrumb: generateBreadcrumb('general.messages', 'report.message'),
        title: 'common.titles.messages_report'
      },
    },
    {
      path: 'dispatches',
      name: 'report.dispatches',
      component: () => import('@/pages/reports/pages/dispatches/DispatchesPage.vue'),
      meta: {
        breadcrumb: generateBreadcrumb('general.dispatches', 'report.dispatches'),
        title: 'common.titles.dispatches_report'
      },
    },
  ],
}
export default sendRoutes
