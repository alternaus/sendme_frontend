<template>
  <div class="payment-strategy-selector">
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-2">
        {{ $t('payment.select_provider') }}
      </h3>
      <p class="text-sm text-surface-600 dark:text-surface-400">
        {{ $t('payment.select_provider_description') }}
      </p>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-8">
      <i class="pi pi-spin pi-spinner text-2xl text-[var(--p-primary-color)]"></i>
      <span class="ml-2 text-sm text-surface-600">
        {{ loadingMessage }}
      </span>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <i class="pi pi-exclamation-triangle text-3xl text-red-500 mb-4"></i>
      <p class="text-red-500 mb-4">{{ error }}</p>
      <AppButton
        :label="$t('general.retry')"
        @click="loadAvailableProviders"
        severity="secondary"
        size="small"
      />
    </div>

    <div v-else-if="availableProviders.length > 0" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="provider in availableProviders"
          :key="provider.id"
          class="provider-card border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md"
          :class="{
            'border-[var(--p-primary-color)] bg-[var(--p-primary-50)] dark:bg-[var(--p-primary-900)]/20':
              selectedProvider?.id === provider.id,
            'border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-800 hover:border-surface-300':
              selectedProvider?.id !== provider.id
          }"
          @click="handleProviderSelection(provider)"
        >
          <div class="flex justify-center mb-4">
            <img
              :src="provider.logo"
              :alt="provider.displayName"
              class="h-12 w-auto object-contain"
              @error="onImageError"
            />
          </div>

          <div class="text-center">
            <h4 class="font-semibold text-surface-900 dark:text-surface-0 mb-2">
              {{ provider.displayName }}
            </h4>
            <p class="text-xs text-surface-600 dark:text-surface-400 mb-3">
              {{ provider.description }}
            </p>

            <div class="text-xs text-surface-500 dark:text-surface-500 mb-2">
              {{ provider.processingTime }}
            </div>

            <div class="flex justify-center gap-1 mb-3">
              <span
                v-for="currency in provider.supportedCurrencies"
                :key="currency"
                class="px-2 py-1 text-xs bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400 rounded"
              >
                {{ currency }}
              </span>
            </div>

            <div v-if="provider.testMode" class="mb-2">
              <span class="inline-flex items-center px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
                <i class="pi pi-flask mr-1"></i>
                {{ $t('payment.test_mode') }}
              </span>
            </div>
          </div>

          <div
            v-if="selectedProvider?.id === provider.id"
            class="absolute top-2 right-2 w-6 h-6 bg-[var(--p-primary-color)] rounded-full flex items-center justify-center"
          >
            <i class="pi pi-check text-white text-xs"></i>
          </div>
        </div>
      </div>

      <div v-if="selectedProvider && canProcessPayment" class="mt-6">
        <AppButton
          :label="processingPayment ? $t('payment.processing_payment') : $t('payment.process_payment')"
          :loading="processingPayment"
          :disabled="processingPayment || !canProcessPayment"
          @click="handleProcessPayment"
          class="w-full"
          size="large"
        />
      </div>
    </div>

    <div v-else class="text-center py-8">
      <i class="pi pi-info-circle text-3xl text-surface-400 mb-4"></i>
      <p class="text-surface-600 dark:text-surface-400 mb-4">
        {{ $t('payment.no_providers_available') }}
      </p>
      <AppButton
        :label="$t('general.retry')"
        @click="loadAvailableProviders"
        severity="secondary"
        size="small"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import { usePaymentProviders } from '@/composables/usePaymentProviders'
import type { IPaymentProvider } from '@/services/payment-provider'
import type { PaymentData, PaymentResult } from '@/services/payment-provider/strategies/PaymentStrategy.interface'

interface Props {
  amount: number
  currency: string
  customerInfo: {
    name: string
    email: string
    company?: string
  }
  planInfo: {
    id: string
    name: string
    features: string[]
  }
  autoLoad?: boolean
}

interface Emits {
  (e: 'payment-success', result: PaymentResult): void
  (e: 'payment-error', error: Error | string): void
  (e: 'provider-selected', provider: IPaymentProvider): void
  (e: 'provider-ready', provider: IPaymentProvider): void
}

const props = withDefaults(defineProps<Props>(), {
  autoLoad: true
})

const emit = defineEmits<Emits>()

const {
  availableProviders,
  selectedProvider,
  loading,
  error,
  loadAvailableProviders,
  selectProvider,
  processPayment
} = usePaymentProviders()

const loadingMessage = ref('Cargando proveedores...')
const processingPayment = ref(false)

const canProcessPayment = computed(() => {
  return selectedProvider.value && !loading.value && !processingPayment.value
})

const handleProviderSelection = async (provider: IPaymentProvider) => {
  try {
    loadingMessage.value = `Configurando ${provider.displayName}...`
    emit('provider-selected', provider)

    await selectProvider(provider)
    emit('provider-ready', provider)

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
    emit('payment-error', errorMessage)
  }
}

const handleProcessPayment = async () => {
  if (!selectedProvider.value) return

  try {
    const paymentData: PaymentData = {
      planId: props.planInfo.id,
      planName: props.planInfo.name,
      amount: props.amount,
      currency: props.currency,
      customerInfo: {
        name: props.customerInfo.name,
        email: props.customerInfo.email,
        company: props.customerInfo.company,
        phone: ''
      }
    }

    processingPayment.value = true
    const result = await processPayment(paymentData)
    emit('payment-success', result)

  } catch (err) {
    const errorMessage = err instanceof Error ? err : new Error(String(err))
    emit('payment-error', errorMessage)
  } finally {
    processingPayment.value = false
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
    try {
      loadingMessage.value = 'Cargando proveedores disponibles...'
      await loadAvailableProviders()
    } catch (err) {
      console.error('Error loading providers:', err)
    }
  }
})

defineExpose({
  loadAvailableProviders,
  selectProvider: handleProviderSelection,
  processPayment: handleProcessPayment,
  selectedProvider,
  canProcessPayment
})
</script>

<style scoped>
.provider-card {
  position: relative;
}

.provider-card:hover {
  transform: translateY(-2px);
}
</style>
