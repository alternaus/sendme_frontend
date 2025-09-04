<script setup lang="ts">
import type { Component } from 'vue'

interface Props {
  icon: Component
  isExpanded: boolean
  label: string
  route?: string
  isActive?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  emit('click')
}
</script>

<template>
  <li class="w-full">
    <!-- Router link para navegación -->
    <router-link
      v-if="route"
      :to="route"
      active-class="bg-black dark:bg-[var(--p-primary-color)] transition-all duration-300 ease-in-out"
      class="group flex items-center p-2 rounded-lg transition-all duration-300 ease-in-out text-neutral-800 hover:bg-primary-400 dark:text-white dark:hover:bg-[var(--p-primary-color)]"
      :class="{ 'justify-center': !isExpanded }"
      @click="handleClick"
    >
      <div
        class="flex items-center transition-all duration-300 ease-in-out"
        :class="{ 'w-full': isExpanded }"
      >
        <component
          :is="icon"
          class="w-9 h-9 transition-all duration-300 ease-in-out flex-shrink-0"
          :class="{
            'dark:fill-black fill-[var(--p-primary-color)]': isActive,
            'group-hover:fill-black dark:group-hover:fill-black': true,
            'dark:fill-[var(--p-primary-color)]': !isActive,
          }"
        />
        <span
          class="text-sm whitespace-nowrap font-semibold overflow-hidden transition-all duration-300 ease-in-out"
          :class="{
            'w-0 opacity-0 ml-0': !isExpanded,
            'w-auto opacity-100 ml-3': isExpanded,
            'dark:text-black text-[var(--p-primary-color)]': isActive,
            'group-hover:text-black dark:group-hover:text-black': true,
            'dark:text-[var(--p-primary-color)]': !isActive,
          }"
        >
          {{ label }}
        </span>
      </div>
    </router-link>

    <button
      v-else
      @click="handleClick"
      class="group flex items-center w-full p-2 rounded-lg transition-all duration-300 ease-in-out text-neutral-800 hover:bg-primary-400 dark:text-white dark:hover:bg-[var(--p-primary-color)]"
      :class="{ 'justify-center': !isExpanded }"
    >
      <div
        class="flex items-center transition-all duration-300 ease-in-out"
        :class="{ 'w-full': isExpanded }"
      >
        <component
          :is="icon"
          class="w-9 h-9 transition-all duration-300 ease-in-out flex-shrink-0 dark:fill-[var(--p-primary-color)] group-hover:fill-black dark:group-hover:fill-black"
        />
        <span
          class="text-sm whitespace-nowrap font-semibold overflow-hidden transition-all duration-300 ease-in-out dark:text-[var(--p-primary-color)] group-hover:text-black dark:group-hover:text-black"
          :class="{
            'w-0 opacity-0 ml-0': !isExpanded,
            'w-auto opacity-100 ml-3': isExpanded,
          }"
        >
          {{ label }}
        </span>
      </div>
    </button>
  </li>
</template>
