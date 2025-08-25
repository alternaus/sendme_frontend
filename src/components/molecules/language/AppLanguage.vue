<script setup lang="ts">
import { computed, ref } from 'vue'

import PrimeButton from 'primevue/button'
import PrimeMenu from 'primevue/menu'
import type { MenuItem } from 'primevue/menuitem'

import { useI18n } from 'vue-i18n'

import { useI18nStore } from '@/stores/i18nStore'
import { useThemeStore } from '@/stores/themeStore'

const { t } = useI18n()
const i18nStore = useI18nStore()
const menu = ref<InstanceType<typeof PrimeMenu> | null>(null)
const target = ref<HTMLElement | null>(null)

const items = computed<MenuItem[]>(() => [
  {
    label: t('languages.en'),
    icon: i18nStore.language === 'en' ? 'pi pi-check' : '',
    command: () => i18nStore.changeLanguage('en'),
  },
  {
    label: t('languages.es'),
    icon: i18nStore.language === 'es' ? 'pi pi-check' : '',
    command: () => i18nStore.changeLanguage('es'),
  },
])

const tooltipText = computed(() => t('languages.language'))

function openMenu(event: Event) {
  menu.value?.toggle(event)
}

const themeStore = useThemeStore()

const buttonSeverity = computed(() => (themeStore.isDark ? 'primary' : 'secondary'))
</script>

<template>
  <div class="flex items-center space-x-2">
    <PrimeButton
      ref="target"
      rounded
      size="large"
      :severity="buttonSeverity"
      variant="text"
      icon="pi pi-language"
      v-tooltip.bottom="tooltipText"
      @click="openMenu"
    />
    <PrimeMenu ref="menu" :model="items" popup />
  </div>
</template>
