import { computed } from 'vue'

import { useI18n } from 'vue-i18n'

import Buy from '@/assets/svg/sidebar/buy.svg?component'
import Campaigns from '@/assets/svg/sidebar/campaigns.svg?component'
import Contacts from '@/assets/svg/sidebar/contacts.svg?component'
import Reports from '@/assets/svg/sidebar/reports.svg?component'
import Send from '@/assets/svg/sidebar/send.svg?component'
import Settings from '@/assets/svg/sidebar/settings.svg?component'
import Whatsapp from '@/assets/svg/sidebar/whatsapp.svg?component'
import { useAuthStore } from '@/stores/useAuthStore'

export const useSidebarRoutes = () => {
  const { t } = useI18n()
  const authStore = useAuthStore()

  const isAdmin = computed(() => authStore.user?.role?.name === 'Admin')

  const routes = computed(() => {
    const baseRoutes = [
      { path: '/contacts', icon: Contacts, title: t('common.contact.contacts') },
      { path: '/campaigns', icon: Campaigns, title: t('common.campaign.campaigns') },
      { path: '/whatsapp', icon: Whatsapp, title: 'Whatsapp' },
      { path: '/send', icon: Send, title: t('common.general.send') },
      { path: '/report', icon: Reports, title: t('common.report.reports') },
      { path: '/buy', icon: Buy, title: t('common.general.buy') },
      { path: '/settings', icon: Settings, title: t('common.general.settings') },
    ]

    if (isAdmin.value) {
      baseRoutes.push({ path: '/admin/clients', icon: Settings, title: t('custom_clients.title') })
    }

    return baseRoutes
  })

  return {
    routes,
  }
}
