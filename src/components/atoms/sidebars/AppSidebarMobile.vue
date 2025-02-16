<script lang="ts">
import { defineComponent, ref } from 'vue'

import PrimeButton from 'primevue/button'
import Drawer from 'primevue/drawer'

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

    return {
      visible,
      routes,
    }
  },
})
</script>

<template>
  <div>
    <PrimeButton icon="pi pi-bars" text rounded @click="visible = true" class="ml-2 mt-2" />

    <Drawer v-model:visible="visible" :modal="true" position="left" style="width: 14rem">
      <template #container="{ closeCallback }">
        <div
          class="flex flex-col h-full bg-[var(--p-primary-color)] dark:bg-neutral-800 text-white"
        >
          <div class="flex justify-between items-center p-4">
            <Logo class="h-16 w-16 cursor-pointer" @click="closeCallback()" />
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
                  class="group flex items-center gap-3 p-3 rounded-lg transition-all duration-300"
                  :class="{
                    'bg-[var(--p-primary-color)] text-black': $route.path.startsWith(route.path),
                    'hover:bg-gray-700': !$route.path.startsWith(route.path),
                    'dark:bg-[var(--p-primary-color)] dark:text-black': $route.path.startsWith(
                      route.path,
                    ),
                    'dark:text-[var(--p-primary-color)] dark:hover:text-black':
                      !$route.path.startsWith(route.path),
                  }"
                  v-tooltip.left="route.title"
                  @click="closeCallback()"
                >
                  <component
                    :is="route.icon"
                    class="w-6 h-6 transition-all duration-300"
                    :class="{
                      'fill-black': $route.path.startsWith(route.path),
                      'fill-black dark:fill-[var(--p-primary-color)] dark:hover:fill-black':
                        !$route.path.startsWith(route.path),
                    }"
                  />

                  <span
                    class="text-sm transition-all duration-300"
                    :class="{
                      'text-black': $route.path.startsWith(route.path),
                      'text-black dark:text-[var(--p-primary-color)] dark:hover:text-black':
                        !$route.path.startsWith(route.path),
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
