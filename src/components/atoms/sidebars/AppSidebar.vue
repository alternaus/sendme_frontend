<script setup lang="ts">
import { ref } from 'vue'

import Campaigns from '@/assets/svg/sidebar/campaigns.svg?component'
import Logo from '@/assets/svg/sidebar/logo.svg?component'
import SidebarItem from '@/components/atoms/sidebars/components/SidebarItem.vue'
import SidebarToggle from '@/components/atoms/sidebars/components/SidebarToggle.vue'
import UserProfileMenu from '@/components/atoms/sidebars/components/UserProfileMenu.vue'
import { useSidebarRoutes } from '@/components/atoms/sidebars/composables/useSidebarRoutes'

const emit = defineEmits<{
  'update:expanded': [value: boolean]
}>()

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
        <SidebarItem
          v-for="route in routes"
          :key="route.path"
          :icon="route.icon"
          :label="route.title"
          :route="route.path"
          :is-expanded="isExpanded"
          :is-active="$route.path.startsWith(route.path)"
        />

        <SidebarItem
          :icon="Campaigns"
          :is-expanded="isExpanded"
          label="Notificaciones"
          @click="handleNotifications"
        />
      </ul>
    </div>

    <UserProfileMenu :is-expanded="isExpanded" />
  </div>
</template>
