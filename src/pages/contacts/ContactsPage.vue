<script lang="ts">
import AppTable from '@/components/atoms/tables/AppTable.vue'
import AppHeader from '@/components/molecules/app-header/AppHeader.vue'
import { ActionTypes } from '@/components/molecules/app-header/enums/action-types.enum'
import { IconTypes } from '@/components/molecules/app-header/enums/icon-types.enum'

import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'

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
    :icon="IconTypes.CONTACTS"
    :actions="[
      {
        label: 'someLabel',
        onClick: () => {
          push('/contacts/create')
        },
        needsId: false,
        type: ActionTypes.CREATE,
      },
      {
        label: 'someLabel',
        onClick: () => {},
        needsId: false,
        type: ActionTypes.DELETE,
      },
      {
        label: 'someLabel',
        onClick: () => {},
        needsId: false,
        type: ActionTypes.EDIT,
      },
      {
        label: 'someLabel',
        onClick: () => {},
        needsId: false,
        type: ActionTypes.EXPORT,
      },
      {
        label: 'someLabel',
        onClick: () => {},
        needsId: false,
        type: ActionTypes.IMPORT,
      },
    ]"
  />
  <AppTable
    class="w-full mt-8"
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
