<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'

import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppCard from '@/components/atoms/cards/AppCard.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'
import type { ICustomField } from '@/services/custom-field/interfaces/custom-field.interface'
import { useCustomFieldService } from '@/services/custom-field/useCustomFieldService'
import { useAuthStore } from '@/stores/useAuthStore'

import { useCustomFieldForm } from './composables/useCustomFieldsForm'

const { t } = useI18n()
const toast = useToast()
const { listCustomFields, createCustomField, updateCustomField, deleteCustomField } = useCustomFieldService()

const {
  customFields,
  addEmptyField,
  addCustomField,
  removeCustomField,
  handleSubmit,
  errors,
  resetForm,
} = useCustomFieldForm()

const customFieldIds = ref<Record<number, string>>({})
const editingFieldIndices = ref<number[]>([])

const { user } = useAuthStore()

const dataTypes = [
  { name: t('settings.custom_fields.data_types.text'), value: 'STRING' },
  { name: t('settings.custom_fields.data_types.number'), value: 'NUMBER' },
  { name: t('settings.custom_fields.data_types.date'), value: 'DATE' },
]

const getError = (idx: number, field: keyof typeof customFields.value[0]['value']) => {
  const key = `customFields.${idx}.${field}` as const
  return errors.value?.[key]
}

const loadCustomFields = async () => {
  try {
    const fields = await listCustomFields()
    resetForm()
    customFieldIds.value = {}

    fields.forEach((field: ICustomField, index: number) => {
      addCustomField({
        fieldName: field.fieldName,
        dataType: field.dataType as 'STRING' | 'NUMBER' | 'DATE'
      })
      customFieldIds.value[index] = field.id.toString()
    })

    await nextTick()
    const lastField = document.querySelector(`[data-field-index="${fields.length - 1}"]`)
    if (lastField) {
      lastField.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  } catch {
    toast.add({
      severity: 'error',
      summary: t('settings.common.error'),
      detail: t('settings.custom_fields.error_loading'),
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

      const newIds: Record<number, string> = {}
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
        summary: t('settings.common.success'),
        detail: t('settings.custom_fields.field_deleted'),
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
      summary: t('settings.common.error'),
      detail: t('settings.custom_fields.error_deleting'),
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
      summary: t('settings.common.error'),
      detail: t('settings.custom_fields.error_saving'),
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
        const existingFields = await listCustomFields()

        for (const [index, field] of values.customFields.entries()) {
          const existingFieldId = customFieldIds.value[index]

          if (existingFieldId) {
            await updateCustomField(existingFieldId, {
              fieldName: field.fieldName,
              dataType: field.dataType,
              elementType: 'INPUT',
              organizationId: existingFields.find((ef: ICustomField) => ef.id === existingFieldId)?.organizationId || user?.organizationId || '1'
            })
          } else {
            await createCustomField({
              fieldName: field.fieldName,
              dataType: field.dataType,
              elementType: 'INPUT',
              organizationId: user?.organizationId as string
            })
          }
        }

        await loadCustomFields()

        editingFieldIndices.value = []

        toast.add({
          severity: 'success',
          summary: t('settings.common.success'),
          detail: t('settings.custom_fields.field_updated'),
          life: 3000
        })
      } catch {
        toast.add({
          severity: 'error',
          summary: t('settings.common.error'),
          detail: t('settings.custom_fields.error_saving'),
          life: 3000
        })
      }
    },
    (_formErrors) => {
      toast.add({
        severity: 'error',
        summary: t('settings.common.error'),
        detail: t('settings.custom_fields.error_saving'),
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
  <AppHeader :icon="IconTypes.CUSTOM_FIELDS" :text="$t('settings.custom_fields.title')" :actions="[]" />
  <div class="">
    <AppCard class="h-full max-h-[calc(100vh-140px-4rem)]">
      <template #content>
        <div class="h-full flex flex-col">
          <div class="flex-none">
            <p class="text-center text-neutral-600 dark:text-neutral-300">
              {{ $t('settings.custom_fields.max_fields') }}
            </p>
          </div>

          <div class="flex-1 min-h-0 max-h-64 lg:max-h-96 overflow-y-auto my-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 auto-rows-min">
              <div v-for="(field, idx) in customFields" :key="field.key"
                :data-field-index="idx"
                class="p-4 my-2 bg-neutral-50 dark:bg-neutral-900 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 h-fit"
                :class="{'border border-red-500': getError(idx, 'fieldName') || getError(idx, 'dataType')}">
                <div class="flex flex-col gap-4">
                  <div class="flex items-center justify-between">
                    <div
                      class="w-8 h-8 flex items-center justify-center bg-[var(--p-primary-color)] dark:text-black rounded-full font-bold text-sm">
                      {{ idx + 1 }}
                    </div>
                    <div class="flex gap-2">
                      <AppButton
                        v-if="idx in customFieldIds"
                        @click="toggleEditMode(idx)"
                        :icon="editingFieldIndices.includes(idx) ? 'pi pi-times' : 'pi pi-pencil'"
                        :severity="editingFieldIndices.includes(idx) ? 'secondary' : 'info'"
                        variant="text"
                        rounded />
                      <AppButton
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
                        :label="$t('settings.custom_fields.field_label')"
                        :errorMessage="getError(idx, 'fieldName')"
                        class="w-full" />

                      <AppSelect
                        v-model="field.value.dataType"
                        :options="dataTypes"
                        :label="$t('settings.custom_fields.field_type')"
                        :errorMessage="getError(idx, 'dataType')"
                        class="w-full" />
                    </template>
                    <template v-else>
                      <div class="flex flex-col gap-2">
                        <div class="flex flex-col">
                          <small class="text-gray-500 dark:text-gray-400">{{ $t('settings.custom_fields.field_label') }}</small>
                          <p class="font-medium">{{ field.value.fieldName }}</p>
                        </div>
                        <div class="flex flex-col">
                          <small class="text-gray-500 dark:text-gray-400">{{ $t('settings.custom_fields.field_type') }}</small>
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
              :label="$t('settings.custom_fields.add_field')"
              @click="handleAddField"
              icon="pi pi-plus" />
            <AppButton
              v-if="editingFieldIndices.length > 0"
              type="button"
              class="!w-fit"
              :label="$t('settings.common.save')"
              @click="onSubmit"
              icon="pi pi-save" />
          </div>
        </div>
      </template>
    </AppCard>
  </div>
</template>

<style scoped></style>
