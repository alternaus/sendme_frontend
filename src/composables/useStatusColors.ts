import { computed } from 'vue'

import { useI18n } from 'vue-i18n'

export type StatusType = 'campaign' | 'contact' | 'message' | 'recharge' | 'audit' | 'dispatch'

export type TagSeverity = 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast'

const STATUS_CONFIG = {
  campaign: {
    active: 'success' as TagSeverity,
    inactive: 'secondary' as TagSeverity,
    paused: 'warning' as TagSeverity,
    finished: 'info' as TagSeverity
  },
  contact: {
    active: 'success' as TagSeverity,
    inactive: 'secondary' as TagSeverity,
    blocked: 'danger' as TagSeverity
  },
  message: {
    queued: 'info' as TagSeverity,
    sending: 'warning' as TagSeverity,
    sent: 'success' as TagSeverity,
    delivered: 'success' as TagSeverity,
    undelivered: 'danger' as TagSeverity,
    failed: 'danger' as TagSeverity,
    received: 'info' as TagSeverity,
    scheduled: 'secondary' as TagSeverity,
    canceled: 'secondary' as TagSeverity,
    read: 'contrast' as TagSeverity
  },
  recharge: {
    accepted: 'success' as TagSeverity,
    rejected: 'danger' as TagSeverity,
    pending: 'warning' as TagSeverity,
    failed: 'danger' as TagSeverity,
    reversed: 'secondary' as TagSeverity,
    held: 'warning' as TagSeverity,
    initiated: 'info' as TagSeverity,
    expired: 'secondary' as TagSeverity,
    abandoned: 'secondary' as TagSeverity,
    cancelled: 'secondary' as TagSeverity
  },
  audit: {
    create: 'success' as TagSeverity,
    update: 'info' as TagSeverity,
    delete: 'danger' as TagSeverity,
    read: 'secondary' as TagSeverity
  },
  dispatch: {
    pending: 'warning' as TagSeverity,
    processing: 'info' as TagSeverity,
    completed: 'success' as TagSeverity,
    failed: 'danger' as TagSeverity,
    cancelled: 'secondary' as TagSeverity
  }
} as const

export const useStatusColors = () => {
  const { t } = useI18n()

  const getStatusSeverity = (status: string, type: StatusType): TagSeverity => {
    const typeConfig = STATUS_CONFIG[type]
    const severity = typeConfig?.[status as keyof typeof typeConfig]
    return severity || 'secondary'
  }

  const getStatusOptions = (type: StatusType) => {
    const typeConfig = STATUS_CONFIG[type]
    if (!typeConfig) return []

    return Object.keys(typeConfig).map(status => ({
      value: status,
      label: t(`status.${type}.${status}`, status), // Fallback al status si no hay traducción
      severity: getStatusSeverity(status, type)
    }))
  }

  const isValidStatus = (status: string, type: StatusType): boolean => {
    const typeConfig = STATUS_CONFIG[type]
    return typeConfig ? status in typeConfig : false
  }

  const getAvailableTypes = (): StatusType[] => {
    return Object.keys(STATUS_CONFIG) as StatusType[]
  }

  const getStatusesForType = (type: StatusType): string[] => {
    const typeConfig = STATUS_CONFIG[type]
    return typeConfig ? Object.keys(typeConfig) : []
  }

  return {
    getStatusSeverity,
    getStatusOptions,
    isValidStatus,
    getAvailableTypes,
    getStatusesForType,
    statusConfig: computed(() => STATUS_CONFIG)
  }
}
