<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

import CredentialIcon from '@/assets/svg/credential.svg?component'
import DataOriginIcon from '@/assets/svg/data_origin.svg?component'
import DateIcon from '@/assets/svg/date.svg?component'
import EmailIcon from '@/assets/svg/email.svg?component'
import PhoneIcon from '@/assets/svg/phone.svg?component'
import StatusIcon from '@/assets/svg/status.svg?component'
import AppTable from '@/components/atoms/tables/AppTable.vue'
import AppTag from '@/components/atoms/tag/AppTag.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { ActionTypes } from '@/components/molecules/header/enums/action-types.enum'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'
import allCountriesData from '@/components/molecules/phone-input/all-countries'
import type { IContact } from '@/services/contact/interfaces/contact.interface'
import { useContactService } from '@/services/contact/useContactService'
import type { IPaginationMeta } from '@/services/interfaces/pagination-response.interface'

import BulkSmsModal from './components/BulkSmsModal.vue'
import CardFilterContacts from './components/CardFilterContacts.vue'
import ContactViewModal from './components/ContactViewModal.vue'
import { useContactFilter } from './composables/useContactFilter'

const { t } = useI18n()
const { push } = useRouter()
const { getContacts, deleteContact, exportContacts } = useContactService()
const { search, name, countryCode, status, origin } = useContactFilter()

const page = ref(1)
const limit = ref(10)
const contacts = ref<IContact[]>([])
const loading = ref(false)
const contactsMeta = ref<IPaginationMeta>({
  currentPage: 1,
  hasNextPage: false,
  hasPreviousPage: false,
  limit: 10,
  totalPages: 0,
  totalRecords: 0,
})
const selectedContact = ref<IContact | null>(null)
const selectedContacts = ref<IContact[]>([])
const showBulkSmsModal = ref(false)
const showContactViewModal = ref(false)
const contactToView = ref<IContact | null>(null)
const toast = useToast()
let debounceTimer: ReturnType<typeof setTimeout> | null = null

// Función para obtener información del país por código de país (dialCode)
const getCountryInfo = (dialCode: string) => {
  return allCountriesData.find(country => country.dialCode === dialCode)
}

// Función para convertir string a lowercase para las clases CSS de banderas
const toLowerCase = (str: string) => str.toLowerCase()

const fetchContacts = async ({ pageSize = 1, limitSize = 10 } = {}) => {
  page.value = pageSize
  limit.value = limitSize
  loading.value = true

  try {
    const filters: Record<string, unknown> = {
      page: page.value,
      limit: limit.value,
    }

    // Solo agregar filtros que no estén vacíos
    if (search.value?.trim()) {
      filters.search = search.value.trim()
    }
    if (name.value?.trim()) {
      filters.name = name.value.trim()
    }
    if (countryCode.value?.trim()) {
      filters.countryCode = countryCode.value.trim()
    }
    if (status.value?.trim()) {
      filters.status = status.value
    }
    if (origin.value?.trim()) {
      filters.origin = origin.value
    }

    const response = await getContacts(filters)
    if (response && response.data && response.meta) {
      contacts.value = response.data
      contactsMeta.value = response.meta
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: t('general.error'),
      detail: t('contact.error_getting_contacts'),
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchContacts({ pageSize: 1, limitSize: 10 })
})

watch([search, name, countryCode, status, origin], () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(() => {
    fetchContacts({ pageSize: 1, limitSize: 10 })
  }, 300)
}, { deep: true })

const handleSelectionChange = (selectedRow: IContact | IContact[]) => {
  if (Array.isArray(selectedRow)) {
    selectedContacts.value = selectedRow
    selectedContact.value = selectedRow.length === 1 ? selectedRow[0] : null
  } else {
    selectedContact.value = selectedRow
    selectedContacts.value = selectedRow ? [selectedRow] : []
  }
}

const handleDelete = async () => {
  if (!selectedContact.value) return

  try {
    await deleteContact(selectedContact.value.id)
    selectedContact.value = null
    selectedContacts.value = []
    toast.add({
      severity: 'success',
      summary: t('general.success'),
      detail: t('contact.success_removed'),
      life: 3000,
    })
    await fetchContacts({ pageSize: page.value, limitSize: limit.value })
  } catch {
    toast.add({
      severity: 'error',
      summary: t('general.error'),
      detail: t('contact.error_removed'),
      life: 3000,
    })
  }
}

const handleRowDoubleClick = (contact: IContact) => {
  if (contact?.id) {
    push(`/contacts/edit/${contact.id}`)
  }
}

const handleRowView = (contact: IContact) => {
  contactToView.value = contact
  showContactViewModal.value = true
}

const handleEditContact = (contact: IContact) => {
  if (contact?.id) {
    push(`/contacts/edit/${contact.id}`)
  }
}

const openBulkSmsModal = () => {
  if (selectedContacts.value.length === 0) {
    toast.add({
      severity: 'warn',
      summary: t('general.warning'),
      detail: t('bulk_sms.no_contacts_selected'),
      life: 3000,
    })
    return
  }
  showBulkSmsModal.value = true
}

