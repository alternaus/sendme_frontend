<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'

import FileUpload, { type FileUploadSelectEvent } from 'primevue/fileupload'
import ProgressBar from 'primevue/progressbar'
import { useToast } from 'primevue/usetoast'

import { io, type Socket } from 'socket.io-client'
import { useI18n } from 'vue-i18n'

import CloudUploadIcon from '@/assets/svg/cloud-upload.svg?component'
import ImportIcon from '@/assets/svg/table-actions/import.svg?component'
import AppButton from '@/components/atoms/buttons/AppButton.vue'
import { useContactService } from '@/services/contact/useContactService'
import { useAuthStore } from '@/stores/useAuthStore'


interface ImportPreviewResponse {
  headers: string[]
  sampleData: string[]
  availableFields: string[]
  totalRows?: number
}

interface ImportProgress {
  progress: number
  total: number
  percentage: number
}

interface ApiError {
  response?: {
    data?: {
      message?: string | string[]
    }
  }
}

interface ImportNotification {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  data?: {
    progress?: number
    total?: number
    errors?: string[]
  }
}

const uploader = ref()
const fileData = ref<string[][]>([])
const selectedFields = ref<Record<number, string>>({})
const originalHeaders = ref<string[]>([])
const { t } = useI18n()
const toast = useToast()
const authStore = useAuthStore()
const { getImportPreview, importContacts } = useContactService()

const fileName = ref('')
const fileSize = ref(0)
const totalRows = ref(0)
const loading = ref(false)
const currentFile = ref<File | null>(null)
const importProgress = ref<ImportProgress | null>(null)
const socket = ref<Socket | null>(null)

const requiredFields = ['phone']

const fieldsOptions = [
  { label: t('general.name'), value: 'name' },
  { label: t('general.last_name'), value: 'lastName' },
  { label: t('general.email'), value: 'email' },
  { label: t('general.phone'), value: 'phone' },
  { label: t('general.country_code'), value: 'countryCode' },
  { label: t('general.birth_date'), value: 'birthDate' }
]

const openFileDialog = () => {
  uploader.value?.choose?.()
}

