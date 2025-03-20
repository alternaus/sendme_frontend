<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useDark, useToggle } from '@vueuse/core'

import PrimeButton from 'primevue/button'

import { useI18n } from 'vue-i18n'


export default defineComponent({
  components: {
    PrimeButton,
  },
  setup() {
    const { t } = useI18n()
    const isDark = useDark({ selector: 'html' })
    const toggleDark = useToggle(isDark)
    const buttonIcon = computed(() => (isDark.value ? 'pi pi-sun' : 'pi pi-moon'))

    return {
      t,
      isDark,
      toggleDark,
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
