<template>
  <header class="flex items-center justify-between w-full px-6 py-4 md:px-12 lg:px-20">
    <!-- Logo -->
    <div class="flex items-center">
      <Logo class="w-18 dark:fill-[var(--p-primary-color)]" />
    </div>

    <!-- Controls -->
    <div class="flex items-center gap-2">
      <AppDarkMode />
      <AppLanguage />
    </div>
  </header>

  <!-- Page Title and Description -->
  <div class="max-w-sm mx-auto text-center space-y-3 px-6 md:px-12 lg:px-20">
    <h1 class="text-surface-900 dark:text-surface-0 font-bold text-xl leading-tight">
      {{ title }}
    </h1>
    <p class="text-surface-500 dark:text-surface-400 text-base lg:text-lg leading-relaxed">
      {{ description }}
    </p>
  </div>
</template>

<script setup lang="ts">
import Logo from '@/assets/svg/logo.svg?component'
import AppDarkMode from '@/components/molecules/dark-mode/AppDarkMode.vue'
import AppLanguage from '@/components/molecules/language/AppLanguage.vue'

interface Props {
  title: string
  description: string
}

defineProps<Props>()
</script>
