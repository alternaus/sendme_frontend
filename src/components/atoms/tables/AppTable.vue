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

// Interfaz para configuración de formato de fecha
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
  paginatorTemplate: 'RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink',
  paginatorPosition: 'right',
  contextMenu: true,
  contextMenuSelection: null,
  containerClass: 'w-full',
  tableClass: '',
  cardClass: 'w-full',
  paginatorClass: 'text-sm'
})

defineOptions({
  inheritAttrs: false
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
watch(selectedRow, (newSelection) => {
  emit('selection-change', newSelection)
}, { deep: true })

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
</script>

<template>
  <div :class="containerClasses">
    <Card v-bind="forwardedAttrs" :class="cardClass" :pt="pt" :pt-options="ptOptions">
      <template #content>
        <div class="max-h-[calc(100vh-300px)] overflow-auto relative">
          <ContextMenu
            v-if="contextMenu"
            ref="contextMenuRef"
            :model="menuModel"
            @hide="selectedRow = null"
          />

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
            :scrollable="scrollable"
            :scrollHeight="scrollHeight"
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
            v-if="multipleSelection"
          ></Column>
          <Column
            class="!border-0"
            v-for="col in headers"
            :key="col.field"
            :field="col.field"
            :sortable="true"
            :style="col.width ? { width: col.width, minWidth: col.width, maxWidth: col.width } : {}"
          >
            <template #header>
              <slot :name="`header-${col.field}`">
                {{ col.header }}
              </slot>
            </template>

            <template #body="{ data }">
              <!-- Si hay un slot personalizado -->
              <slot v-if="$slots[`custom-${col.field}`]" :name="`custom-${col.field}`" :data="data">
                {{ data[col.field] }}
              </slot>

              <!-- Si es un campo de fecha automáticamente detectado -->
              <template v-else-if="isDateField(col.field) && data[col.field]">
                <div class="flex justify-center items-center">
                  <FormattedDate
                    :date="data[col.field] as string"
                    :format="getDateConfig(col.field)?.format"
                    :custom-format="getDateConfig(col.field)?.customFormat"
                    :show-timezone="getDateConfig(col.field)?.showTimezone"
                  />
                </div>
              </template>

              <!-- Para otros tipos de datos -->
              <template v-else>
                {{ data[col.field] }}
              </template>
            </template>
          </Column>

          <template #empty>
            <slot name="empty">
              <div class="flex flex-col items-center justify-center p-6 text-center">
                <i class="pi pi-inbox text-5xl text-gray-300 dark:text-gray-600 mb-4"></i>
                <p class="text-gray-500 dark:text-gray-400">{{ $t('general.no_records_found') }}</p>
              </div>
            </slot>
          </template>
        </DataTable>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div v-if="loading" class="col-span-full flex justify-center py-4">
            <i class="pi pi-spin pi-spinner text-3xl text-gray-400"></i>
          </div>
          <div
            v-else-if="data.length === 0"
            class="col-span-full flex flex-col items-center justify-center p-8 text-center"
          >
            <slot name="empty">
              <i class="pi pi-inbox text-5xl text-gray-300 dark:text-gray-600 mb-4"></i>
              <p class="text-gray-500 dark:text-gray-400">{{ $t('general.no_records_found') }}</p>
            </slot>
          </div>

          <template v-else>
            <div
              v-for="(item, index) in data"
              :key="index"
              class="bg-white dark:bg-neutral-800 shadow-lg rounded-lg p-4 flex flex-col"
              :class="
                selectedRow === item
                  ? '!bg-[var(--p-datatable-row-selected-background)] border !border-[var(--p-datatable-row-focus-ring-color)]'
                  : ''
              "
              @click="
                () => {
                  selectedRow = selectedRow === item ? null : item
                }
              "
            >
              <div
                v-for="col in headers"
                :key="col.field"
                class="flex items-center gap-2 py-1 flex-wrap"
              >
                <strong class="text-gray-600 dark:text-gray-300 flex items-center gap-1 min-w-24">
                  <slot :name="`header-${col.field}`">
                    {{ col.header }}
                  </slot>
                  :
                </strong>
                <span class=" ">
                  <!-- Si hay un slot personalizado -->
                  <slot
                    v-if="$slots[`custom-${col.field}`]"
                    :name="`custom-${col.field}`"
                    :data="item"
                  >
                    {{ item[col.field] }}
                  </slot>

                  <!-- Si es un campo de fecha automáticamente detectado -->
                  <template v-else-if="isDateField(col.field) && item[col.field]">
                    <FormattedDate
                      :date="item[col.field] as string"
                      :format="getDateConfig(col.field)?.format"
                      :custom-format="getDateConfig(col.field)?.customFormat"
                      :show-timezone="getDateConfig(col.field)?.showTimezone"
                    />
                  </template>

                  <!-- Para otros tipos de datos -->
                  <template v-else>
                    {{ item[col.field] }}
                  </template>
                </span>
              </div>
            </div>
          </template>
        </div>
      </div>
      <div v-if="showPaginator" class="flex flex-col md:flex-row md:justify-between items-center mt-4 gap-2 md:gap-0">
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
:deep(.p-datatable-tbody > tr > td) {
  font-size: 12.5px;
  text-align: center;
}

:deep(.p-datatable-column-header-content) {
  justify-content: center;
}

:deep(.p-datatable-column-title) {
  font-size: 15px;
  font-weight: normal;
}

:deep(.p-paginator) {
  justify-content: end;
}

// Mejoras para multiselect - quitar bordes
:deep(.borderless-multiselect) {
  .p-datatable-tbody > tr > td {
    border-left: none !important;
    border-right: none !important;
  }

  .p-datatable-thead > tr > th {
    border-left: none !important;
    border-right: none !important;
  }

  // Reducir padding cuando hay multiselect
  .p-datatable-tbody > tr > td,
  .p-datatable-thead > tr > th {
    padding: 0.5rem 0.25rem !important;
  }

  // Checkbox column más estrecha
  .p-datatable-tbody > tr > td:first-child,
  .p-datatable-thead > tr > th:first-child {
    width: 2rem !important;
    padding: 0.25rem !important;
  }
}

// Paginador más compacto
:deep(.compact-paginator) {
  padding: 0.5rem 0 !important;

  .p-paginator-pages .p-paginator-page,
  .p-paginator-first,
  .p-paginator-prev,
  .p-paginator-next,
  .p-paginator-last {
    min-width: 1.8rem !important;
    height: 1.8rem !important;
    font-size: 0.8rem !important;
  }

  .p-paginator-rpp-options {
    font-size: 0.8rem !important;
  }

  .p-paginator-current {
    font-size: 0.8rem !important;
  }
}

// Estilos generales para texto más pequeño
:deep(.text-sm) {
  .p-paginator {
    font-size: 0.875rem;
  }

  .p-paginator-pages .p-paginator-page,
  .p-paginator-first,
  .p-paginator-prev,
  .p-paginator-next,
  .p-paginator-last {
    font-size: 0.8rem;
  }
}
</style>
