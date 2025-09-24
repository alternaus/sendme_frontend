<script setup lang="ts">
import AuthBackground from '@/assets/svg/auth_background.svg?component'
import Logo from '@/assets/svg/logo.svg?component'
import AppCard from '@/components/atoms/cards/AppCard.vue'
import AppDarkMode from '@/components/molecules/dark-mode/AppDarkMode.vue'
import AppLanguage from '@/components/molecules/language/AppLanguage.vue'
</script>

<template>
  <div class="w-full h-full flex flex-col">
    <header class="w-full p-4 flex items-center justify-between fixed">
      <div class="flex items-center gap-2 ml-auto">
        <AppDarkMode />
        <AppLanguage />
      </div>
    </header>

    <div class="flex-1 grid grid-cols-1 md:grid-cols-2 justify-center items-center">
      <article class="flex justify-center items-center">
        <app-card class="min-w-[22rem] max-w-[22rem]">
          <template #title>
            <div class="flex justify-center items-center">
              <logo class="w-32 h-32 dark:fill-[var(--p-primary-color)]" />
            </div>
          </template>
          <template #content>
            <div class="flex flex-col p-2">
              <div class="mb-6">
                <slot />
              </div>

            </div>
          </template>
        </app-card>
      </article>
      <aside class="hidden md:block">
        <auth-background class="w-[32rem] h-[32rem] mx-auto" />
      </aside>
    </div>
  </div>
</template>
