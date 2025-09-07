<script setup lang="ts">
import { computed, ref, useAttrs, watch, watchEffect } from 'vue'

import Card from 'primevue/card'
import Column from 'primevue/column'
import ContextMenu from 'primevue/contextmenu'
import DataTable from 'primevue/datatable'
import Paginator from 'primevue/paginator'

import dayjs from 'dayjs'

import FormattedDate from '@/components/atoms/formatted-date/FormattedDate.vue'
import AppTag from '@/components/atoms/tag/AppTag.vue'

import type { MobileConfig } from './types/mobile-config.type'
import type { TableHeader } from './types/table-header.type'

type TagSeverity = 'secondary' | 'success' | 'info' | 'warn' | 'warning' | 'danger' | 'contrast'

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
  mobileConfig?: MobileConfig
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

// Utilidades para la configuración móvil genérica
const getFieldValue = (item: Record<string, unknown>, field: string | undefined, fallbackFields?: string[]): string => {
  if (field && item[field]) {
    return String(item[field])
  }

  if (fallbackFields) {
    for (const fallbackField of fallbackFields) {
      if (item[fallbackField]) {
        return String(item[fallbackField])
      }
    }
  }

  return ''
}

const findFieldByKeywords = (keywords: string[]): string | undefined => {
  return props.headers.find(h =>
    keywords.some(keyword => h.field.toLowerCase().includes(keyword))
  )?.field
}

// Funciones para la vista móvil
const getInitials = (item: Record<string, unknown>): string => {
  const avatarConfig = props.mobileConfig?.avatar
  let value = ''

  if (avatarConfig?.field) {
    value = getFieldValue(item, avatarConfig.field, avatarConfig.fallbackFields)
  } else {
    // Fallback automático para compatibilidad
    const autoField = findFieldByKeywords(['name', 'nombre'])
    value = getFieldValue(item, autoField)
  }

  if (value) {
    return value
      .split(' ')
      .slice(0, 2)
      .map(word => word.charAt(0).toUpperCase())
      .join('')
  }
  return 'NA'
}

const getMobileTitle = (item: Record<string, unknown>): string => {
  const titleConfig = props.mobileConfig?.title

  if (titleConfig?.field) {
    return getFieldValue(item, titleConfig.field, titleConfig.fallbackFields)
  }

  // Fallback automático
  const autoField = findFieldByKeywords(['name', 'nombre', 'title', 'titulo'])
  return getFieldValue(item, autoField)
}

// Función para verificar si un elemento está seleccionado (compatible con selección simple y múltiple)
const isItemSelected = (item: Record<string, unknown>): boolean => {
  if (!selectedRow.value) return false

  if (Array.isArray(selectedRow.value)) {
    // Selección múltiple: buscar en el array
    return selectedRow.value.some(selected => {
      // Comparar por ID si existe, sino por referencia
      if (selected.id && item.id) {
        return selected.id === item.id
      }
      return selected === item
    })
  } else {
    // Selección simple: comparación directa
    if (selectedRow.value.id && item.id) {
      return selectedRow.value.id === item.id
    }
    return selectedRow.value === item
  }
}

const getMobileSubtitle = (item: Record<string, unknown>): { value: string; isDate: boolean; field: string } => {
  const subtitleConfig = props.mobileConfig?.subtitle
  let field = ''
  let value = ''

  if (subtitleConfig?.field) {
    field = subtitleConfig.field
    value = getFieldValue(item, subtitleConfig.field, subtitleConfig.fallbackFields)
  } else {
    // Fallback automático
    const autoField = findFieldByKeywords(['phone', 'telefono', 'tel', 'frequency', 'frecuencia', 'email', 'correo'])
    if (autoField) {
      field = autoField
      value = getFieldValue(item, autoField)
    }
  }

  return {
    value,
    isDate: isDateField(field),
    field
  }
}

