<script setup lang="ts">
import { computed, ref, useAttrs, watch, watchEffect } from 'vue'

import Card from 'primevue/card'
import Column from 'primevue/column'
import ContextMenu from 'primevue/contextmenu'
import DataTable from 'primevue/datatable'
import Paginator from 'primevue/paginator'

import dayjs from 'dayjs'

import FormattedDate from '@/components/atoms/formatted-date/FormattedDate.vue'

import type { TableHeader } from './types/table-header.type'

export interface DateFormatConfig {
  field: string
  format?: 'date' | 'time' | 'datetime'
  customFormat?: string
  showTimezone?: boolean
}

type DataTableSize = 'small' | 'large'
type DataTableSelectionMode = 'single' | 'multiple'
type PaginatorPosition = 'left' | 'center' | 'right'

interface Props {
  data: Record<string, unknown>[]
  headers: TableHeader[]
  pageSize: number
  pageCurrent: number
  totalItems: number
  showPaginator?: boolean
  multipleSelection?: boolean
  textTotalItems?: string
  loading?: boolean
  emptyMessage?: string

  // Configuración de formateo de fechas
  dateFields?: DateFormatConfig[]
  autoDetectDateFields?: boolean

  // Nuevas propiedades para mejorar la tabla
  tableSize?: DataTableSize
  selectionMode?: DataTableSelectionMode
  removableSort?: boolean
  resizableColumns?: boolean
  reorderableColumns?: boolean
  scrollable?: boolean
  scrollHeight?: string
  virtualScrollerOptions?: object
  showGridlines?: boolean
  stripedRows?: boolean
  paginatorTemplate?: string
  paginatorPosition?: PaginatorPosition

  // Configuración del contexto
  contextMenu?: boolean
  contextMenuSelection?: Record<string, unknown> | null

  // Clases personalizadas
  containerClass?: string
  tableClass?: string
  cardClass?: string
  paginatorClass?: string

  // PassThrough API
  pt?: object
  ptOptions?: object

  // Configuración para vista móvil
  mobileNameField?: string
  mobilePhoneField?: string
  mobileEmailField?: string
  mobileSourceField?: string
  mobileStatusField?: string
  mobileTitleField?: string
}

const props = withDefaults(defineProps<Props>(), {
  showPaginator: true,
  multipleSelection: false,
  textTotalItems: 'general.total_records',
  loading: false,
  emptyMessage: 'general.no_data',
  dateFields: () => [],
  autoDetectDateFields: true,
  tableSize: 'small',
  removableSort: true,
  resizableColumns: false,
  reorderableColumns: false,
  scrollable: false,
  scrollHeight: '400px',
  showGridlines: false,
  stripedRows: false,
  paginatorTemplate:
    'RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink',
  paginatorPosition: 'right',
  contextMenu: true,
  contextMenuSelection: null,
  containerClass: 'w-full',
  tableClass: '',
  cardClass: 'w-full',
  paginatorClass: 'text-sm',
})

defineOptions({
  inheritAttrs: false,
})

const emit = defineEmits<{
  'selection-change': [selection: Record<string, unknown> | Record<string, unknown>[] | null]
  'page-change': [event: { pageSize: number; limitSize: number }]
  'row-double-click': [row: Record<string, unknown>]
  'row-view': [row: Record<string, unknown>]
  'row-select': [event: { originalEvent: Event; data: Record<string, unknown>; index: number }]
  'row-unselect': [event: { originalEvent: Event; data: Record<string, unknown>; index: number }]
  'row-select-all': [event: { originalEvent: Event; data: Record<string, unknown>[] }]
  'row-unselect-all': [event: { originalEvent: Event }]
  'column-resize-end': [event: { element: HTMLElement; delta: number }]
  'column-reorder': [event: { originalEvent: Event; dragIndex: number; dropIndex: number }]
}>()

const attrs = useAttrs()

// Filtrar atributos conflictivos
const blockKeys = ['class']

const forwardedAttrs = computed(() => {
  const src = attrs ?? {}
  return Object.fromEntries(Object.entries(src).filter(([k]) => !blockKeys.includes(k)))
})

