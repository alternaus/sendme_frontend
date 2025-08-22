export enum NotificationType {
  success = 'success',
  error = 'error',
  warning = 'warning',
  info = 'info',
}

export enum NotificationCategory {
  PROCESS = 'PROCESS',
  INFORMATIVE = 'INFORMATIVE',
  ALERT = 'ALERT',
  USER_ACTION = 'USER_ACTION',
}

export enum ProcessType {
  CONTACT_IMPORT = 'CONTACT_IMPORT',
  SMS_SEND = 'SMS_SEND',
  EMAIL_SEND = 'EMAIL_SEND',
  CAMPAIGN_PROCESS = 'CAMPAIGN_PROCESS',
  DATA_EXPORT = 'DATA_EXPORT',
  DATA_BACKUP = 'DATA_BACKUP',
  BULK_DELETE = 'BULK_DELETE',
  BULK_UPDATE = 'BULK_UPDATE',
  WEBHOOK_DELIVERY = 'WEBHOOK_DELIVERY',
}

export enum ProcessEvent {
  START = 'START',
  PROGRESS = 'PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  PAUSED = 'PAUSED',
  RESUMED = 'RESUMED',
}

export interface INotification {
  id: number
  organizationId: number
  type: NotificationType
  title: string
  message: string
  data: Record<string, unknown> | null
  timestamp: Date
  read: boolean
  category: NotificationCategory | null
  processType: ProcessType | null
  processEvent: ProcessEvent | null
  jobId: string | null
  entityType: string | null
  entityId: string | null
  createdAt: Date
  updatedAt: Date
}
