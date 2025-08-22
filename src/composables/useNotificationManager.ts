import { computed } from 'vue'

import type { INotification } from '@/components/atoms/notifications/interfaces/notification.interface'
import { useNotifications } from '@/composables/useNotifications'
import { useNotificationService } from '@/services/notification/useNotificationService'
import { useAuthStore } from '@/stores/useAuthStore'

/**
 * Composable unificado que combina el sistema reactivo de notificaciones
 * con los servicios de API para una experiencia completa
 */
export const useNotificationManager = () => {
  const authStore = useAuthStore()
  const orgId = authStore.user?.organizationId

  // Sistema reactivo principal
  const notificationSystem = useNotifications(orgId)

  // Servicios de API
  const notificationService = useNotificationService()

  // ===============================================
  // COMPUTED PROPERTIES UNIFICADOS
  // ===============================================

  // Notificaciones con información extendida
  const notificationsWithStats = computed(() => {
    return notificationSystem.list.value.map(notification => ({
      ...notification,
      isJob: notificationSystem.isJobNotificationCheck(notification),
      jobProgress: notification.data?.jobId
        ? notificationSystem.jobSystem.getJobProgress(notification.data.jobId as string)
        : null
    }))
  })

  // Estadísticas generales
  const stats = computed(() => ({
    total: notificationSystem.list.value.length,
    unread: notificationSystem.list.value.filter(n => !n.read).length,
    activeJobs: notificationSystem.jobSystem.activeJobs.value.length,
    completedJobs: notificationSystem.jobSystem.completedJobs.value.length,
    jobsWithErrors: notificationSystem.jobSystem.hasJobsWithErrors.value
  }))

  // ===============================================
  // MÉTODOS UNIFICADOS
  // ===============================================

  // Refrescar notificaciones desde el servidor
  const refresh = async () => {
    await notificationSystem.fetchHistory()
  }

  // Marcar como leída usando el servicio
  const markAsRead = async (notification: INotification) => {
    if (!notification.id || notification.id <= 0) {
      // Para notificaciones locales, solo marcar en el estado local
      const localNotification = notificationSystem.list.value.find(n =>
        n.title === notification.title &&
        n.message === notification.message &&
        n.timestamp === notification.timestamp
      )
      if (localNotification) {
        localNotification.read = true
      }
      return
    }

    try {
      // Marcar como leída optimísticamente
      const targetNotification = notificationSystem.list.value.find(n => n.id === notification.id)
      if (targetNotification) {
        targetNotification.read = true
      }

      // Actualizar en el servidor
      await notificationService.markReadNotification(notification.id)
    } catch (error) {
      console.error('Error al marcar como leída:', error)
      // Revertir el cambio local
      const targetNotification = notificationSystem.list.value.find(n => n.id === notification.id)
      if (targetNotification) {
        targetNotification.read = false
      }
      throw error
    }
  }

  // Eliminar notificación usando el servicio
  const deleteNotification = async (notification: INotification) => {
    if (!notification.id || notification.id <= 0) {
      // Para notificaciones locales, solo eliminar del estado local
      notificationSystem.list.value = notificationSystem.list.value.filter(n =>
        !(n.title === notification.title &&
          n.message === notification.message &&
          n.timestamp === notification.timestamp)
      )
      return
    }

    try {
      // Eliminar optimísticamente de la UI
      notificationSystem.list.value = notificationSystem.list.value.filter(n => n.id !== notification.id)

      // Eliminar del servidor
      await notificationService.markAllAsRead(notification.id)
    } catch (error) {
      console.error('Error al eliminar notificación:', error)
      // Recargar en caso de error
      await refresh()
      throw error
    }
  }

  // Marcar todas como leídas
  const markAllAsRead = async () => {
    try {
      // Marcar todas como leídas optimísticamente
      notificationSystem.list.value.forEach(notification => {
        notification.read = true
      })

      // Actualizar en el servidor
      await notificationService.markAllAsRead()
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error)
      // Recargar en caso de error
      await refresh()
      throw error
    }
  }

  // Eliminar todas las notificaciones
  const deleteAll = async () => {
    try {
      // Limpiar optimísticamente
      notificationSystem.list.value = []

      // Eliminar del servidor
      await notificationService.markAllAsRead()
    } catch (error) {
      console.error('Error al eliminar todas las notificaciones:', error)
      // Recargar en caso de error
      await refresh()
      throw error
    }
  }

  // ===============================================
  // MÉTODOS ESPECÍFICOS PARA JOBS
  // ===============================================


  // Limpiar jobs completados antiguos
  const cleanupOldJobs = (daysOld: number = 7) => {
    notificationSystem.jobSystem.cleanupOldJobs(daysOld)
  }

  // ===============================================
  // UTILIDADES
  // ===============================================

  // Verificar si una notificación es de job
  const isJobNotification = (notification: INotification): boolean => {
    return notificationSystem.isJobNotificationCheck(notification)
  }

  // Obtener progreso de un job
  const getJobProgress = (jobId: string) => {
    return notificationSystem.jobSystem.getJobProgress(jobId)
  }

  return {
    // Estado reactivo
    list: notificationSystem.list,
    isConnected: notificationSystem.isConnected,
    notificationsWithStats,
    stats,

    // Sistema de jobs
    jobSystem: notificationSystem.jobSystem,

    // Métodos de gestión
    refresh,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    deleteAll,

    cleanupOldJobs,

    // Utilidades
    isJobNotification,
    getJobProgress,

    // Acceso directo a servicios específicos
    service: notificationService,
    system: notificationSystem
  }
}

export type UseNotificationManagerReturn = ReturnType<typeof useNotificationManager>
