<script lang="ts">
import { defineComponent, ref } from 'vue'
import AppCard from '@/components/atoms/cards/AppCard.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppHeader from '@/components/molecules/app-header/AppHeader.vue'
import { ActionTypes } from '@/components/molecules/app-header/enums/action-types.enum'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import AppDatePicker from '@/components/atoms/datepickers/AppDatePicker.vue'

import { useFormContact } from '../composables/useContactForm'
import { IconTypes } from '@/components/molecules/app-header/enums/icon-types.enum'

export default defineComponent({
  components: {
    AppInput,
    AppHeader,
    AppCard,
    AppButton,
    AppSelect,
    AppDatePicker,
  },
  setup() {
    const { form, handleSubmit, resetForm, errors, addCustomField } = useFormContact()

    const fields = ref([
      { label: 'Nombre', model: 'name', type: 'text' },
      { label: 'Apellido', model: 'lastName', type: 'text' },
      { label: 'Correo', model: 'email', type: 'email' },
      { label: 'Teléfono', model: 'phone', type: 'tel' },
      { label: 'Código de País', model: 'countryCode', type: 'text' },
      { label: 'Fecha de Nacimiento', model: 'birthDate', type: 'date' },
    ])

    const statusOptions = ref([
      { name: 'Activo', code: 'active' },
      { name: 'Inactivo', code: 'inactive' },
    ])

    const onSubmitForm = handleSubmit((values) => {
      console.log('Formulario enviado con:', values)
    })

    return {
      IconTypes,
      ActionTypes,
      fields,
      form,
      errors,
      resetForm,
      onSubmitForm,
      addCustomField,
      statusOptions,
    }
  },
})
</script>

<template>
  <AppHeader :icon="IconTypes.CONTACTS" :actions="[]" />

  <form @submit.prevent="onSubmitForm" class="w-full mt-8">
    <div class="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div v-for="(field, index) in fields" :key="index" class="flex flex-col gap-1">
        <AppDatePicker
          v-if="field.model === 'birthDate'"
          v-model="form[field.model].value"
          placeholder="Seleccione una fecha"
          :validationRules="['required']"
          class="w-full"
        />
        <AppInput
          v-else
          v-model="form[field.model]"
          :type="field.type"
          class="w-full border-gray-300 dark:border-gray-600 rounded-md"
        />
      </div>

      <div class="flex flex-col gap-1">
        <AppSelect
          v-model="form.status"
          :options="statusOptions"
          placeholder="Seleccione un estado"
          :validationRules="['required']"
          class="w-full"
        />
      </div>
    </div>

    <AppCard class="w-full shadow-lg p-6 mt-8">
      <template #content>
        <h2 class="text-center text-xl font-semibold text-gray-800 dark:text-neutral-300 mb-4">
          Información Personalizada
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div
            v-for="(custom, index) in form.customValues.value"
            :key="index"
            class="flex flex-col gap-1"
          >
            <label class="text-gray-700 dark:text-neutral-300">Campo {{ index + 1 }}</label>
            <AppInput
              v-model="custom.value"
              type="text"
              class="w-full dark:border-gray-600 rounded-md"
            />
            <small v-if="errors[`customValues.${index}.value`]" class="text-red-500">
              {{ errors[`customValues.${index}.value`] }}
            </small>
          </div>
        </div>
      </template>
    </AppCard>

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
