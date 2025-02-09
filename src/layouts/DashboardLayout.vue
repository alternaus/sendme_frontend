<script lang="ts">
import { defineComponent } from 'vue'

import AppSidebar from '@/components/atoms/sidebars/AppSidebar.vue'
import AppSidebarMobile from '@/components/atoms/sidebars/AppSidebarMobile.vue'

export default defineComponent({
  components: {
    AppSidebar,
    AppSidebarMobile,
  },
})
</script>
<template>
  <div class="h-screen w-screen grid grid-cols-1 sm:grid-cols-[140px_1fr]">
    <div class="hidden sm:block w-[140px] h-full">
      <app-sidebar />
    </div>

    <AppSidebarMobile class="sm:hidden" />

    <div class="flex flex-col h-full p-4 items-start">
      <slot />
    </div>
  </div>
</template>
