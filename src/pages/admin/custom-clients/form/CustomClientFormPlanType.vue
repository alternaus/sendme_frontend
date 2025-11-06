<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'

import RadioButton from 'primevue/radiobutton'

import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import type { SelectOption } from '@/components/atoms/selects/types/select-option.types'
import type { CustomClientFormData } from '@/composables/useCustomClientForm'
import { usePlanService } from '@/services/organization/usePlanService'

interface Props {
  form: Record<keyof CustomClientFormData, { value: unknown }>
  errors: Record<string, string | undefined>
}

interface Emits {
  (e: 'update:form', field: keyof CustomClientFormData, value: unknown): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { listPlans } = usePlanService()

const availablePlans = ref<SelectOption[]>([])
const isLoadingPlans = ref(false)

const planType = computed({
  get: () => props.form.planType.value as 'existing' | 'custom',
  set: (value) => emit('update:form', 'planType', value),
})

const selectedPlanId = computed({
  get: () => props.form.selectedPlanId.value as string | undefined,
  set: (value) => emit('update:form', 'selectedPlanId', value),
})

const loadPlans = async () => {
  isLoadingPlans.value = true
  try {
    const plans = await listPlans()
    availablePlans.value = plans.map(plan => ({
      name: plan.name,
      value: plan.id,
    }))
  } catch (error) {
    console.error('Error loading plans:', error)
    availablePlans.value = []
  } finally {
    isLoadingPlans.value = false
  }
}

onMounted(() => {
  loadPlans()
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-4">
      <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {{ $t('custom_clients.form.plan_type.title') }}
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ $t('custom_clients.form.plan_type.subtitle') }}
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        class="flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all"
        :class="{
          'border-primary-500 bg-primary-50 dark:bg-primary-900/20': planType === 'existing',
          'border-gray-300 dark:border-gray-600 hover:border-gray-400': planType !== 'existing',
        }"
        @click="planType = 'existing'"
      >
        <RadioButton v-model="planType" value="existing" />
        <div class="flex flex-col">
          <span class="font-medium text-gray-900 dark:text-gray-100">
            {{ $t('custom_clients.form.plan_type.existing') }}
          </span>
          <span class="text-sm text-gray-600 dark:text-gray-400">
            {{ $t('custom_clients.form.plan_type.existing_description') }}
          </span>
        </div>
      </div>

      <div
        class="flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all"
        :class="{
          'border-primary-500 bg-primary-50 dark:bg-primary-900/20': planType === 'custom',
          'border-gray-300 dark:border-gray-600 hover:border-gray-400': planType !== 'custom',
        }"
        @click="planType = 'custom'"
      >
        <RadioButton v-model="planType" value="custom" />
        <div class="flex flex-col">
          <span class="font-medium text-gray-900 dark:text-gray-100">
            {{ $t('custom_clients.form.plan_type.custom') }}
          </span>
          <span class="text-sm text-gray-600 dark:text-gray-400">
            {{ $t('custom_clients.form.plan_type.custom_description') }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="planType === 'existing'" class="flex flex-col gap-2">
      <AppSelect
        v-model="selectedPlanId"
        :options="availablePlans"
        :label="$t('custom_clients.form.plan_type.select_plan')"
        :placeholder="$t('custom_clients.form.plan_type.select_plan_placeholder')"
        :errorMessage="errors.selectedPlanId"
        :loading="isLoadingPlans"
        autocomplete="off"
        required
      />
    </div>
  </div>
</template>
