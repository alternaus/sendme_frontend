<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'

import AppTable from '@/components/atoms/tables/AppTable.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { ActionTypes } from '@/components/molecules/header/enums/action-types.enum'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'

export default defineComponent({
  components: {
    AppHeader,
    AppTable,
  },
  setup() {
    const { push } = useRouter()
    return {
      push,
      ActionTypes,
      IconTypes,
    }
  },
})
</script>
<template>
  <AppHeader
    :icon="IconTypes.CAMPAIGNS"
    show-search
    :actions="[
      {
        label: 'Create',
        onClick: () => {
          push('/campaigns/create')
        },

        type: ActionTypes.CREATE,
      },
      {
        label: 'Delete',
        onClick: () => {},

        type: ActionTypes.DELETE,
      },
      {
        label: 'Edit',
        onClick: () => {},

        type: ActionTypes.EDIT,
      },
      {
        label: 'Export',
        onClick: () => {},

        type: ActionTypes.EXPORT,
      },
      {
        label: 'Import',
        onClick: () => {},

        type: ActionTypes.IMPORT,
      },
    ]"
  />
  <AppTable
    class="w-full mt-4"
    :data="[
      { name: 'John Doe', email: '', phone: '' },
      { name: 'John Doe', email: '', phone: '' },
    ]"
    :headers="[
      { field: 'name', header: 'Name' },
      { field: 'email', header: 'Email' },
      { field: 'phone', header: 'Phone' },
    ]"
    :pageSize="10"
    :pageCurrent="1"
    :totalItems="100"
  />
</template>
<style lang="scss"></style>
