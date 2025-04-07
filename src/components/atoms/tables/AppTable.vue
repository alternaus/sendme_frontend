<script lang="ts">
import { defineComponent, type PropType, ref, watchEffect } from 'vue'

import Card from 'primevue/card'
import Column from 'primevue/column'
import ContextMenu from 'primevue/contextmenu'
import DataTable from 'primevue/datatable'
import Paginator from 'primevue/paginator'

import type { TableHeader } from './types/table-header.type'

export default defineComponent({
  name: 'AppTable',
  components: {
    DataTable,
    Column,
    Paginator,
    Card,
    ContextMenu,
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
              <slot :name="`custom-${col.field}`" :data="data">
                {{ data[col.field] }}
              </slot>
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
          <div v-else-if="data.length === 0" class="col-span-full flex flex-col items-center justify-center p-8 text-center">
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
            >
              <div v-for="col in headers" :key="col.field" class="flex items-center gap-2 py-1">
                <strong class="text-gray-600 dark:text-gray-300 flex items-center gap-1 min-w-24">
                  <slot :name="`header-${col.field}`">
                    {{ col.header }}
                  </slot>
                  :
                </strong>
                <span class="flex-1">
                  <slot :name="`custom-${col.field}`" :data="item">
                    {{ item[col.field] }}
                  </slot>
                </span>
              </div>
            </div>
          </template>
        </div>
      </div>
      <div class="flex flex-col md:flex-row md:justify-between items-center mt-4 gap-2 md:gap-0">
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
      <!-- @page="(event) => $emit('page-change', event.page + 1)" -->
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
