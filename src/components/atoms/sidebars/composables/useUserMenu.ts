import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { useConfirm } from 'primevue/useconfirm'

import { useI18n } from 'vue-i18n'

import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/useAuthStore'

export function useUserMenu() {
  const { t, locale } = useI18n()
  const authStore = useAuthStore()
  const themeStore = useThemeStore()
  const confirm = useConfirm()
  const router = useRouter()

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
      }
    })
  }

  const handleNavigation = (route: string) => {
    router.push(route)
  }

  const menuItems = computed(() => [
    {
      label: t('common.user.profile'),
      icon: 'pi pi-user',
      command: () => handleNavigation('/account')
    },
    {
      label: t('common.user.settings'),
      icon: 'pi pi-cog',
      command: () => handleNavigation('/settings')
    },
    {
      separator: true
    },
    {
      label: themeStore.isDark ? t('common.theme.lightMode') : t('common.theme.darkMode'),
      icon: themeStore.isDark ? 'pi pi-sun' : 'pi pi-moon',
      command: () => themeStore.toggleDark()
    },
    {
      label: t('common.languages.language'),
      icon: 'pi pi-globe',
      items: [
        {
          label: t('common.languages.es'),
          icon: locale.value === 'es' ? 'pi pi-check' : '',
          class: locale.value === 'es' ? 'text-blue-600 dark:text-blue-400' : '',
          command: () => {
            locale.value = 'es'
          }
        },
        {
          label: t('common.languages.en'),
          icon: locale.value === 'en' ? 'pi pi-check' : '',
          class: locale.value === 'en' ? 'text-blue-600 dark:text-blue-400' : '',
          command: () => {
            locale.value = 'en'
          }
        }
      ]
    },
    {
      separator: true
    },
    {
      label: t('common.auth.logout'),
      icon: 'pi pi-sign-out',
      command: () => confirmLogout(),
      class: 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
    }
  ])

  return {
    authStore,
    themeStore,
    menuItems,
    confirmLogout,
    handleNavigation,
    locale
  }
}
