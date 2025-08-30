<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { useToast } from 'primevue/usetoast'

import dayjs from 'dayjs'
import { useI18n } from 'vue-i18n'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import { useSettingsService } from '@/services/settings/useSettingsService'
import { useAuthStore } from '@/stores/useAuthStore'

import { useSettingsForm } from './composables/useSettingsForm'

const toast = useToast()
const { t } = useI18n()
const authStore = useAuthStore()
const { getSettings, createSettings, updateSettings } = useSettingsService()
const { form, handleSubmit, setValues, resetForm, errors } = useSettingsForm()

const loading = ref(false)
const saving = ref(false)

/**
 * Genera una vista previa de cómo se verán las fechas con la configuración actual
 */
const datePreview = computed(() => {
  if (!form.dateFormat.value || !form.timeFormat.value) return null

  const now = dayjs()
  return {
    date: now.format(form.dateFormat.value),
    time: now.format(form.timeFormat.value),
    dateTime: now.format(`${form.dateFormat.value} ${form.timeFormat.value}`)
  }
})



const dateFormatOpts = computed(() => [
  {
    name: `DD/MM/YYYY`,
    value: 'DD/MM/YYYY',
    description: `${t('settings.date_formats.european_standard')} (15/03/2024)`
  },
  {
    name: `YYYY-MM-DD`,
    value: 'YYYY-MM-DD',
    description: `${t('settings.date_formats.iso_international')} (2024-03-15)`
  },
  {
    name: `MM/DD/YYYY`,
    value: 'MM/DD/YYYY',
    description: `${t('settings.date_formats.us_format')} (03/15/2024)`
  },
  {
    name: `DD-MM-YYYY`,
    value: 'DD-MM-YYYY',
    description: `${t('settings.date_formats.european_dashes')} (15-03-2024)`
  },
  {
    name: `DD.MM.YYYY`,
    value: 'DD.MM.YYYY',
    description: `${t('settings.date_formats.german_dots')} (15.03.2024)`
  },
  {
    name: `YYYY/MM/DD`,
    value: 'YYYY/MM/DD',
    description: `${t('settings.date_formats.asian_format')} (2024/03/15)`
  },
  {
    name: `DD MMM YYYY`,
    value: 'DD MMM YYYY',
    description: `${t('settings.date_formats.month_abbreviated')} (15 Mar 2024)`
  },
  {
    name: `MMM DD, YYYY`,
    value: 'MMM DD, YYYY',
    description: `${t('settings.date_formats.anglosaxon')} (Mar 15, 2024)`
  },
])

const timeFormatOpts = computed(() => [
  {
    name: `HH:mm`,
    value: 'HH:mm',
    description: `${t('settings.time_formats.24_hour')} (14:30)`
  },
  {
    name: `HH:mm:ss`,
    value: 'HH:mm:ss',
    description: `${t('settings.time_formats.24_hour_seconds')} (14:30:45)`
  },
  {
    name: `hh:mm A`,
    value: 'hh:mm A',
    description: `${t('settings.time_formats.12_hour_ampm')} (02:30 PM)`
  },
  {
    name: `hh:mm:ss A`,
    value: 'hh:mm:ss A',
    description: `${t('settings.time_formats.12_hour_seconds')} (02:30:45 PM)`
  },
  {
    name: `HH.mm`,
    value: 'HH.mm',
    description: `${t('settings.time_formats.european_dots')} (14.30)`
  },
  {
    name: `HH h mm`,
    value: 'HH [h] mm',
    description: `${t('settings.time_formats.french_format')} (14 h 30)`
  },
])

const timezoneOpts = [
  { name: 'UTC (Tiempo Universal Coordinado)', value: 'UTC' },
  { name: 'America/Bogotá (COT -5)', value: 'America/Bogota' },
  { name: 'America/Mexico_City (CST/CDT -6/-5)', value: 'America/Mexico_City' },
  { name: 'America/New_York (EST/EDT -5/-4)', value: 'America/New_York' },
  { name: 'America/Chicago (CST/CDT -6/-5)', value: 'America/Chicago' },
  { name: 'America/Los_Angeles (PST/PDT -8/-7)', value: 'America/Los_Angeles' },
  { name: 'America/Buenos_Aires (ART -3)', value: 'America/Argentina/Buenos_Aires' },
  { name: 'America/Lima (PET -5)', value: 'America/Lima' },
  { name: 'America/Santiago (CLT/CLST -4/-3)', value: 'America/Santiago' },
  { name: 'America/Caracas (VET -4)', value: 'America/Caracas' },
  { name: 'Europe/London (GMT/BST +0/+1)', value: 'Europe/London' },
  { name: 'Europe/Madrid (CET/CEST +1/+2)', value: 'Europe/Madrid' },
  { name: 'Europe/Paris (CET/CEST +1/+2)', value: 'Europe/Paris' },
  { name: 'Europe/Rome (CET/CEST +1/+2)', value: 'Europe/Rome' },
  { name: 'Europe/Berlin (CET/CEST +1/+2)', value: 'Europe/Berlin' },
  { name: 'Asia/Tokyo (JST +9)', value: 'Asia/Tokyo' },
  { name: 'Asia/Shanghai (CST +8)', value: 'Asia/Shanghai' },
  { name: 'Asia/Dubai (GST +4)', value: 'Asia/Dubai' },
  { name: 'Australia/Sydney (AEST/AEDT +10/+11)', value: 'Australia/Sydney' },
]

