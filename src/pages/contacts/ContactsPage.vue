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
import type { IContact } from '@/services/contact/interfaces/contact.interface'
import { useContactService } from '@/services/contact/useContactService'
import type { IPaginationMeta } from '@/services/interfaces/pagination-response.interface'

import CardFilterContacts from './components/CardFilterContacts.vue'
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
const toast = useToast()
let debounceTimer: ReturnType<typeof setTimeout> | null = null

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

const headerActions = computed(() => [
  {
    label: t('actions.create'),
    onClick: () => push('/contacts/create'),
    type: ActionTypes.CREATE,
  },
  ...(selectedContact.value
    ? [
        { label: t('actions.delete'), onClick: handleDelete, type: ActionTypes.DELETE },
        {
          label: t('actions.view'),
          onClick: () => {
            if (selectedContact.value?.id) {
              push(`/contacts/view/${selectedContact.value?.id}`)
            }
          },
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
    :multipleSelection="false"
    :loading="loading"
    textTotalItems="contact.contacts"
    @selection-change="handleSelectionChange"
    @page-change="fetchContacts"
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
</template>
