<script lang="ts">
import { computed, defineComponent } from 'vue'

import PrimeButton from 'primevue/button'

import { useI18n } from 'vue-i18n'

import { useThemeStore } from '@/stores/themeStore'

export default defineComponent({
  components: {
    PrimeButton,
  },
  setup() {
    const { t } = useI18n()
    const themeStore = useThemeStore()
    const buttonIcon = computed(() => (themeStore.isDark ? 'pi pi-sun' : 'pi pi-moon'))

    return {
      t,
      isDark: themeStore.isDark,
      toggleDark: themeStore.toggleDark,
      buttonIcon,
    }
  },
})
</script>

<template>
  <div class="flex items-center space-x-2">
    <PrimeButton ref="target" rounded size="large" severity="secondary" variant="text" :icon="buttonIcon"
      v-tooltip.bottom="isDark ? $t('theme.light') : $t('theme.dark')" @click="toggleDark()" />
  </div>
</template>
