export interface INotification {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  data?: Record<string, unknown>
  timestamp: string
  read: boolean
}