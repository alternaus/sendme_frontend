<template>
  <main class="w-screen h-screen flex justify-center items-center transition-all">
    <component :is="layout">
      <Toast position="bottom-right" />
      <router-view />
    </component>
  </main>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useRoute } from 'vue-router'
import { useDark } from '@vueuse/core'

import Toast from 'primevue/toast'

import AuthLayout from '@/layouts/AuthLayout.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

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
    const layout = computed(() => {
      const layoutName = (route.meta.layout as string) || 'DefaultLayout'
      return layoutName
    })

    return { layout }
  },
})
</script>
