<script lang="ts">
import { computed, defineComponent } from 'vue'

import DateIcon from '@/assets/svg/date.svg?component'
import SearchIcon from '@/assets/svg/search.svg?component'
import AppCard from '@/components/atoms/cards/AppCard.vue'
import AppDatePicker from '@/components/atoms/datepickers/AppDatePicker.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'



export default defineComponent({
  name: 'CardFilterDispatches',
  components: {
    AppCard,
    AppInput,
    AppDatePicker,
    SearchIcon,
    DateIcon,
  },
  props: {
    search: String,
    campaignId: String,
    startDate: String,
    endDate: String,
  },
  emits: [
    'update:search',
    'update:campaignId',
    'update:startDate',
    'update:endDate',
  ],
  setup(props, { emit }) {
    const updateField = (field: 'startDate' | 'endDate' | 'search' | 'campaignId', value: unknown) => {
      emit(`update:${field}`, value as string | null | Date)
    }

    const startDateValue = computed(() => (props.startDate ? new Date(props.startDate) : null))
    const endDateValue = computed(() => (props.endDate ? new Date(props.endDate) : null))

    return {
      updateField,
      startDateValue,
      endDateValue,
    }
  },
})
</script>
<template>
  <AppCard>
    <template #content>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <AppInput
          :modelValue="search"
          type="text"
          class="w-full rounded-md mt-3"
          :label="$t('general.search')"
          @input="updateField('search', $event.target.value)"
        >
          <template #icon>
            <SearchIcon class="w-4 h-4 dark:fill-white" />
          </template>
        </AppInput>

        <AppDatePicker
          placeholder=""
          class="w-full mt-3"
          :modelValue="startDateValue"
          :showTime="true"
          :label="$t('general.start_date')"
          @update:modelValue="updateField('startDate', $event)"
        >
          <template #icon>
            <DateIcon class="w-4 h-4 dark:fill-white" />
          </template>
        </AppDatePicker>

        <AppDatePicker
          placeholder=""
          class="w-full mt-3"
          :modelValue="endDateValue"
          :showTime="true"
          :label="$t('general.end_date')"
          @update:modelValue="updateField('endDate', $event)"
        >
          <template #icon>
            <DateIcon class="w-4 h-4 dark:fill-white" />
          </template>
        </AppDatePicker>
      </div>
    </template>
  </AppCard>
</template>
