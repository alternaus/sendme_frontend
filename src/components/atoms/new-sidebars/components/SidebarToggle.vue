<script setup lang="ts">
import { useDark } from '@vueuse/core'

import { Menu, X } from 'lucide-vue-next'

defineProps<{
  isExpanded: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()

const isDark = useDark()
</script>

<template>
  <button
    @click="emit('toggle')"
    class="w-8 h-8 mt-1 cursor-pointer flex mx-auto items-center justify-center rounded-full transition-all duration-300 ease-in-out z-10"
    :class="
      isDark
        ? 'text-[var(--p-primary-color)] hover:bg-[var(--p-surface-800)]'
        : 'text-black hover:bg-black/10'
    "
  >
    <Menu v-if="!isExpanded" :size="18" />
    <X v-else :size="18" />
  </button>
</template>
