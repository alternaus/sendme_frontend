<script lang="ts">
import { defineComponent, ref, watch } from 'vue'

import PrimeButton from 'primevue/button'
import PrimeMenu from 'primevue/menu'
import type { MenuItem } from 'primevue/menuitem'

import { useI18n } from 'vue-i18n'

import { useI18nStore } from '@/stores/i18nStore'

export default defineComponent({
  components: {
    PrimeButton,
    PrimeMenu,
  },
  setup() {
    const { t } = useI18n()
    const i18nStore = useI18nStore()
    const menu = ref<InstanceType<typeof PrimeMenu> | null>(null)
    const target = ref<HTMLElement | null>(null)
    const items = ref<MenuItem[]>([])

    const updateMenuItems = () => {
      items.value = [
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
      ]
    }
    watch(() => i18nStore.language, updateMenuItems, { immediate: true })
    const openMenu = (event: Event) => {
      menu.value?.toggle(event)
    }

    return {
      items,
      menu,
      target,
      openMenu,
      t,
    }
  },
})
</script>

<template>
  <div class="flex items-center space-x-2">
    <PrimeButton
      ref="target"
      rounded
      size="large"
      severity="secondary"
      variant="text"
      icon="pi pi-language"
      v-tooltip.bottom="$t('languages.language')"
      @click="openMenu"
    />
    <PrimeMenu ref="menu" :model="items" popup />
  </div>
</template>
