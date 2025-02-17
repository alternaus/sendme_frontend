<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useToast } from 'primevue/usetoast'

import BirthdayIcon from '@/assets/svg/birthday.svg?component'
import CredentialIcon from '@/assets/svg/credential.svg?component'
import EmailIcon from '@/assets/svg/email.svg?component'
import PhoneIcon from '@/assets/svg/phone.svg?component'
import StatusIcon from '@/assets/svg/status.svg?component'
import InformationIcon from '@/assets/svg/table-actions/information.svg?component'
import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppCard from '@/components/atoms/cards/AppCard.vue'
import AppDatePicker from '@/components/atoms/datepickers/AppDatePicker.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { ActionTypes } from '@/components/molecules/header/enums/action-types.enum'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'
import { useContactService } from '@/services/contact/useContactService'
import { useCustomFieldService } from '@/services/custom-field/useCustomFieldService'

import { useFormContact } from '../composables/useContactForm'

export default defineComponent({
  components: {
    AppInput,
    AppHeader,
    AppCard,
    AppButton,
    AppSelect,
    AppDatePicker,
    CredentialIcon,
    PhoneIcon,
    EmailIcon,
    BirthdayIcon,
    StatusIcon,
    InformationIcon,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const toast = useToast()

    const contactId = String(route.params?.id || '')
    const { form, handleSubmit, resetForm, errors, addCustomField, setValues } = useFormContact()
    const { getCustomFields } = useCustomFieldService()
    const { getContact, createContact, updateContact } = useContactService()

    const customFields = ref<{ id: number; fieldName: string }[]>([])

    onMounted(async () => {
      try {
        const response = await getCustomFields()
        customFields.value = response

        response.forEach((field) => {
          addCustomField({
            customFieldId: field.id,
            value: '',
            id: undefined,
          })
        })
        if (contactId) {
          const contact = await getContact(contactId)

          setValues({
            name: contact.name,
            lastName: contact.lastName,
            email: contact.email,
            phone: contact.phone,
            countryCode: contact.countryCode,
            status: contact.status,
            birthDate: contact.birthDate ? new Date(contact.birthDate) : undefined,
            customValues: contact.customValues?.map((custom) => ({
              customFieldId: custom.customFieldId,
              value: custom.value,
              id: custom.id,
            })),
          })
        }
      } catch {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los campos personalizados',
          life: 3000,
        })
      }
    })

    const statusOptions = [
      { name: 'Activo', value: 'active' },
      { name: 'Inactivo', value: 'inactive' },
    ]

    const onSubmitForm = handleSubmit(
      async (values) => {
        try {
          const payload = {
            ...values,
            birthDate: values.birthDate ? values.birthDate : new Date(),
            customValues: values.customValues
              .filter((customValue) => customValue.customFieldId !== undefined)
              .map((customValue) => ({
                customFieldId: customValue.customFieldId as number,
                value: customValue.value || '',
                id: customValue.id,
              })),
          }

          if (contactId) {
            await updateContact(contactId, payload)
            toast.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Contacto actualizado correctamente',
              life: 3000,
            })
          } else {
            await createContact(payload)
            toast.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Contacto creado correctamente',
              life: 3000,
            })
          }

          router.push('/contacts')
        } catch {
          toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Hubo un problema al guardar el contacto',
            life: 3000,
          })
        }
      },
      (errors) => {
        console.log('❌ Errores en el formulario:', errors)
      },
    )

    const getError = (index: number, field: string) => {
      const errorKey = `customValues[${index}].${field}`
      return (errors?.value as Record<string, string | undefined>)[errorKey] || ''
    }

    const goBack = () => {
      router.push('/contacts')
    }

    return {
      IconTypes,
      ActionTypes,
      form,
      errors,
      resetForm,
      onSubmitForm,
      addCustomField,
      statusOptions,
      customFields,
      getError,
      contactId,
      goBack,
    }
  },
})
</script>

<template>
  <AppHeader :icon="IconTypes.CONTACTS" :actions="[]" />

  <form @submit.prevent="onSubmitForm" class="w-full mt-8">
    <div class="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <AppInput
        v-model="form.name.value"
        type="text"
        class="w-full rounded-md"
        :error-message="errors.name"
      >
        <template #icon><CredentialIcon class="w-4 h-4 dark:fill-white" /></template>
      </AppInput>

      <AppInput
        v-model="form.lastName.value"
        type="text"
        class="w-full rounded-md"
        :error-message="errors.lastName"
      >
        <template #icon><CredentialIcon class="w-4 h-4 dark:fill-white" /></template>
      </AppInput>

      <AppInput
        v-model="form.email.value"
        type="email"
        class="w-full rounded-md"
        :error-message="errors.email"
      >
        <template #icon><EmailIcon class="w-4 h-4 dark:fill-white" /></template>
      </AppInput>

      <AppInput
        v-model="form.phone.value"
        type="tel"
        class="w-full rounded-md"
        :error-message="errors.phone"
      >
        <template #icon><PhoneIcon class="w-4 h-4 dark:fill-white" /></template>
      </AppInput>

      <AppInput
        v-model="form.countryCode.value"
        type="text"
        class="w-full rounded-md"
        :error-message="errors.countryCode"
      >
        <template #icon><CredentialIcon class="w-4 h-4 dark:fill-white" /></template>
      </AppInput>

      <AppDatePicker
        v-model="form.birthDate.value"
        placeholder="Seleccione una fecha"
        class="w-full"
        :error-message="errors.birthDate"
      >
        <template #icon><BirthdayIcon class="w-4 h-4 dark:fill-white" /></template>
      </AppDatePicker>

      <AppSelect
        v-model="form.status.value"
        :options="statusOptions"
        placeholder="Seleccione un estado"
        class="w-full"
        :error-message="errors.status"
      >
        <template #icon><StatusIcon class="w-4 h-4 dark:fill-white" /></template>
      </AppSelect>
    </div>

    <AppCard class="w-full shadow-lg p-6 mt-8">
      <template #content>
        <div class="flex items-center justify-center gap-2 mb-4">
          <InformationIcon class="w-8 h-8 dark:fill-white" />
          <h2 class="text-center text-xl font-semibold">Información Personalizada</h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div
            v-for="(custom, index) in form.customValues.value"
            :key="index"
            class="flex flex-col gap-1"
          >
            <label>{{
              customFields.find((field) => field.id === custom.value.customFieldId)?.fieldName
            }}</label>
            <AppInput
              v-model="custom.value.value"
              type="text"
              class="w-full rounded-md"
              :error-message="getError(index, 'value')"
            />
          </div>
        </div>
      </template>
    </AppCard>

    <div class="flex flex-col lg:flex-row gap-5 mt-7">
      <AppButton class="w-full sm:w-auto" type="submit" severity="primary" label="Guardar" />
      <AppButton class="w-full sm:w-auto" severity="secondary" label="Cancelar" @click="goBack" />
    </div>
  </form>
</template>