const onUpload = async (event: FileUploadSelectEvent) => {
  const file = event.files?.[0]
  if (!file) return

  fileName.value = file.name
  fileSize.value = file.size
  currentFile.value = file
  fileData.value = []
  originalHeaders.value = []
  loading.value = true

  try {
    const response = await getImportPreview(file) as ImportPreviewResponse
    console.log('Preview response:', response)

    if (response?.headers) {
      originalHeaders.value = response.headers

      // Convertir sampleData en filas
      if (response.sampleData) {
        // Convertir el array plano en una matriz
        const rowData = []
        for (let i = 0; i < response.sampleData.length; i += response.headers.length) {
          rowData.push(response.sampleData.slice(i, i + response.headers.length))
        }
        fileData.value = [response.headers, ...rowData]
      }

      // Calcular el número total de filas basado en los datos de muestra
      totalRows.value = Math.floor(response.sampleData.length / response.headers.length) || 1
    }
  } catch (error) {
    console.error('Error al obtener preview:', error)
    toast.add({
      severity: 'error',
      summary: t('general.error'),
      detail: t('general.error_loading_file'),
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

const formatFileSize = computed(() => {
  const size = fileSize.value
  return size > 1024 * 1024
    ? `${(size / (1024 * 1024)).toFixed(2)} MB`
    : `${(size / 1024).toFixed(2)} KB`
})

const isValid = computed(() => {
  const selected = Object.values(selectedFields.value)
  return requiredFields.every(field => selected.includes(field))
})

const handleFinalUpload = async () => {
  if (!isValid.value || !currentFile.value) return

  loading.value = true
  try {
    const fieldMapping: Record<string, string> = {}
    Object.entries(selectedFields.value).forEach(([index, field]) => {
      const headerName = originalHeaders.value[parseInt(index)]
      if (field && headerName) {
        fieldMapping[headerName] = field
      }
    })

    console.log('Field Mapping:', fieldMapping)

    const result = await importContacts(currentFile.value, fieldMapping)

    // Mostrar mensaje de éxito
    toast.add({
      severity: 'success',
      summary: t('general.success'),
      detail: t('contact.import.upload_success'),
      life: 3000,
    })

    // Limpiar datos
    handleCancel()

    if (result.jobId) {
      // Inicializar Socket.IO para seguimiento del progreso
      const baseUrl = import.meta.env.VITE_API_URL || window.location.origin
      const wsUrl = `${baseUrl}/notifications`
      console.log('Socket.IO URL:', wsUrl)

      socket.value = io(wsUrl, {
        query: { token: authStore.token },
        transports: ['websocket'],
        path: '/api/socket.io'
      })

      socket.value.on('connect', () => {
        console.log('Socket.IO conectado')
        // Suscribirse al canal de notificaciones del job
        socket.value?.emit('subscribe', { jobId: result.jobId })
      })

      // Escuchar eventos de desconexión
      socket.value.on('disconnect', () => {
        console.log('Desconectado del servidor de notificaciones')
      })

      // Escuchar errores de conexión
      socket.value.on('connect_error', (error) => {
        console.error('Error de conexión:', error)
        toast.add({
          severity: 'error',
          summary: t('general.error'),
          detail: t('contact.import.connection_error'),
          life: 3000,
        })
      })

      // Escuchar notificaciones de importación
      socket.value.on(`import:${result.jobId}`, (notification: ImportNotification) => {
        switch (notification.type) {
          case 'success':
            toast.add({
              severity: 'success',
              summary: t('general.success'),
              detail: notification.message,
              life: 3000,
            })
            // Limpiar estado
            importProgress.value = null
            socket.value?.disconnect()
            socket.value = null
            handleCancel()
            break

          case 'error':
            toast.add({
              severity: 'error',
              summary: t('general.error'),
              detail: notification.message,
              life: 3000,
            })
            break

          case 'warning':
            toast.add({
              severity: 'warn',
              summary: t('general.warning'),
              detail: notification.message,
              life: 5000,
            })
            break

          case 'info':
            if (notification.data?.progress !== undefined && notification.data?.total !== undefined) {
              importProgress.value = {
                progress: notification.data.progress,
                total: notification.data.total,
                percentage: Math.round((notification.data.progress / notification.data.total) * 100)
              }
            }
            break
        }
      })
    }
  } catch (error: unknown) {
    console.error('Error al importar contactos:', error)
    const apiError = error as ApiError
    if (apiError.response?.data?.message) {
      toast.add({
        severity: 'error',
        summary: t('general.error'),
        detail: Array.isArray(apiError.response.data.message)
          ? apiError.response.data.message.join(', ')
          : apiError.response.data.message,
        life: 5000,
      })
    } else {
      toast.add({
        severity: 'error',
        summary: t('general.error'),
        detail: t('contact.import.error'),
        life: 3000,
      })
    }
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  uploader.value?.clear()
  fileData.value = []
  originalHeaders.value = []
  selectedFields.value = {}
  fileName.value = ''
  fileSize.value = 0
  totalRows.value = 0
}

// Limpiar socket al desmontar
onUnmounted(() => {
  if (socket.value) {
    socket.value.disconnect()
    socket.value = null
  }
})
</script>

<template>
  <div>
    <FileUpload ref="uploader" mode="advanced" class="!border-0" :multiple="false" customUpload accept=".xlsx"
      @select="onUpload">
      <template #header>
        <div></div>
      </template>

      <template #content>
        <div v-if="fileData.length" class="mt-8 space-y-4">
          <div
            class="bg-white dark:bg-neutral-700 rounded-xl shadow p-4 w-full text-neutral-800 dark:text-neutral-100 space-y-2">
            <div class="flex items-center justify-between">
              <p class="text-base font-semibold truncate" title="Nombre del archivo">
                {{ fileName }}
              </p>
              <button @click="handleCancel"
                class="text-neutral-400 hover:text-red-500 dark:hover:text-red-400 text-2xl font-bold transition"
                aria-label="Eliminar archivo">
                &times;
              </button>
            </div>
            <p class="text-sm text-neutral-600 dark:text-neutral-400">
              <strong>{{ $t('contact.import.size') }}</strong> {{ formatFileSize }}
            </p>
            <p class="text-sm text-neutral-600 dark:text-neutral-400">
              <strong>{{ $t('contact.import.rows') }}</strong> {{ totalRows }}
            </p>

            <!-- Barra de progreso -->
            <div v-if="importProgress" class="mt-4">
              <p class="text-sm mb-2">{{ $t('contact.import.progress', { progress: importProgress.progress, total: importProgress.total }) }}</p>
              <ProgressBar :value="importProgress.percentage" />
            </div>
          </div>
          <table class="w-full border table-auto text-sm border-neutral-200 dark:border-neutral-700">
            <thead>
              <tr>
                <th v-for="(col, colIndex) in fileData[0]" :key="'header-' + colIndex"
                  class="border p-2 text-center bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 font-semibold border-neutral-200 dark:border-neutral-700">
                  {{ originalHeaders[colIndex] || `Columna ${colIndex + 1}` }}
                </th>
              </tr>
              <tr>
                <th v-for="(col, colIndex) in fileData[0]" :key="'select-' + colIndex"
                  class="border p-2 bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700">
                  <select v-model="selectedFields[colIndex]"
                    class="w-full border p-1 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-600">
                    <option value="">{{ $t('contact.import.not_import') }}</option>
                    <option v-for="option in fieldsOptions" :key="option.value" :value="option.value"
                      :disabled="selectedFields[colIndex] !== option.value && Object.values(selectedFields).includes(option.value)">
                      {{ option.label }}
                    </option>
                  </select>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in fileData.slice(1)" :key="'row-' + rowIndex"
                class="odd:bg-white even:bg-neutral-50 dark:odd:bg-neutral-800 dark:even:bg-neutral-700">
                <td v-for="(cell, cellIndex) in row" :key="'cell-' + cellIndex"
                  class="border p-2 text-neutral-800 dark:text-neutral-100 border-neutral-200 dark:border-neutral-700">
                  {{ cell }}
                </td>
              </tr>
            </tbody>
          </table>

          <div class="grid grid-cols-2 gap-2 w-fit">
            <AppButton class=" !w-auto !mx-auto" :label="$t('contact.import.load_file')" :disabled="!isValid"
              @click="handleFinalUpload" />
            <AppButton class=" !w-auto !mx-auto" severity="secondary" :label="$t('contact.import.cancel')"
              @click="handleCancel" />
          </div>
        </div>
      </template>

      <template #empty>
        <div class="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 p-6 rounded-lg">
          <div class="border-2 border-gray-300 p-4 rounded-full">
            <CloudUploadIcon class="w-12 h-12 text-gray-300" />
          </div>
          <p class="mt-4 text-sm text-gray-500">{{ $t('general.drag_drop_file') }}</p>
          <AppButton class="mt-6 !w-auto !mx-auto" :label="$t('contact.import.select_file')" @click="openFileDialog">
            <template #icon-start>
              <ImportIcon class="w-5 h-5" />
            </template>
          </AppButton>
        </div>
      </template>
    </FileUpload>
  </div>
</template>

<style lang='scss' scoped>
.p-fileupload-advanced {
  border: none;
}
</style>
