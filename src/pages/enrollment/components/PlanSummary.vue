<template>
  <div class="flex flex-col gap-4">
    <div class="text-surface-900 dark:text-surface-0 font-bold text-xl">{{ plan.name }}</div>
    <div class="flex items-baseline">
      <span class="text-surface-500 dark:text-surface-400 text-base">$</span>
      <span class="text-surface-900 dark:text-surface-0 text-3xl font-bold">{{ plan.cost }}</span>
      <span class="text-surface-500 dark:text-surface-400 text-base">/{{ $t('enrollment.month') }}</span>
    </div>
    <Divider />
    <ul class="list-none flex flex-col gap-3">
      <li v-for="(feature, index) in plan.features" :key="index" class="flex items-center gap-2">
        <i class="pi pi-check-circle text-md! text-[var(--p-primary-color)]" />
        <span class="text-surface-800 text-sm dark:text-surface-100 leading-tight">{{ feature }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import Divider from 'primevue/divider'

interface Props {
  plan: {
    name: string
    cost: number
    features: string[]
  }
}

defineProps<Props>()
</script>
