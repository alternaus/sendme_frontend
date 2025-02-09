<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import AppCard from '@/components/atoms/cards/AppCard.vue'
import AppDatePicker from '@/components/atoms/datepickers/AppDatePicker.vue'
import AppTimePicker from '@/components/atoms/datepickers/AppTimePicker.vue'
import AppSelectButton from '@/components/atoms/buttons/AppSelectButton.vue'
import CampaignStartIcon from '@/assets/svg/campaign_start.svg?component'
import CampaignEndIcon from '@/assets/svg/campaign_end.svg?component'
import type { CampaignFormRef } from '../composables/useCampaignForm'
import type { SelectButtonOption } from '@/components/atoms/buttons/types/select-button-options.type'

export default defineComponent({
  components: {
    AppCard,
    AppDatePicker,
    AppTimePicker,
    AppSelectButton,
    CampaignStartIcon,
    CampaignEndIcon,
  },
  props: {
    form: {
      type: Object as PropType<CampaignFormRef>,
      required: true,
    },
    errors: {
      type: Object as PropType<Record<string, string>>,
      required: true,
    },
  },
  setup() {
    const daysOptions: SelectButtonOption[] = [
      { name: 'LU', value: 'MO' },
      { name: 'MA', value: 'TU' },
      { name: 'MI', value: 'WE' },
      { name: 'JU', value: 'TH' },
      { name: 'VI', value: 'FR' },
      { name: 'SA', value: 'SA' },
      { name: 'DO', value: 'SU' },
    ]

    return {
      daysOptions,
    }
  },
})
</script>

<template>
  <AppCard>
    <template #content>
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div class="flex-col items-center justify-center col-span-1 hidden lg:flex">
          <p
            class="w-10 h-10 flex items-center justify-center rounded-full border border-gray-400 text-lg font-bold"
          >
            1
          </p>
          <p class="text-center mt-2 font-medium">Tiempo</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 justify-center items-center lg:col-span-3">
          <div class="flex flex-col items-center">
            <p class="text-gray-700 dark:text-neutral-300">Duración</p>
          </div>
          <div class="grid grid-cols-1 gap-2">
            <AppDatePicker v-model="form.startDate.value" :errorMessage="errors.startDate">
              <template #icon>
                <CampaignStartIcon class="dark:fill-white" />
              </template>
            </AppDatePicker>
            <AppDatePicker v-model="form.endDate.value" :errorMessage="errors.endDate">
              <template #icon>
                <CampaignEndIcon class="dark:fill-white" />
              </template>
            </AppDatePicker>
          </div>
        </div>

        <!-- Días de ejecución -->
        <div class="grid grid-rows-2 items-center justify-center lg:col-span-4">
          <div class="flex flex-col items-center">
            <p class="text-gray-700 dark:text-neutral-300">Días de ejecución</p>
          </div>
          <div class="w-full">
            <AppSelectButton
              v-model="form.days.value"
              :options="daysOptions"
              :errorMessage="errors.days"
            />
          </div>
        </div>

        <!-- Hora de ejecución -->
        <div class="grid grid-rows-2 lg:col-span-4 w-full">
          <div class="flex flex-col justify-center items-center">
            <p class="text-gray-700 dark:text-neutral-300">Hora de ejecución</p>
          </div>
          <div class="w-full flex items-center justify-center">
            <AppTimePicker v-model="form.time.value" class="w-full" :errorMessage="errors.time" />
          </div>
        </div>
      </div>
    </template>
  </AppCard>
</template>
