import { useApiClient } from '@/composables/useApiClient'

import type { IPaymentProvider } from './interfaces/payment-provider.interface'
import type { IPaymentProviderPublicKey } from './interfaces/payment-provider-public-key.interface'

export const usePaymentProviderService = () => {
  const publicApi = useApiClient(false)

  const getPublicPaymentProviders = async (): Promise<IPaymentProvider[]> => {
    try {
      const response = await publicApi.get<IPaymentProvider[]>('/payment-providers/public')
      return response
    } catch (error: unknown) {
      throw error
    }
  }

  const getPaymentProviderConfig = async (providerName: string): Promise<IPaymentProvider> => {
    try {
      const response = await publicApi.get<IPaymentProvider>(`/payment-providers/${providerName}/config`)

      if (!response.publicKey && providerName === 'epayco') {
        return {
          ...response,
          publicKey: '469ac6140f4662232f03f667ea035dd3',
          testMode: true
        }
      }

      return response
    } catch (error) {
      if (providerName === 'epayco') {
        return {
          id: 1,
          name: 'epayco',
          displayName: 'ePayco',
          logo: 'https://multimedia.epayco.co/epayco.png',
          description: 'Pagos con ePayco (modo de prueba)',
          publicKey: '469ac6140f4662232f03f667ea035dd3',
          testMode: true,
          processingTime: '2-5 minutes',
          supportedCurrencies: ['USD', 'COP']
        }
      }

      throw error
    }
  }

  const getPaymentProviderPublicKey = async (providerName: string): Promise<IPaymentProviderPublicKey> => {
    try {
      const response = await publicApi.get<IPaymentProviderPublicKey>(`/payment-providers/${providerName}/public-key`)
      return response
    } catch (error) {
      throw error
    }
  }

  return {
    getPublicPaymentProviders,
    getPaymentProviderConfig,
    getPaymentProviderPublicKey
  }
}
