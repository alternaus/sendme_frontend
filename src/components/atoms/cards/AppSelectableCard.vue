<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  selected?: boolean
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  disabled: false,
  class: ''
})

const emit = defineEmits<{
  click: []
}>()

const cardClasses = computed(() => {
  const baseClasses = 'flex flex-col items-center justify-center w-60 h-38 p-4 border rounded-2xl cursor-pointer transition-all duration-200 relative'

  if (props.disabled) {
    return `${baseClasses} border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800 cursor-not-allowed opacity-50`
  }

  if (props.selected) {
    return `${baseClasses} border-[var(--p-primary-color)] bg-[var(--p-primary-color)]/10 dark:bg-[var(--p-primary-color)]/20 shadow-md`
  }

  return `${baseClasses} border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 hover:border-[var(--p-primary-color)]/50 dark:hover:border-[var(--p-primary-color)]/50 hover:shadow-lg`
})

const handleClick = () => {
  if (!props.disabled) {
    emit('click')
  }
}
</script>

<template>
  <div
    :class="cardClasses"
    @click="handleClick"
  >
    <!-- Icono de seleccionado -->
    <div v-if="selected" class="absolute top-3 right-3 w-6 h-6 bg-[var(--p-primary-color)] rounded-xl flex items-center justify-center shadow-sm">
      <i class="pi pi-check text-white dark:text-neutral-900 text-sm font-bold"></i>
    </div>

    <slot />
  </div>
</template>

<style scoped>
.w-60 {
  width: 15rem;
}

.h-38 {
  height: 9.5rem;
}
</style>
