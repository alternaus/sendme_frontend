<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  icon: Component
  isExpanded: boolean
  label: string
}>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <li class="w-full">
    <button
      @click="emit('click')"
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
