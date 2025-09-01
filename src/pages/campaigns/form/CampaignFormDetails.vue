<script setup lang="ts">
import { computed } from 'vue'

import { useI18n } from 'vue-i18n'

import CampaignRouteIcon from '@/assets/svg/campaign_route.svg?component'
import ChannelIcon from '@/assets/svg/channel.svg?component'
import DateEndIcon from '@/assets/svg/date_end.svg?component'
import DateStartIcon from '@/assets/svg/date_start.svg?component'
import DescriptionIcon from '@/assets/svg/description.svg?component'
import StatusIcon from '@/assets/svg/status.svg?component'
import AppSelectButton from '@/components/atoms/buttons/AppSelectButton.vue'
import type { SelectButtonOption } from '@/components/atoms/buttons/types/select-button-options.type'
import AppDatePicker from '@/components/atoms/datepickers/AppDatePicker.vue'
import AppTimePicker from '@/components/atoms/datepickers/AppTimePicker.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import AppStatusSelect from '@/components/atoms/selects/AppStatusSelect.vue'
import type { SelectOption } from '@/components/atoms/selects/types/select-option.types'

import type { CampaignFormFields } from '../composables/useCampaignForm'

interface Props {
  form: CampaignFormFields
  errors: Partial<Record<string, string | undefined>>
  channels?: SelectOption[]
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  channels: () => [],
  disabled: false
})

const emit = defineEmits<{
  'update:form': [key: string, value: unknown]
}>()

const { t } = useI18n()

const daysOptions: SelectButtonOption[] = [
  { name: t('campaign.days.monday'), value: 'MO' },
  { name: t('campaign.days.tuesday'), value: 'TU' },
  { name: t('campaign.days.wednesday'), value: 'WE' },
  { name: t('campaign.days.thursday'), value: 'TH' },
  { name: t('campaign.days.friday'), value: 'FR' },
  { name: t('campaign.days.saturday'), value: 'SA' },
  { name: t('campaign.days.sunday'), value: 'SU' },
]

const updateField = (key: string, value: unknown) => {
  emit('update:form', key, value)
}

//Computed properties to access ref values safely
const formValues = computed(() => ({
  name: props.form.name.value as string,
  description: props.form.description.value as string,
  channelId: props.form.channelId.value as number,
  status: props.form.status.value as string,
  startDate: props.form.startDate.value as Date,
  endDate: props.form.endDate.value as Date,
  days: props.form.days.value as string[],
  time: props.form.time.value as Date
}))

const errorMessages = computed(() => ({
  name: props.errors.name || '',
  description: props.errors.description || '',
  channelId: props.errors.channelId || '',
  status: props.errors.status || '',
  startDate: props.errors.startDate || '',
  endDate: props.errors.endDate || '',
  days: props.errors.days || '',
  time: props.errors.time || ''
}))
</script>

<template>
  <div class="space-y-6 p-4 pt-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <AppInput
        :modelValue="formValues.name"
        @update:modelValue="updateField('name', $event)"
        type="text"
        class="w-full"
        :error-message="errorMessages.name"
        :label="t('general.name')"
        :disabled="disabled"
      >
        <template #icon>
          <CampaignRouteIcon class="dark:fill-white w-4 h-4" />
        </template>
      </AppInput>

      <AppInput
        :modelValue="formValues.description"
        @update:modelValue="updateField('description', $event)"
        :error-message="errorMessages.description"
        type="text"
        class="w-full"
        :label="t('general.description')"
        :disabled="disabled"
      >
        <template #icon>
          <DescriptionIcon class="dark:fill-white w-4 h-4" />
        </template>
      </AppInput>

      <AppSelect
        :modelValue="formValues.channelId"
        @update:modelValue="updateField('channelId', $event)"
        :options="channels"
        :error-message="errorMessages.channelId"
        :label="t('campaign.channel')"
        class="w-full"
        :disabled="disabled"
      >
        <template #icon>
          <ChannelIcon class="dark:fill-white w-4 h-4" />
        </template>
      </AppSelect>

      <AppStatusSelect
        :modelValue="formValues.status"
        @update:modelValue="updateField('status', $event)"
        status-type="campaign"
        :error-message="errorMessages.status"
        :label="t('general.status')"
        class="w-full"
        :disabled="disabled"
        :show-colors="true"
      >
        <template #icon>
          <StatusIcon class="dark:fill-white w-4 h-4" />
        </template>
      </AppStatusSelect>
    </div>


    <!-- Campos de programación (scheduling) -->
    <div class="grid grid-cols-1 lg:grid-cols-10 gap-4">


        <div class="grid grid-cols-1 justify-center items-center lg:col-span-3">
          <div class="flex flex-col items-center">
            <p class="text-gray-700 dark:text-neutral-300">{{ t('campaign.duration') }}</p>
          </div>
          <div class="grid grid-cols-1 gap-2">
            <AppDatePicker
              :modelValue="formValues.startDate"
              @update:modelValue="updateField('startDate', $event)"
              :errorMessage="errorMessages.startDate"
            >
              <template #icon>
                <DateStartIcon class="dark:fill-white w-4 h-4" />
              </template>
            </AppDatePicker>

            <AppDatePicker
              :modelValue="formValues.endDate"
              @update:modelValue="updateField('endDate', $event)"
              :errorMessage="errorMessages.endDate"
            >
              <template #icon>
                <DateEndIcon class="dark:fill-white w-4 h-4" />
              </template>
            </AppDatePicker>
          </div>
        </div>

        <!-- Días de ejecución -->
        <div class="grid grid-rows-2 items-center justify-center lg:col-span-4">
          <div class="flex flex-col items-center">
            <p class="text-gray-700 dark:text-neutral-300">{{ t('campaign.execution_days') }}</p>
          </div>
          <div class="w-full">
            <AppSelectButton
              :modelValue="formValues.days"
              @update:modelValue="updateField('days', $event)"
              :options="daysOptions"
              :errorMessage="errorMessages.days"
            />
          </div>
        </div>

        <!-- Hora de ejecución -->
        <div class="grid grid-rows-2 lg:col-span-3 w-full">
          <div class="flex flex-col justify-center items-center">
            <p class="text-gray-700 dark:text-neutral-300">{{ t('campaign.execution_time') }}</p>
          </div>
          <div class="w-full flex items-center justify-center">
            <AppTimePicker
              :modelValue="formValues.time"
              @update:modelValue="updateField('time', $event)"
              class="w-full"
              :errorMessage="errorMessages.time"
            />
          </div>
        </div>
      </div>
    </div>
</template>
