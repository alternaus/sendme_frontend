<script lang="ts">
import { computed, defineComponent, onMounted, provide, ref } from 'vue'
import { useRoute } from 'vue-router'

import AppSidebar from '@/components/atoms/sidebars/AppSidebar.vue'
import AppSidebarMobile from '@/components/atoms/sidebars/AppSidebarMobile.vue'
import { useWebSocket } from '@/composables/useWebSocket'
import { useAuthStore } from '@/stores/useAuthStore'

export default defineComponent({
  components: {
    AppSidebar,
    AppSidebarMobile,
  },
  setup() {
    const isSidebarExpanded = ref(false)
    provide('isSidebarExpanded', isSidebarExpanded)

    const route = useRoute()
    const currentPath = computed(() => route.fullPath)
    const authStore = useAuthStore()
    const { connect, isConnected } = useWebSocket()

    // Iniciar conexión WebSocket cuando el componente se monta
    onMounted(() => {
      if (authStore.isAuthenticated) {
        connect()
      }
    })

    // Proveer el estado de conexión del WebSocket a los componentes hijos
    provide('wsConnected', isConnected)

    return {
      isSidebarExpanded,
      currentPath,
      isConnected
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

    <main class="flex-1 transition-all duration-300 h-screen overflow-y-auto"
      :class="{ 'lg:ml-[200px]': isSidebarExpanded, 'lg:ml-[80px]': !isSidebarExpanded }">
      <!-- Indicador de estado de conexión WebSocket -->
      <div v-if="!isConnected"
        class="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm shadow-lg flex items-center space-x-2">
        <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>
        <span>{{ $t('general.disconnected') }}</span>
      </div>

      <div class="p-4 lg:p-6 w-full max-w-screen-2xl mx-auto">
        <div class="lg:mt-0 mt-[56px]">
          <transition name="page" mode="out-in">
            <div :key="currentPath">
              <slot />
            </div>
          </transition>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(15px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}
</style>
