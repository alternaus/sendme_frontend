<script lang="ts">
import { computed, defineComponent, type PropType, ref, watchEffect } from 'vue'

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

export default defineComponent({
  name: 'AppTable',
  components: {
    DataTable,
    Column,
    Paginator,
    Card,
    ContextMenu,
    FormattedDate,
  },
  props: {
    data: {
      type: Array as PropType<Record<string, unknown>[]>,
      required: true,
    },
    headers: {
      type: Array as PropType<TableHeader[]>,
      required: true,
    },
    pageSize: {
      type: Number,
      required: true,
    },
    pageCurrent: {
      type: Number,
      required: true,
    },
    totalItems: {
      type: Number,
      required: true,
    },
    showPaginator: {
      type: Boolean,
      default: true,
    },
    multipleSelection: {
      type: Boolean,
      default: false,
    },
    textTotalItems: {
      type: String,
      default: 'general.total_records',
    },
    loading: {
      type: Boolean,
      default: false,
    },
    emptyMessage: {
      type: String,
      default: 'general.no_data',
    },
    // Configuración de formateo de fechas
    dateFields: {
      type: Array as PropType<DateFormatConfig[]>,
      default: () => [],
    },
    // Detectar automáticamente campos de fecha
    autoDetectDateFields: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['selection-change', 'page-change'],
  setup(props, { emit }) {
    const rowSizes = [10, 20, 50, 100]
    const selectedRow = ref<Record<string, unknown> | Record<string, unknown>[] | null>([])
    const isMdScreen = ref(window.innerWidth < 1024)
    const contextMenuRef = ref()

    const menuModel = ref([
      {
        label: 'Custom',
        icon: 'pi pi-fw pi-search',
        command: () => console.log('custom'),
        class: 'text-xs',
      },
    ])

    // Detectar campos de fecha automáticamente
    const detectedDateFields = computed(() => {
      if (!props.autoDetectDateFields || props.data.length === 0) {
        return props.dateFields
      }

      const dateFieldConfigs: DateFormatConfig[] = [...props.dateFields]
      const existingFields = dateFieldConfigs.map((config) => config.field)

      // Comprueba datos para inferir campos de fecha
      const item = props.data[0]

      props.headers.forEach((header) => {
        const field = header.field
        const value = item[field]

        // Si ya está configurado, omitir
        if (existingFields.includes(field)) {
          return
        }

        // Detectar si es una fecha por nombre del campo o por valor
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

    // Detectar si un campo es de fecha
    const isDateField = (field: string): boolean => {
      return detectedDateFields.value.some((config) => config.field === field)
    }

    // Obtener la configuración de formato para un campo
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

    const handleRowSelect = () => {
      emit('selection-change', selectedRow.value)
    }

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

    return {
      selectedRow,
      handleRowSelect,
      handlePageChange,
      isMdScreen,
      menuModel,
      contextMenuRef,
      onRowContextMenu,
      rowSizes,
      isDateField,
      getDateConfig,
    }
  },
})
</script>

<template>
  <Card class="w-full">
    <template #content>
      <div class="max-h-[calc(100vh-300px)] overflow-auto relative">
        <ContextMenu ref="contextMenuRef" :model="menuModel" @hide="selectedRow = null" />

        <DataTable
          v-if="!isMdScreen"
          v-model:selection="selectedRow"
          :value="data"
          size="small"
          v-model:contextMenuSelection="selectedRow"
          @rowContextmenu="onRowContextMenu"
          :selectionMode="multipleSelection ? 'multiple' : 'single'"
          removableSort
          tableStyle="min-width: 50rem"
          @row-select="handleRowSelect"
          @row-unselect="handleRowSelect"
          @row-select-all="handleRowSelect"
          context-menu
          @row-unselect-all="handleRowSelect"
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
                  handleRowSelect()
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
          @page="handlePageChange"
        />
      </div>
    </template>
  </Card>
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
</style>
