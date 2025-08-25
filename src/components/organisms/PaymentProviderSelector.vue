<template>
  <div class="payment-providers-selector">
    <div v-if="loading" class="flex justify-center py-4">
      <i class="pi pi-spin pi-spinner text-2xl text-[var(--p-primary-color)]"></i>
    </div>

    <div v-else-if="error" class="text-center py-4">
      <p class="text-red-500 mb-4">{{ error }}</p>
      <AppButton
        :label="$t('general.retry')"
        @click="loadAvailableProviders"
        variant="secondary"
      />
    </div>

    <div v-else-if="availableProviders.length > 0" class="flex flex-wrap gap-4 justify-center">
      <div
        v-for="provider in availableProviders"
        :key="provider.id"
        :disabled="processing"
        @click="handleProviderClick(provider)"
        class="cursor-pointer p-2 bg-surface-0 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

    <div v-else class="text-center py-8">
      <p class="text-surface-600 dark:text-surface-400 mb-4">
        {{ $t('payment.no_providers_available') }}
      </p>
      <AppButton
        :label="$t('general.retry')"
        @click="loadAvailableProviders"
        variant="secondary"
      />
    </div>

    <div v-if="processing" class="mt-4 text-center">
      <p class="text-surface-600 dark:text-surface-400">
        {{ $t('payment.processing_payment') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import { usePaymentProviders } from '@/composables/usePaymentProviders'
import type { IPaymentProvider } from '@/services/payment-provider'

interface Emits {
  (e: 'payment-success', data: { transactionId?: string; id?: string; provider?: string; amount?: number; currency?: string }): void
  (e: 'payment-error', error: { message?: string; code?: string; provider?: string }): void
}

const emit = defineEmits<Emits>()

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


const props = withDefaults(defineProps<Props>(), {
  autoLoad: true
})

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
  placeholder.className = 'h-12 w-20 bg-surface-200 dark:bg-surface-600 rounded flex items-center justify-center text-surface-500 dark:text-surface-400 text-xs font-medium'
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
/* Estilos simplificados */
</style>
