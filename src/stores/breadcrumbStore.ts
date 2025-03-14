import { defineStore } from 'pinia';

interface BreadcrumbTo {
  name: string
  params?: Record<string, string | number>
}

interface BreadcrumbItem {
  text: string
  to?: BreadcrumbTo | null
  url?: string
  active?: boolean
}


export const useBreadcrumbStore = defineStore('breadcrumb', {
  state: () => ({
    breadcrumbs: [] as BreadcrumbItem[]
  }),
  actions: {
    setBreadcrumbs(breadcrumbs: BreadcrumbItem[]) {
      this.breadcrumbs = [];
      this.breadcrumbs = breadcrumbs.filter(item => !!item.text)
    }
  }
});
