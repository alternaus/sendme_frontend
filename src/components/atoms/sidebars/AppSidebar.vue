<script lang="ts">
import { defineComponent } from 'vue'

import { useI18n } from 'vue-i18n'

import Buy from '@/assets/svg/sidebar/buy.svg?component'
import Campaigns from '@/assets/svg/sidebar/campaigns.svg?component'
import Contacts from '@/assets/svg/sidebar/contacts.svg?component'
import Logo from '@/assets/svg/sidebar/logo.svg?component'
import Reports from '@/assets/svg/sidebar/reports.svg?component'
import Send from '@/assets/svg/sidebar/send.svg?component'
import Settings from '@/assets/svg/sidebar/settings.svg?component'
import Whatsapp from '@/assets/svg/sidebar/whatsapp.svg?component'

export default defineComponent({
  name: 'AppSidebar',
  components: {
    Logo,
    Buy,
    Campaigns,
    Contacts,
    Reports,
    Send,
    Settings,
    Whatsapp,
  },
  setup() {
    const { t } = useI18n()
    const routes = [
      { path: '/contacts', icon: Contacts, title: t('contact.contacts') },
      { path: '/campaigns', icon: Campaigns, title: t('campaign.campaigns') },
      { path: '/whatsapp', icon: Whatsapp, title: 'Whatsapp' },
      { path: '/send', icon: Send, title: t('general.send') },
      { path: '/reports', icon: Reports, title: t('report.reports') },
      { path: '/buy', icon: Buy, title: t('general.buy') },
      { path: '/settings', icon: Settings, title: t('general.settings') },
    ] 

    return {
      routes,
    }
  },
})
</script>
<template>
  <div
    class="w-[140px] h-screen bg-[var(--p-primary-color)] dark:bg-neutral-800 text-black dark:text-white flex flex-col fixed top-0 left-0 transition-all duration-300"
  >
    <div class="flex items-center justify-center py-4">
      <router-link to="/" class="flex items-center justify-center">
        <Logo class="h-24 w-24 transition-colors duration-300 dark:fill-[var(--p-primary-color)]" />
      </router-link>
    </div>

    <div class="flex-1 flex flex-col items-center overflow-y-auto">
      <ul class="p-2 space-y-4">
        <li class="w-fit" v-for="(route, index) in routes" :key="index">
          <router-link
            :to="route.path"
            active-class="bg-black dark:bg-[var(--p-primary-color)] transition-colors duration-300"
            class="group flex justify-center items-center p-2 rounded-lg transition-colors duration-300 text-gray-800 hover:bg-primary-400 dark:text-white dark:hover:bg-[var(--p-primary-color)]"
            v-tooltip.left="route.title"
          >
            <component
              :is="route.icon"
              class="w-12 h-12 transition-colors duration-300"
              :class="{
                'dark:fill-black fill-[var(--p-primary-color)]': $route.path.startsWith(route.path),
                'group-hover:fill-black dark:group-hover:fill-black': true,
                'dark:fill-[var(--p-primary-color)]': !$route.path.startsWith(route.path),
              }"
            />
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>
