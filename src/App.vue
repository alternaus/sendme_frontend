<template>
  <main class="w-screen h-screen flex justify-center items-center transition-all">
    <component :is="layout">
      <Toast position="bottom-right" class="toast-custom-zindex" />
      <router-view />
    </component>
  </main>
</template>

<script lang="ts">
import { computed, defineComponent, watch } from 'vue'
import { useRoute } from 'vue-router'

import Toast from 'primevue/toast'

import { useSeoMeta } from '@unhead/vue'
import { useI18n } from 'vue-i18n'

import AuthLayout from '@/layouts/AuthLayout.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useI18nStore } from '@/stores/i18nStore'

export default defineComponent({
  name: 'App',
  components: {
    Toast,
    AuthLayout,
    DashboardLayout,
    DefaultLayout,
  },
  setup() {
    const route = useRoute()
    const i18n = useI18n()
    const i18nStore = useI18nStore()

    const layout = computed(() => {
      const layoutName = (route.meta.layout as string) || 'DefaultLayout'
      return layoutName
    })

    const pageTitle = computed<string>(() => {
      const titleKey = route.meta.title as string
      return titleKey ? i18n.t(`${titleKey}`) : i18n.t('common.titles.home')
    })

    useSeoMeta({
      title: pageTitle,
      description: 'meta description',
      titleTemplate: `%s | ${i18n.t('common.titles.app_name')}`,
    })

    watch(() => i18nStore.language, (newLang) => {
      i18n.locale.value = newLang
    }, { immediate: true })

    return {
      layout
    }
  },
})
</script>
