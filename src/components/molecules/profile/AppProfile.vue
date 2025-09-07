<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import PrimeMenu from 'primevue/menu'
import type { MenuItem } from 'primevue/menuitem'

import { useI18n } from 'vue-i18n'

import AppAvatar from '@/components/atoms/avatar/AppAvatar.vue'
import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppDialog from '@/components/atoms/dialogs/AppDialog.vue'
import { useI18nStore } from '@/stores/i18nStore'
import { useAuthStore } from '@/stores/useAuthStore'

const { logout, user } = useAuthStore()
const { t } = useI18n()
const i18nStore = useI18nStore()
const router = useRouter()

const menu = ref<InstanceType<typeof PrimeMenu> | null>(null)
const target = ref<HTMLElement | null>(null)
const showLogoutDialog = ref(false)

//Definir items de menú de forma reactiva para que se actualicen cuando cambie el idioma
const items = ref<MenuItem[]>([])

//Función para actualizar los items del menú
const updateMenuItems = () => {
  items.value = [
    {
      label: t('general.account'),
      icon: 'pi pi-user',
      command: () => router.push({ name: 'account.index' })
    },
    {
      label: t('general.settings'),
      icon: 'pi pi-cog',
      command: () => router.push({ name: 'settings.general' }) // Ahora lleva a la página principal de settings
    },
    {
      label: t('auth.session.logout'),
      icon: 'pi pi-sign-out',
      command: () => (showLogoutDialog.value = true),
    },
  ]
}

//Observa los cambios en el idioma y actualiza los elementos del menú
watch(() => i18nStore.language, updateMenuItems, { immediate: true })

const openMenu = (event: Event) => {
  menu.value?.toggle(event)
}

const confirmLogout = () => {
  showLogoutDialog.value = false
  logout()
}

const firstLetter = computed(() => user?.name?.charAt(0)?.toUpperCase() || '')
</script>

<template>
  <div class="flex items-center space-x-2">
    <!-- Avatar con menú -->
    <AppAvatar v-if="user?.avatarUrl" ref="target"  :image="user?.avatarUrl" @click="openMenu"  class="cursor-pointer" />
    <AppAvatar v-else ref="target"  :label="firstLetter" @click="openMenu"  class="cursor-pointer" />
    <PrimeMenu ref="menu" :model="items" popup />

    <!-- Diálogo de confirmación de cierre de sesión -->
    <AppDialog
      v-model:modelValue="showLogoutDialog"
      modal
      :header="$t('auth.confirm_logout')"
      :style="{ width: '25rem' }"
    >
      <span class="text-surface-500 dark:text-surface-400 block mb-8">
        {{ $t('auth.sure_logout') }}
      </span>
      <div class="flex justify-end gap-2">
        <AppButton
          type="button"
          size="small"
          :label="$t('general.cancel')"
          severity="secondary"
          @click="showLogoutDialog = false"
        />
        <AppButton
          type="button"
          size="small"
          :label="$t('auth.session.logout')"
          severity="danger"
          @click="confirmLogout"
        />
      </div>
    </AppDialog>
  </div>
</template>
