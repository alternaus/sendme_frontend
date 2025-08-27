import { onUnmounted, ref, watch } from 'vue'

import { useToast } from 'primevue/usetoast'

import { io, type Socket } from 'socket.io-client'
import { useI18n } from 'vue-i18n'

import { BASE_URL } from '@/helpers/api-url.helper'
import { useAuthStore } from '@/stores/useAuthStore'

export interface NotificationData {
  progress?: number
  total?: number
  errors?: string[]
  [key: string]: unknown
}

export interface Notification {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  data?: NotificationData
  timestamp: Date
}

export const useWebSocket = () => {
  const socket = ref<Socket| null>(null)
  const isConnected = ref(false)
  const toast = useToast()
  const { t } = useI18n()
  const authStore = useAuthStore()

  watch(
    () => authStore.token,
    (token, _) => {
      if (token && !socket.value) connect()
      if (!token && socket.value) disconnect()
    }
  )

  const connect = () => {
    if (!authStore.token) {
      return
    }
    if (socket.value) {
      return
    }

    const url = `${BASE_URL}/notifications`

    socket.value = io(url, {
      transports: ['websocket'],
      auth: { token: authStore.token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.value.on('connect', () => {
      isConnected.value = true
    })

    socket.value.on('disconnect', (_reason) => {
      isConnected.value = false
    })

    socket.value.on('connect_error', (_err) => {
      toast.add({
        severity: 'error',
        summary: t('general.error'),
        detail: t('general.connection_error'),
        life: 3000,
      })
    })

    socket.value.onAny((_event, ..._args) => {
    })

    socket.value.on('notification', (n: Notification) => {
      const severity = n.type === 'warning' ? 'warn' : n.type
      toast.add({
        severity,
        summary: n.title,
        detail: n.message,
        life: 5000,
      })
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

  onUnmounted(disconnect)

  return {
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    isConnected,
  }
}
