import { useScriptTag } from '@vueuse/core'

import type { PaymentData, PaymentResult, PaymentStrategy } from './PaymentStrategy.interface'

export abstract class BasePaymentStrategy implements PaymentStrategy {
  public readonly providerName: string
  public readonly scriptUrl: string
  public isScriptLoaded: boolean = false
  public isConfigured: boolean = false

  constructor(providerName: string, scriptUrl: string) {
    this.providerName = providerName
    this.scriptUrl = scriptUrl
  }

  async loadScript(): Promise<boolean> {
    if (this.isScriptLoaded) {
      return true
    }

    try {
      useScriptTag(this.scriptUrl)
      this.isScriptLoaded = true
      return true
    } catch {
      return false
    }
  }

  abstract configure(config: Record<string, unknown>): Promise<void>
  abstract processPayment(paymentData: PaymentData): Promise<PaymentResult>

  destroy(): void {
    this.isConfigured = false
    this.isScriptLoaded = false
  }
}
