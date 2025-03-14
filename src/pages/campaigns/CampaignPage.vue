<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'

// import { useI18n } from 'vue-i18n'
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
    // const { t } = useI18n()
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
        label: $t('actions.create'),
        onClick: () => {
          push('/campaigns/create')
        },

        type: ActionTypes.CREATE,
      },
      {
        label: $t('actions.delete'),
        onClick: () => {},

        type: ActionTypes.DELETE,
      },
      {
        label: $t('actions.edit'),
        onClick: () => {},

        type: ActionTypes.EDIT,
      },
      {
        label: $t('actions.export'),
        onClick: () => {},

        type: ActionTypes.EXPORT,
      },
      {
        label: $t('actions.import'),
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
