import { computed, ref } from 'vue'

import type { IPaymentProvider } from '@/services/payment-provider'
import type { PaymentData, PaymentResult } from '@/services/payment-provider/strategies/PaymentStrategy.interface'

import { usePaymentProviders } from './usePaymentProviders'

export const usePaymentHandler = () => {
  const processing = ref(false)
  const redirecting = ref(false)

  const {
    availableProviders,
    selectedProvider,
    loading,
    error,
    loadAvailableProviders,
    selectProvider: _selectProvider,
    processPayment: _processPayment
  } = usePaymentProviders()

  const loadProviders = async () => {
    try {
      await loadAvailableProviders()
    } catch (err) {
      console.error('Error loading providers:', err)
    }
  }

  const selectProvider = async (provider: IPaymentProvider) => {
    if (processing.value) return
    await _selectProvider(provider)
  }

  const processPayment = async (paymentData: PaymentData): Promise<PaymentResult> => {
    if (!selectedProvider.value) {
      throw new Error('No provider selected')
    }

    processing.value = true

    try {
      const result = await _processPayment(paymentData)

      // Handle redirect-based providers (like ePayco)
      if (result.redirectUrl && !result.success) {
        redirecting.value = true
        window.location.href = result.redirectUrl
        return result
      }

      return result
    } finally {
      if (!redirecting.value) {
        processing.value = false
      }
    }
  }

  const handlePaymentCallback = (params: URLSearchParams) => {
    // Handle payment callback from redirect providers
    const status = params.get('status') || params.get('x_response')
    const transactionId = params.get('transactionId') || params.get('x_transaction_id')
    const reference = params.get('reference') || params.get('x_ref_payco')

    processing.value = false
    redirecting.value = false

    return {
      success: status === 'success' || status === 'Aceptada',
      transactionId,
      reference,
      provider: selectedProvider.value?.name,
      message: status === 'success' || status === 'Aceptada'
        ? 'Payment completed successfully'
        : 'Payment failed or was cancelled'
    }
  }

  const isProcessing = computed(() => processing.value || redirecting.value)

  return {
    // State
    availableProviders,
    selectedProvider,
    loading,
    error,
    processing: isProcessing,
    redirecting,

    // Actions
    loadProviders,
    selectProvider,
    processPayment,
    handlePaymentCallback
  }
}
