<script lang="ts" setup>
import { computed, watch } from 'vue'

import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import type { CustomClientFormData } from '@/composables/useCustomClientForm'

interface Props {
  form: Record<keyof CustomClientFormData, { value: unknown }>
  errors: Record<string, string | undefined>
}

interface Emits {
  (e: 'update:form', field: keyof CustomClientFormData, value: unknown): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const planName = computed({
  get: () => props.form.planName.value as string,
  set: (value) => emit('update:form', 'planName', value),
})

const subscriptionPrice = computed({
  get: () => props.form.subscriptionPrice.value as number,
  set: (value) => emit('update:form', 'subscriptionPrice', value),
})

const includedMessages = computed({
  get: () => props.form.includedMessages.value as number,
  set: (value) => emit('update:form', 'includedMessages', value),
})

const messagePrice = computed({
  get: () => props.form.messagePrice.value as number,
  set: (value) => emit('update:form', 'messagePrice', value),
})

const resetDay = computed({
  get: () => props.form.resetDay.value as number,
  set: (value) => emit('update:form', 'resetDay', value),
})

const campaignLimit = computed({
  get: () => props.form.campaignLimit.value as number,
  set: (value) => emit('update:form', 'campaignLimit', value),
})

const contactLimit = computed({
  get: () => props.form.contactLimit.value as number,
  set: (value) => emit('update:form', 'contactLimit', value),
})

const tagLimit = computed({
  get: () => props.form.tagLimit.value as number,
  set: (value) => emit('update:form', 'tagLimit', value),
})

const customFieldLimit = computed({
  get: () => props.form.customFieldLimit.value as number,
  set: (value) => emit('update:form', 'customFieldLimit', value),
})

const formatCurrency = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) || 0 : value
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num)
}

const displaySubscriptionPrice = computed(() => formatCurrency(subscriptionPrice.value))
const displayMessagePrice = computed(() => formatCurrency(messagePrice.value))

const dayOptions = Array.from({ length: 31 }, (_, i) => ({
  name: `Día ${i + 1}`,
  value: i + 1
}))

watch([subscriptionPrice, messagePrice], () => {
  if (subscriptionPrice.value > 0 && messagePrice.value > 0) {
    const calculated = Math.floor(subscriptionPrice.value / messagePrice.value)
    includedMessages.value = calculated
  }
})

</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-4">
      <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {{ $t('custom_clients.form.custom_plan.title') }}
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ $t('custom_clients.form.custom_plan.subtitle') }}
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="md:col-span-2">
        <AppInput
          v-model="planName"
          :label="$t('custom_clients.form.custom_plan.plan_name')"
          :placeholder="$t('custom_clients.form.custom_plan.plan_name_placeholder')"
          :errorMessage="errors.planName"
          required
        />
      </div>

      <div class="relative">
        <AppInput
          v-model="subscriptionPrice"
          type="number"
          :label="$t('custom_clients.form.custom_plan.subscription_price')"
          :placeholder="$t('custom_clients.form.custom_plan.subscription_price_placeholder')"
          :errorMessage="errors.subscriptionPrice"
          required
        />
        <div class="absolute top-9 right-3 text-sm text-gray-500 pointer-events-none">
          {{ displaySubscriptionPrice }}
        </div>
      </div>

      <AppInput
        v-model="includedMessages"
        type="number"
        :label="$t('custom_clients.form.custom_plan.included_messages')"
        :placeholder="$t('custom_clients.form.custom_plan.included_messages_placeholder')"
        :errorMessage="errors.includedMessages"
        disabled
      />

      <div class="relative">
        <AppInput
          v-model="messagePrice"
          type="number"
          :label="$t('custom_clients.form.custom_plan.message_price')"
          :placeholder="$t('custom_clients.form.custom_plan.message_price_placeholder')"
          :errorMessage="errors.messagePrice"
          required
        />
        <div class="absolute top-9 right-3 text-sm text-gray-500 pointer-events-none">
          {{ displayMessagePrice }}
        </div>
      </div>

      <AppSelect
        v-model="resetDay"
        :options="dayOptions"
        :label="$t('custom_clients.form.custom_plan.reset_day')"
        :errorMessage="errors.resetDay"
        required
      />

      <AppInput
        v-model="campaignLimit"
        type="number"
        :label="$t('custom_clients.form.custom_plan.campaign_limit')"
        :placeholder="$t('custom_clients.form.custom_plan.campaign_limit_placeholder')"
        :errorMessage="errors.campaignLimit"
        required
      />

      <AppInput
        v-model="contactLimit"
        type="number"
        :label="$t('custom_clients.form.custom_plan.contact_limit')"
        :placeholder="$t('custom_clients.form.custom_plan.contact_limit_placeholder')"
        :errorMessage="errors.contactLimit"
        required
      />

      <AppInput
        v-model="tagLimit"
        type="number"
        :label="$t('custom_clients.form.custom_plan.tag_limit')"
        :placeholder="$t('custom_clients.form.custom_plan.tag_limit_placeholder')"
        :errorMessage="errors.tagLimit"
        required
      />

      <AppInput
        v-model="customFieldLimit"
        type="number"
        :label="$t('custom_clients.form.custom_plan.custom_field_limit')"
        :placeholder="$t('custom_clients.form.custom_plan.custom_field_limit_placeholder')"
        :errorMessage="errors.customFieldLimit"
        required
      />
    </div>
  </div>
</template>
