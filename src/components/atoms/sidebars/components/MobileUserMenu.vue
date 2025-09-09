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
  message: t('auth.session.logout_confirm_message'),
  header: t('auth.session.logout_confirm_title'),
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined',
  rejectLabel: t('common.general.cancel'),
    acceptLabel: t('auth.session.logout'),
    acceptClass: 'p-button-danger',
    accept: () => {
      authStore.logout()
      showModal.value = false
    },
  })
}

const handleAction = (action: (() => void) | undefined) => {
  if (action) {
    action()
  }
}

const userInitials = computed(() => {
  if (authStore.user?.name) {
    return authStore.user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }
  return ''
})

const avatarColors = [
  '!bg-blue-800 !text-white dark:!bg-blue-600',
  '!bg-green-800 !text-white dark:!bg-green-600',
  '!bg-purple-800 !text-white dark:!bg-purple-600',
  '!bg-indigo-800 !text-white dark:!bg-indigo-600',
  '!bg-teal-800 !text-white dark:!bg-teal-600',
  '!bg-rose-800 !text-white dark:!bg-rose-600',
  '!bg-emerald-800 !text-white dark:!bg-emerald-600',
  '!bg-violet-800 !text-white dark:!bg-violet-600',
  '!bg-cyan-800 !text-white dark:!bg-cyan-600',
  '!bg-amber-800 !text-white dark:!bg-amber-600',
]

const randomAvatarColor = computed(() => {
  if (!authStore.user?.email) return avatarColors[0]

  // Usar el email como semilla para que sea consistente por usuario
  let hash = 0
  for (let i = 0; i < authStore.user.email.length; i++) {
    const char = authStore.user.email.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convertir a entero de 32 bits
  }

  const index = Math.abs(hash) % avatarColors.length
  return avatarColors[index]
})

const handleNavigation = (route: string) => {
  router.push(route)
  showModal.value = false
}

const menuItems = computed(() => [
  {
  label: t('common.user.profile'),
    icon: 'pi pi-user',
    route: '/profile',
  },
  {
  label: t('common.user.settings'),
    icon: 'pi pi-cog',
    route: '/settings',
  },
  {
  label: themeStore.isDark ? t('common.theme.lightMode') : t('common.theme.darkMode'),
    icon: themeStore.isDark ? 'pi pi-sun' : 'pi pi-moon',
    action: () => themeStore.toggleDark(),
  },
  {
    label: locale.value === 'es' ? t('common.languages.switchToEnglish') : t('common.languages.switchToSpanish'),
    icon: 'pi pi-globe',
    action: () => {
      locale.value = locale.value === 'es' ? 'en' : 'es'
      try { localStorage.setItem('lang', locale.value as string) } catch {}
    },
  },
  {
    label: t('auth.session.logout'),
    icon: 'pi pi-sign-out',
    action: () => confirmLogout(),
    class: 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20',
  },
])
</script>

<template>
  <div class="relative">
    <div
      @click="showModal = true"
      class="cursor-pointer p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      <AppAvatar
        :label="userInitials"
        :image="authStore.user?.avatarUrl"
        size="large"
        class="ring-2 ring-gray-400/30 dark:ring-gray-500/40"
        style=" width: 32px; height: 32px; font-size: 0.875rem;"
        :class="randomAvatarColor"
      />
    </div>

    <Dialog
      v-model:visible="showModal"
      :modal="true"
      :closable="true"
      :dismissable-mask="true"
      class="w-80"
      :pt="{
        root: 'user-menu-modal',
      }"
    >
      <template #header>
        <div class="flex items-center gap-2 w-full">
          <AppAvatar
            :label="userInitials"
            :image="authStore.user?.avatarUrl"
            size="normal"
            class="ring-2 ring-gray-400/30 dark:ring-gray-500/40"
            :class="randomAvatarColor"

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
            :class="
              item.class ||
              'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            "
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


</style>
