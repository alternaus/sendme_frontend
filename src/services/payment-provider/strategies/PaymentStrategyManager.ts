import { EpaycoPaymentStrategy } from './EpaycoPaymentStrategy'
import type { PaymentData, PaymentResult, PaymentStrategy } from './PaymentStrategy.interface'

export class PaymentStrategyManager {
  private strategies: Map<string, PaymentStrategy> = new Map()

  constructor() {
    this.registerStrategy(new EpaycoPaymentStrategy())
  }

  private registerStrategy(strategy: PaymentStrategy): void {
    this.strategies.set(strategy.providerName, strategy)
  }

  getStrategy(providerName: string): PaymentStrategy | null {
    return this.strategies.get(providerName) || null
  }

  hasStrategy(providerName: string): boolean {
    return this.strategies.has(providerName)
  }

  getAvailableProviders(): string[] {
    return Array.from(this.strategies.keys())
  }

  async loadProviderScript(providerName: string): Promise<boolean> {
    const strategy = this.getStrategy(providerName)

    if (!strategy) {
      throw new Error(`Payment strategy not found for provider: ${providerName}`)
    }

    if (strategy.isScriptLoaded) {
      return true
    }

    const scriptLoaded = await strategy.loadScript()

    return scriptLoaded
  }

  async configureProvider(providerName: string, config: Record<string, unknown>): Promise<void> {
    const strategy = this.getStrategy(providerName)

    if (!strategy) {
      throw new Error(`Payment strategy not found for provider: ${providerName}`)
    }

    if (strategy.isConfigured) {
      return
    }

    await strategy.configure(config)
  }

  async processPayment(
    providerName: string,
    config: Record<string, unknown>,
    paymentData: PaymentData,
  ): Promise<PaymentResult> {
    const strategy = this.getStrategy(providerName)

    if (!strategy) {
      throw new Error(`Payment strategy not found for provider: ${providerName}`)
    }

    if (!strategy.isScriptLoaded) {
      const scriptLoaded = await strategy.loadScript()
      if (!scriptLoaded) {
        throw new Error(`Failed to load script for ${providerName}`)
      }
    }

    if (!strategy.isConfigured) {
      await strategy.configure(config)
    }

    return await strategy.processPayment(paymentData)
  }

  getProviderDiagnostics(providerName: string): Record<string, unknown> {
    const strategy = this.getStrategy(providerName)

    if (!strategy) {
      return {
        error: `Payment strategy not found for provider: ${providerName}`,
        available: false,
      }
    }

    const diagnostics = {
      providerName: strategy.providerName,
      scriptUrl: strategy.scriptUrl,
      isScriptLoaded: strategy.isScriptLoaded,
      isConfigured: strategy.isConfigured,
      available: true,
    }

    if (providerName === 'epayco') {
      return {
        ...diagnostics,
        windowEpaycoExists: typeof window !== 'undefined' && !!window.ePayco,
        epaycoCheckoutExists: typeof window !== 'undefined' && !!window.ePayco?.checkout,
        epaycoConfigureExists:
          typeof window !== 'undefined' && typeof window.ePayco?.checkout?.configure === 'function',
      }
    }

    return diagnostics
  }

  destroy(): void {
    this.strategies.forEach((strategy) => strategy.destroy())
    this.strategies.clear()
  }
}
