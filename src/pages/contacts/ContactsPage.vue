<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppTable from '@/components/atoms/tables/AppTable.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { ActionTypes } from '@/components/molecules/header/enums/action-types.enum'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'
import type { IContact } from '@/services/contacts/interfaces/contact.interface'
import { useContactService } from '@/services/contacts/useContactService'

export default defineComponent({
  components: {
    AppHeader,
    AppTable,
  },
  setup() {
    const { push } = useRouter()
    const { getContacts } = useContactService()
    const contacts = ref<IContact[]>([])

    onMounted(async () => {
      try {
        contacts.value = await getContacts()
      } catch (error) {
        console.error('❌ Error al obtener los contactos:', error)
      }
    })
    return {
      push,
      contacts,
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
    :data="contacts"
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
