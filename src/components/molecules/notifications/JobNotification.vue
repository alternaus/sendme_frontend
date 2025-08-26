<template>
  <div class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 mb-2 shadow-sm">
    <!-- Notificación de Job con progreso -->
    <div v-if="job" class="flex flex-col gap-4">
      <!-- Header del job -->
      <div class="flex justify-between items-start flex-wrap gap-2">
        <div class="flex items-center gap-2 flex-1">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100 m-0">{{ getJobTitle() }}</h4>
          <Tag
            :value="getJobTypeLabel()"
            :severity="getJobTypeSeverity()"
            class="text-xs"
          />
        </div>
        <div class="flex flex-col items-end gap-1 text-xs text-gray-500 dark:text-gray-400">
          <span class="font-mono bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">Job: {{ job.jobId }}</span>
          <span>{{ formatElapsedTime() }}</span>
        </div>
      </div>

      <!-- Barra de progreso -->
      <div v-if="job.isActive" class="space-y-2">
        <div class="flex justify-between items-center text-xs">
          <span class="font-semibold text-gray-900 dark:text-gray-100">Progreso: {{ job.progress }}%</span>
          <span class="text-gray-500 dark:text-gray-400">
            {{ job.processed }} procesados
            <span v-if="job.errors > 0" class="text-red-500 font-semibold">
              - {{ job.errors }} errores
            </span>
          </span>
        </div>
        <ProgressBar
          :value="job.progress"
          :severity="getProgressSeverity()"
          class="h-2"
        />
      </div>

      <!-- Resultados finales -->
      <div v-else class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="flex items-center gap-2 p-3 rounded-md bg-green-50 dark:bg-green-900/20">
            <i class="pi pi-check-circle text-xl text-green-500"></i>
            <div>
              <span class="block text-lg font-semibold text-green-600 dark:text-green-400 leading-none">{{ job.processed - job.errors }}</span>
              <span class="block text-xs text-gray-600 dark:text-gray-400 leading-none">Exitosos</span>
            </div>
          </div>

          <div v-if="job.errors > 0" class="flex items-center gap-2 p-3 rounded-md bg-red-50 dark:bg-red-900/20">
            <i class="pi pi-times-circle text-xl text-red-500"></i>
            <div>
              <span class="block text-lg font-semibold text-red-600 dark:text-red-400 leading-none">{{ job.errors }}</span>
              <span class="block text-xs text-gray-600 dark:text-gray-400 leading-none">Errores</span>
            </div>
          </div>

          <div class="flex items-center gap-2 p-3 rounded-md bg-blue-50 dark:bg-blue-900/20">
            <i class="pi pi-list text-xl text-blue-500"></i>
            <div>
              <span class="block text-lg font-semibold text-blue-600 dark:text-blue-400 leading-none">{{ job.total || 0 }}</span>
              <span class="block text-xs text-gray-600 dark:text-gray-400 leading-none">Total</span>
            </div>
          </div>
        </div>

        <!-- Mostrar errores si existen -->
        <div v-if="job.errorDetails && job.errorDetails.length > 0" class="mt-4">
          <Accordion>
            <AccordionTab :header="`Ver errores (${job.errorDetails.length})`">
              <div class="max-h-48 overflow-y-auto">
                <div
                  v-for="(error, index) in job.errorDetails.slice(0, 10)"
                  :key="index"
                  class="flex items-start gap-2 py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                >
                  <i class="pi pi-exclamation-triangle text-orange-500 mt-0.5 flex-shrink-0"></i>
                  <span class="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">{{ error }}</span>
                </div>
                <div v-if="job.errorDetails.length > 10" class="py-2 text-center italic text-gray-500 dark:text-gray-400 text-sm">
                  Y {{ job.errorDetails.length - 10 }} errores más...
                </div>
              </div>
            </AccordionTab>
          </Accordion>
        </div>
      </div>

      <!-- Footer con acciones -->
      <div class="flex justify-end gap-2">
        <Button
          v-if="!job.isActive && job.jobType === 'contact_import'"
          icon="pi pi-download"
          label="Ver reporte"
          size="small"
          outlined
          @click="$emit('viewReport', job.jobId)"
        />
        <Button
          icon="pi pi-times"
          severity="secondary"
          size="small"
          outlined
          @click="$emit('dismiss', job.jobId)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import Button from 'primevue/button'
import ProgressBar from 'primevue/progressbar'
import Tag from 'primevue/tag'

import type { JobProgress } from '@/composables/useNotifications'

interface Props {
  job: JobProgress
}

interface Emits {
  (e: 'dismiss', jobId: string): void
  (e: 'viewReport', jobId: string): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

const getJobTitle = (): string => {
  const jobType = props.job.jobType || 'unknown'

  if (props.job.isActive) {
    switch (jobType) {
      case 'contact_import':
        return 'Importación de contactos en progreso'
      case 'contact_export':
        return 'Exportación de contactos en progreso'
      case 'data_sync':
        return 'Sincronización de datos en progreso'
      default:
        return 'Proceso en progreso'
    }
  } else {
    switch (jobType) {
      case 'contact_import':
        return props.job.errors === 0
          ? 'Importación de contactos completada'
          : 'Importación de contactos finalizada con errores'
      case 'contact_export':
        return props.job.errors === 0
          ? 'Exportación de contactos completada'
          : 'Exportación de contactos finalizada con errores'
      case 'data_sync':
        return props.job.errors === 0
          ? 'Sincronización de datos completada'
          : 'Sincronización de datos finalizada con errores'
      default:
        return props.job.errors === 0
          ? 'Proceso completado'
          : 'Proceso finalizado con errores'
    }
  }
}

//Obtener etiqueta del tipo de job
const getJobTypeLabel = (): string => {
  switch (props.job.jobType) {
    case 'contact_import':
      return 'Importación'
    case 'contact_export':
      return 'Exportación'
    case 'data_sync':
      return 'Sincronización'
    default:
      return 'Proceso'
  }
}

const getJobTypeSeverity = (): string => {
  switch (props.job.jobType) {
    case 'contact_import':
      return 'info'
    case 'contact_export':
      return 'success'
    case 'data_sync':
      return 'warning'
    default:
      return 'secondary'
  }
}

const getProgressSeverity = (): string => {
  if (props.job.errors > 0) return 'danger'
  if (props.job.progress < 50) return 'info'
  return 'success'
}

const formatElapsedTime = (): string => {
  if (!props.job.startTime) return '00:00'

  const endTime = props.job.endTime || new Date()
  const elapsed = Math.floor((endTime.getTime() - props.job.startTime.getTime()) / 1000)

  const hours = Math.floor(elapsed / 3600)
  const minutes = Math.floor((elapsed % 3600) / 60)
  const seconds = elapsed % 60

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}
</script>
