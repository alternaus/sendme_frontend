<script setup lang="ts">
import { ref } from 'vue'

import Campaigns from '@/assets/svg/sidebar/campaigns.svg?component'
import Logo from '@/assets/svg/sidebar/logo.svg?component'
import { useSidebarRoutes } from '@/components/atoms/sidebars/composables/useSidebarRoutes'
import SidebarActionItem from '@/components/atoms/sidebars/SidebarActionItem.vue'
import SidebarNavItem from '@/components/atoms/sidebars/SidebarNavItem.vue'
import SidebarToggle from '@/components/atoms/sidebars/SidebarToggle.vue'
import SidebarUserInfo from '@/components/atoms/sidebars/SidebarUserInfo.vue'
import { useAuthStore } from '@/stores/useAuthStore'

const emit = defineEmits<{
  'update:expanded': [value: boolean]
}>()

const authStore = useAuthStore()
const { routes } = useSidebarRoutes()
const isExpanded = ref(false)

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
  emit('update:expanded', isExpanded.value)
}

const handleNotifications = () => {
  // Lógica para manejar notificaciones
}
</script>

<template>
  <div
    class="w-16 h-screen bg-[var(--p-primary-color)] dark:bg-neutral-800 text-black dark:text-white flex flex-col fixed top-0 left-0 transition-all duration-300 ease-in-out"
    :class="{ 'w-[200px]': isExpanded }"
  >
    <SidebarToggle :is-expanded="isExpanded" @toggle="toggleExpand" />

    <div class="flex items-center py-4">
      <router-link to="/" class="flex-1 flex items-center justify-center">
        <Logo class="h-16 w-16 mx-auto transition-all duration-500 ease-in-out dark:fill-[var(--p-primary-color)]" />
      </router-link>
    </div>

    <div class="flex-1 flex flex-col items-center overflow-y-auto">
      <ul class="p-1 space-y-1 w-full">
        <SidebarNavItem
          v-for="route in routes"
          :key="route.path"
          :route="route"
          :is-expanded="isExpanded"
        />

        <SidebarActionItem
          :icon="Campaigns"
          :is-expanded="isExpanded"
          label="Notificaciones"
          @click="handleNotifications"
        />
      </ul>
    </div>

    <SidebarUserInfo
      :is-expanded="isExpanded"
      :user="authStore.user ? {
        name: authStore.user.name,
        email: authStore.user.email,
        avatarUrl: authStore.user.avatarUrl
      } : undefined"
    />
  </div>
</template>
