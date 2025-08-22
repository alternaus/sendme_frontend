import type { INotification } from '@/components/atoms/notifications/interfaces/notification.interface'
import { useApiClient } from '@/composables/useApiClient'

export const useNotificationService = () => {
  const privateApi = useApiClient(true)

  const getUnreadNotifications = async () => {
    return privateApi.get<INotification[]>('/notifications')
  }

  const markReadNotification = async (id: number) => {
    return privateApi.patch(`/notifications/${id}/read`)
  }



  const markAllAsRead = async (orgId?: number) => {
    return privateApi.patch('/notifications/read', {
      orgId
    })
  }



  return {
    getUnreadNotifications,
    markReadNotification,
    markAllAsRead,

  }
}
