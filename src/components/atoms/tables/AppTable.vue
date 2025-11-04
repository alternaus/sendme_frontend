<script setup lang="ts">
import { computed, ref, useAttrs, watch, watchEffect } from 'vue'

import Card from 'primevue/card'
import Column from 'primevue/column'
import ContextMenu from 'primevue/contextmenu'
import DataTable from 'primevue/datatable'
import Paginator from 'primevue/paginator'

import dayjs from 'dayjs'

import FormattedDate from '@/components/atoms/formatted-date/FormattedDate.vue'
import AppTableMobile from '@/components/atoms/tables/AppTableMobile.vue'

import type { MobileConfig } from './types/mobile-config.type'
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

  dateFields?: DateFormatConfig[]
  autoDetectDateFields?: boolean

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


  contextMenu?: boolean
  contextMenuSelection?: Record<string, unknown> | null


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
  emptyMessage: 'common.general.no_results',
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

            <AppTableMobile
              v-else
              :data="data"
              :headers="headers"
              :loading="loading"
              :empty-message="emptyMessage"
              :multiple-selection="multipleSelection"
              :selected-items="selectedRow"
              :date-fields="dateFields"
              :auto-detect-date-fields="autoDetectDateFields"
              :mobile-config="mobileConfig"
              @selection-change="selectedRow = $event"
              @row-double-click="(row) => handleRowDoubleClick({ data: row })"
            >
              <template #empty>
                <slot name="empty">
                  <i class="pi pi-inbox text-8xl text-neutral-300 dark:text-neutral-600 mb-4"></i>
                  <p class="text-neutral-500 dark:text-neutral-400">
                    {{ $t('common.general.no_records_found') }}
                  </p>
                </slot>
              </template>

              <template #avatar="{ data }">
                <slot name="avatar" :data="data" />
              </template>

              <template #mobile-content="{ data }">
                <slot name="mobile-content" :data="data" />
              </template>

              <template #mobile-status="{ data }">
                <slot name="mobile-status" :data="data" />
              </template>

              <template #mobile-arrow="{ data, selected }">
                <slot name="mobile-arrow" :data="data" :selected="selected" />
              </template>
            </AppTableMobile>
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
