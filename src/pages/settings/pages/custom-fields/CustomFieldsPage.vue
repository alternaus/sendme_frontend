<script setup lang="ts">
import { Button as PrimeButton } from 'primevue'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppCard from '@/components/atoms/cards/AppCard.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'

import { useCustomFieldForm } from './composables/useCustomFieldsForm'

const {
  customFields,
  addEmptyField,
  removeCustomField,
  handleSubmit,
  errors,
} = useCustomFieldForm()

const dataTypes = [
  { name: 'Texto', value: 'string' },
  { name: 'Número', value: 'number' },
  { name: 'Fecha', value: 'date' },
]

const getError = (idx: number, field: keyof typeof customFields[0]['value']) => {
  return errors.value?.[`customFields.${idx}.${field}`]
}

const onSubmit = () => {
  handleSubmit(
    (values) => {
      console.log('Campos personalizados:', values.customFields)
    },
    (formErrors) => {
      console.error('Errores de validación:', formErrors)
    },
  )()
}
</script>

<template>
  <AppHeader :icon="IconTypes.CUSTOM_FIELDS" :text="$t('general.personalized_information')" :actions="[]" />
  <AppCard>
    <template #content>
      <div class="space-y-4">
        <p class="text-center">
          Puedes agregar hasta 10 campos de información complementaria a tus contactos.
        </p>

        <div v-for="(field, idx) in customFields" :key="field.key"
          class="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-x-2">
          <div
            class="w-6 h-6 flex items-center justify-center bg-[var(--p-primary-color)] dark:text-black rounded-full font-bold">
            {{ idx + 1 }}
          </div>

          <AppInput v-model="field.value.fieldName" label="Etiqueta del campo"
            :errorMessage="getError(idx, 'fieldName')" />

          <AppSelect v-model="field.value.dataType" :options="dataTypes" label="Tipo de campo"
            :errorMessage="getError(idx, 'dataType')" />

          <PrimeButton @click="removeCustomField(idx)" icon="pi pi-trash" severity="danger" variant="text" rounded />
        </div>

        <div class="flex justify-center items-center gap-4">
          <AppButton type="button" class="!w-fit" label="Agregar campo" @click="addEmptyField" />
          <AppButton type="button" class="!w-fit" label="Guardar" @click="onSubmit" />
        </div>
      </div>
    </template>
  </AppCard>
</template>

<style scoped></style>
