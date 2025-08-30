<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { useToast } from 'primevue/usetoast'

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
  { name: 'México (GMT-6)', value: 'America/Mexico_City' },
  { name: 'UTC (Tiempo Universal Coordinado)', value: 'UTC' },
  { name: 'America/Bogotá (COT -5)', value: 'America/Bogota' },
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
  <div class="max-w-4xl mx-auto">

    <!-- Form -->
    <form @submit.prevent="onSubmit" class="space-y-8">
      <!-- Grid de selectores -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Zona Horaria -->
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-900 dark:text-white">
              {{ $t('settings.timezone_label') }}
            </label>
          </div>
          <AppSelect
            v-model="form.timezone.value"
            :options="timezoneOpts"
            optionLabel="name"
            optionValue="value"
            :error-message="errors.timezone"
            class="w-full"
          />
          <p class="text-xs text-gray-500">{{ $t('settings.timezone_description') }}</p>
        </div>

        <!-- Formato de Fecha -->
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-900 dark:text-white">
              {{ $t('settings.date_format_label') }}
            </label>
          </div>
          <AppSelect
            v-model="form.dateFormat.value"
            :options="dateFormatOpts"
            optionLabel="name"
            optionValue="value"
            :error-message="errors.dateFormat"
            class="w-full"
          />
          <p class="text-xs text-gray-500">{{ $t('settings.date_format_description') }}</p>
        </div>

        <!-- Formato de Hora -->
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-900 dark:text-white">
              {{ $t('settings.time_format_label') }}
            </label>
          </div>
          <AppSelect
            v-model="form.timeFormat.value"
            :options="timeFormatOpts"
            optionLabel="name"
            optionValue="value"
            :error-message="errors.timeFormat"
            class="w-full"
          />
          <p class="text-xs text-gray-500">{{ $t('settings.time_format_description') }}</p>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="flex gap-3 pt-2">
        <AppButton
          type="submit"
          class="!w-auto"
          :disabled="saving || loading"
          severity="primary"
          :label="$t('settings.save')"
        />
        <AppButton
          type="button"
          class="!w-auto ml-auto"
          severity="contrast"
          outlined
          :disabled="saving"
          :label="$t('settings.reset')"
          @click="resetForm()"
        />
      </div>
    </form>
  </div>
</template>
