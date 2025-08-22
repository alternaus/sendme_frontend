import { computed, type Ref,ref } from 'vue'

import type { INotification } from '@/components/atoms/notifications/interfaces/notification.interface'
import {
  getJobId,
  getJobType,
  isJobCompletionNotification,
  isJobNotification,
  isJobProgressNotification,
  isJobStartNotification
} from '@/components/atoms/notifications/interfaces/notification.interface'

// ===============================================
// TIPOS PARA EL ESTADO DE JOBS
// ===============================================

export interface JobProgress {
  jobId: string
  jobType?: string
  isActive: boolean
  startTime?: Date
  endTime?: Date
  progress: number
  processed: number
  errors: number
  total?: number
  errorDetails: string[]
  lastUpdate: Date
}

export interface JobState {
  [jobId: string]: JobProgress
}

// ===============================================
// COMPOSABLE GENÉRICO PARA JOBS
// ===============================================

export const useJobNotifications = (notifications: Ref<INotification[]>) => {

  // Estado interno para tracking de jobs
  const jobState = ref<JobState>({})

  // ===============================================
  // COMPUTED PROPERTIES
  // ===============================================

  // Todas las notificaciones que son de jobs
  const jobNotifications = computed(() =>
    notifications.value.filter(notification => isJobNotification(notification))
  )

  // Jobs activos (iniciados pero no completados)
  const activeJobs = computed(() => {
    const jobs: JobProgress[] = []

    Object.values(jobState.value).forEach(job => {
      if (job.isActive) {
        jobs.push(job)
      }
    })

    return jobs
  })

  // Jobs completados
  const completedJobs = computed(() => {
    const jobs: JobProgress[] = []

    Object.values(jobState.value).forEach(job => {
      if (!job.isActive) {
        jobs.push(job)
      }
    })

    return jobs.sort((a, b) => (b.endTime?.getTime() || 0) - (a.endTime?.getTime() || 0))
  })

  // Total de jobs activos
  const activeJobsCount = computed(() => activeJobs.value.length)

  // Verificar si hay jobs con errores
  const hasJobsWithErrors = computed(() =>
    activeJobs.value.some(job => job.errors > 0) ||
    completedJobs.value.some(job => job.errors > 0)
  )

  // ===============================================
  // MÉTODOS PARA ACTUALIZAR ESTADO
  // ===============================================

  // Procesar notificación de inicio de job
  const processJobStart = (notification: INotification) => {
    const jobId = getJobId(notification)
    if (!jobId || !notification.data || !isJobStartNotification(notification.data)) return

    const jobType = getJobType(notification)

    jobState.value[jobId] = {
      jobId,
      jobType: jobType || undefined,
      isActive: true,
      startTime: new Date(notification.timestamp),
      progress: 0,
      processed: 0,
      errors: 0,
      errorDetails: [],
      lastUpdate: new Date(notification.data.timestamp)
    }

    console.log(`[Job ${jobId}] Iniciado - Tipo: ${jobType || 'desconocido'}`)
  }

  // Procesar notificación de progreso de job
  const processJobProgress = (notification: INotification) => {
    const jobId = getJobId(notification)
    if (!jobId || !notification.data || !isJobProgressNotification(notification.data)) return

    const existing = jobState.value[jobId]
    if (!existing) {
      // Crear estado si no existe (en caso de que no hayamos recibido el inicio)
      jobState.value[jobId] = {
        jobId,
        jobType: getJobType(notification) || undefined,
        isActive: true,
        progress: 0,
        processed: 0,
        errors: 0,
        errorDetails: [],
        lastUpdate: new Date()
      }
    }

    // Actualizar progreso
    jobState.value[jobId] = {
      ...jobState.value[jobId],
      progress: notification.data.progress,
      processed: notification.data.processed,
      errors: notification.data.errors,
      total: notification.data.total || jobState.value[jobId].total,
      lastUpdate: new Date(notification.data.timestamp)
    }

    console.log(`[Job ${jobId}] Progreso: ${notification.data.progress}% (${notification.data.processed} procesados, ${notification.data.errors} errores)`)
  }

  // Procesar notificación de finalización de job
  const processJobCompletion = (notification: INotification) => {
    const jobId = getJobId(notification)
    if (!jobId || !notification.data || !isJobCompletionNotification(notification.data)) return

    const existing = jobState.value[jobId]
    if (!existing) {
      // Crear estado si no existe
      jobState.value[jobId] = {
        jobId,
        jobType: getJobType(notification) || undefined,
        isActive: false,
        progress: 100,
        processed: 0,
        errors: 0,
        errorDetails: [],
        lastUpdate: new Date()
      }
    }

    // Marcar como completado
    jobState.value[jobId] = {
      ...jobState.value[jobId],
      isActive: false,
      endTime: new Date(notification.data.timestamp),
      progress: 100,
      processed: notification.data.processed,
      errors: notification.data.errors,
      total: notification.data.total,
      errorDetails: notification.data.errorDetails || [],
      lastUpdate: new Date(notification.data.timestamp)
    }

    const status = notification.data.errors > 0 ? 'con errores' : 'exitoso'
    console.log(`[Job ${jobId}] Completado ${status}: ${notification.data.processed} procesados, ${notification.data.errors} errores`)
  }

  // Procesar cualquier notificación de job
  const processJobNotification = (notification: INotification) => {
    if (!isJobNotification(notification)) return

    const data = notification.data

    if (isJobStartNotification(data)) {
      processJobStart(notification)
    } else if (isJobProgressNotification(data)) {
      processJobProgress(notification)
    } else if (isJobCompletionNotification(data)) {
      processJobCompletion(notification)
    }
  }

  // ===============================================
  // MÉTODOS DE UTILIDAD
  // ===============================================

  // Obtener estado de un job específico
  const getJobProgress = (jobId: string): JobProgress | null => {
    return jobState.value[jobId] || null
  }

  // Limpiar jobs completados antiguos (más de X días)
  const cleanupOldJobs = (daysOld: number = 7) => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    Object.keys(jobState.value).forEach(jobId => {
      const job = jobState.value[jobId]
      if (!job.isActive && job.endTime && job.endTime < cutoffDate) {
        delete jobState.value[jobId]
        console.log(`[Job ${jobId}] Limpiado por antigüedad`)
      }
    })
  }

  // Obtener jobs por tipo
  const getJobsByType = (jobType: string): JobProgress[] => {
    return Object.values(jobState.value).filter(job => job.jobType === jobType)
  }

  // Verificar si un tipo de job está activo
  const hasActiveJobOfType = (jobType: string): boolean => {
    return Object.values(jobState.value).some(job => job.isActive && job.jobType === jobType)
  }

  // Calcular tiempo transcurrido para un job
  const getJobElapsedTime = (jobId: string): number => {
    const job = jobState.value[jobId]
    if (!job || !job.startTime) return 0

    const endTime = job.endTime || new Date()
    return Math.floor((endTime.getTime() - job.startTime.getTime()) / 1000)
  }

  // ===============================================
  // INICIALIZACIÓN
  // ===============================================

  // Procesar notificaciones existentes al inicializar
  const initializeFromExistingNotifications = () => {
    notifications.value.forEach(notification => {
      processJobNotification(notification)
    })
  }

  return {
    // Estado
    jobState: computed(() => jobState.value),
    jobNotifications,
    activeJobs,
    completedJobs,
    activeJobsCount,
    hasJobsWithErrors,

    // Métodos de procesamiento
    processJobNotification,
    processJobStart,
    processJobProgress,
    processJobCompletion,

    // Métodos de utilidad
    getJobProgress,
    cleanupOldJobs,
    getJobsByType,
    hasActiveJobOfType,
    getJobElapsedTime,
    initializeFromExistingNotifications
  }
}
