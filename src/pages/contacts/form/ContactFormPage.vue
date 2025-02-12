<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'

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
    const { form, handleSubmit, resetForm, errors, addCustomField } = useFormContact()
    const { getCustomFields } = useCustomFieldService()

    const customFields = ref<{ id: number; fieldName: string }[]>([])

    onMounted(async () => {
      try {
        const response = await getCustomFields()
        customFields.value = response

        response.forEach((field) => {
          addCustomField({
            customFieldId: field.id,
            value: '',
          })
        })
      } catch (error) {
        console.error('❌ Error al obtener campos personalizados:', error)
      }
    })

    const statusOptions = [
      { name: 'Activo', value: 'active' },
      { name: 'Inactivo', value: 'inactive' },
    ]

    const onSubmitForm = handleSubmit(
      (values) => {
        console.log('Formulario enviado con:', values)
      },
      (errors) => {
        console.log('Errores en el formulario:', errors)
      },
    )

    const getError = (index: number, field: string) => {
      const errorKey = `customValues[${index}].${field}`
      return (errors?.value as Record<string, string | undefined>)[errorKey] || ''
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
        class="w-full border-gray-300 dark:border-gray-600 rounded-md"
        :error-message="errors.name"
      >
        <template #icon>
          <CredentialIcon class="dark:fill-white w-4 h-4" />
        </template>
      </AppInput>

      <AppInput
        v-model="form.lastName.value"
        type="text"
        class="w-full border-gray-300 dark:border-gray-600 rounded-md"
        :error-message="errors.lastName"
      >
        <template #icon>
          <CredentialIcon class="dark:fill-white w-4 h-4" />
        </template>
      </AppInput>

      <AppInput
        v-model="form.email.value"
        type="email"
        class="w-full border-gray-300 dark:border-gray-600 rounded-md"
        :error-message="errors.email"
      >
        <template #icon> <EmailIcon class="dark:fill-white w-4 h-4" /> </template>
      </AppInput>

      <AppInput
        v-model="form.phone.value"
        type="tel"
        class="w-full border-gray-300 dark:border-gray-600 rounded-md"
        :error-message="errors.phone"
      >
        <template #icon>
          <PhoneIcon class="dark:fill-white w-4 h-4" />
        </template>
      </AppInput>

      <AppInput
        v-model="form.countryCode.value"
        type="text"
        class="w-full border-gray-300 dark:border-gray-600 rounded-md"
        :error-message="errors.countryCode"
      >
        <template #icon>
          <CredentialIcon class="dark:fill-white w-4 h-4" />
        </template>
      </AppInput>

      <AppDatePicker
        v-model="form.birthDate.value"
        placeholder="Seleccione una fecha"
        class="w-full"
        :error-message="errors.birthDate"
      >
        <template #icon>
          <BirthdayIcon class="dark:fill-white w-4 h-4" />
        </template>
      </AppDatePicker>

      <AppSelect
        v-model="form.status.value"
        :options="statusOptions"
        placeholder="Seleccione un estado"
        class="w-full"
        :error-message="errors.status"
      >
        <template #icon>
          <StatusIcon class="dark:fill-white w-4 h-4" />
        </template>
      </AppSelect>
    </div>

    <AppCard class="w-full shadow-lg p-6 mt-8">
      <template #content>
        <div class="flex items-center justify-center gap-2 mb-4">
          <InformationIcon class="w-8 h-8 dark:fill-white" />
          <h2 class="text-center text-xl font-semibold text-gray-800 dark:text-neutral-300">
            Información Personalizada
          </h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div
            v-for="(custom, index) in form.customValues.value"
            :key="index"
            class="flex flex-col gap-1"
          >
            <label class="text-gray-700 dark:text-neutral-300 text-sm">
              {{ customFields.find((field) => field.id === custom.value.customFieldId)?.fieldName }}
            </label>
            <AppInput
              v-model="custom.value.value"
              type="text"
              class="w-full dark:border-gray-600 rounded-md"
              :error-message="getError(index, 'value')"
            />
          </div>
        </div>
      </template>
    </AppCard>

    <!-- Botones de acción -->
    <div class="flex flex-col lg:flex-row lg:justify-start gap-5 mt-7">
      <AppButton type="submit" severity="primary" class="w-full sm:w-auto" label="Guardar" />
      <AppButton
        severity="secondary"
        class="w-full sm:w-auto"
        label="Cancelar"
        @click="resetForm"
      />
    </div>
  </form>
</template>
