<template>
  <main class="w-screen h-screen flex justify-center items-center transition-all">
    <component :is="layout">
      <router-view />
    </component>
  </main>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useRoute } from 'vue-router'

import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { useDark } from '@vueuse/core'

export default defineComponent({
  components: {
    DefaultLayout,
    AuthLayout,
    DashboardLayout,
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