const getMobileMetadata = (item: Record<string, unknown>): Array<{ value: string; label?: string; isDate: boolean; field: string; position: 'left' | 'right'; separator?: string }> => {
  if (!props.mobileConfig?.metadata) {
    // Fallback automático para compatibilidad
    const emailField = findFieldByKeywords(['email', 'correo'])
    const sourceField = findFieldByKeywords(['source', 'origen', 'canal', 'channel', 'type', 'tipo', 'date', 'fecha', 'start', 'end'])

    const metadata = []
    if (emailField && item[emailField]) {
      metadata.push({
        value: String(item[emailField]),
        isDate: isDateField(emailField),
        field: emailField,
        position: 'left' as const
      })
    }
    if (sourceField && item[sourceField]) {
      metadata.push({
        value: String(item[sourceField]),
        isDate: isDateField(sourceField),
        field: sourceField,
        position: 'right' as const
      })
    }
    return metadata
  }

  return props.mobileConfig.metadata
    .map(config => {
      const value = getFieldValue(item, config.field)
      return {
        value,
        label: config.label,
        isDate: isDateField(config.field),
        field: config.field,
        position: config.position || 'left',
        separator: config.separator
      }
    })
    .filter(meta => meta.value)
}

const getMobileStatus = (item: Record<string, unknown>): string => {
  const statusConfig = props.mobileConfig?.status

  if (statusConfig?.field) {
    return getFieldValue(item, statusConfig.field, statusConfig.fallbackFields)
  }

  // Fallback automático
  const autoField = findFieldByKeywords(['status', 'estado', 'state'])
  return getFieldValue(item, autoField)
}

const shouldShowAvatar = computed(() => {
  return props.mobileConfig?.showAvatar !== false && (props.mobileConfig?.avatar?.field || findFieldByKeywords(['name', 'nombre']))
})

