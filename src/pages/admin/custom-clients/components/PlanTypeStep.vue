<template>
  <div class="space-y-6">
    <div class="text-center">
      <h3 class="text-xl font-semibold mb-2">{{ $t('custom_clients.form.plan_type.title') }}</h3>
      <p class="text-muted-foreground">{{ $t('custom_clients.form.plan_type.subtitle') }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        class="border-2 rounded-lg p-6 cursor-pointer transition-all hover:border-primary"
        :class="modelValue === 'existing' ? 'border-primary bg-primary/5' : 'border-border'"
        @click="selectPlanType('existing')"
      >
        <div class="flex items-start space-x-4">
          <div class="flex-shrink-0">
            <i class="pi pi-list text-3xl" :class="modelValue === 'existing' ? 'text-primary' : 'text-muted-foreground'"></i>
          </div>
          <div class="flex-1">
            <h4 class="font-semibold mb-1">{{ $t('custom_clients.form.plan_type.existing') }}</h4>
            <p class="text-sm text-muted-foreground">
              {{ $t('custom_clients.form.plan_type.existing_description') }}
            </p>
          </div>
        </div>
      </div>

      <div
        class="border-2 rounded-lg p-6 cursor-pointer transition-all hover:border-primary"
        :class="modelValue === 'custom' ? 'border-primary bg-primary/5' : 'border-border'"
        @click="selectPlanType('custom')"
      >
        <div class="flex items-start space-x-4">
          <div class="flex-shrink-0">
            <i class="pi pi-cog text-3xl" :class="modelValue === 'custom' ? 'text-primary' : 'text-muted-foreground'"></i>
          </div>
          <div class="flex-1">
            <h4 class="font-semibold mb-1">{{ $t('custom_clients.form.plan_type.custom') }}</h4>
            <p class="text-sm text-muted-foreground">
              {{ $t('custom_clients.form.plan_type.custom_description') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="modelValue === 'existing'" class="mt-6">
      <AppSelect
        v-model="selectedPlan"
        :options="planOptions"
        :label="$t('custom_clients.form.plan_type.select_plan')"
        :placeholder="$t('custom_clients.form.plan_type.select_plan_placeholder')"
        :error="error"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import type { SelectOption } from '@/components/atoms/selects/types/select-option.types'
import { usePlanService } from '@/services/organization/usePlanService'

interface Props {
  modelValue: 'existing' | 'custom'
  selectedPlanId?: string
  error?: string
}

interface Emits {
  (e: 'update:modelValue', value: 'existing' | 'custom'): void
  (e: 'update:selectedPlanId', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedPlan = ref<string>()
const planOptions = ref<SelectOption[]>([])
const { listPlans } = usePlanService()

const selectPlanType = (type: 'existing' | 'custom') => {
  emit('update:modelValue', type)
}

watch(() => props.selectedPlanId, (value) => {
  if (value) {
    selectedPlan.value = value
  }
}, { immediate: true })

watch(selectedPlan, (value) => {
  if (value) {
    emit('update:selectedPlanId', value)
  }
})

const loadPlans = async () => {
  try {
    const plans = await listPlans()
    planOptions.value = plans.map(plan => ({
      name: `${plan.name} - $${plan.cost.toLocaleString()}`,
      value: plan.id
    }))
  } catch {
    planOptions.value = []
  }
}

loadPlans()
</script>
