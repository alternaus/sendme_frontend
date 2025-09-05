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
import SearchIcon from '@/assets/svg/search.svg?component'
import StatusIcon from '@/assets/svg/status.svg?component'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import AppStatusSelect from '@/components/atoms/selects/AppStatusSelect.vue'
import AppTable from '@/components/atoms/tables/AppTable.vue'
import AppTag from '@/components/atoms/tag/AppTag.vue'
import AppFilterPanel from '@/components/molecules/filter-panel/AppFilterPanel.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { ActionTypes } from '@/components/molecules/header/enums/action-types.enum'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'
import allCountriesData from '@/components/molecules/phone-input/all-countries'
import { useActiveFiltersCount } from '@/composables/useActiveFiltersCount'
import { useStatusColors } from '@/composables/useStatusColors'
import { useTableTypes } from '@/composables/useTableTypes'
import type { IContact } from '@/services/contact/interfaces/contact.interface'
import { useContactService } from '@/services/contact/useContactService'
import type { IPaginationMeta } from '@/services/interfaces/pagination-response.interface'

import BulkSmsModal from './components/BulkSmsModal.vue'
import ContactViewModal from './components/ContactViewModal.vue'
import { useContactFilter } from './composables/useContactFilter'
import { ContactOriginTypes } from './enums/contact-origin.enum'

const { t } = useI18n()
const { push } = useRouter()
const { getContacts, deleteContact, exportContacts } = useContactService()
const { search, name, countryCode, status, origin } = useContactFilter()
const { getTableValueWithDefault, hasTableValue } = useTableTypes()
const { getStatusSeverity } = useStatusColors()
const { activeFiltersCount } = useActiveFiltersCount({ search, name, countryCode, status, origin })

const showMobileModal = ref(false)

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

const handleSelectionChange = (selection: Record<string, unknown> | Record<string, unknown>[] | null) => {
  if (selection === null || selection === undefined) {
    selectedContacts.value = []
    selectedContact.value = null
  } else if (Array.isArray(selection)) {
    selectedContacts.value = selection as unknown as IContact[]
    selectedContact.value = selection.length === 1 ? (selection[0] as unknown as IContact) : null
  } else {
    selectedContacts.value = [selection as unknown as IContact]
    selectedContact.value = selection as unknown as IContact
  }
}

