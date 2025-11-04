<script setup lang="ts">
import { computed } from 'vue'

import { useI18n } from 'vue-i18n'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import { useThemeStore } from '@/stores/themeStore'

const { t } = useI18n()
const themeStore = useThemeStore()

const buttonIcon = computed(() => (themeStore.isDark ? 'pi pi-sun' : 'pi pi-moon'))
const buttonSeverity = computed(() => (themeStore.isDark ? 'primary' : 'secondary'))
const tooltipText = computed(() =>
  themeStore.isDark ? t('common.theme.lightMode') : t('common.theme.darkMode')
)

function toggleTheme() {
  themeStore.toggleDark()
}
</script>

<template>
  <div class="flex items-center space-x-2">
    <AppButton
      rounded
      size="large"
      :severity="buttonSeverity"
      variant="text"
      :icon="buttonIcon"
      v-tooltip.bottom="tooltipText"
      @click="toggleTheme"
    />
  </div>
</template>
