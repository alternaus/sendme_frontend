<script setup lang="ts">
import { computed, ref } from 'vue'

import PrimeMenu from 'primevue/menu'
import type { MenuItem } from 'primevue/menuitem'

import { useI18n } from 'vue-i18n'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import { useI18nStore } from '@/stores/i18nStore'
import { useThemeStore } from '@/stores/themeStore'

const { t } = useI18n()
const i18nStore = useI18nStore()
const menu = ref<InstanceType<typeof PrimeMenu> | null>(null)
const target = ref<HTMLElement | null>(null)

// Mapeo de idiomas a códigos de país para las banderas
const languageCountryMap = {
  en: 'us', // Inglés -> Bandera de Estados Unidos
  es: 'es', // Español -> Bandera de España
}

const items = computed<MenuItem[]>(() => [
  {
    label: t('common.languages.en'),
    icon: languageCountryMap.en,
    command: () => i18nStore.changeLanguage('en'),
  },
  {
    label: t('common.languages.es'),
    icon: languageCountryMap.es,
    command: () => i18nStore.changeLanguage('es'),
  },
])

const tooltipText = computed(() => t('common.languages.language'))

// Bandera del idioma actual
const currentFlag = computed(() => languageCountryMap[i18nStore.language])

function openMenu(event: Event) {
  menu.value?.toggle(event)
}

const themeStore = useThemeStore()

const buttonSeverity = computed(() => (themeStore.isDark ? 'primary' : 'secondary'))
</script>

<template>
  <div class="flex items-center space-x-2">
    <AppButton
      ref="target"
      rounded
      size="large"
      :severity="buttonSeverity"
      variant="text"
      icon="pi pi-language"
      v-tooltip.bottom="tooltipText"
      @click="openMenu"
    />

    <PrimeMenu ref="menu" :model="items" popup>
      <template #item="{ item }">
        <div class="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
          <span
            v-if="item.icon === currentFlag"
            class="pi pi-check w-4"
          ></span>
          <span
            v-else
            class="w-4"
          ></span>
          <span :class="['country-flag', item.icon, 'text-base']"></span>
          <span class="font-medium">{{ item.label }}</span>
        </div>
      </template>
    </PrimeMenu>
  </div>
</template>