const handleDelete = async () => {
  if (selectedContacts.value.length === 0) return

  try {
    if (selectedContacts.value.length === 1) {
      await deleteContact(selectedContacts.value[0].id)
      toast.add({
        severity: 'success',
        summary: t('general.success'),
        detail: t('contact.success_removed'),
        life: 3000,
      })
    } else {
      // Eliminar múltiples contactos
      await Promise.all(selectedContacts.value.map(contact => deleteContact(contact.id)))
      toast.add({
        severity: 'success',
        summary: t('general.success'),
        detail: t('contact.success_removed_multiple', { count: selectedContacts.value.length }),
        life: 3000,
      })
    }

    selectedContact.value = null
    selectedContacts.value = []
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

const handleRowDoubleClick = (row: Record<string, unknown>) => {
  const contact = row as unknown as IContact
  if (contact?.id) {
    push(`/contacts/edit/${contact.id}`)
  }
}

const handleRowView = (row: Record<string, unknown>) => {
  const contact = row as unknown as IContact
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
    label: t('general.filters'),
    onClick: () => { showMobileModal.value = !showMobileModal.value },
    type: ActionTypes.FILTER,
    badge: activeFiltersCount.value,
  },
  {
    label: t('actions.create'),
    onClick: () => push('/contacts/create'),
    type: ActionTypes.CREATE,
  },
  ...(selectedContacts.value.length > 0
    ? [
        {
          label: t('actions.bulk_sms'),
          onClick: openBulkSmsModal,
          type: ActionTypes.SEND,
        },
      ]
    : []),
  ...(selectedContacts.value.length > 0
    ? [
        {
          label: t('actions.delete'),
          onClick: handleDelete,
          type: ActionTypes.DELETE,
        },
      ]
    : []),
  ...(selectedContacts.value.length === 1
    ? [
        {
          label: t('actions.edit'),
          onClick: () => selectedContact.value && push(`/contacts/edit/${selectedContact.value.id}`),
          type: ActionTypes.EDIT,
        },
      ]
    : []),
  {
    label: t('actions.export'),
    onClick: () => {
      exportContacts({
        search: search.value,
        name: name.value,
        countryCode: countryCode.value,
        status: status.value,
        origin: origin.value,
      })
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
  <AppHeader
    :icon="IconTypes.CONTACTS"
    :actions="headerActions"
    :title="$t('contact.contacts')"
    :selectedItems="selectedContacts.length"
  />

  <AppFilterPanel
    v-model:showMobileModal="showMobileModal"
  >
    <AppInput
      v-model="search"
      type="text"
      class="w-full"
      :label="$t('general.search')"
    >
      <template #icon>
        <SearchIcon class="w-4 h-4 dark:fill-white" />
      </template>
    </AppInput>

    <AppInput
      v-model="name"
      type="text"
      class="w-full"
      :label="$t('general.name')"
    >
      <template #icon>
        <CredentialIcon class="w-4 h-4 dark:fill-white" />
      </template>
    </AppInput>

    <AppSelect
      class="w-full"
      v-model="countryCode"
      :options="[
        { value: '1', name: '+1 (US/CA)' },
        { value: '52', name: '+52 (MX)' },
        { value: '34', name: '+34 (ES)' },
        { value: '33', name: '+33 (FR)' },
        { value: '44', name: '+44 (UK)' },
        { value: '49', name: '+49 (DE)' },
        { value: '39', name: '+39 (IT)' },
        { value: '55', name: '+55 (BR)' },
        { value: '54', name: '+54 (AR)' },
        { value: '57', name: '+57 (CO)' },
      ]"
      :label="$t('general.country_code')"
    >
      <template #icon>
        <PhoneIcon class="w-6 h-4 dark:fill-white" />
      </template>
    </AppSelect>

    <AppStatusSelect
      class="w-full"
      v-model="status"
      status-type="contact"
      :label="$t('general.status')"
      :show-colors="true"
    >
      <template #icon>
        <StatusIcon class="w-6 h-4 dark:fill-white" />
      </template>
    </AppStatusSelect>

    <AppSelect
      class="w-full"
      v-model="origin"
      :options="
        Object.entries(ContactOriginTypes).map(([key, value]) => ({
          value: key,
          name: $t(value),
        }))
      "
      :label="$t('general.origin')"
    >
      <template #icon>
        <DataOriginIcon class="w-6 h-4 dark:fill-white" />
      </template>
    </AppSelect>
  </AppFilterPanel>
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
        <AppTag
          :label="$t(`status.contact.${getTableValueWithDefault<string>(data, 'status', 'inactive')}`)"
          :severity="getStatusSeverity(getTableValueWithDefault<string>(data, 'status', 'inactive'), 'contact')"
        />
      </div>
    </template>
        <template #custom-phone="{ data }">
      <div class="flex justify-center items-center gap-2">
        <template v-if="hasTableValue(data, 'phone') && hasTableValue(data, 'countryCode')">
          <span
            v-if="getCountryInfo(getTableValueWithDefault<string>(data, 'countryCode', ''))"
            :class="[
              'country-flag',
              toLowerCase(getCountryInfo(getTableValueWithDefault<string>(data, 'countryCode', ''))?.iso2 || ''),
              'inline-block'
            ]"
          ></span>
          <span>+{{ getTableValueWithDefault<string>(data, 'countryCode', '') }} {{ getTableValueWithDefault<string>(data, 'phone', '') }}</span>
        </template>
        <span v-else>-</span>
      </div>
    </template>
    <template #custom-phoneNumber="{ data }">
      <div class="flex justify-center">
        {{ getTableValueWithDefault<string>(data, 'phone', '-') }}
      </div>
    </template>
    <template #custom-email="{ data }">
      <div class="flex justify-center">
        {{ getTableValueWithDefault<string>(data, 'email', '-') }}
      </div>
    </template>
  </AppTable>

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
