<script setup lang="ts">
import { nextTick,onMounted, ref } from 'vue'

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
  addCustomField,
  removeCustomField,
  handleSubmit,
  errors,
  resetForm,
} = useCustomFieldForm()

const customFieldIds = ref<Record<number, number>>({})
const editingFieldIndices = ref<number[]>([])

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
      addCustomField({
        fieldName: field.fieldName,
        dataType: field.dataType as 'string' | 'number' | 'date'
      })
      customFieldIds.value[index] = field.id
    })

    await nextTick()
    const lastField = document.querySelector(`[data-field-index="${fields.length - 1}"]`)
    if (lastField) {
      lastField.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: t('general.error'),
      detail: t('customFields.error_loading'),
      life: 3000
    })
  }
}

const toggleEditMode = (index: number) => {
  const idx = editingFieldIndices.value.indexOf(index)
  if (idx === -1) {
    editingFieldIndices.value.push(index)
  } else {
    editingFieldIndices.value.splice(idx, 1)
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
    const editIndex = editingFieldIndices.value.indexOf(idx)
    if (editIndex !== -1) {
      editingFieldIndices.value.splice(editIndex, 1)
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: t('general.error'),
      detail: t('customFields.error_deleting'),
      life: 3000
    })
  }
}


const validateForm = () => {

  const hasEmptyFields = customFields.value.some(field =>
    !field.value.fieldName.trim() || !field.value.dataType
  )

  if (hasEmptyFields) {
    toast.add({
      severity: 'error',
      summary: t('general.error'),
      detail: t('customFields.error_saving'),
      life: 3000
    })
    return false
  }

  return true
}

const onSubmit = () => {
  if (!validateForm()) {
    return
  }

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

        editingFieldIndices.value = []

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
      toast.add({
        severity: 'error',
        summary: t('general.error'),
        detail: t('customFields.error_saving'),
        life: 3000
      })
    },
  )()
}

const handleAddField = async () => {
  addEmptyField()
  const newIndex = customFields.value.length - 1
  editingFieldIndices.value.push(newIndex)

  await nextTick()
  const newField = document.querySelector(`[data-field-index="${newIndex}"]`)
  if (newField) {
    newField.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
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
                :data-field-index="idx"
                class="p-4 my-2 bg-neutral-50 dark:bg-neutral-700 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 h-fit"
                :class="{'border border-red-500': getError(idx, 'fieldName') || getError(idx, 'dataType')}">
                <div class="flex flex-col gap-4">
                  <div class="flex items-center justify-between">
                    <div
                      class="w-8 h-8 flex items-center justify-center bg-[var(--p-primary-color)] dark:text-black rounded-full font-bold text-sm">
                      {{ idx + 1 }}
                    </div>
                    <div class="flex gap-2">
                      <PrimeButton
                        v-if="idx in customFieldIds"
                        @click="toggleEditMode(idx)"
                        :icon="editingFieldIndices.includes(idx) ? 'pi pi-times' : 'pi pi-pencil'"
                        :severity="editingFieldIndices.includes(idx) ? 'secondary' : 'info'"
                        variant="text"
                        rounded />
                      <PrimeButton
                        @click="handleRemoveField(idx)"
                        icon="pi pi-trash"
                        severity="danger"
                        variant="text"
                        rounded />
                    </div>
                  </div>

                  <div class="space-y-6 mt-2">
                    <template v-if="editingFieldIndices.includes(idx)">
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
                    </template>
                    <template v-else>
                      <div class="flex flex-col gap-2">
                        <div class="flex flex-col">
                          <small class="text-gray-500 dark:text-gray-400">{{ $t('customFields.field_label') }}</small>
                          <p class="font-medium">{{ field.value.fieldName }}</p>
                        </div>
                        <div class="flex flex-col">
                          <small class="text-gray-500 dark:text-gray-400">{{ $t('customFields.field_type') }}</small>
                          <p class="font-medium">{{ dataTypes.find(type => type.value === field.value.dataType)?.name }}</p>
                        </div>
                      </div>
                    </template>
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
              @click="handleAddField"
              icon="pi pi-plus" />
            <AppButton
              v-if="editingFieldIndices.length > 0"
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
