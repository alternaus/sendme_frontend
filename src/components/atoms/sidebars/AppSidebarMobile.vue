<script lang="ts">
import {  computed, defineComponent, ref } from 'vue'

import PrimeButton from 'primevue/button'
import Drawer from 'primevue/drawer'

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
  name: 'AppSidebarMobile',
  components: {
    PrimeButton,
    Drawer,
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
    const visible = ref(false)

    const { t } = useI18n()
    const routes = computed(() => [
      { path: '/contacts', icon: Contacts, title: t('contact.contacts') },
      { path: '/campaigns', icon: Campaigns, title: t('campaign.campaigns') },
      { path: '/whatsapp', icon: Whatsapp, title: 'Whatsapp' },
      { path: '/send', icon: Send, title: t('general.send') },
      { path: '/report', icon: Reports, title: t('report.reports') },
      { path: '/buy', icon: Buy, title: t('general.buy') },
      { path: '/settings', icon: Settings, title: t('general.settings') },
    ])
    return {
      visible,
      routes,
    }
  },
})
</script>

<template>
  <div class="w-full flex flex-col">
    <div class="w-full flex justify-start p-2 bg-[var(--p-card-background)]">
      <PrimeButton
        icon="pi pi-bars"
        text
        rounded
        @click="visible = true"
        class="w-auto !text-black dark:!text-[var(--p-primary-color)] px-4"
      />
    </div>

    <Drawer v-model:visible="visible" :modal="true" position="left" style="width: 14rem">
      <template #container="{ closeCallback }">
        <div
          class="flex flex-col h-full bg-[var(--p-primary-color)] dark:bg-neutral-800 text-white"
        >
          <div class="flex justify-between items-center p-4">
            <Logo
              class="h-16 w-16 cursor-pointer dark:fill-[var(--p-primary-color)]"
              @click="closeCallback()"
            />
            <PrimeButton
              @click="closeCallback"
              icon="pi pi-times"
              size="small"
              unstyled
              class="text-black dark:text-white"
            />
          </div>

          <div class="overflow-y-auto flex-1">
            <ul class="p-2 space-y-2">
              <li v-for="(route, index) in routes" :key="index">
                <router-link
                  :to="route.path"
                  active-class="bg-black dark:bg-[var(--p-primary-color)] transition-colors duration-300"
                  class="group flex items-center gap-3 p-3 rounded-lg transition-all duration-300 text-gray-800 hover:bg-primary-400 dark:text-white dark:hover:bg-[var(--p-primary-color)]"
                  v-tooltip.left="route.title"
                  @click="closeCallback()"
                >
                  <component
                    :is="route.icon"
                    class="w-6 h-6 transition-all duration-300"
                    :class="{
                      'dark:fill-black fill-[var(--p-primary-color)]': $route.path.startsWith(
                        route.path,
                      ),
                      'group-hover:fill-black dark:group-hover:fill-black': true,
                      'dark:fill-[var(--p-primary-color)]': !$route.path.startsWith(route.path),
                    }"
                  />

                  <span
                    class="text-sm transition-all duration-300"
                    :class="{
                      'dark:text-black text-[var(--p-primary-color)]': $route.path.startsWith(
                        route.path,
                      ),
                      'group-hover:text-black dark:group-hover:text-black': true,
                      'dark:text-[var(--p-primary-color)]': !$route.path.startsWith(route.path),
                    }"
                  >
                    {{ route.title }}
                  </span>
                </router-link>
              </li>
            </ul>
          </div>
        </div>
      </template>
    </Drawer>
  </div>
</template>
