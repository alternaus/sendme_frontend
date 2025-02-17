<template>
  <AppHeader :icon="IconTypes.CONTACTS" :text="fullName" :actions="headerActions" />

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
        <StatusIcon class="w-4 h-4" /> {{ contact.status }}
      </span>
    </div>
  </div>

  <AppCard class="w-full mt-8">
    <template #content>
      <div class="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6">
        <div class="flex flex-col items-center gap-2">
          <InformationIcon class="w-8 h-8 fill-current" />
          <span class="text-lg font-semibold">Información personalizada</span>
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
import { computed, defineComponent, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useToast } from 'primevue'

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
    const route = useRoute()
    const router = useRouter()
    const contactId = String(route.params?.id || '')

    const { getContact, deleteContact } = useContactService()
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

    const headerActions = [
      {
        label: 'Editar',
        type: ActionTypes.EDIT,
        onClick: () => router.push(`/contacts/edit/${contactId}`),
      },
      {
        label: 'Eliminar',
        type: ActionTypes.DELETE,
        onClick: async () => {
          try {
            await deleteContact(Number(contactId))
            toast.add({
              severity: 'success',
              summary: 'Contacto eliminado',
              detail: 'El contacto ha sido eliminado correctamente',
              life: 3000,
            })
            router.push('/contacts')
          } catch {
            toast.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar el contacto',
              life: 3000,
            })
          }
        },
      },
      {
        label: 'Exportar',
        type: ActionTypes.EXPORT,
        onClick: () => console.log('Exportar contacto'),
      },
    ]

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
