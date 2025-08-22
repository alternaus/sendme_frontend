import { computed, ref, watchEffect } from 'vue'

import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

import type { IOrganizationSettings } from '@/services/organization/useOrganizationSettingsService'
import { useOrganizationSettingsService } from '@/services/organization/useOrganizationSettingsService'
import { useAuthStore } from '@/stores/useAuthStore'

dayjs.extend(utc)
dayjs.extend(timezone)

export const useDateFormat = () => {
  const authStore = useAuthStore()
  const { getOrganizationSettings, settings: orgSettings } = useOrganizationSettingsService()
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  const settings = ref<IOrganizationSettings | null>(null)

  const loadSettings = async () => {
    isLoading.value = true
    error.value = null

    try {
      if (authStore.user?.organizationId) {
        await getOrganizationSettings(authStore.user.organizationId)
        settings.value = orgSettings.value
      }
    } catch (e) {
      error.value = e as Error
    } finally {
      isLoading.value = false
    }
  }

  const defaultDateFormat = 'DD/MM/YYYY'
  const defaultTimeFormat = 'HH:mm'
  const defaultTimezone = 'UTC'

  const dateFormat = computed(() => settings.value?.dateFormat || defaultDateFormat)
  const timeFormat = computed(() => settings.value?.timeFormat || defaultTimeFormat)
  const timezone = computed(() => settings.value?.timezone || defaultTimezone)
  const dateTimeFormat = computed(() => `${dateFormat.value} ${timeFormat.value}`)

  const formatDate = (date: string | Date | null | undefined, format?: string): string => {
    if (!date) return ''

    const fmt = format || dateFormat.value
    return dayjs(date).tz(timezone.value).format(fmt)
  }


  const formatTime = (date: string | Date | null | undefined, format?: string): string => {
    if (!date) return ''

    const fmt = format || timeFormat.value
    return dayjs(date).tz(timezone.value).format(fmt)
  }

  const formatDateTime = (date: string | Date | null | undefined, format?: string): string => {
    if (!date) return ''

    const fmt = format || dateTimeFormat.value
    return dayjs(date).tz(timezone.value).format(fmt)
  }

  watchEffect(() => {
    if (authStore.isAuthenticated && authStore.user?.organizationId) {
      loadSettings()
    }
  })

  return {
    formatDate,
    formatTime,
    formatDateTime,
    dateFormat,
    timeFormat,
    dateTimeFormat,
    timezone,
    isLoading,
    error,
    loadSettings
  }
}
