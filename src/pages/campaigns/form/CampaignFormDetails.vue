<script lang="ts">
import { defineComponent, type PropType } from 'vue'

import { useI18n } from 'vue-i18n'

import DateEndIcon from '@/assets/svg/date_end.svg?component'
import DateStartIcon from '@/assets/svg/date_start.svg?component'
import AppSelectButton from '@/components/atoms/buttons/AppSelectButton.vue'
import type { SelectButtonOption } from '@/components/atoms/buttons/types/select-button-options.type'
import AppCard from '@/components/atoms/cards/AppCard.vue'
import AppDatePicker from '@/components/atoms/datepickers/AppDatePicker.vue'
import AppTimePicker from '@/components/atoms/datepickers/AppTimePicker.vue'

import type { CampaignFormRef } from '../composables/useCampaignForm'

export default defineComponent({
  components: {
    AppCard,
    AppDatePicker,
    AppTimePicker,
    AppSelectButton,
    DateStartIcon,
    DateEndIcon,
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
      emit('update:form', { ..._, [key]: { value } })
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
  <AppCard>
    <template #content>
      <div class="grid grid-cols-1 lg:grid-cols-11 gap-4">
        <div class="flex-col items-center justify-center col-span-1 hidden lg:flex">
          <p
            class="w-10 h-10 flex items-center justify-center rounded-full border border-gray-400 text-lg font-bold"
          >
            1
          </p>
          <p class="text-center mt-2 font-medium">{{ t('campaign.details') }}</p>
        </div>

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
    </template>
  </AppCard>
</template>
