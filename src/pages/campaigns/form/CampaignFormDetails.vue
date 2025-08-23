<script lang="ts">
import { defineComponent, type PropType } from 'vue'

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
import type { SelectOption } from '@/components/atoms/selects/types/select-option.types'

import type { CampaignFormRef } from '../composables/useCampaignForm'

export default defineComponent({
  components: {
    AppInput,
    AppSelect,
    AppDatePicker,
    AppTimePicker,
    AppSelectButton,
    CampaignRouteIcon,
    ChannelIcon,
    DateStartIcon,
    DateEndIcon,
    DescriptionIcon,
    StatusIcon,
  },
  props: {
    form: {
      type: Object as PropType<CampaignFormRef>,
      required: true,
    },
    errors: {
      type: Object as PropType<Partial<Record<string, string>>>,
      required: true,
    },
    channels: {
      type: Array as PropType<SelectOption[]>,
      default: () => [],
    },
    statusOptions: {
      type: Array as PropType<SelectOption[]>,
      default: () => [],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:form'],

  setup(_, { emit }) {
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

    const updateFormValue = (key: keyof CampaignFormRef, value: unknown) => {
      try {
        console.log(`🔄 CampaignFormDetails updating ${key}:`, value)
        emit('update:form', { [key]: value })
      } catch (error) {
        console.error('❌ Error updating form value in CampaignFormDetails:', error)
      }
    }

    return {
      daysOptions,
      updateFormValue,
      t,
    }
  },
})
</script>

<template>
  <div class="space-y-6 p-4 pt-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <AppInput
        :modelValue="form.name.value"
        @update:modelValue="updateFormValue('name', $event)"
        type="text"
        class="w-full"
        :error-message="errors.name"
        :label="t('general.name')"
        :disabled="disabled"
      >
        <template #icon>
          <CampaignRouteIcon class="dark:fill-white w-4 h-4" />
        </template>
      </AppInput>

      <AppInput
        :modelValue="form.description.value"
        @update:modelValue="updateFormValue('description', $event)"
        :error-message="errors.description"
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
        :modelValue="form.channelId.value"
        @update:modelValue="updateFormValue('channelId', $event)"
        :options="channels"
        :error-message="errors.channelId"
        :label="t('campaign.channel')"
        class="w-full"
        :disabled="disabled"
      >
        <template #icon>
          <ChannelIcon class="dark:fill-white w-4 h-4" />
        </template>
      </AppSelect>

      <AppSelect
        :modelValue="form.status.value"
        @update:modelValue="updateFormValue('status', $event)"
        :options="statusOptions"
        :error-message="errors.status"
        :label="t('general.status')"
        class="w-full"
        :disabled="disabled"
      >
        <template #icon>
          <StatusIcon class="dark:fill-white w-4 h-4" />
        </template>
      </AppSelect>
    </div>


    <!-- Campos de programación (scheduling) -->
    <div class="grid grid-cols-1 lg:grid-cols-10 gap-4">


        <div class="grid grid-cols-1 justify-center items-center lg:col-span-3">
          <div class="flex flex-col items-center">
            <p class="text-gray-700 dark:text-neutral-300">{{ t('campaign.duration') }}</p>
          </div>
          <div class="grid grid-cols-1 gap-2">
            <AppDatePicker
              :modelValue="form.startDate.value"
              @update:modelValue="updateFormValue('startDate', $event)"
              :errorMessage="errors.startDate"
            >
              <template #icon>
                <DateStartIcon class="dark:fill-white w-4 h-4" />
              </template>
            </AppDatePicker>

            <AppDatePicker
              :modelValue="form.endDate.value"
              @update:modelValue="updateFormValue('endDate', $event)"
              :errorMessage="errors.endDate"
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
              :modelValue="form.days.value"
              @update:modelValue="updateFormValue('days', $event)"
              :options="daysOptions"
              :errorMessage="errors.days"
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
              :modelValue="form.time.value"
              @update:modelValue="updateFormValue('time', $event)"
              class="w-full"
              :errorMessage="errors.time"
            />
          </div>
        </div>
      </div>
    </div>
</template>
