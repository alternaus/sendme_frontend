<script lang="ts">
import { computed, defineComponent, nextTick, onMounted, type PropType, ref, watch } from 'vue'

import { useI18n } from 'vue-i18n'

import DeleteIcon from '@/assets/svg/table-actions/delete.svg?component'
import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppCard from '@/components/atoms/cards/AppCard.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import type { SelectOption } from '@/components/atoms/selects/types/select-option.types'
import { useCustomFieldService } from '@/services/custom-field/useCustomFieldService'

import type { CampaignFormRef, CampaignRule } from '../composables/useCampaignForm'

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
      type: Object as PropType<Partial<Record<string, string>>>,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n()
    const { getCustomFields } = useCustomFieldService()
    const customFieldsOptions = ref<SelectOption[]>([])
    const touchedFields = ref<Record<number, boolean>>({})

    onMounted(async () => {
      try {
        const response = await getCustomFields()
        customFieldsOptions.value = response.map((customField) => ({
          name: customField.fieldName,
          value: customField.id,
        }))
      } catch (error) {
        console.error('❌ Error al obtener campos personalizados:', error)
      }
    })

    const campaignRules = computed<CampaignRule[]>(() =>
      props.form.campaignRules.value.map((entry) => entry.value),
    )

    // Observar cambios en la cantidad de reglas para actualizar touchedFields
    watch(
      () => campaignRules.value.length,
      () => {
        const newTouchedFields: Record<number, boolean> = {}
        campaignRules.value.forEach((_, index) => {
          // Mantener el estado anterior si existe, false si es nuevo
          newTouchedFields[index] = touchedFields.value[index] || false
        })
        touchedFields.value = newTouchedFields
      },
      { immediate: true }
    )

    const getError = (index: number, field: string) => {
      const errorKey = `campaignRules[${index}].${field}`
      return touchedFields.value[index] ? props.errors?.[errorKey] || '' : ''
    }

    const hasErrors = (index: number) => {
      return touchedFields.value[index] && (
        getError(index, 'customFieldId') ||
        getError(index, 'conditionType') ||
        getError(index, 'value')
      )
    }

    const handleFieldChange = (index: number) => {
      touchedFields.value[index] = true
    }

    const scrollToLastTrigger = async () => {
      await nextTick()
      const lastTrigger = document.querySelector(`[data-field-index="${campaignRules.value.length - 1}"]`)
      if (lastTrigger) {
        lastTrigger.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }

    const handleAddRule = () => {
      props.addRule()
      scrollToLastTrigger()
    }

    const handleRemoveRule = (index: number) => {
      props.removeRule(index)
      // Actualizar los índices después de eliminar
      const newTouchedFields: Record<number, boolean> = {}
      Object.entries(touchedFields.value).forEach(([key, value]) => {
        const numKey = Number(key)
        if (numKey < index) {
          newTouchedFields[numKey] = value
        } else if (numKey > index) {
          newTouchedFields[numKey - 1] = value
        }
      })
      touchedFields.value = newTouchedFields
    }

    return {
      campaignRules,
      customFieldsOptions,
      getError,
      hasErrors,
      handleAddRule,
      handleFieldChange,
      handleRemoveRule,
      t,
    }
  },
})
</script>

<template>
  <AppCard>
    <template #content>
      <div class="flex flex-col h-full">
        <div class="flex-none mb-4">
          <p class="text-center text-neutral-600 dark:text-neutral-300">
            {{ t('campaign.configure_triggers') }}
          </p>
        </div>

        <div class="flex-1 overflow-y-auto mb-4" style="max-height: 300px;">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 auto-rows-min">
            <div v-for="(rule, index) in campaignRules" :key="index"
              :data-field-index="index"
              class="p-4 my-2 bg-neutral-50 dark:bg-neutral-900 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 h-fit"
              :class="{'border border-red-500': hasErrors(index)}">
              <div class="flex flex-col gap-4">
                <div class="flex items-center justify-between">
                  <div
                    class="w-8 h-8 flex items-center justify-center bg-[var(--p-primary-color)] dark:text-black rounded-full font-bold text-sm">
                    {{ index + 1 }}
                  </div>
                  <div class="flex gap-2">
                    <DeleteIcon
                      class="w-6 h-6 fill-red-400 dark:fill-red-300 cursor-pointer"
                      @click="handleRemoveRule(index)"
                    />
                  </div>
                </div>

                <div class="space-y-4 mt-2">
                  <AppSelect
                    v-model="rule.customFieldId"
                    :options="customFieldsOptions"
                    :errorMessage="getError(index, 'customFieldId')"
                    :placeholder="t('campaign.select_field')"
                    class="w-full"
                    @update:modelValue="handleFieldChange(index)" />

                  <AppSelect
                    v-model="rule.conditionType"
                    :options="conditionOptions"
                    :errorMessage="getError(index, 'conditionType')"
                    :placeholder="t('campaign.select_condition')"
                    class="w-full"
                    @update:modelValue="handleFieldChange(index)" />

                  <AppInput
                    v-model="rule.value"
                    :errorMessage="getError(index, 'value')"
                    :placeholder="t('campaign.value')"
                    class="w-full"
                    @update:modelValue="handleFieldChange(index)" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex-none flex justify-center items-center gap-4 py-4">
          <AppButton
            type="button"
            class="!w-fit"
            :label="t('campaign.add_trigger')"
            @click="handleAddRule"
            icon="pi pi-plus" />
        </div>
      </div>
    </template>
  </AppCard>
</template>

<style scoped></style>
