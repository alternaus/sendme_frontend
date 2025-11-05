<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { watchDebounced } from '@vueuse/core'

import Dialog from 'primevue/dialog'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

import CredentialIcon from '@/assets/svg/credential.svg?component'
import DataOriginIcon from '@/assets/svg/data_origin.svg?component'
import DateIcon from '@/assets/svg/date.svg?component'
import EmailIcon from '@/assets/svg/email.svg?component'
import TagIcon from '@/assets/svg/lucide/tag.svg?component'
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
import TagManager from '@/components/molecules/TagManager.vue'
import { useActiveFiltersCount } from '@/composables/useActiveFiltersCount'
import { useEnumValues } from '@/composables/useEnumValues'
import { useStatusColors } from '@/composables/useStatusColors'
import { useTableTypes } from '@/composables/useTableTypes'
import { ContactOrigin } from '@/services/contact/enums/contact-origin.enum'
import type { IContact } from '@/services/contact/interfaces/contact.interface'
import { useContactService } from '@/services/contact/useContactService'
import type { IPaginationMeta } from '@/services/interfaces/pagination-response.interface'

import BulkSmsModal from './components/BulkSmsModal.vue'
import ContactViewModal from './components/ContactViewModal.vue'
import { useContactFilter } from './composables/useContactFilter'

const { t } = useI18n()
const { push } = useRouter()
const toast = useToast()
const confirm = useConfirm()

const { listContacts, deleteContact, exportContacts } = useContactService()
const { getTableValueWithDefault, hasTableValue } = useTableTypes()
const { getStatusSeverity } = useStatusColors()

const { search, name, countryCode, status, origin, tagIds } = useContactFilter()
const { activeFiltersCount } = useActiveFiltersCount({ search, name, countryCode, status, origin, tagIds })

const showMobileModal = ref(false)
const showBulkSmsModal = ref(false)
const showContactViewModal = ref(false)
const showTagsModal = ref(false)
const selectedContactTags = ref<Array<{id: string, name: string, color?: string}>>([])

const handleShowAllTags = (tags: Array<{id: string, name: string, color?: string}>) => {
  selectedContactTags.value = tags
  showTagsModal.value = true
}

const loading = ref(false)
const contacts = ref<IContact[]>([])
const contactsMeta = ref<IPaginationMeta>({
  currentPage: 1, hasNextPage: false, hasPreviousPage: false,
  limit: 10, totalPages: 0, totalRecords: 0,
})

const selectedContact = ref<IContact | null>(null)
const selectedContacts = ref<IContact[]>([])
const contactToView = ref<IContact | null>(null)

const page = ref(1)
const limit = ref(10)

const countryByDial = new Map(allCountriesData.map(c => [c.dialCode, c]))
const getCountryInfo = (dialCode: string) => countryByDial.get(dialCode)
const toLowerCase = (s: string) => s.toLowerCase()

