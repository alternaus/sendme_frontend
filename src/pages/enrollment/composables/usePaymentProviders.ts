// usePaymentProviders.ts
import { computed, ref } from 'vue'

import { usePaymentProviderService } from '@/services/payment-provider'
import type { IPaymentProvider } from '@/services/payment-provider/interfaces/payment-provider.interface'
import type { EnrollmentPaymentData, RechargePaymentData } from '@/services/payment-provider/strategies/BasePaymentStrategy'
import type { PaymentData, PaymentResult } from '@/services/payment-provider/strategies/PaymentStrategy.interface'
import { PaymentStrategyManager } from '@/services/payment-provider/strategies/PaymentStrategyManager'

export function usePaymentProviders() {
  const { getPublicPaymentProviders, getPaymentProviderConfig } = usePaymentProviderService()

  const availableProviders = ref<IPaymentProvider[]>([])
  const selectedProvider = ref<IPaymentProvider | null>(null)
  const providerConfig = ref<Record<string, unknown> | null>(null)

  const loading = ref(false)
  const error = ref('')

  const strategyManager = new PaymentStrategyManager()

  const loadAvailableProviders = async () => {
    try {
      loading.value = true
      error.value = ''
      const providers = await getPublicPaymentProviders()
      availableProviders.value = providers.filter(p => strategyManager.hasStrategy(p.name))
    } catch (err) {
      error.value = 'Error al cargar los proveedores de pago'
      throw err
    } finally {
      loading.value = false
    }
  }

  const selectProvider = async (provider: IPaymentProvider) => {
    try {
      loading.value = true
      error.value = ''

      if (!strategyManager.hasStrategy(provider.name)) {
        throw new Error(`Strategy not implemented for ${provider.name}`)
      }

      const cfg = await getPaymentProviderConfig(provider.name)

      const ok = await strategyManager.loadProviderScript(provider.name)
      if (!ok) throw new Error(`Failed to load script for ${provider.name}`)

      const normalizedCfg = { publicKey: cfg.publicKey, testMode: cfg.testMode }
      await strategyManager.configureProvider(provider.name, normalizedCfg)

      selectedProvider.value = provider
      providerConfig.value = normalizedCfg
      return provider
    } catch (err) {
      error.value = `Error al configurar el proveedor ${provider.displayName}: ${err instanceof Error ? err.message : 'Error desconocido'}`
      throw err
    } finally {
      loading.value = false
    }
  }

  // Compat: ruta genérica legacy
  const processPayment = async (paymentData: PaymentData): Promise<PaymentResult> => {
    if (!selectedProvider.value || !providerConfig.value) throw new Error('No payment provider selected')
    try {
      loading.value = true
      return await strategyManager.processPayment(selectedProvider.value.name, providerConfig.value, paymentData)
    } catch (err) {
      error.value = 'Error al procesar el pago'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Nuevo: APIs simples
  const processEnrollment = async (data: EnrollmentPaymentData): Promise<PaymentResult> => {
    if (!selectedProvider.value || !providerConfig.value) throw new Error('No payment provider selected')
    try {
      loading.value = true
      return await strategyManager.processEnrollment(selectedProvider.value.name, providerConfig.value, data)
    } catch (err) {
      error.value = 'Error al procesar el pago'
      throw err
    } finally {
      loading.value = false
    }
  }

  const processRecharge = async (data: RechargePaymentData, organizationId: string): Promise<PaymentResult> => {
    if (!selectedProvider.value || !providerConfig.value) throw new Error('No payment provider selected')
    if (!organizationId) throw new Error('organizationId es requerido')
    try {
      loading.value = true
      return await strategyManager.processRecharge(
        selectedProvider.value.name,
        providerConfig.value,
        { ...data, organizationId }
      )
    } catch (err) {
      error.value = 'Error al procesar el pago'
      throw err
    } finally {
      loading.value = false
    }
  }

  const canProcessPayment = computed(() => Boolean(selectedProvider.value && providerConfig.value && !loading.value))

  return {
    availableProviders,
    selectedProvider,
    loading,
    error,
    canProcessPayment,
    loadAvailableProviders,
    selectProvider,
    // nuevas APIs
    processEnrollment,
    processRecharge,
    // compat
    processPayment,
    destroy: () => strategyManager.destroy(),
  }
}
