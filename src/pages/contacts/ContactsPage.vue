<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useToast } from 'primevue/usetoast'

import CredentialIcon from '@/assets/svg/credential.svg?component'
import DataOriginIcon from '@/assets/svg/data_origin.svg?component'
import DateIcon from '@/assets/svg/date.svg?component'
import EmailIcon from '@/assets/svg/email.svg?component'
import PhoneIcon from '@/assets/svg/phone.svg?component'
import StatusIcon from '@/assets/svg/status.svg?component'
import AppTable from '@/components/atoms/tables/AppTable.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { ActionTypes } from '@/components/molecules/header/enums/action-types.enum'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'
import type { IContact } from '@/services/contact/interfaces/contact.interface'
import { useContactService } from '@/services/contact/useContactService'
import type { IPaginationMeta } from '@/services/interfaces/pagination-response.interface'

export default defineComponent({
  components: {
    AppHeader,
    AppTable,
    CredentialIcon,
    PhoneIcon,
    EmailIcon,
    DataOriginIcon,
    DateIcon,
    StatusIcon,
  },
  setup() {
    const { push } = useRouter()
    const { getContacts, deleteContact, exportContacts } = useContactService()
    const page = ref(1)
    const limit = ref(10)
    const contacts = ref<IContact[]>([])
    const contactsMeta = ref<IPaginationMeta>({
      currentPage: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      limit: 10,
      totalPages: 0,
      totalRecords: 0,
    })
    const selectedContact = ref<IContact | null>(null)
    const toast = useToast()

    const fetchContacts = async (newPage = 1) => {
      page.value = newPage
      try {
        const response = await getContacts({ page: page.value, limit: limit.value })
        contacts.value = response.data
        contactsMeta.value = response.meta
      } catch (error) {
        console.error('❌ Error al obtener los contactos:', error)
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los contactos',
          life: 3000,
        })
      }
    }

    onMounted(() => fetchContacts())

    const handleSelectionChange = (selectedRow: IContact) => {
      selectedContact.value = selectedRow
    }

    const handleDelete = async () => {
      if (!selectedContact.value) return

      try {
        await deleteContact(selectedContact.value.id)
        selectedContact.value = null
        toast.add({
          severity: 'success',
          summary: 'Eliminado',
          detail: 'Contacto eliminado correctamente',
          life: 3000,
        })
        await fetchContacts(page.value)
      } catch (error) {
        console.error('❌ Error al eliminar contacto:', error)
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo eliminar el contacto',
          life: 3000,
        })
      }
    }
    const headerActions = computed(() => [
      { label: 'Create', onClick: () => push('/contacts/create'), type: ActionTypes.CREATE },
      ...(selectedContact.value
        ? [
            { label: 'Delete', onClick: handleDelete, type: ActionTypes.DELETE },
            {
              label: 'View',
              onClick: () => push('/contacts/view/' + selectedContact.value?.id),
              type: ActionTypes.VIEW,
            },
          ]
        : []),
      ...(selectedContact.value
        ? [
            {
              label: 'Update',
              onClick: () => push(`/contacts/edit/${selectedContact.value?.id}`),
              type: ActionTypes.EDIT,
            },
          ]
        : []),
      {
        label: 'Export',
        onClick: () => {
          try {
            exportContacts()
            toast.add({
              severity: 'success',
              summary: 'Exportado',
              detail: 'Contactos exportados correctamente',
              life: 3000,
            })
          } catch (error) {
            console.error('❌ Error al exportar contactos:', error)
            toast.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudieron exportar los contactos',
              life: 3000,
            })
          }
        },
        type: ActionTypes.EXPORT,
      },
      {
        label: 'Import',
        onClick: () => push('/contacts/import'),
        type: ActionTypes.IMPORT,
      },
    ])

    return {
      push,
      contacts,
      selectedContact,
      handleSelectionChange,
      handleDelete,
      fetchContacts,
      ActionTypes,
      IconTypes,
      contactsMeta,
      headerActions,
    }
  },
})
</script>

<template>
  <AppHeader :icon="IconTypes.CONTACTS" show-search :actions="headerActions" />

  <AppTable
    class="w-full mt-4"
    :data="contacts"
    :headers="[
      { field: 'name', header: 'Name' },
      { field: 'phone', header: 'Phone' },
      { field: 'email', header: 'Email' },
      { field: 'createdAt', header: 'Created At' },
      { field: 'origin', header: 'Origin' },
      { field: 'status', header: 'Status' },
    ]"
    :pageSize="contactsMeta.limit"
    :pageCurrent="contactsMeta.currentPage"
    :totalItems="contactsMeta.totalRecords"
    :multipleSelection="false"
    @selection-change="handleSelectionChange"
    @page-change="fetchContacts"
  >
    <template #header-name>
      <div class="flex items-center">
        <CredentialIcon class="w-5 h-5 mr-2 fill-current" />
        <span>Nombre</span>
      </div>
    </template>
    <template #header-phone>
      <div class="flex items-center">
        <PhoneIcon class="w-5 h-5 mr-2 fill-current" />
        <span>Telefono</span>
      </div>
    </template>
    <template #header-email>
      <div class="flex items-center">
        <EmailIcon class="w-5 h-5 mr-2 fill-current" />
        <span>Email</span>
      </div>
    </template>
    <template #header-createdAt>
      <div class="flex items-center">
        <DateIcon class="w-5 h-5 mr-2 fill-current" />
        <span>Fecha</span>
      </div>
    </template>
    <template #header-origin>
      <div class="flex items-center">
        <DataOriginIcon class="w-5 h-5 mr-2 fill-current" />
        <span>Origen</span>
      </div>
    </template>
    <template #header-status>
      <div class="flex items-center">
        <StatusIcon class="w-5 h-5 mr-2 fill-current" />
        <span>Estado</span>
      </div>
    </template>
  </AppTable>
</template>
