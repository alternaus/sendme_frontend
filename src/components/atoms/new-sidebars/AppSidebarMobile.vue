<script setup lang="ts">
import { ref } from 'vue'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import MobileUserMenu from '@/components/atoms/new-sidebars/components/MobileUserMenu.vue'
import SidebarDrawer from '@/components/atoms/new-sidebars/components/SidebarDrawer.vue'
import { useSidebarRoutes } from '@/components/atoms/new-sidebars/composables/useSidebarRoutes'

const visible = ref(false)
const { routes } = useSidebarRoutes()
</script>

<template>
  <div class="w-full flex flex-col">
    <div class="w-full flex items-center p-2 bg-[var(--p-card-background)]">
      <div class="flex items-center justify-start" style="width: 48px">
        <AppButton
          icon="pi pi-bars"
          text
          rounded
          @click="visible = true"
          class="!text-black dark:!text-[var(--p-primary-color)]"
        />
      </div>
      <div class="flex-1"></div>
      <div class="flex items-center justify-end" style="width: 48px">
        <MobileUserMenu />
      </div>
    </div>

    <SidebarDrawer v-model:visible="visible" :routes="routes" />
  </div>
</template>
