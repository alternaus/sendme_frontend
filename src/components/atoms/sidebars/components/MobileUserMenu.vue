<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import Dialog from 'primevue/dialog'
import { useConfirm } from 'primevue/useconfirm'

import { useI18n } from 'vue-i18n'

import AppAvatar from '@/components/atoms/avatar/AppAvatar.vue'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/useAuthStore'

const { t, locale } = useI18n()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const confirm = useConfirm()
const router = useRouter()

const showModal = ref(false)

const confirmLogout = () => {
  confirm.require({
    message: t('auth.sure_logout'),
    header: t('auth.confirm_logout'),
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined',
    rejectLabel: t('general.cancel'),
    acceptLabel: t('auth.logout'),
    acceptClass: 'p-button-danger',
    accept: () => {
      authStore.logout()
      showModal.value = false
    }
  })
}

const handleAction = (action: (() => void) | undefined) => {
  if (action) {
    action()
  }
}

const handleNavigation = (route: string) => {
  router.push(route)
  showModal.value = false
}

const menuItems = computed(() => [
  {
    label: t('user.profile'),
    icon: 'pi pi-user',
    route: '/profile'
  },
  {
    label: t('user.settings'),
    icon: 'pi pi-cog',
    route: '/settings'
  },
  {
    label: themeStore.isDark ? t('theme.lightMode') : t('theme.darkMode'),
    icon: themeStore.isDark ? 'pi pi-sun' : 'pi pi-moon',
    action: () => themeStore.toggleDark()
  },
  {
    label: locale.value === 'es' ? t('languages.switchToEnglish') : t('languages.switchToSpanish'),
    icon: 'pi pi-globe',
    action: () => {
      locale.value = locale.value === 'es' ? 'en' : 'es'
    }
  },
  {
    label: t('auth.logout'),
    icon: 'pi pi-sign-out',
    action: () => confirmLogout(),
    class: 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
  }
])
</script>

<template>
  <!-- Solo el avatar que abre la modal -->
  <div class="relative">
    <div
      @click="showModal = true"
      class="cursor-pointer p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      <AppAvatar
        :image="authStore.user?.avatarUrl"
        size="large"
        class="ring-2 ring-white dark:ring-gray-800"
      />
    </div>

    <!-- Modal del menu de usuario -->
    <Dialog
      v-model:visible="showModal"
      :modal="true"
      :closable="true"
      :dismissable-mask="true"
      class="w-80"
      :pt="{
        root: 'user-menu-modal'
      }"
    >
      <template #header>
        <div class="flex items-center gap-3 w-full">
          <AppAvatar
            :image="authStore.user?.avatarUrl"
            size="large"
          />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {{ authStore.user?.name }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
              {{ authStore.user?.email }}
            </p>
          </div>
        </div>
      </template>

      <!-- Menu items -->
      <div class="space-y-1 pt-2">
        <template v-for="item in menuItems" :key="item.label">
          <button
            v-if="item.route"
            @click="handleNavigation(item.route)"
            class="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors duration-200 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
          >
            <i :class="item.icon" class="text-sm w-4" />
            <span>{{ item.label }}</span>
          </button>

          <button
            v-else
            @click="handleAction(item.action)"
            class="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors duration-200 w-full text-left"
            :class="item.class || 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'"
          >
            <i :class="item.icon" class="text-sm w-4" />
            <span>{{ item.label }}</span>
          </button>
        </template>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
:deep(.user-menu-modal) {
  max-width: 20rem;
}

:deep(.user-menu-modal .p-dialog-content) {
  padding: 0 1rem 1rem 1rem;
}

:deep(.user-menu-modal .p-dialog-header) {
  padding: 1rem 1rem 0.5rem 1rem;
  border-bottom: 1px solid var(--p-surface-border);
}
</style>
