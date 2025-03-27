<script lang="ts">
import { defineComponent } from 'vue'

import { useI18n } from 'vue-i18n'

import ActionIcon from '@/assets/svg/action.svg?component'
import DateIcon from '@/assets/svg/date.svg?component'
import ModuleIcon from '@/assets/svg/module.svg?component'
import SearchIcon from '@/assets/svg/search.svg?component'
import AppCard from '@/components/atoms/cards/AppCard.vue'
import AppDatePicker from '@/components/atoms/datepickers/AppDatePicker.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'

import { ActionAuditTypes } from '../enums/action-types.enum.ts'
import { ModuleTypes } from '../enums/module-types.enum'

export default defineComponent({
  name: 'CardFilterAudit',
  components: {
    AppCard,
    AppSelect,
    AppInput,
    AppDatePicker,
    ActionIcon,
    ModuleIcon,
    DateIcon,
    SearchIcon,
  },
  props: {
    action: String,
    table: String,
    startDate: String,
    endDate: String,
    search: String,
  },
  emits: ['update:action', 'update:table', 'update:startDate', 'update:endDate', 'update:search'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const updateField = (field: string, value: unknown) => {
      emit(`update:${field}`, value as string | null | Date)
    }

    return {
      ActionAuditTypes,
      ModuleTypes,
      updateField,
      t
    }
  },
})
</script>

<template>
  <AppCard>
    <template #content>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        <AppInput
          :modelValue="search"
          type="tel"
          class="w-full rounded-md mt-3"
          :label="$t('general.search')"
          @input="updateField('search', $event.target.value)"
        >
          <template #icon>
            <SearchIcon class="w-4 h-4 dark:fill-white" />
          </template>
        </AppInput>
        <AppSelect
          class="w-full mt-3"
          placeholder=""
          :modelValue="action"
          :options="
            Object.entries(ActionAuditTypes).map(([key, value]) => ({ value: key, name: t(value) }))
          "
          :label="$t('general.action')"
          @update:modelValue="updateField('action', $event)"
        >
          <template #icon>
            <ActionIcon class="w-4 h-4 dark:fill-white" />
          </template>
        </AppSelect>
        <AppSelect
          class="w-full mt-3"
          placeholder=""
          :modelValue="table"
          :options="
            Object.entries(ModuleTypes).map(([key, value]) => ({ value: key, name: t(value) }))
          "
          :label="$t('general.module')"
          @update:modelValue="updateField('table', $event)"
        >
          <template #icon>
            <ModuleIcon class="w-4 h-4 dark:fill-white" />
          </template>
        </AppSelect>
        <AppDatePicker
          :modelValue="startDate"
          placeholder=""
          :label="$t('general.start_date')"
          class="w-full mt-3"
          @update:modelValue="updateField('startDate', $event)"
        >
          <template #icon>
            <DateIcon class="w-4 h-4 dark:fill-white" />
          </template>
        </AppDatePicker>
        <AppDatePicker
          :modelValue="endDate"
          placeholder=""
          :label="$t('general.end_date')"
          class="w-full mt-3"
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
