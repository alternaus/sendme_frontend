<template>
  <div class="payment-provider-selector">
    <div v-if="loading" class="flex justify-center items-center py-8">
      <i class="pi pi-spin pi-spinner text-2xl text-[var(--p-primary-color)]"></i>
      <span class="ml-2 text-sm text-surface-600">{{ $t('payment.loading_providers') }}</span>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <i class="pi pi-exclamation-triangle text-3xl text-red-500 mb-4"></i>
      <p class="text-red-500 mb-4">{{ error }}</p>
      <AppButton
        :label="$t('general.retry')"
        @click="loadProviders"
        severity="secondary"
        size="small"
      />
    </div>

    <div v-else-if="availableProviders.length > 0" class="space-y-4">
      <div class="flex flex-wrap gap-4 justify-center">
        <div
          v-for="provider in availableProviders"
          :key="provider.id"
          :disabled="processing"
          @click="handleProviderClick(provider)"
          class="cursor-pointer p-2 bg-surface-0 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
          :class="{ 'opacity-50 cursor-not-allowed': processing }"
        >
          <img
            :src="provider.logo"
            :alt="provider.displayName"
            class="h-8 w-auto object-contain"
            @error="onImageError"
          />
        </div>
      </div>

      <div v-if="processing" class="mt-4 text-center">
        <p class="text-surface-600 dark:text-surface-400">
          {{ $t('payment.processing_payment') }}
        </p>
      </div>
    </div>

    <div v-else class="text-center py-8">
      <i class="pi pi-info-circle text-3xl text-surface-400 mb-4"></i>
      <p class="text-surface-600 dark:text-surface-400 mb-4">
        {{ $t('payment.no_providers_available') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import { usePaymentHandler } from '@/pages/enrollment/composables/usePaymentHandler'
import type { IPaymentProvider } from '@/services/payment-provider'
import type { PaymentResult } from '@/services/payment-provider/strategies/PaymentStrategy.interface'

interface Props {
  amount: number
  currency: string
  customerInfo: {
    name: string
    email: string
    dni: string
    company?: string
  }
  planInfo: {
    id: string | number
    name: string
    features: string[]
  }
}

interface PaymentError {
  message: string
  code?: string
  provider?: string
}

interface Emits {
  (e: 'payment-success', result: PaymentResult): void
  (e: 'payment-error', error: PaymentError): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const {
  availableProviders,
  loading,
  error,
  processing,
  loadProviders,
  selectProvider,
  processPayment
} = usePaymentHandler()

const handleProviderClick = async (provider: IPaymentProvider) => {
  if (processing.value) return

  try {
    await selectProvider(provider)

    const paymentData = {
      planId: props.planInfo.id.toString(),
      planName: props.planInfo.name,
      amount: props.amount,
      currency: props.currency,
      customerInfo: {
        name: props.customerInfo.name,
        email: props.customerInfo.email,
        dni: props.customerInfo.dni,
        company: props.customerInfo.company || '',
        phone: ''
      }
    }

    const result = await processPayment(paymentData)

    if (result.success) {
      emit('payment-success', result)
    } else {
      emit('payment-error', {
        message: result.message || 'Payment failed',
        provider: result.provider
      })
    }
  } catch (error) {
    emit('payment-error', { message: error instanceof Error ? error.message : 'Payment failed' })
  }
}

const onImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'

  const placeholder = document.createElement('div')
  placeholder.className = 'h-8 w-20 bg-surface-200 dark:bg-surface-600 rounded flex items-center justify-center text-surface-500 dark:text-surface-400 text-xs font-medium'
  placeholder.textContent = 'Logo'

  img.parentNode?.insertBefore(placeholder, img)
}

onMounted(() => {
  loadProviders()
})
</script>

<style scoped>
/* Estilos simplificados */
</style>
