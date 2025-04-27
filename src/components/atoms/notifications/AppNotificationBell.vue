<script lang="ts">
import { computed, defineComponent, ref } from 'vue'

import PrimeBadge from 'primevue/badge'
import PrimeButton from 'primevue/button'
import PrimeMenu from 'primevue/menu'

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

type NotificationType = Notification['type']

export default defineComponent({
  name: 'AppNotificationBell',
  components: { PrimeButton, PrimeBadge, PrimeMenu },
  setup() {
    const { t } = useI18n()
    const menu = ref<InstanceType<typeof PrimeMenu> | null>(null)
    const { list, deleteNotification } = useNotifications(1)

    const unreadCount = computed(() =>
      list.value.filter((n: Notification) => !n.read).length
    )

    const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('es', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }).format(date)
    }

    const getIconForType = (type: NotificationType) => {
      switch (type) {
        case 'success': return 'pi pi-check-circle'
        case 'error':   return 'pi pi-times-circle'
        case 'warning': return 'pi pi-exclamation-triangle'
        case 'info':
        default:        return 'pi pi-info-circle'
      }
    }

    const colorClasses: Record<NotificationType, string> = {
      success: 'text-green-700 dark:text-green-300',
      error:   'text-red-700 dark:text-red-300',
      warning: 'text-yellow-700 dark:text-yellow-300',
      info:    'text-blue-700 dark:text-blue-300',
    }

    const getIconClasses = (type: NotificationType) => {
      return [
        getIconForType(type),
        colorClasses[type],
        'text-2xl flex-shrink-0 mt-1'
      ].join(' ')
    }

    // Borra una notificación y la elimina de la lista local
    const handleDelete = async (id: number) => {
      try {
        await deleteNotification(id)
      } finally {
        list.value = list.value.filter(n => n.id !== id)
      }
    }

    // Borra todas las notificaciones
    const clearAllNotifications = async () => {
      const ids = list.value.map(n => n.id)
      await Promise.all(ids.map(id => deleteNotification(id)))
      list.value = []
    }

    return {
      menu,
      unreadCount,
      list,
      formatDate,
      getIconClasses,
      t,
      handleDelete,
      clearAllNotifications
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
      @click="menu?.toggle($event)"
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
      :popup="true"
      appendTo="body"
      class="min-w-sm max-w-sm md:max-w-md max-h-80 overflow-y-auto p-2"
    >
      <template #start>
        <div v-if="list.length > 0" class="flex justify-end px-4 pt-2">
          <button
            class="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors"
            @click="clearAllNotifications"
          >
            {{ t('notifications.clear_all') }}
          </button>
        </div>

        <div v-if="list.length === 0" class="p-6 text-center text-gray-500 dark:text-gray-400">
          {{ t('notifications.no_notifications') }}
        </div>

        <div v-else>
          <div
            v-for="notification in list"
            :key="notification.id"
            class="relative flex items-start gap-4 px-4 py-3 mb-3 rounded-lg shadow-sm border-l-4 bg-white dark:bg-neutral-800"
            :class="{
              'border-green-700 dark:border-green-300': notification.type === 'success',
              'border-red-700 dark:border-red-300': notification.type === 'error',
              'border-yellow-700 dark:border-yellow-300': notification.type === 'warning',
              'border-blue-700 dark:border-blue-300': notification.type === 'info'
            }"
          >
            <i :class="getIconClasses(notification.type)" />

            <div class="flex-grow min-w-0">
              <div class="flex justify-between items-center mb-1">
                <span class="font-semibold text-gray-800 dark:text-gray-200 truncate">
                  {{ notification.title }}
                </span>
              </div>
              <p class="text-gray-700 dark:text-gray-300 text-sm">
                {{ notification.message }}
              </p>
              <div class="text-xs text-gray-400 dark:text-gray-500 mt-2 flex justify-end">
                {{ formatDate(notification.timestamp) }}
              </div>
            </div>

            <button
              class="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
              @click="handleDelete(notification.id)"
              title="{{ t('notifications.delete') }}"
            >
              <i class="pi pi-times text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"></i>
            </button>
          </div>
        </div>
      </template>
    </PrimeMenu>
  </div>
</template>

<style scoped>
:deep(.p-menu) {
  padding: 0;
  border: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
:deep(.p-menu-list) {
  padding: 0;
}
</style>
