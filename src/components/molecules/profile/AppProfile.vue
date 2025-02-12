<script lang="ts">
import { defineComponent, ref } from 'vue'

import PrimeButton from 'primevue/button'
import PrimeDialog from 'primevue/dialog'
import PrimeMenu from 'primevue/menu'
import type { MenuItem } from 'primevue/menuitem'

import AppAvatar from '@/components/atoms/avatar/AppAvatar.vue'
import { useAuthStore } from '@/stores/useAuthStore'

export default defineComponent({
  components: {
    AppAvatar,
    PrimeMenu,
    PrimeDialog,
    PrimeButton,
  },
  setup() {
    const { logout } = useAuthStore()
    const menu = ref<InstanceType<typeof PrimeMenu> | null>(null)
    const target = ref<HTMLElement | null>(null)
    const showLogoutDialog = ref(false)

    const items: MenuItem[] = [
      { label: 'Profile' },
      { label: 'Settings' },
      {
        label: 'Logout',
        command: () => (showLogoutDialog.value = true),
      },
    ]

    const openMenu = (event: Event) => {
      menu.value?.toggle(event)
    }

    const confirmLogout = () => {
      showLogoutDialog.value = false
      logout()
    }

    return {
      items,
      menu,
      target,
      openMenu,
      showLogoutDialog,
      confirmLogout,
    }
  },
})
</script>

<template>
  <div class="flex items-center space-x-2">
    <AppAvatar ref="target" @click="openMenu" class="cursor-pointer" />
    <PrimeMenu ref="menu" :model="items" popup />

    <PrimeDialog
      v-model:visible="showLogoutDialog"
      modal
      header="Confirmar Cierre de Sesión"
      :style="{ width: '25rem' }"
    >
      <span class="text-surface-500 dark:text-surface-400 block mb-8">
        ¿Estás seguro de que deseas cerrar sesión?
      </span>
      <div class="flex justify-end gap-2">
        <PrimeButton
          type="button"
          size="small"
          label="Cancelar"
          severity="secondary"
          @click="showLogoutDialog = false"
        />
        <PrimeButton
          type="button"
          size="small"
          label="Cerrar Sesión"
          severity="danger"
          @click="confirmLogout"
        />
      </div>
    </PrimeDialog>
  </div>
</template>
