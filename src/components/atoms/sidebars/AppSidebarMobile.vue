<script lang="ts">
import { defineComponent, ref } from 'vue'
import PrimeButton from 'primevue/button'
import Drawer from 'primevue/drawer'
import Logo from '@/assets/svg/sidebar/logo.svg?component'
import Buy from '@/assets/svg/sidebar/buy.svg?component'
import Campaigns from '@/assets/svg/sidebar/campaigns.svg?component'
import Contacts from '@/assets/svg/sidebar/contacts.svg?component'
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
  },
  setup() {
    const visible = ref(false)

    const routes = [
      { path: '/contacts', icon: Contacts, title: 'Contacts' },
      { path: '/campaigns', icon: Campaigns, title: 'Campaigns' },
      { path: '/whatsapp', icon: Whatsapp, title: 'Whatsapp' },
      { path: '/send', icon: Send, title: 'Send' },
      { path: '/reports', icon: Reports, title: 'Reports' },
      { path: '/buy', icon: Buy, title: 'Buy' },
      { path: '/settings', icon: Settings, title: 'Settings' },
    ]

    const redirectToHome = () => {
      window.location.href = '/'
    }

    return {
      visible,
      routes,
      redirectToHome,
    }
  },
})
</script>
<template>
  <div class="md:hidden">
    <PrimeButton icon="pi pi-bars" text rounded @click="visible = true" />
    <Drawer v-model:visible="visible" :modal="true" position="left" style="width: 12rem">
      <template #container="{ closeCallback }">
        <div
          class="flex flex-col h-full bg-[var(--p-primary-color)] dark:bg-neutral-800 text-white"
        >
          <div class="flex justify-between items-center p-4">
            <Logo
              class="h-16 w-16 cursor-pointer m-auto dark:fill-white"
              @click="(redirectToHome(), closeCallback())"
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
                  active-class="bg-black dark:bg-[var(--p-primary-color)]"
                  class="group flex items-center gap-2 p-3 rounded-lg transition-all duration-300 text-white hover:bg-gray-700"
                  v-tooltip.left="route.title"
                  @click="closeCallback()"
                >
                  <component
                    :is="route.icon"
                    class="w-6 h-6 transition-all duration-300 active:fill-white"
                  />
                  <span class="text-sm">{{ route.title }}</span>
                </router-link>
              </li>
            </ul>
          </div>
        </div>
      </template>
    </Drawer>
  </div>
</template>
