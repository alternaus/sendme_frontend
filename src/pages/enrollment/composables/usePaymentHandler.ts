// usePaymentHandler.ts
import { computed, ref } from 'vue'

import type { IPaymentProvider } from '@/services/payment-provider'
import type { RechargePaymentData, TransactionType } from '@/services/payment-provider/strategies/BasePaymentStrategy'
import type { PaymentData, PaymentResult } from '@/services/payment-provider/strategies/PaymentStrategy.interface'

import { usePaymentProviders } from './usePaymentProviders'

type PaymentDataTx = PaymentData & { transactionType?: TransactionType; organizationId?: string }

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
    processEnrollment: _processEnrollment,
    processRecharge: _processRecharge,
    processPayment: _legacyProcessPayment,
  } = usePaymentProviders()

  const loadProviders = async () => {
    try { await loadAvailableProviders() } catch (err) { console.error('Error loading providers:', err) }
  }

  const selectProvider = async (provider: IPaymentProvider) => {
    if (processing.value) return
    await _selectProvider(provider)
  }

  const withFlags = async <T extends Record<string,unknown>>(fn: () => Promise<T>): Promise<T> => {
    processing.value = true
    try {
      const res = await fn()

      if (res?.['redirectUrl'] && !res?.['success']) {
        redirecting.value = true

        window.location.href = res['redirectUrl'] as string
      }
      return res
    } finally {
      if (!redirecting.value) processing.value = false
    }
  }

  // Nuevo: explícitos
  const payEnrollment = (data: PaymentData): Promise<PaymentResult> => {
    if (!selectedProvider.value) return Promise.reject(new Error('No provider selected'))
    return withFlags<PaymentResult>(() => _processEnrollment(data))
  }

  const payRecharge = (data: RechargePaymentData, organizationId: string): Promise<PaymentResult> => {
    if (!selectedProvider.value) return Promise.reject(new Error('No provider selected'))
    if (!organizationId) return Promise.reject(new Error('organizationId requerido'))
    return withFlags(() => _processRecharge(data, organizationId))
  }

  // Compat: si viene transactionType, enruta; si no, usa legacy
  const processPayment = (paymentData: PaymentDataTx): Promise<PaymentResult> => {
    if (!selectedProvider.value) return Promise.reject(new Error('No provider selected'))
    if (paymentData.transactionType === 'enrollment') return payEnrollment(paymentData)
    if (paymentData.transactionType === 'recharge') {
      return payRecharge(paymentData as RechargePaymentData, paymentData.organizationId || '')
    }
    // flujo antiguo
    return withFlags(() => _legacyProcessPayment(paymentData))
  }

  const handlePaymentCallback = (params: URLSearchParams) => {
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
        : 'Payment failed or was cancelled',
    }
  }

  const isProcessing = computed(() => processing.value || redirecting.value)

  return {
    // state
    availableProviders,
    selectedProvider,
    loading,
    error,
    processing: isProcessing,
    redirecting,
    // actions
    loadProviders,
    selectProvider,
    payEnrollment,
    payRecharge,
    processPayment,
    handlePaymentCallback,
  }
}
