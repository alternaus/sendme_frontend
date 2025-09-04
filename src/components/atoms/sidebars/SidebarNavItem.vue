<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  route: {
    path: string
    icon: Component
    title: string
  }
  isExpanded: boolean
}>()
</script>

<template>
  <li class="w-full">
    <router-link
      :to="route.path"
      active-class="bg-black dark:bg-[var(--p-primary-color)] transition-all duration-300 ease-in-out"
      class="group flex items-center p-2 rounded-lg transition-all duration-300 ease-in-out text-neutral-800 hover:bg-primary-400 dark:text-white dark:hover:bg-[var(--p-primary-color)]"
      :class="{ 'justify-center': !isExpanded }"
    >
      <div
        class="flex items-center transition-all duration-300 ease-in-out"
        :class="{ 'w-full': isExpanded }"
      >
        <component
          :is="route.icon"
          class="w-9 h-9 transition-all duration-300 ease-in-out flex-shrink-0"
          :class="{
            'dark:fill-black fill-[var(--p-primary-color)]': $route.path.startsWith(route.path),
            'group-hover:fill-black dark:group-hover:fill-black': true,
            'dark:fill-[var(--p-primary-color)]': !$route.path.startsWith(route.path),
          }"
        />
        <span
          class="text-sm whitespace-nowrap font-semibold overflow-hidden transition-all duration-300 ease-in-out"
          :class="{
            'w-0 opacity-0 ml-0': !isExpanded,
            'w-auto opacity-100 ml-3': isExpanded,
            'dark:text-black text-[var(--p-primary-color)]': $route.path.startsWith(route.path),
            'group-hover:text-black dark:group-hover:text-black': true,
            'dark:text-[var(--p-primary-color)]': !$route.path.startsWith(route.path),
          }"
        >
          {{ route.title }}
        </span>
      </div>
    </router-link>
  </li>
</template>
