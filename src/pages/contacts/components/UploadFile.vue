<script setup lang="ts">
import { computed, ref } from 'vue'

import FileUpload, { type FileUploadSelectEvent } from 'primevue/fileupload'

import ExcelJS from 'exceljs'

import CloudUploadIcon from '@/assets/svg/cloud-upload.svg?component'
import ImportIcon from '@/assets/svg/table-actions/import.svg?component'
import AppButton from '@/components/atoms/buttons/AppButton.vue'

const uploader = ref()
const fileData = ref<string[][]>([])
const selectedFields = ref<Record<number, string>>({})
const originalHeaders = ref<string[]>([])

const fileName = ref('')
const fileSize = ref(0)
const totalRows = ref(0)

const requiredFields = ['phone']

const fieldsOptions = [
  { label: 'Nombre', value: 'name' },
  { label: 'Apellido', value: 'last_name' },
  { label: 'Email', value: 'email' },
  { label: 'Teléfono', value: 'phone' },
  { label: 'Fecha de nacimiento', value: 'birth_date' }
]

const openFileDialog = () => {
  uploader.value?.choose?.()
}

const onUpload = async (event: FileUploadSelectEvent) => {
  const file = event.files?.[0]
  if (!file) return

  fileName.value = file.name
  fileSize.value = file.size
  fileData.value = []
  originalHeaders.value = []

  const buffer = await file.arrayBuffer()
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)

  const worksheet = workbook.worksheets[0]
  const parsed: string[][] = []

  worksheet.eachRow({ includeEmpty: false }, (row, rowIndex) => {
    const values = Array.isArray(row?.values) ? row.values.slice(1) as string[] : []
    if (rowIndex === 1) {
      originalHeaders.value = values
    }
    if (rowIndex <= 3) {
      parsed.push(values)
    }
  })

  totalRows.value = worksheet.rowCount - 1
  fileData.value = parsed
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

const handleFinalUpload = () => {
  if (!isValid.value) return
  console.log('Subiendo archivo con mapeo:', selectedFields.value)
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
              <strong>Tamaño:</strong> {{ formatFileSize }}
            </p>
            <p class="text-sm text-neutral-600 dark:text-neutral-400">
              <strong>Filas encontradas:</strong> {{ totalRows }}
            </p>
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