const handleBulkSmsSuccess = () => {
  selectedContacts.value = []
  selectedContact.value = null
  // Opcional: recargar contactos para actualizar cualquier estado
  // fetchContacts({ pageSize: page.value, limitSize: limit.value })
}

const headerActions = computed(() => [
  {
    label: t('actions.create'),
    onClick: () => push('/contacts/create'),
    type: ActionTypes.CREATE,
  },
  ...(selectedContacts.value.length > 0
    ? [
        {
          label: t('bulk_sms.send_bulk_sms'),
          onClick: openBulkSmsModal,
          type: ActionTypes.BULK_SMS,
        },
      ]
    : []),
  ...(selectedContact.value
    ? [
        { label: t('actions.delete'), onClick: handleDelete, type: ActionTypes.DELETE },
        {
          label: t('actions.view'),
          onClick: () => handleRowView(selectedContact.value!),
          type: ActionTypes.VIEW,
        },
      ]
    : []),
  ...(selectedContact.value
    ? [
        {
          label: t('actions.edit'),
          onClick: () => {
            if (selectedContact.value?.id) {
              push(`/contacts/edit/${selectedContact.value?.id}`)
            }
          },
          type: ActionTypes.EDIT,
        },
      ]
    : []),
  {
    label: t('actions.export'),
    onClick: () => {
      try {
        exportContacts()
        toast.add({
          severity: 'success',
          detail: t('contact.success_exported'),
          life: 3000,
        })
      } catch {
        toast.add({
          severity: 'error',
          summary: t('general.error'),
          detail: t('contact.error_exported'),
          life: 3000,
        })
      }
    },
    type: ActionTypes.EXPORT,
  },
  {
    label: t('actions.import'),
    onClick: () => push('/contacts/import'),
    type: ActionTypes.IMPORT,
  },
])
</script>

<template>
  <AppHeader :icon="IconTypes.CONTACTS" :actions="headerActions" />
  <CardFilterContacts
    v-model:search="search"
    v-model:name="name"
    v-model:countryCode="countryCode"
    v-model:status="status"
    v-model:origin="origin"
  />
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
    :multipleSelection="true"
    :loading="loading"
    textTotalItems="contact.contacts"
    @selection-change="handleSelectionChange"
    @page-change="fetchContacts"
    @row-double-click="handleRowDoubleClick"
    @row-view="handleRowView"
  >
    <template #header-name>
      <div class="flex items-center">
        <CredentialIcon class="w-5 h-5 mr-2 fill-current" />
        <span> {{ $t('general.name') }} </span>
      </div>
    </template>
    <template #header-phone>
      <div class="flex items-center">
        <PhoneIcon class="w-5 h-5 mr-2 fill-current" />
        <span> {{ $t('general.phone') }} </span>
      </div>
    </template>
    <template #header-email>
      <div class="flex items-center">
        <EmailIcon class="w-5 h-5 mr-2 fill-current" />
        <span> {{ $t('general.email') }} </span>
      </div>
    </template>
    <template #header-createdAt>
      <div class="flex items-center">
        <DateIcon class="w-5 h-5 mr-2 fill-current" />
        <span> {{ $t('general.date') }} </span>
      </div>
    </template>
    <template #header-origin>
      <div class="flex items-center">
        <DataOriginIcon class="w-5 h-5 mr-2 fill-current" />
        <span> {{ $t('general.origin') }} </span>
      </div>
    </template>
    <template #header-status>
      <div class="flex items-center">
        <StatusIcon class="w-5 h-5 mr-2 fill-current" />
        <span> {{ $t('general.status') }} </span>
      </div>
    </template>
    <template #custom-status="{ data }">
      <div class="flex justify-center">
        <AppTag :label="data.status === 'active' ? $t('general.active') : $t('general.inactive')" />
      </div>
    </template>
        <template #custom-phone="{ data }">
      <div class="flex justify-center items-center gap-2">
        <template v-if="data.phone && data.countryCode">
          <span
            v-if="getCountryInfo(data.countryCode)"
            :class="[
              'country-flag',
              toLowerCase(getCountryInfo(data.countryCode)?.iso2 || ''),
              'inline-block'
            ]"
          ></span>
          <span>+{{ data.countryCode }} {{ data.phone }}</span>
        </template>
        <span v-else>-</span>
      </div>
    </template>
    <template #custom-phoneNumber="{ data }">
      <div class="flex justify-center">
        {{ data.phoneNumber || '-' }}
      </div>
    </template>
    <template #custom-email="{ data }">
      <div class="flex justify-center">
        {{ data.email || '-' }}
      </div>
    </template>
  </AppTable>

  <!-- Modales -->
  <BulkSmsModal
    v-model:visible="showBulkSmsModal"
    :selectedContacts="selectedContacts"
    @message-sent="handleBulkSmsSuccess"
  />

  <ContactViewModal
    v-model:visible="showContactViewModal"
    :contact="contactToView"
    @edit-contact="handleEditContact"
  />
</template>