const ensureColorWithHash = (color?: string): string => {
  const sanitized = (color ?? '').trim().replace(/^#+/, '')
  if (!sanitized) {
    return '#6B7280' // Fallback color
  }
  return `#${sanitized}`
}

const { enumOptions: originOptions } = useEnumValues(ContactOrigin)

const buildQuery = (): Record<string, unknown> => {
  const q: Record<string, unknown> = { page: page.value, limit: limit.value }
  const add = (k: string, v?: string) => { if (v?.trim()) q[k] = v.trim() }
  add('search', search.value)
  add('name', name.value)
  add('countryCode', countryCode.value)
  add('status', status.value)
  add('origin', origin.value)
  if (tagIds.value && tagIds.value.length > 0) {
    q['tagIds'] = tagIds.value
  }
  return q
}

const fetchContacts = async ({ pageSize = 1, limitSize = 10 } = {}) => {
  page.value = pageSize
  limit.value = limitSize
  loading.value = true
  try {
    const { data, meta } = await listContacts(buildQuery())
    contacts.value = data ?? []
    contactsMeta.value = meta ?? contactsMeta.value
  } catch {
    toast.add({ severity: 'error', summary: t('contact.general.error'), detail: t('contact.error_getting_contacts') })
  } finally {
    loading.value = false
  }
}

watchDebounced([search, name, countryCode, status, origin, tagIds], () => {
  fetchContacts({ pageSize: 1, limitSize: limit.value })
}, { debounce: 300, maxWait: 1000, deep: true })

onMounted(() => fetchContacts({ pageSize: 1, limitSize: 10 }))

const handleSelectionChange = (sel: Record<string, unknown> | Record<string, unknown>[] | null) => {
  if (!sel) {
    selectedContacts.value = []
    selectedContact.value = null
    return
  }
  const contacts = Array.isArray(sel) ? (sel as unknown as IContact[]) : [(sel as unknown as IContact)]
  selectedContacts.value = contacts
  selectedContact.value = selectedContacts.value.length === 1 ? selectedContacts.value[0] : null
}

const handleDelete = async () => {
  if (selectedContacts.value.length === 0) return

  const isMultiple = selectedContacts.value.length > 1
  const contactName = isMultiple ? '' : selectedContacts.value[0].name || selectedContacts.value[0].phone || ''

  confirm.require({
    message: isMultiple
      ? t('contact.delete_confirmation.message_multiple', { count: selectedContacts.value.length })
      : t('contact.delete_confirmation.message_single', { name: contactName }),
    header: t('contact.delete_confirmation.title'),
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',
    rejectLabel: t('contact.general.cancel'),
    acceptLabel: t('contact.actions.delete'),
    accept: async () => {
      try {
        await Promise.all(selectedContacts.value.map(c => deleteContact(c.id)))
        toast.add({
          severity: 'success',
          summary: t('contact.general.success'),
          detail: selectedContacts.value.length === 1
            ? t('contact.success_removed')
            : t('contact.success_removed_multiple', { count: selectedContacts.value.length }),
          life: 3000,
        })
        selectedContacts.value = []
        selectedContact.value = null
        await fetchContacts({ pageSize: page.value, limitSize: limit.value })
      } catch {
        toast.add({ severity: 'error', summary: t('contact.general.error'), detail: t('contact.error_removed'), life: 3000 })
      }
    }
  })
}

const handleRowDoubleClick = (row: Record<string, unknown>) => {
  const contact = row as unknown as IContact
  if (contact?.id) push(`/contacts/edit/${contact.id}`)
}

const handleRowView = (row: Record<string, unknown>) => {
  contactToView.value = row as unknown as IContact
  showContactViewModal.value = true
}

const handleEditContact = (contact: IContact) => {
  if (contact?.id) push(`/contacts/edit/${contact.id}`)
}

const openBulkSmsModal = async () => {
  if (selectedContacts.value.length === 0) {
    toast.add({ severity: 'warn', summary: t('contact.general.warning'), detail: t('contact.bulk_sms.no_contacts_selected'), life: 3000 })
    return
  }
  showBulkSmsModal.value = true
}

const handleBulkSmsSuccess = () => {
  selectedContacts.value = []
  selectedContact.value = null
}

const headerActions = computed(() => {
  const actions = [
    { label: t('contact.general.filters'), onClick: () => { showMobileModal.value = !showMobileModal.value }, type: ActionTypes.FILTER, badge: activeFiltersCount.value },
    { label: t('contact.actions.create'), onClick: () => push('/contacts/create'), type: ActionTypes.CREATE },
    { label: t('contact.actions.export'), onClick: () => exportContacts({
        search: search.value, name: name.value, countryCode: countryCode.value, status: status.value, origin: origin.value, tagIds: tagIds.value,
      }), type: ActionTypes.EXPORT },
    { label: t('contact.actions.import'), onClick: () => push('/contacts/import'), type: ActionTypes.IMPORT },
  ]
  if (selectedContacts.value.length > 0) {
    actions.push({ label: t('contact.actions.bulk_sms'), onClick: openBulkSmsModal, type: ActionTypes.SEND })
    actions.push({ label: t('contact.actions.delete'), onClick: handleDelete, type: ActionTypes.DELETE })
  }
  if (selectedContacts.value.length === 1) {
    actions.push({
      label: t('contact.actions.view'),
      onClick: async () => {
        if (selectedContact.value) {
          contactToView.value = selectedContact.value
          showContactViewModal.value = true
        }
        return Promise.resolve()
      },
      type: ActionTypes.VIEW
    })
    actions.push({
      label: t('contact.actions.edit'),
      onClick: async () => {
        if (selectedContact.value) {
          await push(`/contacts/edit/${selectedContact.value.id}`)
        }
      },
      type: ActionTypes.EDIT
    })
  }
  return actions
})
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
      :label="$t('contact.general.search')"
    >
      <template #icon>
        <SearchIcon class="w-4 h-4 dark:fill-white" />
      </template>
    </AppInput>

    <AppInput
      v-model="name"
      type="text"
      class="w-full"
      :label="$t('contact.general.name')"
    >
      <template #icon>
        <CredentialIcon class="w-4 h-4 dark:fill-white" />
      </template>
    </AppInput>

    <AppSelect
      class="w-full"
      v-model="countryCode"
      :options="[
        { value: '1', name: 'US/CA' },
        { value: '52', name: 'MX' },
        { value: '34', name: 'ES' },
        { value: '33', name: 'FR' },
        { value: '44', name: 'UK' },
        { value: '49', name: 'DE' },
        { value: '39', name: 'IT' },
        { value: '55', name: 'BR' },
        { value: '54', name: 'AR' },
        { value: '57', name: 'CO' },
      ]"
      :label="$t('contact.general.country_code')"
    >
      <template #icon>
        <PhoneIcon class="w-6 h-4 dark:fill-white" />
      </template>
    </AppSelect>

    <AppStatusSelect
      class="w-full"
      v-model="status"
      status-type="contact"
      :label="$t('contact.general.status')"
      :show-colors="true"
    >
      <template #icon>
        <StatusIcon class="w-6 h-4 dark:fill-white" />
      </template>
    </AppStatusSelect>

    <AppSelect
      class="w-full"
      v-model="origin"
      :options="originOptions"
      :label="$t('contact.general.origin')"
    >
      <template #icon>
        <DataOriginIcon class="w-6 h-4 dark:fill-white" />
      </template>
    </AppSelect>

    <TagManager
      v-model="tagIds"
      :label="$t('contact.general.tags')"
      :placeholder="$t('contact.general.select_tags')"
      :allow-create="false"
      :allow-manage="false"
      class="w-full"
    />
  </AppFilterPanel>
  <AppTable
    class="w-full mt-4"
    :data="contacts"
    :headers="[
      { field: 'name', header: 'Name' },
      { field: 'phone', header: 'Phone' },
      { field: 'email', header: 'Email' },
      { field: 'tags', header: 'Tags' },
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
    :mobile-config="{
      avatar: { field: 'name' },
      title: { field: 'name' },
      subtitle: { field: 'phone' },
      metadata: [
        { field: 'email', position: 'left' },
        { field: 'origin', position: 'right' }
      ],
      status: { field: 'status' },
      showAvatar: true
    }"
    @selection-change="handleSelectionChange"
    @page-change="fetchContacts"
    @row-double-click="handleRowDoubleClick"
    @row-view="handleRowView"
  >
    <template #header-name>
      <div class="flex items-center">
        <CredentialIcon class="w-5 h-5 mr-2 fill-current" />
        <span> {{ $t('contact.general.name') }} </span>
      </div>
    </template>
    <template #header-phone>
      <div class="flex items-center">
        <PhoneIcon class="w-5 h-5 mr-2 fill-current" />
        <span> {{ $t('contact.general.phone') }} </span>
      </div>
    </template>
    <template #header-email>
      <div class="flex items-center">
        <EmailIcon class="w-5 h-5 mr-2 fill-current" />
        <span> {{ $t('contact.general.email') }} </span>
      </div>
    </template>
    <template #header-tags>
      <div class="flex items-center">
        <TagIcon class="w-5 h-5 mr-2" />
        <span> {{ $t('contact.general.tags') }} </span>
      </div>
    </template>
    <template #header-createdAt>
      <div class="flex items-center">
        <DateIcon class="w-5 h-5 mr-2 fill-current" />
        <span> {{ $t('contact.general.date') }} </span>
      </div>
    </template>
    <template #header-origin>
      <div class="flex items-center">
        <DataOriginIcon class="w-5 h-5 mr-2 fill-current" />
        <span> {{ $t('contact.general.origin') }} </span>
      </div>
    </template>
    <template #header-status>
      <div class="flex items-center">
        <StatusIcon class="w-5 h-5 mr-2 fill-current" />
        <span> {{ $t('contact.general.status') }} </span>
      </div>
    </template>
    <template #custom-status="{ data }">
      <div class="flex justify-center">
        <AppTag
          :label="$t(`contact.status.${getTableValueWithDefault<string>(data, 'status', 'INACTIVE')}`)"
          :severity="getStatusSeverity(getTableValueWithDefault<string>(data, 'status', 'INACTIVE'), 'contact')"
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
    <template #custom-tags="{ data }">
      <div class="flex justify-center">
        <template v-if="data.tags && data.tags.length > 0">
          <!-- Si hay solo un tag, mostrarlo -->
          <AppTag
            v-if="data.tags.length === 1"
            :label="data.tags[0].name"
            :style="{ backgroundColor: ensureColorWithHash(data.tags[0].color), color: 'white' }"
            size="small"
            class="text-xs"
          />
          <!-- Si hay múltiples tags, mostrar contador clickeable -->
          <AppTag
            v-else
            :label="`${data.tags.length} tags`"
            severity="info"
            size="small"
            class="text-xs cursor-pointer hover:bg-blue-600"
            @click="handleShowAllTags(data.tags)"
          />
        </template>
        <span v-else class="text-sm text-gray-400">-</span>
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

  <!-- Tags Modal -->
  <Dialog
    v-model:visible="showTagsModal"
    :header="$t('contact.general.tags')"
    modal
    :style="{ width: '400px' }"
    :draggable="false"
  >
    <div class="space-y-3">
      <div class="flex flex-wrap gap-2">
        <AppTag
          v-for="tag in selectedContactTags"
          :key="tag.id"
          :label="tag.name"
          :style="{ backgroundColor: ensureColorWithHash(tag.color), color: 'white' }"
          size="small"
        />
      </div>
    </div>
  </Dialog>
</template>
