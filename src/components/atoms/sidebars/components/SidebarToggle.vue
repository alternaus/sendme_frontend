<script setup lang="ts">
import MenuIcon from '@/assets/svg/lucide/menu.svg?component'
import XIcon from '@/assets/svg/lucide/x.svg?component'

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
    class="w-8 h-8 mt-1 cursor-pointer flex mx-auto items-center justify-center rounded-full transition-all duration-500 ease-in-out text-neutral-800 hover:bg-[var(--p-primary-600)] dark:text-[var(--p-primary-color)] dark:hover:bg-neutral-600 z-10"
  >
    <MenuIcon v-if="!isExpanded" class="w-4 h-4" />

    <XIcon v-else class="w-4 h-4" />
  </button>

</template>
