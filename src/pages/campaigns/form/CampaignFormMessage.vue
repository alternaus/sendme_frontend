<template>
   <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-4">


        <div class="col-span-12 grid grid-cols-8 gap-4 items-center justify-center text-center">
          <div class="flex flex-col items-center justify-center gap-1 col-span-12 lg:col-span-1">
            <SmsIcon class="w-12 h-12 dark:fill-white" />
            <span class="text-gray-700 dark:text-neutral-300 font-medium">{{ t('general.sms') }}</span>
          </div>

          <div class="flex items-center justify-center col-span-12 lg:col-span-5">
            <AppEditor
            :contentType="'text'"
              :modelValue="(form.content.value as string)"
              :errorMessage="errors.content"
              @update:modelValue="updateContent"
            />
          </div>

          <div class="flex flex-col items-center justify-center gap-2 col-span-12 lg:col-span-2">
            <p class="text-gray-700 dark:text-neutral-300 font-medium">{{ t('campaign.dynamic_data') }}</p>

            <AppSelect v-model="selectedField" :options="availableFields" class="w-full" />

            <AppButton :label="t('campaign.insert_in_message')" @click="insertPlaceholder" />
          </div>
        </div>
      </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { useI18n } from 'vue-i18n'

import SmsIcon from '@/assets/svg/sms.svg?component'
import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppEditor from '@/components/atoms/editor/AppEditor.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import type { SelectOption } from '@/components/atoms/selects/types/select-option.types'
import { useCustomFieldService } from '@/services/custom-field/useCustomFieldService'

import type { CampaignFormFields } from '../composables/useCampaignForm'

interface Props {
  form: CampaignFormFields
  errors: Partial<Record<string, string | undefined>>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:form': [key: string, value: unknown]
}>()

const { t } = useI18n()
const { getCustomFields } = useCustomFieldService()

const availableFields = ref<SelectOption[]>([])
const selectedField = ref<string | null>(null)

const updateContent = (value: string) => {
  try {
    console.log('🔄 CampaignFormMessage updating content:', value)
    emit('update:form', 'content', value)
  } catch (error) {
    console.error('❌ Error updating content in CampaignFormMessage:', error)
  }
}

const insertPlaceholder = () => {
  try {
    if (selectedField.value) {
      console.log('🔄 Inserting placeholder:', selectedField.value)
      const currentContent = props.form.content.value as string || ''
      const newValue = `${currentContent} ${selectedField.value}`
      updateContent(newValue)
    }
  } catch (error) {
    console.error('❌ Error inserting placeholder:', error)
  }
}

getCustomFields()
  .then((response) => {
    const contactFields = [
      { name: t('general.name'), value: '{name}' },
      { name: t('general.last_name'), value: '{lastName}' },
      { name: t('general.email'), value: '{email}' },
      { name: t('general.phone'), value: '{phone}' },
      { name: t('general.country_code'), value: '{countryCode}' },
      { name: t('general.birth_date'), value: '{birthDate}' },
      { name: t('general.status'), value: '{status}' },
    ]

    const customFields = response.map((field) => ({
      name: field.fieldName,
      value: `{${field.fieldName}}`,
    }))

    availableFields.value = [...contactFields, ...customFields]
  })
  .catch((_error) => {
  })
</script>
