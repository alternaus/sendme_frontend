<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { Button as PrimeButton } from 'primevue'
import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppCard from '@/components/atoms/cards/AppCard.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'
import { useCustomFieldService } from '@/services/custom-field/useCustomFieldService'

import { useCustomFieldForm } from './composables/useCustomFieldsForm'

const { t } = useI18n()
const toast = useToast()
const { getCustomFields, createCustomField, updateCustomField, deleteCustomField } = useCustomFieldService()

const {
  customFields,
  addEmptyField,
  removeCustomField,
  handleSubmit,
  errors,
  resetForm,
  addCustomField: addFormField
} = useCustomFieldForm()

const customFieldIds = ref<Record<number, number>>({})

const dataTypes = [
  { name: t('customFields.data_types.text'), value: 'string' },
  { name: t('customFields.data_types.number'), value: 'number' },
  { name: t('customFields.data_types.date'), value: 'date' },
]

const getError = (idx: number, field: keyof typeof customFields.value[0]['value']) => {
  const key = `customFields.${idx}.${field}` as const
  return errors.value?.[key]
}

const loadCustomFields = async () => {
  try {
    const fields = await getCustomFields()
    resetForm()
    customFieldIds.value = {}

    fields.forEach((field, index) => {
      addFormField({
        fieldName: field.fieldName,
        dataType: field.dataType as 'string' | 'number' | 'date'
      })
      customFieldIds.value[index] = field.id
    })
  } catch {
    toast.add({
      severity: 'error',
      summary: t('general.error'),
      detail: t('customFields.error_loading'),
      life: 3000
    })
  }
}

const handleRemoveField = async (idx: number) => {
  try {
    if (customFieldIds.value[idx] !== undefined) {
      await deleteCustomField(customFieldIds.value[idx])

      delete customFieldIds.value[idx]

      const newIds: Record<number, number> = {}
      Object.entries(customFieldIds.value).forEach(([key, value]) => {
        const numKey = Number(key)
        if (numKey > idx) {
          newIds[numKey - 1] = value
        } else {
          newIds[numKey] = value
        }
      })
      customFieldIds.value = newIds

      toast.add({
        severity: 'success',
        summary: t('general.success'),
        detail: t('customFields.field_deleted'),
        life: 3000
      })
    }

    removeCustomField(idx)
  } catch {
    toast.add({
      severity: 'error',
      summary: t('general.error'),
      detail: t('customFields.error_deleting'),
      life: 3000
    })
  }
}

const onSubmit = () => {
  handleSubmit(
    async (values) => {
      try {
        const existingFields = await getCustomFields()

        for (const field of values.customFields) {
          const existingField = existingFields.find(
            ef => ef.fieldName === field.fieldName
          )

          if (existingField) {
            await updateCustomField(existingField.id, {
              fieldName: field.fieldName,
              dataType: field.dataType,
              elementType: 'input',
              organizationId: existingField.organizationId
            })
          } else {
            await createCustomField({
              fieldName: field.fieldName,
              dataType: field.dataType,
              elementType: 'input',
              organizationId: 1
            })
          }
        }

        await loadCustomFields()

        toast.add({
          severity: 'success',
          summary: t('general.success'),
          detail: t('customFields.field_updated'),
          life: 3000
        })
      } catch {
        toast.add({
          severity: 'error',
          summary: t('general.error'),
          detail: t('customFields.error_saving'),
          life: 3000
        })
      }
    },
    (formErrors) => {
      console.error('Errores de validación:', formErrors)
    },
  )()
}

onMounted(() => {
  loadCustomFields()
})
</script>

<template>
  <AppHeader :icon="IconTypes.CUSTOM_FIELDS" :text="$t('customFields.title')" :actions="[]" />
  <div class="">
    <AppCard class="h-full max-h-[calc(100vh-140px-4rem)]">
      <template #content>
        <div class="h-full flex flex-col">
          <div class="flex-none">
            <p class="text-center text-neutral-600 dark:text-neutral-300">
              {{ $t('customFields.max_fields') }}
            </p>
          </div>

          <div class="flex-1 min-h-0 max-h-64 lg:max-h-96 overflow-y-auto my-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 auto-rows-min">
              <div v-for="(field, idx) in customFields" :key="field.key"
                class="p-4 my-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 h-fit">
                <div class="flex flex-col gap-4">
                  <div class="flex items-center justify-between">
                    <div
                      class="w-8 h-8 flex items-center justify-center bg-[var(--p-primary-color)] dark:text-black rounded-full font-bold text-sm">
                      {{ idx + 1 }}
                    </div>
                    <PrimeButton
                      @click="handleRemoveField(idx)"
                      icon="pi pi-trash"
                      severity="danger"
                      variant="text"
                      rounded />
                  </div>

                  <div class="space-y-6">
                    <AppInput
                      v-model="field.value.fieldName"
                      :label="$t('customFields.field_label')"
                      :errorMessage="getError(idx, 'fieldName')"
                      class="w-full" />

                    <AppSelect
                      v-model="field.value.dataType"
                      :options="dataTypes"
                      :label="$t('customFields.field_type')"
                      :errorMessage="getError(idx, 'dataType')"
                      class="w-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex-none flex justify-center items-center gap-4 py-4">
            <AppButton
              type="button"
              class="!w-fit"
              :label="$t('customFields.add_field')"
              @click="addEmptyField"
              icon="pi pi-plus" />
            <AppButton
              type="button"
              class="!w-fit"
              :label="$t('general.save')"
              @click="onSubmit"
              icon="pi pi-save" />
          </div>
        </div>
      </template>
    </AppCard>
  </div>
</template>

<style scoped></style>