// Manejar clases del contenedor
const containerClasses = computed(() => {
  const classAttr = attrs.class as string | undefined
  return classAttr ? `${props.containerClass} ${classAttr}` : props.containerClass
})

const selectedRow = ref<Record<string, unknown> | Record<string, unknown>[] | null>([])

// Watcher para detectar cambios en la selección
watch(
  selectedRow,
  (newSelection) => {
    emit('selection-change', newSelection)
  },
  { deep: true },
)

const isMdScreen = ref(window.innerWidth < 1024)
const contextMenuRef = ref()

const menuModel = ref([
  {
    label: 'Ver',
    icon: 'pi pi-fw pi-eye',
    command: () => {
      if (selectedRow.value && !Array.isArray(selectedRow.value)) {
        emit('row-view', selectedRow.value)
      }
    },
    class: 'text-xs',
  },
])

//Detectar campos de fecha automáticamente
const detectedDateFields = computed(() => {
  if (!props.autoDetectDateFields || props.data.length === 0) {
    return props.dateFields
  }

  const dateFieldConfigs: DateFormatConfig[] = [...props.dateFields]
  const existingFields = dateFieldConfigs.map((config) => config.field)

  //Comprueba datos para inferir campos de fecha
  const item = props.data[0]

  props.headers.forEach((header) => {
    const field = header.field
    const value = item[field]

    //Si ya está configurado, omitir
    if (existingFields.includes(field)) {
      return
    }

    const isDateField =
      typeof value === 'string' &&
      (field.toLowerCase().includes('date') ||
        field.toLowerCase().includes('at') ||
        (value && dayjs(value).isValid() && /^\d{4}-\d{2}-\d{2}/.test(value as string)))

    if (isDateField) {
      dateFieldConfigs.push({
        field,
        format: field.toLowerCase().includes('time') ? 'time' : 'datetime',
      })
    }
  })

  return dateFieldConfigs
})

//Detectar si un campo es de fecha
const isDateField = (field: string): boolean => {
  return detectedDateFields.value.some((config) => config.field === field)
}

//Obtener la configuración de formato para un campo
const getDateConfig = (field: string): DateFormatConfig | undefined => {
  return detectedDateFields.value.find((config) => config.field === field)
}

watchEffect(() => {
  const handleResize = () => {
    isMdScreen.value = window.innerWidth < 1024
  }
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
})

const onRowContextMenu = (event: { originalEvent: unknown }) => {
  contextMenuRef.value.show(event.originalEvent)
}

const handlePageChange = (event: { first: number; rows: number }) => {
  const newPage = Math.floor(event.first / event.rows) + 1
  const newPageSize = event.rows

  emit('page-change', {
    pageSize: newPage,
    limitSize: newPageSize,
  })
}

const handleRowDoubleClick = (event: { data: Record<string, unknown> }) => {
  emit('row-double-click', event.data)
}

// Configuración de tamaños de página
const rowSizes = computed(() => [10, 20, 50, 100])

// Clases mejoradas para multiselect y paginador
const tableClasses = computed(() => {
  const classes = [props.tableClass]
  if (props.multipleSelection) {
    classes.push('borderless-multiselect')
  }
  return classes.filter(Boolean).join(' ')
})

const paginatorClasses = computed(() => {
  const classes = [props.paginatorClass]
  if (props.multipleSelection) {
    classes.push('compact-paginator')
  }
  return classes.filter(Boolean).join(' ')
})

// Computed para determinar si hay datos y ajustar altura
const hasData = computed(() => props.data && props.data.length > 0)

const tableContentClasses = computed(() => {
  const baseClasses = ['table-content-container']
  if (!hasData.value) {
    baseClasses.push('table-empty')
  }
  return baseClasses.join(' ')
})

// Funciones para la vista móvil tipo tarjeta
const getInitials = (item: Record<string, unknown>): string => {
  const nameField = props.mobileNameField || props.headers.find(h =>
    h.field.toLowerCase().includes('name') ||
    h.field.toLowerCase().includes('nombre')
  )?.field

  if (nameField && item[nameField]) {
    const name = String(item[nameField])
    return name
      .split(' ')
      .slice(0, 2)
      .map(word => word.charAt(0).toUpperCase())
      .join('')
  }
  return 'NA'
}

