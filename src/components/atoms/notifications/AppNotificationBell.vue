<script lang="ts">
import { computed, defineComponent, ref } from 'vue'

import PrimeBadge from 'primevue/badge'
import PrimeButton from 'primevue/button'
import PrimeMenu from 'primevue/menu'
import type { MenuItem } from 'primevue/menuitem'

import { useI18n } from 'vue-i18n'

import { useNotifications } from '@/composables/useNotifications'

export interface Notification {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  data?: Record<string, unknown>
  timestamp: string
  read: boolean
}

export default defineComponent({
  name: 'AppNotificationBell',
  components: {
    PrimeButton,
    PrimeBadge,
    PrimeMenu
  },
  setup() {
    const { t } = useI18n()
    const menu = ref()
    const { list, markRead } = useNotifications(1)

    const unreadCount = computed(() => {
      return list.value.filter((n: Notification) => !n.read).length
    })

    const menuItems = computed(() => {
      if (list.value.length === 0) {
        return [{
          label: t('notifications.no_notifications'),
          disabled: true
        }]
      }

      return list.value.map((notification: Notification) => ({
        label: notification.title,
        icon: getIconForType(notification.type),
        command: () => markRead(notification.id),
        template: (item: MenuItem) => {
          return `
            <div class="flex items-center gap-2 p-2">
              <i class="${item.icon}"></i>
              <div class="flex flex-col">
                <span class="font-semibold">${item.label}</span>
                <small class="text-gray-500">${notification.message}</small>
              </div>
            </div>
          `
        }
      }))
    })

    const getIconForType = (type: Notification['type']) => {
      switch (type) {
        case 'success':
          return 'pi pi-check-circle text-green-500'
        case 'error':
          return 'pi pi-times-circle text-red-500'
        case 'warning':
          return 'pi pi-exclamation-triangle text-yellow-500'
        case 'info':
        default:
          return 'pi pi-info-circle text-blue-500'
      }
    }

    return {
      menu,
      unreadCount,
      menuItems,
      t
    }
  }
})
</script>

<template>
  <div class="relative">
    <PrimeButton
      v-tooltip.bottom="t('notifications.title')"
      icon="pi pi-bell"
      text
      rounded
      size="large"
      severity="secondary"
      variant="text"
      @click="menu.toggle($event)"
      class="relative"
    />
    <PrimeBadge
      v-if="unreadCount > 0"
      :value="unreadCount"
      severity="danger"
      class="absolute -top-1 -right-1"
    />
    <PrimeMenu
      ref="menu"
      :model="menuItems"
      :popup="true"
      class="w-80"
    />
  </div>
</template>

<style scoped>
:deep(.p-menu) {
  min-width: 15rem;
  padding: 0.5rem;
}

:deep(.p-menu-list) {
  padding: 0;
}

:deep(.p-menuitem) {
  margin: 0.25rem 0;
}

:deep(.p-menuitem-link) {
  padding: 0.5rem;
  border-radius: 0.5rem;
}

:deep(.p-menuitem-icon) {
  margin-right: 0.5rem;
}
</style>