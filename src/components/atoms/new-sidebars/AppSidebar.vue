<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useDark, useToggle } from '@vueuse/core'

import Menu from 'primevue/menu'
import { useConfirm } from 'primevue/useconfirm'

import { ChevronDown } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

import Alterna from '@/assets/svg/alterna.svg?component'
import AlternaMobile from '@/assets/svg/alterna-mobile.svg?component'
import Logo from '@/assets/svg/sidebar/logo.svg?component'
import AppAvatar from '@/components/atoms/avatar/AppAvatar.vue'
import SidebarItem from '@/components/atoms/new-sidebars/components/SidebarItem.vue'
import SidebarToggle from '@/components/atoms/new-sidebars/components/SidebarToggle.vue'
import { useSidebarRoutes } from '@/components/atoms/new-sidebars/composables/useSidebarRoutes'
import { useAuthStore } from '@/stores/useAuthStore'

const emit = defineEmits<{
  'update:expanded': [value: boolean]
}>()

const { routes } = useSidebarRoutes()
const { t } = useI18n()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const confirm = useConfirm()
const isDark = useDark({ selector: 'html' })
const toggleDark = useToggle(isDark)

const userMenu = ref()
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
        emit('update:expanded', true)
      } else {
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

const toggleUserMenu = (event: Event) => {
  userMenu.value.toggle(event)
}

const userInitials = computed(() => {
  if (!user.value?.name) return 'U'
  return user.value.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
})

const userName = computed(() => user.value?.name || 'Usuario')
const userEmail = computed(() => user.value?.email || 'usuario@example.com')

const confirmLogout = () => {
  confirm.require({
    message: t('common.auth.sure_logout'),
    header: t('common.auth.confirm_logout'),
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined',
    rejectLabel: t('common.general.cancel'),
    acceptLabel: t('common.auth.logout'),
    acceptClass: 'p-button-danger',
    accept: () => {
      authStore.logout()
    },
  })
}

const userMenuItems = computed(() => [
  {
    label: t('common.theme.dark'),
    icon: isDark.value ? 'pi pi-sun' : 'pi pi-moon',
    command: () => toggleDark(),
  },
  {
    separator: true,
  },
  {
    label: t('common.auth.logout'),
    icon: 'pi pi-sign-out',
    command: confirmLogout,
  },
])
</script>

<template>
  <div
    class="w-16 h-screen flex flex-col fixed top-0 left-0 transition-all duration-300 ease-in-out z-[70]"
    :class="[
      { 'w-[200px]': uiExpanded },
      isDark
        ? 'bg-[var(--p-surface-900)] text-[var(--p-surface-50)]'
        : 'bg-[var(--p-primary-color)] text-[var(--p-primary-contrast-color)]',
    ]"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div class="py-2 px-2 relative">
      <router-link to="/" class="flex items-center justify-center h-16">
        <Logo
          :class="
            isDark
              ? 'h-16 w-16 transition-all duration-500 ease-in-out fill-[var(--p-primary-color)]'
              : 'h-16 w-16 transition-all duration-500 ease-in-out fill-black'
          "
        />
      </router-link>
      <SidebarToggle
        v-if="uiExpanded"
        :is-expanded="isPinned"
        @toggle="toggleExpand"
        class="absolute right-2 top-1/2 -translate-y-1/2"
      />
    </div>

    <div class="flex-1 flex flex-col overflow-y-auto px-2 py-3">
      <ul class="space-y-1 w-full">
        <SidebarItem
          v-for="route in routes"
          :key="route.path"
          :icon="route.icon"
          :label="route.title"
          :route="route.path"
          :is-expanded="uiExpanded"
          :is-active="$route.path.startsWith(route.path)"
        />
      </ul>
    </div>

    <!-- Perfil de usuario y logo Nebula -->
    <div class="relative mt-auto">
      <!-- Perfil de usuario -->
      <div
        @click="toggleUserMenu"
        class="flex items-center p-3 cursor-pointer transition-all duration-300 rounded-lg mx-2 mb-2"
        :class="[
          {
            'justify-center': !uiExpanded,
            'gap-3': uiExpanded,
          },
          isDark ? 'hover:bg-[var(--p-surface-800)]' : 'hover:bg-[var(--p-primary-contrast-color)]/10',
        ]"
      >
        <div class="relative">
          <AppAvatar
            class="flex-shrink-0 !w-9 !h-9 !text-xs ring-2"
            :class="[
              isDark
                ? '!bg-[var(--p-primary-color)] !text-[var(--p-primary-contrast-color)] ring-[var(--p-primary-color)]/20'
                : '!bg-black !text-[var(--p-primary-color)] ring-[var(--p-primary-contrast-color)]/30'
            ]"
            :label="userInitials"
            size="large"
          />
        </div>

        <div
          v-if="uiExpanded"
          class="flex flex-col min-w-0 transition-all duration-300 ease-in-out overflow-hidden flex-1"
        >
          <span
            class="text-sm font-semibold truncate"
            :class="isDark ? 'text-[var(--p-primary-color)]' : 'text-black'"
          >
            {{ userName }}
          </span>
          <span
            class="text-xs opacity-70 truncate"
            :class="isDark ? 'text-[var(--p-primary-color)]' : 'text-black'"
          >
            {{ userEmail }}
          </span>
        </div>

        <ChevronDown
          v-if="uiExpanded"
          :size="14"
          class="transition-transform duration-200 opacity-60"
          :class="isDark ? 'text-[var(--p-primary-color)]' : 'text-black'"
        />
      </div>

      <!-- Menu de usuario -->
      <Menu ref="userMenu" :model="userMenuItems" :popup="true" />

      <!-- Alterna Logo -->
      <div class="flex items-center justify-center pb-4 px-2">
        <Alterna
          v-if="uiExpanded"
          class="h-4 w-auto transition-all duration-300"
          :class="isDark ? 'text-[var(--p-primary-color)]' : 'text-black'"
        />
        <AlternaMobile
          v-else
          class="h-4 w-4 transition-all duration-300"
          :class="isDark ? 'text-[var(--p-primary-color)]' : 'text-black'"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.2s ease;
  transform-origin: left center;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
