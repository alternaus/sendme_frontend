<script setup lang="ts">
defineProps<{
  isExpanded: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()
</script>

<template>
  <button
    @click="emit('toggle')"
    class="absolute top-20 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 ease-in-out text-neutral-800 hover:bg-[var(--p-primary-600)] dark:text-white dark:hover:bg-neutral-600 bg-[var(--p-primary-300)] dark:bg-neutral-700 shadow-lg z-10"
    :class="{
      'rotate-180': isExpanded,
      '-right-4': !isExpanded,
      'right-4': isExpanded,
    }"
  >
    <i class="pi pi-chevron-right text-lg transition-all duration-300 ease-in-out text-black dark:text-[var(--p-primary-color)]" />
  </button>
</template>