onMounted(async () => {
  loading.value = true
  try {
    if (!authStore.user?.organizationId) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la configuración', life: 3000 })
      return
    }
    const s = await getSettings(authStore.user?.organizationId)
    if (s) {
      setValues({
        dateFormat: s.dateFormat,
        timeFormat: s.timeFormat,
        timezone: s.timezone,
      })
    }
  } finally {
    loading.value = false
  }
})

const onSubmit = handleSubmit(async (values) => {
  saving.value = true
  try {
    if (!authStore.user?.organizationId) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar', life: 3000 })
      return
    }

    const exists = await getSettings(authStore.user?.organizationId)
    if (exists) {
      await updateSettings(authStore.user?.organizationId, values)
      toast.add({ severity: 'success', summary: 'Guardado', detail: 'Configuración actualizada', life: 2200 })
    } else {
      await createSettings(authStore.user?.organizationId, values)
      toast.add({ severity: 'success', summary: 'Guardado', detail: 'Configuración creada', life: 2200 })
    }
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar', life: 3000 })
  } finally {
    saving.value = false
  }
})
</script>

<template>
  <form @submit.prevent="onSubmit" class="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
    <div>
      <AppSelect v-model="form.dateFormat.value" :options="dateFormatOpts" optionLabel="name" optionValue="value"
        :error-message="errors.dateFormat" :label="$t('settings.date_format')" />
      <p class="text-xs text-gray-500 mt-1">{{ $t('settings.date_format_description') }}</p>
    </div>

    <div>
      <AppSelect v-model="form.timeFormat.value" :options="timeFormatOpts" optionLabel="name" optionValue="value"
        :error-message="errors.timeFormat" :label="$t('settings.time_format')" />
      <p class="text-xs text-gray-500 mt-1">{{ $t('settings.time_format_description') }}</p>
    </div>

    <div class="md:col-span-2">
      <AppSelect v-model="form.timezone.value" :options="timezoneOpts" optionLabel="name" optionValue="value"
        :error-message="errors.timezone" :label="$t('settings.timezone')" />
      <p class="text-xs text-gray-500 mt-1">{{ $t('settings.timezone_description') }}</p>
    </div>

    <!-- Vista Previa de Formatos -->
    <div v-if="datePreview" class="md:col-span-2 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
      <h3 class="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
        {{ $t('settings.preview') }}
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <span class="text-neutral-600 dark:text-neutral-400">{{ $t('settings.date') }}:</span>
          <div class="font-mono bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 px-3 py-2 rounded border border-neutral-300 dark:border-neutral-600 mt-1">
            {{ datePreview.date }}
          </div>
        </div>
        <div>
          <span class="text-neutral-600 dark:text-neutral-400">{{ $t('settings.time') }}:</span>
          <div class="font-mono bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 px-3 py-2 rounded border border-neutral-300 dark:border-neutral-600 mt-1">
            {{ datePreview.time }}
          </div>
        </div>
        <div>
          <span class="text-neutral-600 dark:text-neutral-400">{{ $t('settings.date_time') }}:</span>
          <div class="font-mono bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 px-3 py-2 rounded border border-neutral-300 dark:border-neutral-600 mt-1">
            {{ datePreview.dateTime }}
          </div>
        </div>
      </div>
    </div>

    <div class="flex gap-3 pt-2 md:col-span-2">
      <AppButton type="submit" :disabled="saving || loading" severity="primary" :label="$t('settings.save')" />
      <AppButton type="button" severity="secondary" :disabled="saving" :label="$t('settings.reset')" @click="resetForm()" />
    </div>
  </form>
</template>
