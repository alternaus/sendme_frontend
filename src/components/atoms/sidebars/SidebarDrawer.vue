<script setup lang="ts">
import Drawer from 'primevue/drawer'

import type { Component } from 'vue'

import Logo from '@/assets/svg/sidebar/logo.svg?component'
import AppButton from '@/components/atoms/buttons/AppButton.vue'

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
            unstyled
            class="text-black dark:text-white"
          />
        </div>

        <div class="overflow-y-auto flex-1">
          <ul class="p-2 space-y-2">
            <li
              v-for="route in routes"
              :key="route.path"
              class="w-full"
            >
              <router-link
                :to="route.path"
                active-class="bg-black dark:bg-[var(--p-primary-color)] transition-colors duration-300"
                class="group flex items-center gap-3 p-3 rounded-lg transition-all duration-300 text-gray-800 hover:bg-primary-400 dark:text-white dark:hover:bg-[var(--p-primary-color)]"
                @click="closeCallback()"
              >
                <component
                  :is="route.icon"
                  class="w-6 h-6 transition-all duration-300 flex-shrink-0"
                  :class="{
                    'dark:fill-black fill-[var(--p-primary-color)]': $route.path.startsWith(route.path),
                    'group-hover:fill-black dark:group-hover:fill-black': true,
                    'dark:fill-[var(--p-primary-color)]': !$route.path.startsWith(route.path),
                  }"
                />
                <span
                  class="text-sm transition-all duration-300"
                  :class="{
                    'dark:text-black text-[var(--p-primary-color)]': $route.path.startsWith(route.path),
                    'group-hover:text-black dark:group-hover:text-black': true,
                    'dark:text-[var(--p-primary-color)]': !$route.path.startsWith(route.path),
                  }"
                >
                  {{ route.title }}
                </span>
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </Drawer>
</template>
