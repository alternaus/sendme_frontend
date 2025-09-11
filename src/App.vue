<template>
  <main class="w-screen h-screen flex justify-center items-center transition-all">
    <component :is="layout">
      <Toast position="top-right" />
      <router-view />
    </component>

    <!-- Modal Global de Términos y Condiciones -->
    <TermsAcceptanceModal
      :blocking="true"
      @accepted="handleTermsAccepted"
      @error="handleTermsError"
    />
  </main>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

import Toast from 'primevue/toast'

import { useSeoMeta } from '@unhead/vue'
import { useI18n } from 'vue-i18n'

import TermsAcceptanceModal from '@/components/organisms/TermsAcceptanceModal.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useGlobalTermsService } from '@/services/terms/useGlobalTermsService'
import { useI18nStore } from '@/stores/i18nStore'



export default defineComponent({
  components: {
    DefaultLayout,
    AuthLayout,
    DashboardLayout,
    Toast,
    TermsAcceptanceModal,
  },
  setup() {
    const route = useRoute()
    const i18n = useI18n()
    const i18nStore = useI18nStore()
    const { initialize } = useGlobalTermsService()

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

    // Inicializar el servicio global de términos
    onMounted(() => {
      initialize()
    })

    const handleTermsAccepted = (data: unknown) => {
      console.log('Terms accepted globally:', data)
    }

    const handleTermsError = (error: Error) => {
      console.error('Global terms error:', error)
    }

    return {
      layout,
      handleTermsAccepted,
      handleTermsError
    }
  },
})
</script>
