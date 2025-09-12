<template>
  <main class="w-screen h-screen flex justify-center items-center transition-all">
    <component :is="layout">
      <Toast position="top-right" />
      <router-view />
    </component>

    <!-- Global Terms Handler - shows modal when organization requires terms acceptance -->
    <TermsHandler
      v-if="currentOrganizationId && authStore.isAuthenticated"
      :organization-id="currentOrganizationId"
      mode="modal-only"
    />
  </main>
</template>

<script lang="ts">
import { computed, defineComponent, watch } from 'vue'
import { useRoute } from 'vue-router'

import Toast from 'primevue/toast'

import { useSeoMeta } from '@unhead/vue'
import { useI18n } from 'vue-i18n'

import TermsHandler from '@/components/organisms/TermsHandler.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useI18nStore } from '@/stores/i18nStore'
import { useAuthStore } from '@/stores/useAuthStore'

export default defineComponent({
  name: 'App',
  components: {
    Toast,
    AuthLayout,
    DashboardLayout,
    DefaultLayout,
    TermsHandler,
  },
  setup() {
    const route = useRoute()
    const i18n = useI18n()
    const i18nStore = useI18nStore()
    const authStore = useAuthStore()

    const layout = computed(() => {
      const layoutName = (route.meta.layout as string) || 'DefaultLayout'
      return layoutName
    })

    const pageTitle = computed<string>(() => {
      const titleKey = route.meta.title as string
      return titleKey ? i18n.t(`${titleKey}`) : i18n.t('common.titles.home')
    })

    // Get current organization ID from auth store or route
    const currentOrganizationId = computed(() => {
      return authStore.user?.organizationId || (route.params.organizationId as string) || null
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
      layout,
      currentOrganizationId,
      authStore
    }
  },
})
</script>
