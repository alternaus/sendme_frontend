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
  <div
    class="grid grid-rows-[auto_1fr] lg:grid-cols-[140px_1fr] lg:grid-rows-1 min-h-screen w-full"
  >
    <div class="hidden lg:block h-full">
      <AppSidebar />
    </div>

    <div class="lg:hidden w-full h-[56px] bg-white dark:bg-neutral-900 shadow-md z-50">
      <AppSidebarMobile />
    </div>

    <div class="p-4 w-full max-w-screen-2xl mx-auto overflow-auto">
      <slot />
    </div>
  </div>
</template>