const getMainTitle = (item: Record<string, unknown>): string => {
  const nameField = props.mobileNameField || props.headers.find(h =>
    h.field.toLowerCase().includes('name') ||
    h.field.toLowerCase().includes('nombre')
  )?.field

  return nameField ? String(item[nameField] || '') : ''
}

const getPhoneFormatted = (item: Record<string, unknown>): { value: string; isDate: boolean; field: string } => {
  const phoneField = props.mobilePhoneField || props.headers.find(h =>
    h.field.toLowerCase().includes('phone') ||
    h.field.toLowerCase().includes('telefono') ||
    h.field.toLowerCase().includes('tel') ||
    h.field.toLowerCase().includes('frequency') ||
    h.field.toLowerCase().includes('frecuencia')
  )?.field

  if (phoneField && item[phoneField]) {
    return {
      value: String(item[phoneField]),
      isDate: isDateField(phoneField),
      field: phoneField
    }
  }
  return { value: '', isDate: false, field: '' }
}

const getEmail = (item: Record<string, unknown>): string => {
  const emailField = props.mobileEmailField || props.headers.find(h =>
    h.field.toLowerCase().includes('email') ||
    h.field.toLowerCase().includes('correo')
  )?.field

  return emailField ? String(item[emailField] || '') : ''
}

const getSourceFormatted = (item: Record<string, unknown>): { value: string; isDate: boolean; field: string } => {
  const sourceField = props.mobileSourceField || props.headers.find(h => {
    const sourceFields = ['source', 'origen', 'canal', 'channel', 'type', 'tipo', 'date', 'fecha', 'start', 'end']
    return sourceFields.some(field => h.field.toLowerCase().includes(field))
  })?.field

  if (sourceField && item[sourceField]) {
    return {
      value: String(item[sourceField]),
      isDate: isDateField(sourceField),
      field: sourceField
    }
  }
  return { value: '', isDate: false, field: '' }
}

const getStatus = (item: Record<string, unknown>): string => {
  const statusField = props.mobileStatusField || props.headers.find(h =>
    h.field.toLowerCase().includes('status') ||
    h.field.toLowerCase().includes('estado') ||
    h.field.toLowerCase().includes('state')
  )?.field

  return statusField ? String(item[statusField] || '') : ''
}

const getStatusClass = (item: Record<string, unknown>): string => {
  const status = getStatus(item).toLowerCase()

  if (status.includes('activ') || status.includes('active')) {
    return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
  }
  if (status.includes('pendient') || status.includes('pending')) {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
  }
  if (status.includes('inactiv') || status.includes('inactive')) {
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
  }

  return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
}
</script>

