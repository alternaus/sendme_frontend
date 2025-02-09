<script lang="ts">
import { defineComponent, type PropType } from 'vue'

import DataTable from 'primevue/datatable'
import Paginator from 'primevue/paginator'
import Column from 'primevue/column'
import { Card } from 'primevue'
import type { TableHeader } from './types/table-header.type'

export default defineComponent({
  name: 'AppTable',
  components: {
    DataTable,
    Column,
    Paginator,
    Card,
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
  },
  setup() {
    const onRowSelect = (event: { data: Record<string, unknown> }) => {
      console.log('Row selected:', event.data)
    }

    const allSelected = () => {
      console.log('All rows selected')
    }

    const allUnSelected = () => {
      console.log('All rows unselected')
    }

    const handlePageChange = (event: { page: number }) => {
      console.log('Page changed:', event.page)
    }

    return {
      handlePageChange,
      selectedRow: [],
      rowSizes: [20, 50, 100, 500],
      onRowSelect,
      allSelected,
      allUnSelected,
    }
  },
})
</script>

<template>
  <Card>
    <template #content>
      <DataTable
        v-model:selection="selectedRow"
        :value="data"
        size="small"
        :selectionMode="multipleSelection ? 'multiple' : 'single'"
        removableSort
        tableStyle="min-width: 50rem"
        @row-select="onRowSelect"
        @row-unselect="onRowSelect"
        @row-select-all="allSelected"
        @row-unselect-all="allUnSelected"
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
      </DataTable>
      <Paginator
        v-show="totalItems > 0"
        :rows="pageSize"
        :totalRecords="totalItems"
        :rowsPerPageOptions="rowSizes"
        @page="handlePageChange"
      ></Paginator>
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
