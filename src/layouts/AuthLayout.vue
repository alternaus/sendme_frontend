<script lang="ts">
import AppCard from '@/components/atoms/cards/AppCard.vue'
import { defineComponent } from 'vue'
import AuthBackground from '@/assets/svg/auth_background.svg?component'
import Logo from '@/assets/svg/logo.svg?component'

export default defineComponent({
  components: {
    AppCard,
    AuthBackground,
    Logo,
  },
  setup() {
    return {}
  },
})
</script>

<template>
  <div class="w-full h-full grid grid-cols-1 md:grid-cols-2 justify-center items-center">
    <article class="flex justify-center items-center">
      <app-card class="min-w-[22rem] max-w-[22rem]">
        <template #title>
          <div class="flex justify-center items-center">
            <logo class="w-32 h-32 dark:fill-[var(--p-primary-color)]" />
          </div>
        </template>
        <template #content>
          <slot />
        </template>
      </app-card>
    </article>
    <aside class="hidden md:block">
      <auth-background class="w-[32rem] h-[32rem] mx-auto" />
    </aside>
  </div>
</template>
