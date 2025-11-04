<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useDark } from '@vueuse/core'

import type { Component } from 'vue'

interface Props {
  icon: Component
  isExpanded: boolean
  label: string
  route?: string
  isActive?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: []
}>()

const currentRoute = useRoute()
const isDark = useDark()

const handleClick = () => {
  emit('click')
}

const isRouteActive = () => {
  const currentPath = currentRoute.path

  if (props.route) {
    return currentPath === props.route || currentPath.startsWith(props.route + '/')
  }

  return false
}
</script>

<template>
  <li class="w-full">
    <router-link
      v-if="route"
      :to="route"
      class="group flex items-center gap-2 p-2 rounded-lg transition-all duration-200 ease-in-out"
      :class="[
        { 'justify-center': !isExpanded },
        isRouteActive()
          ? isDark
            ? 'bg-[var(--p-primary-color)]'
            : 'bg-[var(--p-primary-contrast-color)]'
          : isDark
            ? 'hover:bg-[var(--p-surface-800)]'
            : 'hover:bg-[var(--p-primary-contrast-color)]/10',
      ]"
      @click="handleClick"
    >
      <component
        :is="icon"
        class="w-8 h-8 flex-shrink-0 transition-colors duration-200"
        :class="
          isRouteActive()
            ? isDark
              ? 'fill-[var(--p-surface-900)]'
              : 'fill-[var(--p-primary-color)]'
            : isDark
              ? 'fill-[var(--p-primary-color)] group-hover:fill-[var(--p-primary-color)]'
              : 'fill-[var(--p-primary-contrast-color)] group-hover:fill-[var(--p-primary-contrast-color)]'
        "
      />
      <span
        v-if="isExpanded"
        class="text-sm font-medium transition-all duration-200 truncate"
        :class="
          isRouteActive()
            ? isDark
              ? 'text-[var(--p-surface-900)]'
              : 'text-[var(--p-primary-color)]'
            : isDark
              ? 'text-[var(--p-primary-color)] group-hover:text-[var(--p-primary-color)]'
              : 'text-[var(--p-primary-contrast-color)] group-hover:text-[var(--p-primary-contrast-color)]'
        "
      >
        {{ label }}
      </span>
    </router-link>

    <button
      v-else
      @click="handleClick"
      class="group flex items-center gap-2 w-full p-2 rounded-lg transition-all duration-200 ease-in-out"
      :class="[
        { 'justify-center': !isExpanded },
        isDark ? 'hover:bg-[var(--p-surface-800)]' : 'hover:bg-[var(--p-primary-contrast-color)]/10',
      ]"
    >
      <component
        :is="icon"
        class="w-8 h-8 flex-shrink-0 transition-colors duration-200"
        :class="isDark ? 'fill-[var(--p-primary-color)]' : 'fill-[var(--p-primary-contrast-color)] group-hover:fill-[var(--p-primary-contrast-color)]'"
      />
      <span
        v-if="isExpanded"
        :class="isDark ? 'text-[var(--p-primary-color)]' : 'text-[var(--p-primary-contrast-color)]'"
        class="text-sm font-medium group-hover:text-[var(--p-primary-color)] transition-colors duration-200 truncate"
      >
        {{ label }}
      </span>
    </button>
  </li>
</template>
