import { computed, type Ref } from 'vue'

import type { INotification } from '@/components/atoms/notifications/interfaces/notification.interface'
import { isContactImportNotification } from '@/components/atoms/notifications/interfaces/notification.interface'

import { useJobNotifications } from './useJobNotifications'

/**
 * Composable especializado para notificaciones de importación de contactos
 * Utiliza el sistema genérico de jobs para manejo escalable
 */
export const useContactImportNotifications = (notifications: Ref<INotification[]>) => {

  // Usar el sistema genérico de jobs
  const jobSystem = useJobNotifications(notifications)

  // ===============================================
  // COMPUTED PROPERTIES ESPECÍFICOS PARA IMPORTACIÓN
  // ===============================================

  // Filtrar solo notificaciones de importación de contactos
  const contactImportNotifications = computed(() =>
    notifications.value.filter(notification => isContactImportNotification(notification))
  )

  // Jobs activos de importación de contactos
  const activeContactImportJobs = computed(() =>
    jobSystem.activeJobs.value.filter(job =>
      job.jobType === 'contact_import' ||
      // Fallback para jobs sin tipo específico pero que son de contactos
      contactImportNotifications.value.some(n =>
        jobSystem.getJobProgress(n.data?.jobId as string)?.jobId === job.jobId
      )
    )
  )

  // Jobs completados de importación de contactos
  const completedContactImportJobs = computed(() =>
    jobSystem.completedJobs.value.filter(job =>
      job.jobType === 'contact_import' ||
      // Fallback para jobs sin tipo específico pero que son de contactos
      contactImportNotifications.value.some(n =>
        jobSystem.getJobProgress(n.data?.jobId as string)?.jobId === job.jobId
      )
    )
  )

  // Verificar si hay importaciones activas
  const hasActiveImports = computed(() => activeContactImportJobs.value.length > 0)

  // Verificar si hay importaciones con errores
  const hasImportsWithErrors = computed(() =>
    activeContactImportJobs.value.some(job => job.errors > 0) ||
    completedContactImportJobs.value.some(job => job.errors > 0)
  )

  // Progreso total de todas las importaciones activas
  const totalImportProgress = computed(() => {
    const activeJobs = activeContactImportJobs.value
    if (activeJobs.length === 0) return 0

    const totalProgress = activeJobs.reduce((sum, job) => sum + job.progress, 0)
    return Math.round(totalProgress / activeJobs.length)
  })

  // ===============================================
  // COMPUTED PROPERTIES PARA COMPATIBILIDAD
  // ===============================================

  // Para mantener compatibilidad con el componente existente
  const latestProgress = computed(() => {
    const activeJob = activeContactImportJobs.value[0]
    if (!activeJob) return null

    return {
      progress: activeJob.progress,
      processed: activeJob.processed,
      errors: activeJob.errors,
      total: activeJob.total
    }
  })

  const isImportInProgress = computed(() => hasActiveImports.value)

  const lastCompletedImport = computed(() => {
    const completedJob = completedContactImportJobs.value[0]
    if (!completedJob) return null

    return {
      processed: completedJob.processed,
      errors: completedJob.errors,
      total: completedJob.total || 0,
      completed: true,
      errorDetails: completedJob.errorDetails
    }
  })

  const elapsedTime = computed(() => {
    const activeJob = activeContactImportJobs.value[0]
    if (!activeJob) return '00:00'

    const elapsed = jobSystem.getJobElapsedTime(activeJob.jobId)
    const minutes = Math.floor(elapsed / 60)
    const seconds = elapsed % 60

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  })

  // ===============================================
  // MÉTODOS ESPECÍFICOS PARA IMPORTACIÓN
  // ===============================================

  // Obtener progreso de una importación específica
  const getImportProgress = (jobId: string) => {
    return jobSystem.getJobProgress(jobId)
  }

  // Verificar si una importación específica está activa
  const isImportActive = (jobId: string): boolean => {
    const job = jobSystem.getJobProgress(jobId)
    return job?.isActive || false
  }

  // Obtener estadísticas de una importación
  const getImportStats = (jobId: string) => {
    const job = jobSystem.getJobProgress(jobId)
    if (!job) return null

    return {
      processed: job.processed,
      errors: job.errors,
      total: job.total || 0,
      progress: job.progress,
      errorDetails: job.errorDetails,
      elapsedTime: jobSystem.getJobElapsedTime(jobId),
      isCompleted: !job.isActive
    }
  }

  // Calcular tasa de éxito
  const getSuccessRate = (jobId: string): number => {
    const job = jobSystem.getJobProgress(jobId)
    if (!job || !job.total) return 0

    const successful = job.processed - job.errors
    return Math.round((successful / job.total) * 100)
  }

  // Obtener tipo de resultado de la importación
  const getImportResultType = (jobId: string): 'success' | 'warning' | 'error' | 'info' => {
    const job = jobSystem.getJobProgress(jobId)
    if (!job || job.isActive) return 'info'

    if (job.errors === 0) return 'success'
    if (job.errors > 0 && job.processed > 0) return 'warning'
    return 'error'
  }

  // ===============================================
  // MÉTODOS DE INICIALIZACIÓN
  // ===============================================

  // Inicializar desde notificaciones existentes
  const initializeContactImports = () => {
    jobSystem.initializeFromExistingNotifications()
  }

  // Procesar nueva notificación de importación
  const processContactImportNotification = (notification: INotification) => {
    if (isContactImportNotification(notification)) {
      jobSystem.processJobNotification(notification)
    }
  }

  // Limpiar importaciones completadas antiguas
  const cleanupOldImports = (daysOld: number = 7) => {
    jobSystem.cleanupOldJobs(daysOld)
  }

  return {
    // Estado específico de importación
    contactImportNotifications,
    activeContactImportJobs,
    completedContactImportJobs,
    hasActiveImports,
    hasImportsWithErrors,
    totalImportProgress,

    // Propiedades de compatibilidad
    importNotifications: contactImportNotifications,
    latestProgress,
    isImportInProgress,
    lastCompletedImport,
    elapsedTime,

    // Métodos específicos de importación
    getImportProgress,
    isImportActive,
    getImportStats,
    getSuccessRate,
    getImportResultType,

    // Métodos de gestión
    processContactImportNotification,
    initializeContactImports,
    cleanupOldImports,

    // Acceso al sistema genérico de jobs para funciones avanzadas
    jobSystem
  }
}

export type UseContactImportNotificationsReturn = ReturnType<typeof useContactImportNotifications>
