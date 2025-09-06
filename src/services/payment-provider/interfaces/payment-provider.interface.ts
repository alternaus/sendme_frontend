export interface IPaymentProvider {
  id: string
  name: string
  logo: string
  testMode: boolean
  publicKey: string
  description: string
  displayName: string
  processingTime: string
  supportedCurrencies: string[]
}
