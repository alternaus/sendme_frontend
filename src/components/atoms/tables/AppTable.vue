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
    ContextMenu
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
    const selectedRow = ref<Record<string, unknown> | Record<string, unknown>[] | null>([])
    const isMdScreen = ref(window.innerWidth < 1024)
    const contextMenuRef = ref();

    const menuModel = ref([
      { label: 'Custom', icon: 'pi pi-fw pi-search', command: () => console.log('custom'), class: 'text-xs' },
    ]);



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
      contextMenuRef.value.show(event.originalEvent);
    };

    return {
      selectedRow,
      handleRowSelect,
      isMdScreen,
      menuModel,
      contextMenuRef,
      onRowContextMenu
    }
  },
})
</script>

<template>
  <Card class="w-full">
    <template #content>
      <div class="max-h-[calc(100vh-300px)] overflow-auto">
        <ContextMenu ref="contextMenuRef" :model="menuModel" @hide="selectedRow = null" />
        <DataTable v-if="!isMdScreen" v-model:selection="selectedRow" :value="data" size="small"
          v-model:contextMenuSelection="selectedRow" @rowContextmenu="onRowContextMenu"
          :selectionMode="multipleSelection ? 'multiple' : 'single'" removableSort tableStyle="min-width: 50rem"
          @row-select="handleRowSelect" @row-unselect="handleRowSelect" @row-select-all="handleRowSelect" context-menu
          @row-unselect-all="handleRowSelect">
          <Column selectionMode="multiple" headerStyle="width: 3rem" v-if="multipleSelection"></Column>
          <Column class="!border-0 " v-for="col in headers" :key="col.field" :field="col.field" :sortable="true">
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

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div v-for="(item, index) in data" :key="index"
            class="bg-white dark:bg-neutral-800 shadow-lg rounded-lg p-4 flex flex-col">
            <div v-for="col in headers" :key="col.field" class="flex items-center gap-2">
              <strong class="text-gray-600 dark:text-gray-300 flex items-center gap-1">
                <slot :name="`header-${col.field}`">
                  {{ col.header }}
                </slot>
                :
              </strong>
              <small>{{ item[col.field] }}</small>
            </div>
          </div>
        </div>
      </div>

      <Paginator v-show="totalItems > 0" :rows="pageSize" :totalRecords="totalItems"
        @page="(event) => $emit('page-change', event.page + 1)" />
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
