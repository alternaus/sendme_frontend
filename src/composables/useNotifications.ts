import { onMounted, onUnmounted, ref, watch } from 'vue'

import { io, type Socket } from 'socket.io-client'

import type { INotification } from '@/components/atoms/notifications/interfaces/notification.interface'
import { useNotificationService } from '@/services/notification/useNotificationService'
import { useAuthStore } from '@/stores/useAuthStore'

import { useJobNotifications } from './useJobNotifications'

export const useNotifications = (orgId?: number) => {
  const list = ref<INotification[]>([])
  const socket = ref<Socket | null>(null)
  const isConnected = ref(false)
  const authStore = useAuthStore()

  // Integrar el sistema de jobs
  const jobSystem = useJobNotifications(list)

  // Servicio de notificaciones para llamadas API
  const notificationService = useNotificationService()

  // Función helper para verificar si una notificación es de job
  const isJobNotificationCheck = (notification: INotification): boolean => {
    if (!notification.data?.jobId) return false

    const title = notification.title?.toLowerCase() || ''
    const message = notification.message?.toLowerCase() || ''

    // Verificar palabras clave de jobs conocidos
    const jobKeywords = [
      'importación',
      'importacion',
      'progreso',
      'completada',
      'fallida',
      'exportación',
      'exportacion',
      'sincronización',
      'sincronizacion',
      'campaña',
      'campaign',
      'análisis',
      'analysis',
      'backup',
      'restore',
    ]

    return jobKeywords.some((keyword) => title.includes(keyword) || message.includes(keyword))
  }

  // Función para filtrar notificaciones de sistema que no son relevantes para el usuario

  // Función para filtrar notificaciones de sistema que no son relevantes para el usuario
  const isSystemNotification = (notification: INotification): boolean => {
    const title = notification.title?.toLowerCase() || ''
    const message = notification.message?.toLowerCase() || ''

    const systemKeywords = [
      'conexión', 'conexion', 'conectado', 'websocket', 'sistema', 'servidor',
      'authentication', 'auth', 'login', 'logout', 'session', 'token'
    ]

    return systemKeywords.some(keyword =>
      title.includes(keyword) || message.includes(keyword)
    )
  }

  watch(
    () => authStore.token,
    (token) => {
      if (token && !socket.value) connect()
      if (!token && socket.value) disconnect()
    },
  )

  const connect = () => {
    if (!authStore.token) {
      return
    }
    if (socket.value) {
      return
    }

    const base =
      import.meta.env.MODE === 'development'
        ? 'http://localhost:4000'
        : (import.meta.env.VITE_API_URL ?? window.location.origin)
    const url = `${base}/notifications`

    socket.value = io(url, {
      transports: ['websocket'],
      auth: { token: authStore.token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.value.on('connect', () => {
      console.log('[WebSocket] Connected successfully')
      isConnected.value = true
      subscribe('notifications')

      // No solicitar historial via WebSocket ya que lo obtenemos via fetch API
      // El WebSocket solo se usa para actualizaciones en tiempo real
    })

    socket.value.on('disconnect', () => {
      isConnected.value = false
    })

    socket.value.on('connect_error', () => {})

    socket.value.on('notification', (n: INotification) => {
      console.log('[WebSocket] Real-time notification received:', { title: n.title, jobId: n.data?.jobId })

      // Filtrar notificaciones de conexión/sistema que no son relevantes para el usuario
      if (isSystemNotification(n)) {
        console.log('[WebSocket] System notification filtered out')
        return
      }

      // Procesar con el sistema de jobs si aplica
      jobSystem.processJobNotification(n)

      if (!Array.isArray(list.value)) {
        list.value = []
      }

      // Para notificaciones de job, buscar por jobId y actualizar la existente
      if (isJobNotificationCheck(n) && n.data?.jobId) {
        const jobId = n.data.jobId as string
        const existingJobIndex = list.value.findIndex(
          (existing) => existing.data?.jobId === jobId && isJobNotificationCheck(existing),
        )

        if (existingJobIndex !== -1) {
          // Actualizar la notificación existente del job
          console.log(`[WebSocket] Updating existing job notification: ${jobId}`)
          list.value[existingJobIndex] = {
            ...list.value[existingJobIndex],
            ...n,
            // Mantener el ID original si existe
            id: list.value[existingJobIndex].id || n.id,
          }
          return
        } else {
          // Primera notificación de este job, agregarla normalmente
          console.log(`[WebSocket] Adding new job notification: ${jobId}`)
          list.value.unshift(n)
          return
        }
      }

      // Para notificaciones normales (no de job), verificar duplicados por contenido
      const existingIndex = list.value.findIndex((existing) => {
        // Si ambas tienen ID, comparar por ID
        if (existing.id && n.id && existing.id > 0 && n.id > 0) {
          return existing.id === n.id
        }

        // Si no tienen ID válido, comparar por contenido
        return (
          existing.title === n.title &&
          existing.message === n.message &&
          Math.abs(new Date(existing.timestamp).getTime() - new Date(n.timestamp).getTime()) < 5000
        )
      })

      if (existingIndex !== -1) {
        // Actualizar notificación existente
        console.log('[WebSocket] Updating existing notification')
        list.value[existingIndex] = { ...list.value[existingIndex], ...n }
      } else {
        // Nueva notificación
        console.log('[WebSocket] Adding new notification')
        list.value.unshift(n)
      }
    })

    socket.value.on('notifications:history', (_notifications: INotification[]) => {
      // Este evento ya no es necesario porque cargamos el historial via API
      // Solo lo mantenemos por compatibilidad con el backend
      console.log('[WebSocket] History event received but ignored (using API fetch instead)')
    })
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
    }
    isConnected.value = false
  }

  const subscribe = (channel: string) => {
    if (!socket.value?.connected) {
      return
    }
    socket.value.emit('subscribe', { channel })
  }

  const unsubscribe = (channel: string) => {
    if (!socket.value?.connected) {
      return
    }
    socket.value.emit('unsubscribe', { channel })
  }

  const fetchHistory = async () => {
    try {
      console.log('[Notifications] Fetching initial history from API...')
      const notifications = await notificationService.getUnreadNotifications()

      console.log(`[Notifications] Fetched ${notifications.length} notifications from API`)

      // Procesar y limpiar duplicados
      const cleanNotifications = removeDuplicates(notifications)

      // Ordenar por timestamp (más recientes primero)
      list.value = cleanNotifications.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )

      // Inicializar el sistema de jobs con las notificaciones obtenidas
      console.log('[Notifications] Initializing job system with fetched notifications...')
      jobSystem.initializeFromExistingNotifications()

      console.log(`[Notifications] Initialization complete: ${list.value.length} notifications loaded`)
    } catch (error) {
      console.error('[Notifications] Error fetching history:', error)
      list.value = []
    }
  }

  const removeDuplicates = (notifications: INotification[]): INotification[] => {
    const seen = new Set<string>()
    const jobsSeen = new Map<string, number>() // jobId -> index del más reciente

    return notifications.filter((notification, index) => {
      // Para notificaciones de job, mantener solo la más reciente por jobId
      if (notification.data?.jobId && isJobNotificationCheck(notification)) {
        const jobId = notification.data.jobId as string
        const existingIndex = jobsSeen.get(jobId)

        if (existingIndex !== undefined) {
          // Ya existe una notificación de este job, mantener la más reciente
          const existingNotification = notifications[existingIndex]
          const currentTime = new Date(notification.timestamp).getTime()
          const existingTime = new Date(existingNotification.timestamp).getTime()

          if (currentTime > existingTime) {
            // La actual es más reciente, marcar la anterior para eliminación
            jobsSeen.set(jobId, index)
            return true
          } else {
            // La existente es más reciente, eliminar la actual
            return false
          }
        } else {
          // Primera notificación de este job
          jobsSeen.set(jobId, index)
          return true
        }
      }

      // Para notificaciones normales, usar la lógica existente
      const key =
        notification.id && notification.id > 0
          ? `id:${notification.id}`
          : `content:${notification.title}:${notification.message}:${notification.timestamp}`

      if (seen.has(key)) {
        return false
      }

      seen.add(key)
      return true
    })
  }

  const markRead = async (id: number) => {
    try {
      await notificationService.markReadNotification(id)
      if (Array.isArray(list.value)) {
        const item = list.value.find((n) => n.id === id)
        if (item) item.read = true
      }
    } catch {}
  }

  const deleteNotification = async (id: number) => {
    if (!id || id <= 0) {
      return
    }

    try {
      // Eliminar optimísticamente de la lista local
      if (Array.isArray(list.value)) {
        list.value = list.value.filter((n) => n.id !== id)
      }

      if (!orgId) {
        return
      }

      // Marcar como leída y eliminar en el servidor
      await notificationService.markReadNotification(id)
    } catch {
      // En caso de error, recargar la lista
      await fetchHistory()
    }
  }

  onMounted(async () => {
    // Estrategia de carga:
    // 1. Primero cargar notificaciones existentes via API
    // 2. Después conectar WebSocket para actualizaciones en tiempo real
    console.log('[Notifications] Starting initialization...')

    await fetchHistory() // 1. Carga inicial via fetch
    connect()            // 2. WebSocket para tiempo real

    console.log('[Notifications] Initialization complete')
  })

  onUnmounted(() => {
    disconnect()
  })

  return {
    list,
    isConnected,
    fetchHistory,
    markRead,
    deleteNotification,
    connect,
    disconnect,
    subscribe,
    unsubscribe,

    // Sistema de jobs expuesto para uso avanzado
    jobSystem,

    // Helper para verificar notificaciones de job
    isJobNotificationCheck,
  }
}
