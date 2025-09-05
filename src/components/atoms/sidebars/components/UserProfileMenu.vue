<script setup lang="ts">
import { computed, ref } from 'vue'

import TieredMenu from 'primevue/tieredmenu'

import AppAvatar from '@/components/atoms/avatar/AppAvatar.vue'
import { useUserMenu } from '@/components/atoms/sidebars/composables/useUserMenu'

defineProps<{
  isExpanded: boolean
}>()

const { authStore, menuItems } = useUserMenu()

const menu = ref()
const profileMenuVisible = ref(false)

const toggleMenu = (event: Event) => {
  menu.value.toggle(event)
}
const userInitials = computed(() => {
  if (authStore.user?.name) {
    return authStore.user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }
  return ''
})

const avatarColors = [
  '!bg-blue-800 !text-white',
  '!bg-green-800 !text-white',
  '!bg-purple-800 !text-white',
  '!bg-indigo-800 !text-white',
  '!bg-teal-800 !text-white',
  '!bg-rose-800 !text-white',
  '!bg-emerald-800 !text-white',
  '!bg-violet-800 !text-white',
  '!bg-cyan-800 !text-white',
  '!bg-amber-800 !text-white'
]

const randomAvatarColor = computed(() => {
  if (!authStore.user?.email) return avatarColors[0]

  let hash = 0
  for (let i = 0; i < authStore.user.email.length; i++) {
    const char = authStore.user.email.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }

  const index = Math.abs(hash) % avatarColors.length
  return avatarColors[index]
})
</script>

<template>
  <div class="relative">
    <div
      class="flex items-center p-2 cursor-pointer transition-all duration-300"
      :class="{
        'justify-center': !isExpanded,
        'gap-3': isExpanded,
      }"
      @click="toggleMenu"
    >
      <div class="relative">
        <AppAvatar class="flex-shrink-0 ring-2 ring-neutral-500/30 dark:ring-neutral-300/40" :class="randomAvatarColor" :label="userInitials" :image="authStore.user?.avatarUrl" size="large" />
      </div>

      <div
        v-if="isExpanded"
        class="flex flex-col min-w-0 transition-all duration-300 ease-in-out overflow-hidden flex-1"
      >
        <span
          class="text-sm font-semibold truncate text-neutral-800 dark:text-white"
          :title="authStore.user?.name"
        >
          {{ authStore.user?.name }}
        </span>
        <span
          class="text-xs text-neutral-500 dark:text-neutral-400 truncate"
          :title="authStore.user?.email"
        >
          {{ authStore.user?.email }}
        </span>
      </div>

      <i
        v-if="isExpanded"
        class="pi pi-chevron-down text-xs transition-transform duration-200 text-neutral-600 dark:text-neutral-300"
        :class="{ '-rotate-180': profileMenuVisible }"
      />
    </div>

    <TieredMenu
      ref="menu"
      :model="menuItems"
      :popup="true"
      class="w-56"
      :pt="{
        root: 'menu-left-positioned',
      }"
      @show="profileMenuVisible = true"
      @hide="profileMenuVisible = false"
    >
    </TieredMenu>
  </div>
</template>

<style scoped>
/* Posicionamiento del menú a la izquierda */
:deep(.menu-left-positioned) {
  position: absolute !important;
  left: -224px !important;
  top: 0 !important;
  z-index: 1000;
}

/* Ajustes de sombra para el lado izquierdo */
:deep(.menu-left-positioned .p-tieredmenu-root-list) {
  box-shadow:
    -4px 0 6px -1px rgba(0, 0, 0, 0.1),
    -2px 0 4px -1px rgba(0, 0, 0, 0.06) !important;
  border-radius: 0.375rem;
}

/* Posicionamiento del submenú de idiomas al lado izquierdo */
:deep(.menu-left-positioned .p-tieredmenu-submenu) {
  position: absolute !important;
  left: -100% !important;
  top: 0 !important;
  margin-left: -8px !important;
  box-shadow:
    -4px 0 6px -1px rgba(0, 0, 0, 0.1),
    -2px 0 4px -1px rgba(0, 0, 0, 0.06) !important;
  border-radius: 0.375rem !important;
  min-width: 120px !important;
}

/* Ajustar la flecha del submenú para que apunte hacia la izquierda */
:deep(.menu-left-positioned .p-tieredmenu-submenu-icon) {
  transform: rotate(180deg) !important;
}

/* Responsive: en pantallas pequeñas mantener comportamiento normal */
@media (max-width: 768px) {
  :deep(.menu-left-positioned) {
    position: fixed !important;
    left: auto !important;
    right: 1rem !important;
    top: auto !important;
  }

  :deep(.menu-left-positioned .p-tieredmenu-submenu) {
    left: 100% !important;
    margin-left: 8px !important;
  }

  :deep(.menu-left-positioned .p-tieredmenu-submenu-icon) {
    transform: none !important;
  }
}
</style>
