<script lang="ts">
import { defineComponent, provide,ref } from 'vue'

import AppSidebar from '@/components/atoms/sidebars/AppSidebar.vue'
import AppSidebarMobile from '@/components/atoms/sidebars/AppSidebarMobile.vue'

export default defineComponent({
  components: {
    AppSidebar,
    AppSidebarMobile,
  },
  setup() {
    const isSidebarExpanded = ref(false)
    provide('isSidebarExpanded', isSidebarExpanded)

    return {
      isSidebarExpanded,
    }
  },
})
</script>

<template>
  <div class="flex min-h-screen w-full bg-gray-50 dark:bg-neutral-900">
    <div class="hidden lg:block h-full">
      <AppSidebar @update:expanded="isSidebarExpanded = $event" />
    </div>

    <div class="lg:hidden w-full h-[56px] bg-white dark:bg-neutral-900 shadow-md z-50 fixed top-0 left-0">
      <AppSidebarMobile />
    </div>

    <main class="flex-1 transition-all duration-300 h-screen overflow-y-auto" :class="{ 'lg:ml-[200px]': isSidebarExpanded, 'lg:ml-[80px]': !isSidebarExpanded }">
      <div class="p-4 lg:p-6 w-full max-w-screen-2xl mx-auto">
        <div class="lg:mt-0 mt-[56px]">
          <slot />
        </div>
      </div>
    </main>
  </div>
</template>
