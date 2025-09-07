import { computed } from 'vue'

import { useI18n } from 'vue-i18n'

import Buy from '@/assets/svg/sidebar/buy.svg?component'
import Campaigns from '@/assets/svg/sidebar/campaigns.svg?component'
import Contacts from '@/assets/svg/sidebar/contacts.svg?component'
import Reports from '@/assets/svg/sidebar/reports.svg?component'
import Send from '@/assets/svg/sidebar/send.svg?component'
import Settings from '@/assets/svg/sidebar/settings.svg?component'
import Whatsapp from '@/assets/svg/sidebar/whatsapp.svg?component'

export const useSidebarRoutes = () => {
  const { t } = useI18n()

  const routes = computed(() => [
    { path: '/contacts', icon: Contacts, title: t('contact.contacts') },
    { path: '/campaigns', icon: Campaigns, title: t('campaign.general.campaigns') },
    { path: '/whatsapp', icon: Whatsapp, title: 'Whatsapp' },
    { path: '/send', icon: Send, title: t('general.send') },
    { path: '/report', icon: Reports, title: t('reports.reports') },
    { path: '/buy', icon: Buy, title: t('general.buy') },
    { path: '/settings', icon: Settings, title: t('general.settings') },
  ])

  return {
    routes,
  }
}
