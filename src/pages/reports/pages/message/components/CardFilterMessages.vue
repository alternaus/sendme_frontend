<script lang="ts">
import { computed, defineComponent } from 'vue'

import DateIcon from '@/assets/svg/date.svg?component'
import ModuleIcon from '@/assets/svg/module.svg?component'
import SearchIcon from '@/assets/svg/search.svg?component'
import StatusIcon from '@/assets/svg/status.svg?component'
import AppCard from '@/components/atoms/cards/AppCard.vue'
import AppDatePicker from '@/components/atoms/datepickers/AppDatePicker.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'

import { TypeMessageTypes } from '../enums/message-types.enum'
import { StatusMessageTypes } from '../enums/status-types.enum'
export default defineComponent({
  name: 'CardFilterMessages',
  components: {
    AppCard,
    AppSelect,
    AppInput,
    AppDatePicker,
    SearchIcon,
    StatusIcon,
    DateIcon,
    ModuleIcon,
  },
  props: {
    content: String,
    status: String,
    messageType: String,
    startDate: String,
    endDate: String,
  },
  emits: [
    'update:content',
    'update:status',
    'update:messageType',
    'update:startDate',
    'update:endDate',
  ],
  setup(props, { emit }) {
    const updateField = (field: 'startDate' | 'endDate' | 'content' | 'status' | 'messageType', value: unknown) => {
      emit(`update:${field}`, value as string | null | Date)
    }

    const startDateValue = computed(() => (props.startDate ? new Date(props.startDate) : null))
    const endDateValue = computed(() => (props.endDate ? new Date(props.endDate) : null))

    return {
      StatusMessageTypes,
      TypeMessageTypes,
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
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        <AppInput
          :modelValue="content"
          type="tel"
          class="w-full rounded-md mt-3"
          :label="$t('common.general.search')"
          @input="updateField('content', $event.target.value)"
        >
          <template #icon>
            <SearchIcon class="w-4 h-4 dark:fill-white" />
          </template>
        </AppInput>
        <AppSelect
          class="w-full mt-3"
          :modelValue="status"
          :options="
            Object.entries(StatusMessageTypes).map(([key, value]) => ({
              value: key,
              name: $t(value),
            }))
          "
          :label="$t('common.general.status')"
          @update:modelValue="updateField('status', $event)"
        >
          <template #icon>
            <StatusIcon class="w-6 h-4 dark:fill-white" />
          </template>
        </AppSelect>
        <AppSelect
          class="w-full mt-3"
          :modelValue="messageType"
          :options="
            Object.entries(TypeMessageTypes).map(([key, value]) => ({
              value: key,
              name: $t(value),
            }))
          "
          :label="$t('common.general.message_type')"
          @update:modelValue="updateField('messageType', $event)"
        >
          <template #icon>
            <ModuleIcon class="w-6 h-4 dark:fill-white" />
          </template>
        </AppSelect>
        <AppDatePicker

          class="w-full mt-3"
          :modelValue="startDateValue"
          :showTime="true"
          :label="$t('common.general.start_date')"
          @update:modelValue="updateField('startDate', $event)"
        >
          <template #icon>
            <DateIcon class="w-4 h-4 dark:fill-white" />
          </template>
        </AppDatePicker>
        <AppDatePicker

          class="w-full mt-3"
          :modelValue="endDateValue"
          :showTime="true"
          :label="$t('common.general.end_date')"
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
