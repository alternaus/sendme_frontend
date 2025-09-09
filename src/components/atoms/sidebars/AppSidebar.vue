<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

//import Campaigns from '@/assets/svg/sidebar/campaigns.svg?component'
import Logo from '@/assets/svg/sidebar/logo.svg?component'
import SidebarItem from '@/components/atoms/sidebars/components/SidebarItem.vue'
import SidebarToggle from '@/components/atoms/sidebars/components/SidebarToggle.vue'
import UserProfileMenu from '@/components/atoms/sidebars/components/UserProfileMenu.vue'
import { useSidebarRoutes } from '@/components/atoms/sidebars/composables/useSidebarRoutes'

const emit = defineEmits<{
  'update:expanded': [value: boolean]
}>()

const { routes } = useSidebarRoutes()

const isPinned = ref(false)
const isHovering = ref(false)
const HOVER_OPEN_DELAY = 120
const HOVER_CLOSE_DELAY = 120
let hoverOpenTimer: ReturnType<typeof setTimeout> | null = null
let hoverCloseTimer: ReturnType<typeof setTimeout> | null = null
const isDesktop = ref(true)
let mq: MediaQueryList | null = null

const updateDesktop = () => {
  isDesktop.value = mq ? mq.matches : true
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    mq = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px)')
    updateDesktop()
    mq?.addEventListener('change', updateDesktop)

    try {
      const saved = localStorage.getItem('app.sidebar.pinned')
      if (saved === '1') {
        isPinned.value = true
        // Notificar al layout que debe iniciar expandido (anclado)
        emit('update:expanded', true)
      } else {
        // Asegurar estado inicial coherente en layout
        emit('update:expanded', false)
      }
    } catch {}
  }
})

onBeforeUnmount(() => {
  mq?.removeEventListener('change', updateDesktop)
  if (hoverOpenTimer) clearTimeout(hoverOpenTimer)
  if (hoverCloseTimer) clearTimeout(hoverCloseTimer)
})

const uiExpanded = computed(() => isPinned.value || (isHovering.value && isDesktop.value))

const toggleExpand = () => {
  isPinned.value = !isPinned.value
  try {
    localStorage.setItem('app.sidebar.pinned', isPinned.value ? '1' : '0')
  } catch {}
  emit('update:expanded', isPinned.value)
}

const onMouseEnter = () => {
  if (!isDesktop.value) return
  if (hoverCloseTimer) {
    clearTimeout(hoverCloseTimer)
    hoverCloseTimer = null
  }
  if (hoverOpenTimer) clearTimeout(hoverOpenTimer)
  hoverOpenTimer = setTimeout(() => {
    isHovering.value = true
  }, HOVER_OPEN_DELAY)
}

const onMouseLeave = () => {
  if (!isDesktop.value) return
  if (hoverOpenTimer) {
    clearTimeout(hoverOpenTimer)
    hoverOpenTimer = null
  }
  if (hoverCloseTimer) clearTimeout(hoverCloseTimer)
  hoverCloseTimer = setTimeout(() => {
    isHovering.value = false
  }, HOVER_CLOSE_DELAY)
}

//const handleNotifications = () => {
  // Lógica para manejar notificaciones
//}
</script>

<template>
  <div
    class="w-16 h-screen bg-[var(--p-primary-color)] dark:bg-neutral-800 text-black dark:text-white flex flex-col fixed top-0 left-0 transition-all duration-300 ease-in-out z-[70]"
    :class="{ 'w-[200px]': uiExpanded }"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div class="py-2 px-2 relative">
      <router-link to="/" class="flex items-center justify-center">
        <Logo class="h-16 w-16 transition-all duration-500 ease-in-out dark:fill-[var(--p-primary-color)]" />
      </router-link>
      <SidebarToggle
        v-if="uiExpanded"
        :is-expanded="isPinned"
        @toggle="toggleExpand"
        class="absolute right-2 top-1/2 -translate-y-1/2 !mx-0 !mt-0"
      />
    </div>

  <div class="flex-1 flex flex-col items-center overflow-y-auto">
      <ul class="p-1 space-y-1 w-full">
        <SidebarItem
          v-for="route in routes"
          :key="route.path"
          :icon="route.icon"
          :label="route.title"
          :route="route.path"
          :is-expanded="uiExpanded"
          :is-active="$route.path.startsWith(route.path)"
        />

        <!-- <SidebarItem
          :icon="Campaigns"
          :is-expanded="uiExpanded"
          label="Notificaciones"
          @click="handleNotifications"
        /> -->
      </ul>
    </div>

  <UserProfileMenu :is-expanded="uiExpanded" />
  </div>
</template>
