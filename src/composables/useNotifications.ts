import { onMounted, onUnmounted, ref, watch } from 'vue'

import { useToast } from 'primevue/usetoast'

import axios from 'axios'
import { io, type Socket } from 'socket.io-client'
import { useI18n } from 'vue-i18n'

import { useAuthStore } from '@/stores/useAuthStore'

interface Notification {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  data?: Record<string, unknown>
  timestamp: string
  read: boolean
}

export const useNotifications = (orgId: number) => {
  const list = ref<Notification[]>([])
  const socket = ref<Socket | null>(null)
  const isConnected = ref(false)
  const toast = useToast()
  const { t } = useI18n()
  const authStore = useAuthStore()

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
      toast.add({
        severity: 'error',
        summary: t('general.error'),
        detail: t('general.connection_error'),
        life: 3000,
      })
    })

    socket.value.on('notification', (n: Notification) => {
      console.log('[WebSocket] Notificación recibida:', n)
      if (Array.isArray(list.value)) {
        list.value.unshift(n)
      } else {
        list.value = [n]
      }
      const severity = n.type === 'warning' ? 'warn' : n.type
      toast.add({
        severity,
        summary: n.title,
        detail: n.message,
        life: 5000,
      })
    })

    socket.value.on('notifications:history', (notifications: Notification[]) => {
      console.log('[WebSocket] Historial de notificaciones recibido:', notifications)
      list.value = Array.isArray(notifications) ? notifications : []
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
      const res = await axios.get<Notification[]>('/notifications', {
        params: { orgId, unreadOnly: false },
      })
      list.value = Array.isArray(res.data) ? res.data : []
    } catch (error) {
      console.error('[Notifications] Error al obtener historial:', error)
      list.value = []
    }
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
    connect,
    disconnect,
    subscribe,
    unsubscribe
  }
}
