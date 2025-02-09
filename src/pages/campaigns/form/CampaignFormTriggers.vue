<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue'
import AppCard from '@/components/atoms/cards/AppCard.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import AppButton from '@/components/atoms/buttons/AppButton.vue'
import DeleteIcon from '@/assets/svg/table-actions/delete.svg?component'
import type { CampaignFormRef, CampaignRule } from '../composables/useCampaignForm'
import type { SelectOption } from '@/components/atoms/selects/types/select-option.types'

export default defineComponent({
  components: {
    AppCard,
    AppInput,
    AppSelect,
    AppButton,
    DeleteIcon,
  },
  props: {
    form: {
      type: Object as PropType<CampaignFormRef>,
      required: true,
    },
    conditionOptions: {
      type: Array as PropType<SelectOption[]>,
      required: true,
    },
    addRule: {
      type: Function as PropType<() => void>,
      required: true,
    },
    removeRule: {
      type: Function as PropType<(index: number) => void>,
      required: true,
    },
    errors: {
      type: Object as PropType<Record<string, string>>,
      required: true,
    },
  },
  setup(props) {
    const campaignRules = computed<CampaignRule[]>(() =>
      props.form.campaignRules.value.map((entry) => entry.value),
    )

    const getError = (index: number, field: string) => {
      const errorKey = `campaignRules[${index}].${field}`
      return props.errors?.[errorKey] || ''
    }

    return {
      campaignRules,
      getError,
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
            2
          </p>
          <p class="text-center mt-2 font-medium">Activadores</p>
        </div>

        <div class="lg:col-span-11 flex flex-col justify-center items-center gap-4">
          <div
            v-for="(rule, index) in campaignRules"
            :key="index"
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-8 justify-center items-center gap-2 w-full"
          >
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--p-primary-color)] text-black font-bold mx-auto"
            >
              {{ index + 1 }}
            </div>

            <AppSelect
              class="w-full sm:col-span-1 md:col-span-1 lg:col-span-2"
              v-model="rule.customFieldId"
              :options="[]"
              :errorMessage="getError(index, 'customFieldId')"
              placeholder="Seleccione un campo"
            />

            <AppSelect
              class="w-full sm:col-span-1 md:col-span-1 lg:col-span-2"
              v-model="rule.conditionType"
              :options="conditionOptions"
              :errorMessage="getError(index, 'conditionType')"
              placeholder="Seleccione el tipo de condición"
            />

            <AppInput
              class="w-full sm:col-span-2 md:col-span-1 lg:col-span-2"
              v-model="rule.value"
              :errorMessage="getError(index, 'value')"
              placeholder="Valor"
            />

            <div class="w-8 h-8 mx-auto rounded-lg flex items-center justify-center">
              <DeleteIcon
                class="w-8 h-8 fill-red-500 dark:fill-red-400 cursor-pointer"
                @click="removeRule(index)"
              />
            </div>
          </div>

          <AppButton class="!w-auto" label="Agregar Activador" @click="addRule" />
        </div>
      </div>
    </template>
  </AppCard>
</template>
