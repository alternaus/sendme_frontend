<template>
  <AppHeader
    :text="$t('contact.contact_information') + ': ' + fullName"
    :icon="IconTypes.CONTACTS"
    :actions="headerActions"
  />

  <div v-if="contact" class="w-full md:w-auto mx-auto my-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
      <span
        class="flex items-center gap-2 bg-[var(--p-primary-color)] px-3 py-1 rounded-lg text-sm text-black"
      >
        <PhoneIcon class="w-4 h-4" /> {{ contact.phone }}
      </span>
      <span
        class="flex items-center gap-2 bg-[var(--p-primary-color)] px-3 py-1 rounded-lg text-sm text-black"
      >
        <EmailIcon class="w-4 h-4" /> {{ contact.email }}
      </span>
      <span
        class="flex items-center gap-2 bg-[var(--p-primary-color)] px-3 py-1 rounded-lg text-sm text-black"
      >
        <DateIcon class="w-4 h-4" /> {{ contact.birthDate }}
      </span>
      <span
        class="flex items-center gap-2 bg-[var(--p-primary-color)] px-3 py-1 rounded-lg text-sm text-black"
      >
        <StatusIcon class="w-4 h-4" />
        {{ contact.status === 'ACTIVE' ? $t('contact.general.active') : $t('contact.general.inactive') }}
      </span>
    </div>
  </div>

  <AppCard class="w-full mt-4">
    <template #content>
      <div class="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6">
        <div class="flex flex-col items-center gap-2">
          <InformationIcon class="w-8 h-8 fill-current" />
          <span class="text-lg font-semibold">{{ $t('contact.general.personalized_information') }}</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="(customField, index) in formattedCustomFields"
            :key="index"
            class="flex flex-col gap-1"
          >
            <small class="font-semibold text-gray-600 dark:text-gray-300">{{
              customField.name
            }}</small>
            <div class="p-2 bg-white dark:bg-neutral-900 rounded-lg shadow-md text-sm">
              {{ customField.value }}
            </div>
          </div>
        </div>
      </div>
    </template>
  </AppCard>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useToast } from 'primevue'

import { useI18n } from 'vue-i18n'

import DateIcon from '@/assets/svg/date.svg?component'
import EmailIcon from '@/assets/svg/email.svg?component'
import PhoneIcon from '@/assets/svg/phone.svg?component'
import StatusIcon from '@/assets/svg/status.svg?component'
import InformationIcon from '@/assets/svg/table-actions/information.svg?component'
import AppCard from '@/components/atoms/cards/AppCard.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { ActionTypes } from '@/components/molecules/header/enums/action-types.enum'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'
import type { IContact } from '@/services/contact/interfaces/contact.interface'
import { useContactService } from '@/services/contact/useContactService'
import { useCustomFieldService } from '@/services/custom-field/useCustomFieldService'
import { useBreadcrumbStore } from '@/stores/breadcrumbStore'

export default defineComponent({
  name: 'ContactView',
  components: {
    AppHeader,
    AppCard,
    InformationIcon,
    PhoneIcon,
    EmailIcon,
    DateIcon,
    StatusIcon,
  },
  setup() {
    const { t } = useI18n()
    const route = useRoute()
    const breadcrumbStore = useBreadcrumbStore()
    const router = useRouter()
    const contactId = route.params?.id ? String(route.params.id) : ''

    const { getContact, deleteContact } = useContactService()
    const { getCustomFields } = useCustomFieldService()

    const contact = ref<IContact | null>(null)
    const customFields = ref<{ id:string; fieldName: string }[]>([])
    const toast = useToast()

    const breadcrumbData = computed(() => [
      { text: 'contact.contacts', to: { name: 'contacts.index' }, active: false },
      {
        text: contactId ? 'actions.view' : '',
        to: contactId
          ? { name: 'contacts.view', params: { id: contactId } }
          : { name: 'contacts.index' },
        active: true,
      },
    ])

    watchEffect(() => {
      breadcrumbStore.setBreadcrumbs(breadcrumbData.value)
    })

    onMounted(async () => {
      try {
        if (contactId) {
          contact.value = await getContact(contactId)
        }
        customFields.value = await getCustomFields()
      } catch {
        toast.add({
          severity: 'error',
          summary: t('contact.general.error'),
          detail: t('contact.custom_fields_not_loaded'),
          life: 3000,
        })
      }
    })

    const fullName = computed(() => {
      if (!contact.value) return ''
      return `${contact.value.name} ${contact.value.lastName}`
    })

    const formattedCustomFields = computed(() => {
      if (!contact.value || !customFields.value.length || !contact.value.customValues) return []

      return contact.value.customValues.map((customValue) => {
        const field = customFields.value.find((f) => f.id === customValue.customFieldId)
        return {
          name: field ? field.fieldName : t('contact.general.unknown_field'),
          value: customValue.value || t('contact.general.not_defined'),
        }
      })
    })

    const headerActions = computed(() => [
      {
        label: t('actions.edit'),
        type: ActionTypes.EDIT,
        onClick: () => router.push(`/contacts/edit/${contactId}`),
      },
      {
        label: t('actions.delete'),
        type: ActionTypes.DELETE,
        onClick: async () => {
          try {
            await deleteContact((contactId))
            toast.add({
              severity: 'success',
              summary: t('contact.contact_deleted'),
              detail: t('contact.success_removed'),
              life: 3000,
            })
            router.push('/contacts')
          } catch {
            toast.add({
              severity: 'error',
              summary: t('contact.general.error'),
              detail: t('contact.error_removed'),
              life: 3000,
            })
          }
        },
      },
      {
        label: t('actions.export'),
        type: ActionTypes.EXPORT,
        onClick: () => console.log('Exportar contacto'),
      },
    ])

    return {
      IconTypes,
      contact,
      formattedCustomFields,
      fullName,
      headerActions,
    }
  },
})
</script>

<style scoped></style>