<template>
  <div :class="containerClasses">
    <Card
      v-bind="forwardedAttrs"
      :class="cardClass"
      :pt="{ ...pt, body: { style: 'padding: 0.8rem !important;' } }"
      :pt-options="ptOptions"
    >
      <template #content>
        <div class="relative flex flex-col" :class="tableContentClasses">
          <ContextMenu
            v-if="contextMenu"
            ref="contextMenuRef"
            :model="menuModel"
            @hide="selectedRow = null"
          />

          <div class="flex-1 min-h-0 overflow-hidden">
            <DataTable
              v-if="!isMdScreen"
              v-model:selection="selectedRow"
              :value="data"
              :size="tableSize"
              v-model:contextMenuSelection="selectedRow"
              @rowContextmenu="onRowContextMenu"
              @rowDblclick="handleRowDoubleClick"
              :selectionMode="multipleSelection ? 'multiple' : 'single'"
              :removableSort="removableSort"
              :resizableColumns="resizableColumns"
              :reorderableColumns="reorderableColumns"
              :scrollable="true"
              :scrollHeight="'flex'"
              :virtualScrollerOptions="virtualScrollerOptions"
              :showGridlines="showGridlines"
              :stripedRows="stripedRows"
              tableStyle="min-width: 50rem"
              :class="tableClasses"
              :contextMenu="contextMenu"
              @column-resize-end="emit('column-resize-end', $event)"
              @column-reorder="emit('column-reorder', $event)"
              :loading="loading"
              :emptyMessage="$t(emptyMessage)"
            >
              <Column
                selectionMode="multiple"
                headerStyle="width: 3rem"
                class="!border-0"
                v-if="multipleSelection"
              ></Column>
              <Column
                class="!border-0"
                v-for="col in headers"
                :key="col.field"
                :field="col.field"
                :sortable="true"
                :style="
                  col.width ? { width: col.width, minWidth: col.width, maxWidth: col.width } : {}
                "
              >
                <template #header>
                  <div class="flex items-center justify-center gap-2 text-sm font-semibold text-neutral-600 dark:text-neutral-300 uppercase tracking-wide">
                    <slot :name="`header-${col.field}`">
                      {{ col.header }}
                    </slot>
                  </div>
                </template>

                <template #body="{ data }">
                  <div class="flex justify-center font-medium items-center text-sm text-neutral-500 dark:text-neutral-400">
                    <slot
                      v-if="$slots[`custom-${col.field}`]"
                      :name="`custom-${col.field}`"
                      :data="data"
                    >
                      {{ data[col.field] }}
                    </slot>

                    <template v-else-if="isDateField(col.field) && data[col.field]">
                      <FormattedDate
                        :date="data[col.field] as string"
                        :format="getDateConfig(col.field)?.format"
                        :custom-format="getDateConfig(col.field)?.customFormat"
                        :show-timezone="getDateConfig(col.field)?.showTimezone"
                      />
                    </template>

                    <template v-else>
                      <span class="truncate max-w-[200px]" :title="String(data[col.field] || '')">
                        {{ data[col.field] || '-' }}
                      </span>
                    </template>
                  </div>
                </template>
              </Column>

              <template #empty>
                <slot name="empty">
                  <div class="flex flex-col items-center justify-center p-4 text-center">
                    <i class="pi pi-inbox text-5xl text-neutral-300 dark:text-neutral-600 mb-4"></i>
                    <p class="text-neutral-500 dark:text-neutral-400">
                      {{ $t('common.general.no_records_found') }}
                    </p>
                  </div>
                </slot>
              </template>
            </DataTable>

            <div v-else class="space-y-3 overflow-y-auto max-h-[60vh] p-1">
              <div v-if="loading" class="flex justify-center py-8">
                <i class="pi pi-spin pi-spinner text-3xl text-neutral-400"></i>
              </div>
              <div
                v-else-if="data.length === 0"
                class="flex flex-col items-center justify-center p-8 text-center"
              >
                <slot name="empty">
                  <i class="pi pi-inbox text-8xl text-neutral-300 dark:text-neutral-600 mb-4"></i>
                  <p class="text-neutral-500 dark:text-neutral-400">
                    {{ $t('common.general.no_records_found') }}
                  </p>
                </slot>
              </div>

              <template v-else>
                <div
                  v-for="(item, index) in data"
                  :key="index"
                  class="bg-white dark:bg-neutral-800 rounded-xl p-4 flex items-center shadow-sm border border-neutral-100 dark:border-neutral-700 hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.98]"
                  :class="[
                    mobileNameField ? 'gap-4' : 'gap-0'
                  ]"
                  @click="
                    () => {
                      selectedRow = selectedRow === item ? null : item
                    }
                  "
                  @dblclick="() => handleRowDoubleClick({ data: item })"
                >
                  <!-- Avatar -->
                  <div v-if="mobileNameField" class="flex-shrink-0">
                    <slot name="avatar" :data="item">
                      <div class="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-600 flex items-center justify-center text-neutral-700 dark:text-neutral-300 font-semibold text-lg">
                        {{ getInitials(item) }}
                      </div>
                    </slot>
                  </div>

                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <slot name="mobile-content" :data="item">
                      <!-- Contenido basado en props -->
                      <!-- Title/Name -->
                      <h3 v-if="mobileNameField || mobileTitleField" class="font-semibold text-neutral-900 dark:text-white text-base truncate leading-tight">
                        {{ mobileTitleField ? item[mobileTitleField] : getMainTitle(item) }}
                      </h3>

                      <!-- Phone/Secondary info -->
                      <p v-if="mobilePhoneField" class="text-neutral-600 dark:text-neutral-300 text-sm truncate mt-0.5">
                        <FormattedDate
                          v-if="getPhoneFormatted(item).isDate && getPhoneFormatted(item).value"
                          :date="getPhoneFormatted(item).value"
                          :format="getDateConfig(getPhoneFormatted(item).field)?.format"
                          :custom-format="getDateConfig(getPhoneFormatted(item).field)?.customFormat"
                          :show-timezone="getDateConfig(getPhoneFormatted(item).field)?.showTimezone"
                        />
                        <span v-else>{{ getPhoneFormatted(item).value }}</span>
                      </p>

                      <!-- Email and source -->
                      <div v-if="mobileEmailField || mobileSourceField" class="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        <span v-if="mobileEmailField" class="truncate max-w-[150px]">{{ getEmail(item) }}</span>
                        <span v-if="mobileEmailField && mobileSourceField && getEmail(item) && getSourceFormatted(item).value" class="text-neutral-300 dark:text-neutral-600">•</span>
                        <span v-if="mobileSourceField" class="flex-shrink-0 font-medium">
                          <FormattedDate
                            v-if="getSourceFormatted(item).isDate && getSourceFormatted(item).value"
                            :date="getSourceFormatted(item).value"
                            :format="getDateConfig(getSourceFormatted(item).field)?.format"
                            :custom-format="getDateConfig(getSourceFormatted(item).field)?.customFormat"
                            :show-timezone="getDateConfig(getSourceFormatted(item).field)?.showTimezone"
                          />
                          <span v-else>{{ getSourceFormatted(item).value }}</span>
                        </span>
                      </div>
                    </slot>
                  </div>

                  <!-- Status and Arrow -->
                  <div class="flex items-center gap-3 flex-shrink-0">
                    <slot name="mobile-status" :data="item">
                      <span
                        v-if="mobileStatusField && getStatus(item)"
                        class="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap"
                        :class="getStatusClass(item)"
                      >
                        {{ getStatus(item) }}
                      </span>
                    </slot>

                    <slot name="mobile-arrow" :data="item">
                      <div class="w-6 h-6 flex items-center justify-center">
                        <div
                          v-if="selectedRow === item"
                          class="w-6 h-6 rounded-full flex items-center justify-center shadow-sm transition-all duration-200"
                          style="background-color: var(--p-primary-color);"
                        >
                          <i class="pi pi-check text-sm font-semibold" style="color: var(--p-primary-contrast-color);"></i>
                        </div>
                      </div>
                    </slot>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
        <div
          v-if="showPaginator"
          class="flex flex-col md:flex-row md:justify-between items-center mt-4 gap-2 md:gap-0"
        >
          <small class="text-sm text-center md:text-left">
            <span class="text-base font-semibold">
              {{ totalItems }}
            </span>
            {{ $t(textTotalItems) }}
          </small>

          <Paginator
            v-show="totalItems > 0"
            :rows="pageSize"
            :rowsPerPageOptions="rowSizes"
            :totalRecords="totalItems"
            :template="paginatorTemplate"
            :class="paginatorClasses"
            @page="handlePageChange"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<style lang="scss" scoped>
// Altura adaptativa simple
.table-content-container {
  &.table-empty {
    max-height: 300px;
  }

  &:not(.table-empty) {
    max-height: 70vh;
  }
}

// DataTable básico
:deep(.p-datatable) {
  .p-datatable-wrapper {
    overflow: auto;
    max-height: 60vh;
  }
}

// Estilos básicos de texto
:deep(.p-datatable-tbody > tr > td) {
  font-size: 12.5px;
  text-align: center;
}

:deep(.p-datatable-column-header-content) {
  justify-content: center;
}

:deep(.p-paginator) {
  justify-content: end;
}
</style>
