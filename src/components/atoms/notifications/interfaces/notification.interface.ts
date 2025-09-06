export interface INotification {
  id?:string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  data?: Record<string, unknown>
  timestamp: string
  read: boolean
}

export interface IBaseJobData extends Record<string, unknown> {
  jobId: string
  timestamp: string
}

export interface IJobStartData extends IBaseJobData {
  jobStarted: true
  jobType?: string
}

export interface IJobProgressData extends IBaseJobData {
  progress: number
  processed: number
  errors: number
  total?: number
}

export interface IJobCompletionData extends IBaseJobData {
  processed: number
  errors: number
  total: number
  completed: true
  errorDetails?: string[]
}

export interface IContactImportStartData extends IJobStartData {
  jobType: 'contact_import'
}

export interface IContactImportProgressData extends IJobProgressData {
  jobType?: 'contact_import'
}

export interface IContactImportCompletionData extends IJobCompletionData {
  jobType?: 'contact_import'
}

export interface IContactExportStartData extends IJobStartData {
  jobType: 'contact_export'
  format?: 'csv' | 'xlsx' | 'pdf'
}

export interface IContactExportProgressData extends IJobProgressData {
  jobType?: 'contact_export'
}

export interface IContactExportCompletionData extends IJobCompletionData {
  jobType?: 'contact_export'
  downloadUrl?: string
}

export interface IDataSyncStartData extends IJobStartData {
  jobType: 'data_sync'
  source?: string
}

export interface IDataSyncProgressData extends IJobProgressData {
  jobType?: 'data_sync'
}

export interface IDataSyncCompletionData extends IJobCompletionData {
  jobType?: 'data_sync'
}

export const isJobNotification = (notification: INotification): boolean => {
  return notification.data?.jobId !== undefined && typeof notification.data.jobId === 'string'
}

export const isJobStartNotification = (data: Record<string, unknown> | undefined): data is IJobStartData => {
  return data !== undefined &&
         typeof data.jobId === 'string' &&
         data.jobStarted === true
}

export const isJobProgressNotification = (data: Record<string, unknown> | undefined): data is IJobProgressData => {
  return data !== undefined &&
         typeof data.jobId === 'string' &&
         typeof data.progress === 'number' &&
         typeof data.processed === 'number'
}

export const isJobCompletionNotification = (data: Record<string, unknown> | undefined): data is IJobCompletionData => {
  return data !== undefined &&
         typeof data.jobId === 'string' &&
         data.completed === true &&
         typeof data.total === 'number'
}

export const isContactImportNotification = (notification: INotification): boolean => {
  if (!isJobNotification(notification)) return false

  const title = notification.title?.toLowerCase() || ''
  const message = notification.message?.toLowerCase() || ''
  const jobType = notification.data?.jobType as string

  if (title.includes('conexión') || title.includes('conexion') ||
      title.includes('conectado') || title.includes('websocket') ||
      message.includes('conexión') || message.includes('conexion') ||
      message.includes('conectado') || message.includes('websocket')) {
    return false
  }

  if (jobType === 'contact_import') return true

  const isImportRelated = title.includes('importación') || title.includes('importacion') ||
                          message.includes('importación') || message.includes('importacion')

  const isContactRelated = title.includes('contacto') || message.includes('contacto') ||
                          title.includes('progreso') || message.includes('progreso') ||
                          title.includes('finalizado') || message.includes('finalizado') ||
                          title.includes('completad') || message.includes('completad')

  return isImportRelated && (isContactRelated ||
                           notification.data?.progress !== undefined ||
                           notification.data?.completed !== undefined ||
                           notification.data?.jobStarted !== undefined)
}

export const isProgressNotification = (data: Record<string, unknown> | undefined): data is IContactImportProgressData => {
  return isJobProgressNotification(data)
}

export const isCompletionNotification = (data: Record<string, unknown> | undefined): data is IContactImportCompletionData => {
  return isJobCompletionNotification(data)
}

export const isStartNotification = (data: Record<string, unknown> | undefined): data is IContactImportStartData => {
  return isJobStartNotification(data)
}

export const getJobId = (notification: INotification): string | null => {
  return notification.data?.jobId as string || null
}

export const getJobType = (notification: INotification): string | null => {
  return notification.data?.jobType as string || null
}

export const isJobActive = (jobId: string, notifications: INotification[]): boolean => {
  const jobNotifications = notifications.filter(n => getJobId(n) === jobId)

  const hasStart = jobNotifications.some(n => n.data && isJobStartNotification(n.data))
  const hasCompletion = jobNotifications.some(n => n.data && isJobCompletionNotification(n.data))

  return hasStart && !hasCompletion
}
