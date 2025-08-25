export interface PaymentStrategy {
  providerName: string
  scriptUrl: string
  isScriptLoaded: boolean
  isConfigured: boolean

  loadScript(): Promise<boolean>
  configure(config: Record<string, unknown>): Promise<void>
  processPayment(paymentData: PaymentData): Promise<PaymentResult>
  destroy(): void
}

export interface PaymentData {
  amount: number
  currency: string
  planId: string
  planName: string
  customerInfo: {
    name: string
    email: string
    dni: string
    company?: string
    phone?: string
  }
}

export interface PaymentResult {
  success: boolean
  transactionId: string
  provider: string
  message?: string
  redirectUrl?: string
}
