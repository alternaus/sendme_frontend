<template>
  <main class="w-screen h-screen flex justify-center items-center transition-all">
    <component :is="layout">
      <Toast position="top-right" />
      <router-view />
    </component>
  </main>
</template>

<script lang="ts">
import { computed, defineComponent, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useDark } from '@vueuse/core'

import Toast from 'primevue/toast'

import { useI18n } from 'vue-i18n'

import AuthLayout from '@/layouts/AuthLayout.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useI18nStore } from '@/stores/i18nStore'

export default defineComponent({
  components: {
    DefaultLayout,
    AuthLayout,
    DashboardLayout,
    Toast,
  },
  setup() {
    const isDark = useDark({ selector: 'html' })
    const route = useRoute()
    const i18n = useI18n()
    const i18nStore = useI18nStore()

    // Computed para cambiar el layout dinámicamente
    const layout = computed(() => {
      const layoutName = (route.meta.layout as string) || 'DefaultLayout'
      return layoutName
    })

    // Asegurar que el idioma cambia en toda la app
    watch(() => i18nStore.language, (newLang) => {
      i18n.locale.value = newLang
    }, { immediate: true })

    return { layout }
  },
})
</script>