const getStatusSeverity = (item: Record<string, unknown>): TagSeverity => {
  const status = getMobileStatus(item).toLowerCase()

  if (status.includes('activ') || status.includes('active')) {
    return 'success'
  }
  if (status.includes('pendient') || status.includes('pending')) {
    return 'warn'
  }
  if (status.includes('inactiv') || status.includes('inactive')) {
    return 'secondary'
  }

  return 'info'
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
                  class="rounded-xl p-4 flex items-center shadow-sm transition-all duration-200 cursor-pointer active:scale-[0.95]"
                  :class="[
                    shouldShowAvatar ? 'gap-4' : 'gap-0',
                    isItemSelected(item)
                      ? 'border-1'
                      : 'bg-white dark:bg-neutral-800 border-neutral-100 dark:border-neutral-700 hover:shadow-md'
                  ]"
                  :data-selected="isItemSelected(item)"
                  @click="
                    () => {
                      if (props.multipleSelection) {
                        // Selección múltiple: agregar/quitar del array
                        if (!Array.isArray(selectedRow)) {
                          selectedRow = []
                        }
                        const currentSelection = selectedRow as Record<string, unknown>[]
                        const isCurrentlySelected = isItemSelected(item)

                        if (isCurrentlySelected) {
                          // Quitar elemento
                          selectedRow = currentSelection.filter(selected => {
                            if (selected.id && item.id) {
                              return selected.id !== item.id
                            }
                            return selected !== item
                          })
                        } else {
                          // Agregar elemento
                          selectedRow = [...currentSelection, item]
                        }
                      } else {
                        // Selección simple: toggle
                        selectedRow = isItemSelected(item) ? null : item
                      }
                    }
                  "
                  @dblclick="() => handleRowDoubleClick({ data: item })"
                >
                  <!-- Avatar -->
                  <div v-if="shouldShowAvatar" class="flex-shrink-0">
                    <div class="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-600 flex items-center justify-center text-neutral-700 dark:text-neutral-300 font-semibold text-lg">
                      <slot name="avatar" :data="item">
                        {{ getInitials(item) }}
                      </slot>
                    </div>
                  </div>

                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <slot name="mobile-content" :data="item">
                      <!-- Title -->
                      <h3 v-if="getMobileTitle(item)" class="font-semibold text-neutral-900 dark:text-white text-base truncate leading-tight">
                        {{ getMobileTitle(item) }}
                      </h3>

                      <!-- Subtitle -->
                      <p v-if="getMobileSubtitle(item).value" class="text-neutral-600 dark:text-neutral-300 text-sm truncate mt-0.5">
                        <FormattedDate
                          v-if="getMobileSubtitle(item).isDate"
                          :date="getMobileSubtitle(item).value"
                          :format="getDateConfig(getMobileSubtitle(item).field)?.format"
                          :custom-format="getDateConfig(getMobileSubtitle(item).field)?.customFormat"
                          :show-timezone="getDateConfig(getMobileSubtitle(item).field)?.showTimezone"
                        />
                        <span v-else>{{ getMobileSubtitle(item).value }}</span>
                      </p>

                      <!-- Metadata -->
                      <div v-if="getMobileMetadata(item).length > 0" class="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        <template v-for="(meta, metaIndex) in getMobileMetadata(item)" :key="metaIndex">
                          <span v-if="meta.position === 'left'" class="truncate max-w-[150px]">
                            <span v-if="meta.label" class="font-medium">{{ meta.label }}: </span>
                            <FormattedDate
                              v-if="meta.isDate"
                              :date="meta.value"
                              :format="getDateConfig(meta.field)?.format"
                              :custom-format="getDateConfig(meta.field)?.customFormat"
                              :show-timezone="getDateConfig(meta.field)?.showTimezone"
                            />
                            <span v-else>{{ meta.value }}</span>
                          </span>
                        </template>

                        <span v-if="getMobileMetadata(item).some(m => m.position === 'left') && getMobileMetadata(item).some(m => m.position === 'right')" class="text-neutral-300 dark:text-neutral-600">•</span>

                        <template v-for="(meta, metaIndex) in getMobileMetadata(item)" :key="`right-${metaIndex}`">
                          <span v-if="meta.position === 'right'" class="flex-shrink-0 font-medium">
                            <span v-if="meta.label" class="font-medium">{{ meta.label }}: </span>
                            <FormattedDate
                              v-if="meta.isDate"
                              :date="meta.value"
                              :format="getDateConfig(meta.field)?.format"
                              :custom-format="getDateConfig(meta.field)?.customFormat"
                              :show-timezone="getDateConfig(meta.field)?.showTimezone"
                            />
                            <span v-else>{{ meta.value }}</span>
                          </span>
                        </template>
                      </div>
                    </slot>
                  </div>

                  <!-- Status and Arrow -->
                  <div class="flex items-center gap-3 flex-shrink-0">
                    <div class="flex items-center">
                      <slot name="mobile-status" :data="item">
                        <AppTag
                          v-if="getMobileStatus(item)"
                          :label="getMobileStatus(item)"
                          :severity="getStatusSeverity(item)"
                        />
                      </slot>
                    </div>

                    <div class="w-6 h-6 flex items-center justify-center">
                      <slot name="mobile-arrow" :data="item" :selected="isItemSelected(item)">
                        <div
                          v-if="isItemSelected(item)"
                          class="w-6 h-6 rounded-full flex items-center justify-center shadow-sm transition-all duration-200"
                          style="background-color: var(--p-primary-color);"
                        >
                          <i class="pi pi-check text-sm font-semibold" style="color: var(--p-primary-contrast-color);"></i>
                        </div>
                      </slot>
                    </div>
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

// Estilos para selección móvil con modo oscuro
[data-selected="true"] {
  // Modo claro
  background-color: var(--p-primary-50) !important;
  border-color: var(--p-primary-color) !important;
  color: var(--p-primary-800) !important;

  // Modo oscuro
  html.dark & {
    background-color: var(--p-primary-900) !important;
    border-color: var(--p-primary-color) !important;
    color: var(--p-primary-100) !important;
  }
}
</style>
