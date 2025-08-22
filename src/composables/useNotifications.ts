import { onMounted, onUnmounted, ref, watch } from 'vue'

import axios from 'axios'
import { io, type Socket } from 'socket.io-client'

import type { INotification } from '@/components/atoms/notifications/interfaces/notification.interface'
import { useAuthStore } from '@/stores/useAuthStore'

import { useJobNotifications } from './useJobNotifications'

export const useNotifications = (orgId?: number) => {
  const list = ref<INotification[]>([])
  const socket = ref<Socket | null>(null)
  const isConnected = ref(false)
  const authStore = useAuthStore()

  // Integrar el sistema de jobs
  const jobSystem = useJobNotifications(list)

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
    }
  )

  const connect = () => {
    if (!authStore.token) {
      console.warn('[WebSocket] No hay token, omitiendo conexión')
      return
    }
    if (socket.value) {
      console.log('[WebSocket] Ya conectado')
      return
    }

    const base = import.meta.env.MODE === 'development'
      ? 'http://localhost:4000'
      : import.meta.env.VITE_API_URL ?? window.location.origin
    const url = `${base}/notifications`
    console.log('[WebSocket] Conectando a', url)

    socket.value = io(url, {
      transports: ['websocket'],
      auth: { token: authStore.token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.value.on('connect', () => {
      console.log('[WebSocket] Conectado:', socket.value?.id)
      isConnected.value = true
      subscribe('notifications')
    })

    socket.value.on('disconnect', (reason) => {
      console.log('[WebSocket] Desconectado:', reason)
      isConnected.value = false
    })

    socket.value.on('connect_error', (err) => {
      console.error('[WebSocket] Error de conexión:', err.message)
    })

    socket.value.on('notification', (n: INotification) => {
      console.log('[WebSocket] Notificación recibida:', n)

      // Filtrar notificaciones de conexión/sistema que no son relevantes para el usuario
      if (isSystemNotification(n)) {
        console.log('[WebSocket] Notificación de sistema filtrada:', n)
        return
      }

      // Procesar con el sistema de jobs si aplica
      jobSystem.processJobNotification(n)

      if (!Array.isArray(list.value)) {
        list.value = [n]
        return
      }

      // Verificar si la notificación ya existe para evitar duplicados
      const existingIndex = list.value.findIndex(existing => {
        // Si ambas tienen ID, comparar por ID
        if (existing.id && n.id && existing.id === n.id) {
          return true
        }
        // Si no tienen ID o son diferentes, comparar por contenido
        return existing.title === n.title &&
               existing.message === n.message &&
               existing.timestamp === n.timestamp
      })

      if (existingIndex !== -1) {
        // Si existe, actualizar la notificación existente
        list.value[existingIndex] = { ...list.value[existingIndex], ...n }
        console.log('[WebSocket] Notificación actualizada:', n)
      } else {
        // Si no existe, agregar al inicio
        list.value.unshift(n)
        console.log('[WebSocket] Nueva notificación agregada:', n)
      }
    })

    socket.value.on('notifications:history', (notifications: INotification[]) => {
      console.log('[WebSocket] Historial de notificaciones recibido:', notifications)

      // Filtrar notificaciones de sistema del historial recibido via WebSocket
      const filteredNotifications = Array.isArray(notifications) ?
        notifications.filter(notification => !isSystemNotification(notification)) : []

      const cleanNotifications = removeDuplicates(filteredNotifications)
      list.value = cleanNotifications.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )

      // Inicializar el sistema de jobs con las notificaciones existentes
      jobSystem.initializeFromExistingNotifications()
    })
  }

  const disconnect = () => {
    if (socket.value) {
      console.log('[WebSocket] Desconectando')
      socket.value.disconnect()
      socket.value = null
    }
    isConnected.value = false
  }

  const subscribe = (channel: string) => {
    if (!socket.value?.connected) {
      console.error('[WebSocket] No conectado')
      return
    }
    console.log('[WebSocket] subscribe ->', channel)
    socket.value.emit('subscribe', { channel })
  }

  const unsubscribe = (channel: string) => {
    if (!socket.value?.connected) {
      console.error('[WebSocket] No conectado')
      return
    }
    console.log('[WebSocket] unsubscribe ->', channel)
    socket.value.emit('unsubscribe', { channel })
  }

  const fetchHistory = async () => {
    try {
      const res = await axios.get<INotification[]>('/notifications', {
        params: { orgId, unreadOnly: false },
      })
      const notifications = Array.isArray(res.data) ? res.data : []

      // Filtrar notificaciones de sistema/conexión del historial
      const filteredNotifications = notifications.filter(notification => !isSystemNotification(notification))

      // Eliminar duplicados y ordenar por timestamp
      list.value = removeDuplicates(filteredNotifications).sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    } catch (error) {
      console.error('[Notifications] Error al obtener historial:', error)
      list.value = []
    }
  }

  const removeDuplicates = (notifications: INotification[]): INotification[] => {
    const seen = new Set<string>()
    return notifications.filter(notification => {
      // Crear una clave única basada en ID (si existe) o contenido
      const key = notification.id && notification.id > 0
        ? `id-${notification.id}`
        : `content-${notification.title}-${notification.message}-${notification.timestamp}`

      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  }

  const markRead = async (id: number) => {
    try {
      await axios.patch(`/notifications/${id}/read`)
      if (Array.isArray(list.value)) {
        const item = list.value.find((n) => n.id === id)
        if (item) item.read = true
      }
    } catch (error) {
      console.error('[Notifications] Error al marcar como leída:', error)
    }
  }

  const deleteNotification = async (id: number) => {
    if (!id || id <= 0) {
      console.warn('[Notifications] ID inválido para eliminar del servidor:', id)
      return
    }

    try {
      // Eliminar optimísticamente de la lista local
      if (Array.isArray(list.value)) {
        list.value = list.value.filter(n => n.id !== id)
      }

      if (!orgId) {
        console.log('[Notifications] Notificación eliminada localmente (sin orgId)')
        return
      }

      // Marcar como leída y eliminar en el servidor
      await axios.patch(`/notifications/${id}/read`)
      await axios.delete(`/notifications/${id}`)

      console.log('[Notifications] Notificación eliminada del servidor:', id)
    } catch (error) {
      console.error('[Notifications] Error al eliminar notificación:', error)
      // En caso de error, recargar la lista
      await fetchHistory()
    }
  }

  onMounted(async () => {
    await fetchHistory()
    connect()
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
    jobSystem
  }
}
