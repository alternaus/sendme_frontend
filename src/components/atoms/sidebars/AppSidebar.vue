<script lang="ts">
import { computed, defineComponent, ref } from 'vue'

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
  setup(props, { emit }) {
    const { t } = useI18n()
    const isExpanded = ref(false)
    const routes = computed(() => [
      { path: '/contacts', icon: Contacts, title: t('contact.contacts') },
      { path: '/campaigns', icon: Campaigns, title: t('campaign.campaigns') },
      { path: '/whatsapp', icon: Whatsapp, title: 'Whatsapp' },
      { path: '/send', icon: Send, title: t('general.send') },
      { path: '/report', icon: Reports, title: t('report.reports') },
      { path: '/buy', icon: Buy, title: t('general.buy') },
      { path: '/settings', icon: Settings, title: t('general.settings') },
    ])

    const toggleExpand = () => {
      isExpanded.value = !isExpanded.value
      emit('update:expanded', isExpanded.value)
    }

    return {
      routes,
      isExpanded,
      toggleExpand,
    }
  },
  emits: ['update:expanded'],
})
</script>

<template>
  <div
    class="w-[80px] h-screen bg-[var(--p-primary-color)] dark:bg-neutral-800 text-black dark:text-white flex flex-col fixed top-0 left-0 transition-all duration-300"
    :class="{ 'w-[200px]': isExpanded }"
  >
    <div class="flex items-center p-3">
      <router-link to="/" class="flex-1 flex items-center justify-center">
        <Logo class="h-16 w-16 transition-colors duration-300 dark:fill-[var(--p-primary-color)]" />
      </router-link>
    </div>

    <div class="flex-1 flex flex-col items-center overflow-y-auto">
      <ul class="p-1.5 space-y-3 w-full">
        <li class="w-full" v-for="(route, index) in routes" :key="index">
          <router-link
            :to="route.path"
            active-class="bg-black dark:bg-[var(--p-primary-color)] transition-colors duration-300"
            class="group flex items-center p-2 rounded-lg transition-colors duration-300 text-gray-800 hover:bg-primary-400 dark:text-white dark:hover:bg-[var(--p-primary-color)]"
            :class="{ 'justify-center': !isExpanded }"
          >
            <div class="flex items-center" :class="{ 'w-full': isExpanded }">
              <component
                :is="route.icon"
                class="w-8 h-8 transition-colors duration-300 flex-shrink-0"
                :class="{
                  'dark:fill-black fill-[var(--p-primary-color)]': $route.path.startsWith(route.path),
                  'group-hover:fill-black dark:group-hover:fill-black': true,
                  'dark:fill-[var(--p-primary-color)]': !$route.path.startsWith(route.path),
                }"
              />
              <span
                class="text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ml-3"
                :class="{
                  'hidden': !isExpanded,
                  'opacity-100': isExpanded,
                  'dark:text-black text-[var(--p-primary-color)]': $route.path.startsWith(route.path),
                  'group-hover:text-black dark:group-hover:text-black': true,
                  'dark:text-[var(--p-primary-color)]': !$route.path.startsWith(route.path),
                }"
              >
                {{ route.title }}
              </span>
            </div>
          </router-link>
        </li>
      </ul>
    </div>

    <div class="flex justify-center p-4">
      <button
        @click="toggleExpand"
        class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-300"
        :class="{ 'rotate-180': isExpanded }"
      >
        <i class="pi pi-chevron-right text-lg"></i>
      </button>
    </div>
  </div>
</template>
