<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'

import PrimeBadge from 'primevue/badge'
import PrimeButton from 'primevue/button'
import PrimeMenu from 'primevue/menu'

import { useI18n } from 'vue-i18n'

import JobNotification from '@/components/molecules/notifications/JobNotification.vue'
import { useNotifications } from '@/composables/useNotifications'
import { useAuthStore } from '@/stores/useAuthStore'

import ContactImportNotification from './ContactImportNotification.vue'
import type { INotification } from './interfaces/notification.interface'
import { isContactImportNotification, isJobNotification } from './interfaces/notification.interface'

type NotificationType = INotification['type']

export default defineComponent({
  name: 'AppNotificationBell',
  components: {
    PrimeButton,
    PrimeBadge,
    PrimeMenu,
    ContactImportNotification,
    JobNotification
  },
  setup() {
    const { t } = useI18n()
    const menu = ref<InstanceType<typeof PrimeMenu> | null>(null)
    const authStore = useAuthStore()
    const list = ref<INotification[]>([])
    const unreadCount = computed(() => list.value.filter((n: INotification) => !n.read).length)

    const {
      deleteNotification: deleteNotificationBase,
      list: notificationsList,
      markRead: markReadBase,
      jobSystem
    } = useNotifications(
      authStore.user?.organizationId || undefined
    )

    // Sincronizar la lista de notificaciones cuando cambie
    watch(notificationsList, (newList) => {
      list.value = Array.isArray(newList) ? [...newList] : []
    }, { immediate: true, deep: true })

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

    const handleDelete = async (notification: INotification) => {
      if (!notification) {
        console.error('Notificación inválida')
        return
      }

      // Para notificaciones del frontend (sin ID válido del backend)
      if (!notification.id || notification.id <= 0) {
        console.log('Eliminando notificación local sin ID del backend')
        // Eliminar por índice usando una combinación única
        const index = list.value.findIndex(n =>
          n.title === notification.title &&
          n.message === notification.message &&
          n.timestamp === notification.timestamp
        )
        if (index !== -1) {
          list.value.splice(index, 1)
        }
        return
      }

      // Para notificaciones del backend (con ID válido)
      if (!authStore.user?.organizationId) {
        console.error('No hay ID de organización disponible')
        return
      }

      try {
        // Eliminar optimísticamente de la UI
        list.value = list.value.filter(n => n.id !== notification.id)
        // Luego eliminar del servidor
        await deleteNotificationBase(notification.id)
      } catch (error) {
        console.error('Error al borrar la notificación:', error)
        // Si hay error, recargar la lista
        if (notificationsList.value) {
          list.value = [...notificationsList.value]
        }
      }
    }

    const clearAllNotifications = async () => {
      try {
        // Separar notificaciones locales de las del backend
        const backendNotifications = list.value.filter(n => n.id && n.id > 0)
        const localNotifications = list.value.filter(n => !n.id || n.id <= 0)

        if (backendNotifications.length === 0 && localNotifications.length === 0) {
          console.warn('No hay notificaciones para borrar')
          return
        }

        // Limpiar optimísticamente la UI
        list.value = []

        // Si hay notificaciones del backend y tenemos organización
        if (backendNotifications.length > 0 && authStore.user?.organizationId) {
          const ids = backendNotifications
            .map(n => n.id)
            .filter((id): id is number => id !== undefined && id > 0)
          await Promise.all(ids.map(id => deleteNotificationBase(id)))
        }

        console.log(`Eliminadas ${backendNotifications.length} notificaciones del backend y ${localNotifications.length} notificaciones locales`)
      } catch (error) {
        console.error('Error al borrar todas las notificaciones:', error)
        // Si hay error, recargar la lista
        if (notificationsList.value) {
          list.value = [...notificationsList.value]
        }
      }
    }

    const markAsRead = async (notification: INotification) => {
      if (!notification) {
        console.error('Notificación inválida')
        return
      }

      // Para notificaciones del frontend (sin ID válido del backend)
      if (!notification.id || notification.id <= 0) {
        console.log('Marcando como leída notificación local sin ID del backend')
        // Marcar como leída solo localmente
        const localNotification = list.value.find(n =>
          n.title === notification.title &&
          n.message === notification.message &&
          n.timestamp === notification.timestamp
        )
        if (localNotification) {
          localNotification.read = true
        }
        return
      }

      // Para notificaciones del backend (con ID válido)
      try {
        // Marcar como leída optimísticamente
        const targetNotification = list.value.find(n => n.id === notification.id)
        if (targetNotification) {
          targetNotification.read = true
        }
        // Luego actualizar en el servidor
        await markReadBase(notification.id)
      } catch (error) {
        console.error('Error al marcar como leída:', error)
        // Si hay error, revertir el cambio
        const targetNotification = list.value.find(n => n.id === notification.id)
        if (targetNotification) {
          targetNotification.read = false
        }
      }
    }

    // Métodos para manejar jobs
    const handleJobDismiss = (jobId: string) => {
      console.log(`Dismissing job ${jobId}`)
      // Podríamos ocultar el job o marcarlo como visto
    }

    const handleJobViewReport = (jobId: string) => {
      console.log(`Viewing report for job ${jobId}`)
      // Aquí podríamos navegar a la página de reporte
    }

    // Verificar si una notificación es de job
    const isJobNotificationCheck = (notification: INotification): boolean => {
      return isJobNotification(notification)
    }

    // Obtener job progress de manera segura
    const getJobProgressSafe = (notification: INotification) => {
      if (!isJobNotification(notification) || !notification.data?.jobId) return null
      const jobId = notification.data.jobId as string
      return jobSystem.getJobProgress(jobId)
    }

    return {
      menu,
      unreadCount,
      list,
      formatDate,
      getIconClasses,
      t,
      handleDelete,
      clearAllNotifications,
      markAsRead,
      isContactImportNotification,

      // Sistema de jobs
      jobSystem,
      handleJobDismiss,
      handleJobViewReport,
      isJobNotification: isJobNotificationCheck,
      getJobProgressSafe
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
          <template
            v-for="notification in list"
            :key="`notification-${notification.id}-${notification.timestamp}`"
          >
            <!-- Notificación especializada para importación de contactos -->
            <ContactImportNotification
              v-if="isContactImportNotification(notification)"
              :notification="notification"
              @delete="handleDelete"
              @mark-as-read="markAsRead"
            />

            <!-- Notificación de Job genérica -->
            <JobNotification
              v-else-if="getJobProgressSafe(notification)"
              :job="getJobProgressSafe(notification)!"
              @dismiss="handleJobDismiss"
              @view-report="handleJobViewReport"
            />

            <!-- Notificación estándar -->
            <div
              v-else
              class="relative flex items-start gap-4 px-4 py-3 mb-3 rounded-lg shadow-sm border-l-4 transition-all duration-300"
              :class="{
                'border-green-700 dark:border-green-300 bg-white dark:bg-neutral-800': notification.type === 'success',
                'border-red-700 dark:border-red-300 bg-white dark:bg-neutral-800': notification.type === 'error',
                'border-yellow-700 dark:border-yellow-300 bg-white dark:bg-neutral-800': notification.type === 'warning',
                'border-blue-700 dark:border-blue-300 bg-white dark:bg-neutral-800': notification.type === 'info',
                'opacity-60': notification.read
              }"
            >
              <i :class="getIconClasses(notification.type)" />

              <div
                class="flex-grow min-w-0 cursor-pointer"
                @click="!notification.read && markAsRead(notification)"
                :title="!notification.read ? t('notifications.mark_as_read') : ''"
              >
                <div class="flex justify-between items-center mb-1">
                  <span
                    class="font-semibold text-gray-800 dark:text-gray-200 truncate"
                    :class="{ 'font-bold': !notification.read }"
                  >
                    {{ notification.title }}
                    <span
                      v-if="!notification.read"
                      class="inline-block w-2 h-2 bg-blue-500 rounded-full ml-2"
                    ></span>
                  </span>
                </div>
                <p
                  class="text-gray-700 dark:text-gray-300 text-sm"
                  :class="{ 'font-medium': !notification.read }"
                >
                  {{ notification.message }}
                </p>
                <div class="text-xs text-gray-400 dark:text-gray-500 mt-2 flex justify-between items-center">
                  <span>{{ formatDate(notification.timestamp) }}</span>
                  <span v-if="notification.read" class="text-green-600 dark:text-green-400 text-xs">
                    {{ t('notifications.read') }}
                  </span>
                </div>
              </div>

              <div class="flex flex-col gap-1">
                <!-- Botón marcar como leída (solo si no está leída) -->
                <button
                  v-if="!notification.read"
                  class="p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                  @click="markAsRead(notification)"
                  :title="t('notifications.mark_as_read')"
                >
                  <i class="pi pi-check text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"></i>
                </button>

                <!-- Botón eliminar -->
                <button
                  class="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                  @click="handleDelete(notification)"
                  :title="t('notifications.delete')"
                >
                  <i class="pi pi-times text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"></i>
                </button>
              </div>
            </div>
          </template>
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
