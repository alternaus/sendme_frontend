<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { useToast } from 'primevue/usetoast'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import { useSettingsService } from '@/services/settings/useSettingsService'
import { useAuthStore } from '@/stores/useAuthStore'

import { useSettingsForm } from './composables/useSettingsForm'


const toast = useToast()
const authStore = useAuthStore()
const { getSettings, createSettings, updateSettings } = useSettingsService()
const { form, handleSubmit, setValues, resetForm, errors } = useSettingsForm()

const loading = ref(false)
const saving = ref(false)

const dateFormatOpts = [
  { name: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
  { name: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
  { name: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
]
const timeFormatOpts = [
  { name: 'HH:mm', value: 'HH:mm' },
  { name: 'HH:mm:ss', value: 'HH:mm:ss' },
  { name: 'hh:mm A', value: 'hh:mm A' },
]
const timezoneOpts = [
  { name: 'UTC', value: 'UTC' },
  { name: 'America/Bogota', value: 'America/Bogota' },
  { name: 'America/New_York', value: 'America/New_York' },
  { name: 'Europe/Madrid', value: 'Europe/Madrid' },
  { name: 'Europe/London', value: 'Europe/London' },
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
    <AppSelect v-model="form.dateFormat.value" :options="dateFormatOpts" optionLabel="name" optionValue="value"
      :error-message="errors.dateFormat" :label="$t('settings.date_format')" />
    <AppSelect v-model="form.timeFormat.value" :options="timeFormatOpts" optionLabel="name" optionValue="value"
      :error-message="errors.timeFormat" :label="$t('settings.time_format')" />
    <AppSelect v-model="form.timezone.value" :options="timezoneOpts" optionLabel="name" optionValue="value"
      :error-message="errors.timezone" :label="$t('settings.timezone')" class="md:col-span-2" />

    <div class="flex gap-3 pt-2 md:col-span-2">
      <AppButton type="submit" :disabled="saving || loading" severity="primary" :label="$t('settings.save')" />
      <AppButton type="button" severity="secondary" :disabled="saving" :label="$t('settings.reset')" @click="resetForm()" />
    </div>
  </form>
</template>
