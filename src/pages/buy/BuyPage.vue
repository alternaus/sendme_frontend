<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useToast } from 'primevue/usetoast'

import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import SelectableCard from '@/components/atoms/cards/AppSelectableCard.vue'
import AppInputNumber from '@/components/atoms/inputs/AppInputNumber.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'
import { useAuthStore } from '@/stores/useAuthStore'

import PaymentProviderSelector from '../enrollment/components/PaymentProviderSelector.vue'

const { t } = useI18n()
const toast = useToast()

const auth = useAuthStore()
const { user } = storeToRefs(auth)
const organizationId = computed(() => user.value?.organizationId ?? '')

const defaultValues = ref([
  { id: 1, value: 50000, currency: 'COP' },
  { id: 2, value: 100000, currency: 'COP' },
])
const customValue = ref<number | undefined>()
const selectedValue = ref<number | null>(null)
const showProviders = ref(false)

const customerInfo = ref({ name: '', email: '', dni: '', company: '', phone: '' })

const amount = computed<number>(() => selectedValue.value ?? customValue.value ?? 0)
const isValidAmount = computed(() => amount.value >= 10000 && amount.value <= 500000)

const selectOption = (v: number) => {
  selectedValue.value = selectedValue.value === v ? null : v
  customValue.value = undefined
}

watch(customValue, (nv) => {
  if (nv && nv > 0) selectedValue.value = null
})

const formatCurrency = (valor: number, currency: string) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(valor)

const handlePayClick = () => {
  if (!amount.value || amount.value <= 0) {
    toast.add({
      severity: 'warn',
      summary: t('general.warning'),
      detail: t('general.select_valid_recharge_value'),
      life: 3000
    })
    return
  }

  if (!isValidAmount.value) {
    toast.add({
      severity: 'warn',
      summary: t('general.warning'),
      detail: t('general.minimum_amount'),
      life: 3000
    })
    return
  }

  if (!organizationId.value) {
    toast.add({
      severity: 'warn',
      summary: t('general.warning'),
      detail: 'organizationId requerido',
      life: 3000
    })
    return
  }

  showProviders.value = true
}

const onPaymentSuccess = () => {
  toast.add({
    severity: 'success',
    summary: t('payment.title'),
    detail: t('payment.success'),
    life: 3000
  })
  showProviders.value = false
}

const onPaymentError = (e: { message: string }) => {
  toast.add({
    severity: 'error',
    summary: t('payment.title'),
    detail: e.message,
    life: 4000
  })
}
</script>

<template>
  <AppHeader :icon="IconTypes.BUY" :text="$t('general.buy_messages')" :actions="[]" />

  <div class="flex justify-center items-start gap-8 m-4">
    <div class="flex flex-col items-center w-full max-w-4xl">
      <!-- Header Section -->
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
          {{ $t('general.choose_value_recharge') }}
        </h1>
        <p class="text-base text-neutral-600 dark:text-neutral-400">
          {{ $t('general.choose_value_recharge_description') }}
        </p>
      </div>

      <!-- Value Selection Cards -->
      <div class="flex flex-row justify-center flex-wrap gap-6 mb-8">
        <!-- Predefined Value Cards -->
        <SelectableCard
          v-for="item in defaultValues"
          :key="item.id"
          :selected="selectedValue === item.value"
          @click="selectOption(item.value)"
          class="relative"
        >
          <div class="text-center">
            <div class="text-2xl font-bold text-neutral-900 dark:text-white">
              {{ formatCurrency(item.value, 'COP') }}
            </div>
            <div class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">COP</div>
          </div>
        </SelectableCard>

        <!-- Custom Value Card -->
        <SelectableCard
          :selected="amount > 0 && !selectedValue"
          class="relative"
        >
          <div class="text-center w-full">
            <div class="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              {{ $t('general.custom_value') }}
            </div>

            <AppInputNumber
              v-model="customValue"
              mode="currency"
              currency="COP"
              suffix=" COP"
              locale="es-CO"
              :min="10000"
              :max="500000"
              class="!w-full text-center"
              :placeholder="'0'"
            />

            <div class="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
              {{ $t('general.range_info') }}
            </div>
          </div>
        </SelectableCard>
      </div>

      <!-- Warning Message -->
      <div v-if="customValue && !isValidAmount" class="mb-6">
        <div class="flex items-center gap-2 p-3 border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700 rounded-lg">
          <i class="pi pi-exclamation-triangle text-red-500"></i>
          <span class="text-sm text-red-500 dark:text-red-300">
            {{ $t('general.minimum_amount') }}
          </span>
        </div>
      </div>

      <!-- Payment Button -->
      <AppButton
        :label="amount > 0 ? t('general.pay_amount', { amount: formatCurrency(amount, 'COP') }) : t('general.pay')"
        :disabled="!amount || !isValidAmount || !organizationId"
        class="!w-auto mb-8"
        size="small"
        @click="handlePayClick"
      />

      <!-- Payment Provider Selector -->
      <PaymentProviderSelector
        v-if="showProviders && organizationId"
        :amount="amount"
        currency="COP"
        :customer-info="customerInfo"
        :plan-info="{ id: 'recharge', name: 'Recarga', features: [] }"
        transaction-type="recharge"
        :organization-id="`${organizationId}`"
        @payment-success="onPaymentSuccess"
        @payment-error="onPaymentError"
      />

      <!-- Important Note -->
      <div class="text-left w-full max-w-2xl">
        <div class="text-sm text-neutral-700 dark:text-neutral-300">
          <span class="font-semibold">{{ $t('general.important') }}:</span>
          {{ $t('general.info_remember_recharge') }}
        </div>
      </div>
    </div>
  </div>
</template>
