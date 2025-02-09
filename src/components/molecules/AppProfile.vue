<script lang="ts">
import AppAvatar from '@/components/atoms/avatar/AppAvatar.vue'
import PrimeMenu from 'primevue/menu'

import { defineComponent, ref } from 'vue'

export default defineComponent({
  components: {
    AppAvatar,
    PrimeMenu,
  },
  setup() {
    const menu = ref<InstanceType<typeof PrimeMenu> | null>(null)
    const target = ref<HTMLElement | null>(null)
    const items = [{ label: 'Profile' }, { label: 'Settings' }, { label: 'Logout' }]
    const openMenu = (event: Event) => {
      if (menu.value) {
        menu.value.toggle(event)
      }
    }
    return {
      items,
      menu,
      target,
      openMenu,
    }
  },
})
</script>

<template>
  <div class="flex items-center space-x-2">
    <AppAvatar ref="target" @click="openMenu" class="cursor-pointer" />

    <PrimeMenu ref="menu" :model="items" popup />
  </div>
</template>
