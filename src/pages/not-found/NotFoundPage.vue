<script setup lang="ts">
import { useRouter } from 'vue-router'

import { useI18n } from 'vue-i18n'

import Logo from '@/assets/svg/sidebar/logo.svg?component'
import AppButton from '@/components/atoms/buttons/AppButton.vue'

const router = useRouter()
const { t } = useI18n()

const goToHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen w-screen flex items-center justify-center p-8 bg-inherit">
    <div class="text-center max-w-[600px] w-full">
      <div class="flex justify-center items-center mb-8">
        <Logo class="w-[120px] h-auto dark:fill-[var(--p-primary-color)]" />
      </div>
      <h1 class="text-4xl font-bold mb-4 ">{{ t('notFound.title') }}</h1>
      <p class="text-lg mb-8 text-gray-600 dark:text-gray-300">{{ t('notFound.description') }}</p>
      <AppButton
        :label="t('notFound.backToHome')"
        severity="primary"
        @click="goToHome"
        class="!w-fit mx-auto"
      />
    </div>
  </div>
</template>
