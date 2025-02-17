<template>
  <AppHeader :icon="IconTypes.CONTACTS" :text="fullName" :actions="[]" />

  <div v-if="contact" class="w-full md:w-auto mx-auto my-2">
    <div
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mx-auto"
    >
      <span
        class="flex items-center w-auto gap-1 bg-[var(--p-primary-color)] px-2 py-1 rounded-xl text-sm dark:text-neutral-900"
      >
        <PhoneIcon class="w-4 h-4" /> {{ contact.phone }}
      </span>

      <span
        class="flex items-center w-auto gap-1 bg-[var(--p-primary-color)] px-2 py-1 rounded-xl text-sm dark:text-neutral-900"
      >
        <EmailIcon class="w-4 h-4" /> {{ contact.email }}
      </span>

      <span
        class="flex items-center w-auto gap-1 bg-[var(--p-primary-color)] px-2 py-1 rounded-xl text-sm dark:text-neutral-900"
      >
        <DateIcon class="w-4 h-4" /> {{ contact.birthDate }}
      </span>

      <span
        class="flex items-center w-auto gap-1 bg-[var(--p-primary-color)] px-2 py-1 rounded-xl text-sm dark:text-neutral-900"
      >
        <StatusIcon class="w-4 h-4" /> {{ contact.status }}
      </span>
    </div>
  </div>

  <AppCard class="w-full mt-8">
    <template #content>
      <div class="grid grid-cols-[auto_1fr] gap-4">
        <div class="flex flex-col items-center gap-2">
          <InformationIcon class="w-8 h-8 fill-current" />
          <span>Información de contacto</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="(customField, index) in formattedCustomFields"
            :key="index"
            class="flex flex-col gap-2 p-2 rounded-lg"
          >
            <small class="font-semibold">{{ customField.name }}:</small>
            <small class="rounded-xl p-2 shadow bg-white dark:bg-neutral-900">{{
              customField.value
            }}</small>
          </div>
        </div>
      </div>
    </template>
  </AppCard>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { useToast } from 'primevue'

import DateIcon from '@/assets/svg/date.svg?component'
import EmailIcon from '@/assets/svg/email.svg?component'
import PhoneIcon from '@/assets/svg/phone.svg?component'
import StatusIcon from '@/assets/svg/status.svg?component'
import InformationIcon from '@/assets/svg/table-actions/information.svg?component'
import AppCard from '@/components/atoms/cards/AppCard.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'
import type { IContact } from '@/services/contact/interfaces/contact.interface'
import { useContactService } from '@/services/contact/useContactService'
import { useCustomFieldService } from '@/services/custom-field/useCustomFieldService'

export default defineComponent({
  name: 'ContactView',
  components: { AppHeader, AppCard, InformationIcon, PhoneIcon, EmailIcon, DateIcon, StatusIcon },
  setup() {
    const route = useRoute()
    const contactId = String(route.params?.id || '')
    const { getContact } = useContactService()
    const { getCustomFields } = useCustomFieldService()
    const contact = ref<IContact | null>(null)
    const customFields = ref<{ id: number; fieldName: string }[]>([])
    const toast = useToast()

    onMounted(async () => {
      try {
        if (contactId) {
          contact.value = await getContact(contactId)
        }
        customFields.value = await getCustomFields()
      } catch {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los campos personalizados',
          life: 3000,
        })
      }
    })

    const fullName = computed(() => {
      if (!contact.value) return ''
      return `${contact.value.name} ${contact.value.lastName}`
    })

    const formattedCustomFields = computed(() => {
      if (!contact.value || !customFields.value.length) return []

      return contact.value.customValues.map((customValue) => {
        const field = customFields.value.find((f) => f.id === customValue.customFieldId)
        return {
          name: field ? field.fieldName : 'Campo Desconocido',
          value: customValue.value || 'No definido',
        }
      })
    })

    return {
      IconTypes,
      contact,
      formattedCustomFields,
      fullName,
    }
  },
})
</script>
