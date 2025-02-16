<script lang="ts">
import { defineComponent, type PropType, ref } from 'vue'

import Card from 'primevue/card'
import Column from 'primevue/column'
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
  emits: ['selection-change', 'page-change'],
  setup(props, { emit }) {
    const selectedRow = ref<Record<string, unknown> | Record<string, unknown>[]>([])

    const handleRowSelect = () => {
      emit('selection-change', selectedRow.value)
    }

    return {
      selectedRow,
      handleRowSelect,
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
        @row-select="handleRowSelect"
        @row-unselect="handleRowSelect"
        @row-select-all="handleRowSelect"
        @row-unselect-all="handleRowSelect"
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
        @page="(event) => $emit('page-change', event.page + 1)"
      />
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
