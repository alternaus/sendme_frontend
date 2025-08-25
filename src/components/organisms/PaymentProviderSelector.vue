<template>
  <div class="payment-providers-selector">
    <div class="mb-6">
      <h3 class="text-surface-900 dark:text-surface-0 font-bold text-lg mb-2">
        {{ $t('payment.select_provider') }}
      </h3>
      <p class="text-surface-500 dark:text-surface-400 text-sm">
        {{ $t('payment.click_to_pay') }}
      </p>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-8">
      <i class="pi pi-spin pi-spinner text-4xl text-[var(--p-primary-color)]"></i>
    </div>

    <div v-else-if="error" class="flex flex-col gap-4 items-center justify-center py-8">
      <i class="pi pi-exclamation-triangle text-4xl text-red-500"></i>
      <p class="text-red-500 font-bold text-center">{{ error }}</p>
      <Button
        :label="$t('general.retry')"
        @click="loadAvailableProviders"
        severity="secondary"
        size="small"
      />
    </div>

    <div v-else-if="availableProviders.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="provider in availableProviders"
        :key="provider.id"
        class="provider-card bg-surface-0 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-[var(--p-primary-color)] hover:-translate-y-1"
        @click="handleProviderClick(provider)"
      >
        <div class="flex justify-center items-center h-16 mb-4">
          <img
            :src="provider.logo"
            :alt="provider.displayName"
            class="max-h-12 w-auto object-contain"
            @error="onImageError"
          />
        </div>

        <div class="text-center">
          <h4 class="font-bold text-surface-900 dark:text-surface-0 text-lg">
            {{ provider.displayName }}
          </h4>

          <div v-if="provider.testMode" class="mt-2">
            <span class="inline-flex items-center px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
              <i class="pi pi-flask mr-1"></i>
              {{ $t('payment.test_mode') }}
            </span>
          </div>
        </div>

        <div class="mt-4 text-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span class="text-sm text-[var(--p-primary-color)] font-medium">
            {{ $t('payment.click_to_continue') }}
          </span>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col gap-4 items-center justify-center py-16">
      <i class="pi pi-info-circle text-4xl text-surface-400"></i>
      <p class="text-surface-600 dark:text-surface-400 text-center">
        {{ $t('payment.no_providers_available') }}
      </p>
      <Button
        :label="$t('general.retry')"
        @click="loadAvailableProviders"
        severity="secondary"
        size="small"
      />
    </div>

    <div v-if="processing" class="mt-6 p-4 bg-[var(--p-primary-50)] dark:bg-[var(--p-primary-900)]/20 border border-[var(--p-primary-200)] dark:border-[var(--p-primary-800)] rounded-lg">
      <div class="flex items-center gap-3">
        <i class="pi pi-spin pi-spinner text-[var(--p-primary-color)]"></i>
        <div>
          <p class="font-medium text-surface-900 dark:text-surface-0">
            {{ $t('payment.processing_payment') }}
          </p>
          <p class="text-sm text-surface-600 dark:text-surface-400">
            {{ $t('payment.redirecting_provider') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import Button from 'primevue/button'

import { usePaymentProviders } from '@/composables/usePaymentProviders'
import type { IPaymentProvider } from '@/services/payment-provider'

interface Props {
  autoLoad?: boolean
  amount: number
  currency: string
  customerInfo: {
    name: string
    email: string
    company: string
  }
  planInfo: {
    id: string | number
    name: string
    features: string[]
  }
}

interface Emits {
  (e: 'payment-success', data: { transactionId?: string; id?: string; provider?: string; amount?: number; currency?: string }): void
  (e: 'payment-error', error: { message?: string; code?: string; provider?: string }): void
}

const props = withDefaults(defineProps<Props>(), {
  autoLoad: true
})

const emit = defineEmits<Emits>()
const processing = ref(false)

const {
  availableProviders,
  loading,
  error,
  loadAvailableProviders,
  selectProvider,
  processPayment
} = usePaymentProviders()

const handleProviderClick = async (provider: IPaymentProvider) => {
  try {
    processing.value = true

    if (!props.customerInfo.name || !props.customerInfo.email || !props.customerInfo.company) {
      emit('payment-error', { provider: provider.name })
      return
    }

    await selectProvider(provider)

    const paymentData = {
      amount: props.amount,
      currency: props.currency,
      planId: props.planInfo.id.toString(),
      planName: props.planInfo.name,
      customerInfo: {
        name: props.customerInfo.name,
        email: props.customerInfo.email,
        company: props.customerInfo.company,
        phone: ''
      }
    }

    const result = await processPayment(paymentData)

    if (result.success) {
      emit('payment-success', {
        transactionId: result.transactionId,
        provider: result.provider,
        amount: props.amount,
        currency: props.currency
      })
    } else {
      emit('payment-error', {
        message: result.message,
        provider: provider.name
      })
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido en el pago'
    emit('payment-error', {
      message: errorMessage,
      code: 'PROCESSING_ERROR',
      provider: provider.name
    })
  } finally {
    processing.value = false
  }
}

const onImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'

  const placeholder = document.createElement('div')
  placeholder.className = 'h-12 w-full bg-surface-200 dark:bg-surface-700 rounded flex items-center justify-center text-surface-600 dark:text-surface-400 text-sm font-medium'
  placeholder.textContent = 'Logo'

  img.parentNode?.insertBefore(placeholder, img)
}

onMounted(async () => {
  if (props.autoLoad) {
    await loadAvailableProviders()
  }
})

defineExpose({
  loadAvailableProviders
})
</script>

<style scoped>
.provider-card {
  position: relative;
  overflow: hidden;
}

.provider-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
}

.provider-card:hover .group-hover\:opacity-100 {
  opacity: 1;
}

.dark .provider-card:hover {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.provider-card.processing {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  pointer-events: none;
}
</style>
