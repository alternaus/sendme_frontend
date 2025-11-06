<template>
  <div class="space-y-6">
    <div class="text-center mb-6">
      <h3 class="text-xl font-semibold mb-2">{{ $t('custom_clients.form.custom_plan.title') }}</h3>
      <p class="text-muted-foreground">{{ $t('custom_clients.form.custom_plan.subtitle') }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AppInput v-model="plan.planName" :label="$t('custom_clients.form.custom_plan.plan_name')" required class="md:col-span-2" />
      <AppInputNumber v-model="plan.subscriptionPrice" :label="$t('custom_clients.form.custom_plan.subscription_price')" required />
      <AppInputNumber v-model="plan.includedMessages" :label="$t('custom_clients.form.custom_plan.included_messages')" required />
      <AppInputNumber v-model="plan.messagePrice" :label="$t('custom_clients.form.custom_plan.message_price')" required />
      <AppInputNumber v-model="plan.resetDay" :label="$t('custom_clients.form.custom_plan.reset_day')" :min="1" :max="31" required />
      <div class="md:col-span-2 mt-4"><h4 class="font-semibold">{{ $t('custom_clients.form.custom_plan.limits_section') }}</h4></div>
      <AppInputNumber v-model="plan.campaignLimit" :label="$t('custom_clients.form.custom_plan.campaign_limit')" />
      <AppInputNumber v-model="plan.contactLimit" :label="$t('custom_clients.form.custom_plan.contact_limit')" />
      <AppInputNumber v-model="plan.tagLimit" :label="$t('custom_clients.form.custom_plan.tag_limit')" />
      <AppInputNumber v-model="plan.customFieldLimit" :label="$t('custom_clients.form.custom_plan.custom_field_limit')" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, watch } from 'vue'

import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppInputNumber from '@/components/atoms/inputs/AppInputNumber.vue'
import type { ICustomPlanFormData } from '@/services/custom-client/interfaces/create-client.interface'

const props = defineProps<{ modelValue: ICustomPlanFormData }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: ICustomPlanFormData): void }>()

const plan = reactive<ICustomPlanFormData>({
  planName: '', subscriptionPrice: 0, includedMessages: 0, messagePrice: 50,
  resetDay: 1, campaignLimit: 100, contactLimit: 50000, tagLimit: 50, customFieldLimit: 20
})

watch(() => props.modelValue, (v) => Object.assign(plan, v), { immediate: true, deep: true })
watch(plan, () => emit('update:modelValue', { ...plan }), { deep: true })
</script>
