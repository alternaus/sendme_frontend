import { type RouteRecordRaw } from 'vue-router'

const baseBreadcrumb = {
  text: 'contact.contacts',
  to: { name: 'contacts.index' },
  active: false
}

const generateBreadcrumb = (text: string, name: string, id?: string) => [
  baseBreadcrumb,
  {
    text,
    to: id ? { name, params: { id } } : { name },
    active: true
  }
]


const contactRoutes: RouteRecordRaw = {
  path: '/contacts',
  name: 'contacts',
  meta: {
    layout: 'DashboardLayout',
    requiresAuth: true,
    breadcrumb: [baseBreadcrumb]
  },
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
      meta: { breadcrumb: generateBreadcrumb('actions.create', 'contacts.create') }
    },
    {
      path: 'edit/:id',
      name: 'contacts.edit',
      component: () => import('@/pages/contacts/form/ContactFormPage.vue'),
      beforeEnter: (to, from, next) => {
        to.meta.breadcrumb = generateBreadcrumb('actions.edit', 'contacts.edit', to.params.id as string);
        next();
      }
    },
    {
      path: 'view/:id',
      name: 'contacts.view',
      component: () => import('@/pages/contacts/view/ContactViewPage.vue'),
      beforeEnter: (to, from, next) => {
        to.meta.breadcrumb = generateBreadcrumb('actions.view', 'contacts.view', to.params.id as string);
        next();
      }
    }
    ,
    {
      path: 'import',
      name: 'contacts.import',
      component: () => import('@/pages/contacts/import/ContactImportPage.vue'),
      meta: { breadcrumb: generateBreadcrumb('actions.import', 'contacts.import') }
    },
  ]
}

export default contactRoutes
