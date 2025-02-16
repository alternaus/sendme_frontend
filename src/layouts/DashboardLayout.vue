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
  <div class="flex min-h-screen w-full">
    <div class="hidden md:flex w-[140px] h-full">
      <AppSidebar />
    </div>

    <div class="fixed z-50 md:hidden">
      <AppSidebarMobile />
    </div>

    <div class="flex flex-col flex-1 h-full p-4 items-start w-full max-w-screen-2xl mx-auto">
      <slot />
    </div>
  </div>
</template>
