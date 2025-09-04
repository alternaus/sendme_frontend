<script setup lang="ts">
import Drawer from 'primevue/drawer'

import type { Component } from 'vue'

import Logo from '@/assets/svg/sidebar/logo.svg?component'
import AppButton from '@/components/atoms/buttons/AppButton.vue'
import SidebarItem from '@/components/atoms/sidebars/components/SidebarItem.vue'

defineProps<{
  visible: boolean
  routes: Array<{
    path: string
    icon: Component
    title: string
  }>
}>()

defineEmits<{
  'update:visible': [value: boolean]
  close: []
}>()
</script>

<template>
  <Drawer
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    :modal="true"
    position="left"
    style="width: 14rem"
  >

    <template #container="{ closeCallback }">
      <div class="flex flex-col h-full bg-[var(--p-primary-color)] dark:bg-neutral-800 text-white">
        <div class="flex justify-between items-center p-4">
          <Logo
            class="h-16 w-16 cursor-pointer dark:fill-[var(--p-primary-color)]"
            @click="closeCallback()"
          />
          <AppButton
            @click="closeCallback"
            icon="pi pi-times"
            size="small"
            class="text-black w-8 h-8 dark:text-white"
          />
        </div>

        <div class="overflow-y-auto flex-1">
          <ul class="p-2 space-y-2">
            <SidebarItem
              v-for="route in routes"
              :key="route.path"
              :icon="route.icon"
              :label="route.title"
              :route="route.path"
              :is-expanded="true"
              @click="closeCallback()"
              class="mobile-nav-item"
            />
          </ul>
        </div>
      </div>
    </template>
  </Drawer>
</template>

<style scoped>
/* Adaptaciones para contexto móvil */
.mobile-nav-item :deep(.group) {
  gap: 0.75rem; /* gap-3 */
  padding: 0.75rem; /* p-3 */
}

.mobile-nav-item :deep(.w-9) {
  width: 1.5rem; /* w-6 */
  height: 1.5rem; /* h-6 */
}
</style>
