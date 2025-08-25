import { computed, ref } from 'vue'

import { usePaymentProviderService } from '@/services/payment-provider'
import type { IPaymentProvider } from '@/services/payment-provider/interfaces/payment-provider.interface'
import type { PaymentData, PaymentResult } from '@/services/payment-provider/strategies/PaymentStrategy.interface'
import { PaymentStrategyManager } from '@/services/payment-provider/strategies/PaymentStrategyManager'

export function usePaymentProviders() {
  const { getPublicPaymentProviders, getPaymentProviderConfig } = usePaymentProviderService()

  const availableProviders = ref<IPaymentProvider[]>([])
  const selectedProvider = ref<IPaymentProvider | null>(null)
  const loading = ref(false)
  const error = ref<string>('')

  const strategyManager = new PaymentStrategyManager()

  const loadAvailableProviders = async () => {
    try {
      loading.value = true
      error.value = ''

      const providers = await getPublicPaymentProviders()
      const implementedProviders = providers.filter(provider =>
        strategyManager.hasStrategy(provider.name)
      )

      availableProviders.value = implementedProviders
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

      const config = await getPaymentProviderConfig(provider.name)

      const scriptLoaded = await strategyManager.loadProviderScript(provider.name)
      if (!scriptLoaded) {
        throw new Error(`Failed to load script for ${provider.name}`)
      }

      const providerConfig = {
        publicKey: config.publicKey,
        testMode: config.testMode
      }

      await strategyManager.configureProvider(provider.name, providerConfig)

      selectedProvider.value = config
      return config
    } catch (err) {
      const errorMsg = `Error al configurar el proveedor ${provider.displayName}: ${err instanceof Error ? err.message : 'Error desconocido'}`
      error.value = errorMsg
      throw err
    } finally {
      loading.value = false
    }
  }

  const processPayment = async (paymentData: PaymentData): Promise<PaymentResult> => {
    if (!selectedProvider.value) {
      throw new Error('No payment provider selected')
    }

    try {
      loading.value = true

      const result = await strategyManager.processPayment(
        selectedProvider.value.name,
        selectedProvider.value,
        paymentData
      )

      return result
    } catch (err) {
      error.value = 'Error al procesar el pago'
      throw err
    } finally {
      loading.value = false
    }
  }

  const canProcessPayment = computed(() => {
    return selectedProvider.value && !loading.value
  })

  return {
    availableProviders,
    selectedProvider,
    loading,
    error,
    canProcessPayment,
    loadAvailableProviders,
    selectProvider,
    processPayment,
    destroy: () => strategyManager.destroy()
  }
}
