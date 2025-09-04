<script setup lang="ts">
import { ref } from 'vue'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import { useSidebarRoutes } from '@/components/atoms/sidebars/composables/useSidebarRoutes'
import SidebarDrawer from '@/components/atoms/sidebars/SidebarDrawer.vue'

const visible = ref(false)
const { routes } = useSidebarRoutes()
</script>

<template>
  <div class="w-full flex flex-col">
    <div class="w-full flex justify-start p-2 bg-[var(--p-card-background)]">
      <AppButton
        icon="pi pi-bars"
        text
        rounded
        @click="visible = true"
        class="w-auto !text-black dark:!text-[var(--p-primary-color)] px-4"
      />
    </div>

    <SidebarDrawer
      v-model:visible="visible"
      :routes="routes"
    />
  </div>
</template>
