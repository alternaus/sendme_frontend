import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import { io, type Socket } from 'socket.io-client'

import { useApiClient } from '@/composables/useApiClient'
import { BASE_URL } from '@/helpers/api-url.helper'
import { useAuthStore } from '@/stores/useAuthStore'

//Interfaces simplificadas
export interface INotification {
  id?:string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  data?: {
    jobId?: string
    jobType?: string
    progress?: number
    processed?: number
    errors?: number
    total?: number
    completed?: boolean
    errorDetails?: string[]
    [key: string]: unknown
  }
  timestamp: string
  read: boolean
}

export interface JobProgress {
  jobId: string
  jobType?: string
  isActive: boolean
  progress: number
  processed: number
  errors: number
  total?: number
  errorDetails: string[]
  startTime: Date
  endTime?: Date
  lastUpdate: Date
}

export const useNotifications = () => {
  const authStore = useAuthStore()
  const privateApi = useApiClient(true)

  //Estado principal
  const notifications = ref<INotification[]>([])
  const jobs = ref<Map<string, JobProgress>>(new Map())
  const socket = ref<Socket | null>(null)
  const isConnected = ref(false)

  //Computed properties
  const unreadCount = computed(() =>
    notifications.value.filter(n => !n.read).length
  )

  const activeJobs = computed(() =>
    Array.from(jobs.value.values()).filter(job => job.isActive)
  )

  const completedJobs = computed(() =>
    Array.from(jobs.value.values()).filter(job => !job.isActive)
  )

  const hasActiveImports = computed(() =>
    activeJobs.value.some(job => job.jobType === 'contact_import')
  )

  //Utilidades
  const isJobNotification = (notification: INotification): boolean => {
    return Boolean(notification.data?.jobId)
  }

  const isContactImportNotification = (notification: INotification): boolean => {
    if (!isJobNotification(notification)) return false

    const { title = '', message = '' } = notification
    const jobType = notification.data?.jobType

    //Filtrar notificaciones de sistema
    const systemKeywords = ['conexión', 'conectado', 'websocket', 'sistema']
    if (systemKeywords.some(keyword =>
      title.toLowerCase().includes(keyword) || message.toLowerCase().includes(keyword)
    )) {
      return false
    }

    return jobType === 'contact_import' ||
           (title.toLowerCase().includes('importación') ||
            message.toLowerCase().includes('importación'))
  }

  const getJobProgress = (jobId: string): JobProgress | null => {
    return jobs.value.get(jobId) || null
  }

  //Gestión de jobs
  const updateJobFromNotification = (notification: INotification) => {
    const jobId = notification.data?.jobId
    if (!jobId) return

    const existingJob = jobs.value.get(jobId)
    const timestamp = new Date(notification.timestamp)

    const jobData: JobProgress = {
      jobId,
      jobType: notification.data?.jobType,
      isActive: !notification.data?.completed,
      progress: notification.data?.progress || (notification.data?.completed ? 100 : 0),
      processed: notification.data?.processed || 0,
      errors: notification.data?.errors || 0,
      total: notification.data?.total,
      errorDetails: notification.data?.errorDetails || [],
      startTime: existingJob?.startTime || timestamp,
      endTime: notification.data?.completed ? timestamp : undefined,
      lastUpdate: timestamp
    }

    jobs.value.set(jobId, jobData)
  }

  //API calls
  const fetchNotifications = async (): Promise<INotification[]> => {
    try {
      return await privateApi.get<INotification[]>('/notifications')
    } catch {
      return []
    }
  }

  const markAsRead = async (notification: INotification) => {
    if (!notification.id) {
      //Notificación local
      const index = notifications.value.findIndex(n =>
        n.title === notification.title &&
        n.message === notification.message &&
        n.timestamp === notification.timestamp
      )
      if (index !== -1) {
        notifications.value[index].read = true
      }
      return
    }

    try {
      //Marcar optimísticamente
      const target = notifications.value.find(n => n.id === notification.id)
      if (target) target.read = true

      await privateApi.patch(`/notifications/${notification.id}/read`)
    } catch (error) {
      //Revertir en caso de error
      const target = notifications.value.find(n => n.id === notification.id)
      if (target) target.read = false
      throw error
    }
  }

  const deleteNotification = async (notification: INotification) => {
    if (!notification.id) {
      //Eliminar notificación local
      notifications.value = notifications.value.filter(n =>
        !(n.title === notification.title &&
          n.message === notification.message &&
          n.timestamp === notification.timestamp)
      )
      return
    }

    try {
      //Eliminar optimísticamente
      notifications.value = notifications.value.filter(n => n.id !== notification.id)
      await privateApi.patch(`/notifications/${notification.id}/read`)
    } catch (error) {
      //Recargar en caso de error
      await loadNotifications()
      throw error
    }
  }

  const markAllAsRead = async () => {
    try {
      notifications.value.forEach(n => n.read = true)
      await privateApi.patch('/notifications/read', {
        orgId: authStore.user?.organizationId
      })
    } catch (error) {
      await loadNotifications()
      throw error
    }
  }

  const deleteAll = async () => {
    try {
      notifications.value = []
      await privateApi.patch('/notifications/read')
    } catch (error) {
      await loadNotifications()
      throw error
    }
  }

  //WebSocket
  const connectWebSocket = () => {
    if (!authStore.token || socket.value) return

    socket.value = io(`${BASE_URL}/notifications`, {
      transports: ['websocket'],
      auth: { token: authStore.token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.value.on('connect', () => {
      isConnected.value = true
      socket.value?.emit('subscribe', { channel: 'notifications' })
    })

    socket.value.on('disconnect', () => {
      isConnected.value = false
    })

    socket.value.on('notification', (notification: INotification) => {
      //Filtrar notificaciones de sistema irrelevantes
      const systemKeywords = ['conexión', 'conectado', 'websocket', 'authentication', 'login']
      const title = notification.title?.toLowerCase() || ''
      const message = notification.message?.toLowerCase() || ''

      if (systemKeywords.some(keyword => title.includes(keyword) || message.includes(keyword))) {
        return
      }

      //Actualizar job si aplica
      if (isJobNotification(notification)) {
        updateJobFromNotification(notification)
      }

      //Agregar/actualizar notificación
      if (notification.data?.jobId) {
        //Para jobs, mantener solo la más reciente por jobId
        const existingIndex = notifications.value.findIndex(n =>
          n.data?.jobId === notification.data?.jobId
        )
        if (existingIndex !== -1) {
          notifications.value[existingIndex] = notification
        } else {
          notifications.value.unshift(notification)
        }
      } else {
        //Para notificaciones normales, verificar duplicados
        const exists = notifications.value.some(n =>
          n.title === notification.title &&
          n.message === notification.message &&
          Math.abs(new Date(n.timestamp).getTime() - new Date(notification.timestamp).getTime()) < 5000
        )
        if (!exists) {
          notifications.value.unshift(notification)
        }
      }
    })
  }

  const disconnectWebSocket = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
    }
    isConnected.value = false
  }

  //Cargar notificaciones iniciales
  const loadNotifications = async () => {
    try {
      const fetchedNotifications = await fetchNotifications()

      //Procesar jobs de las notificaciones existentes
      fetchedNotifications.forEach(notification => {
        if (isJobNotification(notification)) {
          updateJobFromNotification(notification)
        }
      })

      //Remover duplicados y ordenar
      const uniqueNotifications = new Map<string, INotification>()

      fetchedNotifications.forEach(notification => {
        const key = notification.id
          ? `id:${notification.id}`
          : `content:${notification.title}:${notification.message}:${notification.timestamp}`

        if (!uniqueNotifications.has(key)) {
          uniqueNotifications.set(key, notification)
        }
      })

      notifications.value = Array.from(uniqueNotifications.values())
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    } catch {
      notifications.value = []
    }
  }

  //Watchers
  watch(
    () => authStore.token,
    (token) => {
      if (token && !socket.value) {
        connectWebSocket()
      } else if (!token && socket.value) {
        disconnectWebSocket()
      }
    }
  )

  //Lifecycle
  onMounted(async () => {
    await loadNotifications()
    connectWebSocket()
  })

  onUnmounted(() => {
    disconnectWebSocket()
  })

  //Limpiar jobs antiguos (7 días por defecto)
  const cleanupOldJobs = (daysOld: number = 7) => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    for (const [jobId, job] of jobs.value.entries()) {
      if (!job.isActive && job.endTime && job.endTime < cutoffDate) {
        jobs.value.delete(jobId)
      }
    }
  }

  return {
    //Estado
    notifications,
    unreadCount,
    isConnected,

    //Jobs
    activeJobs,
    completedJobs,
    hasActiveImports,
    getJobProgress,
    cleanupOldJobs,

    //Métodos
    loadNotifications,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    deleteAll,

    //Utilidades
    isJobNotification,
    isContactImportNotification
  }
}
