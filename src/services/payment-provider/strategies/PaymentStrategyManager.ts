// PaymentStrategyManager.ts
import type {
  EnrollmentPaymentData,
  RechargePaymentData,
  TransactionType,
} from './BasePaymentStrategy'
import { EpaycoPaymentStrategy } from './EpaycoPaymentStrategy'
import type { PaymentData, PaymentResult, PaymentStrategy } from './PaymentStrategy.interface'

type PaymentInput = PaymentData & {
  transactionType?: TransactionType
  organizationId?: string
  extras?: { extra1?: string; extra2?: string; extra3?: string }
  extra_1?: string; extra_2?: string; extra_3?: string
}

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

  private async ensureReady(providerName: string, config: Record<string, unknown>): Promise<PaymentStrategy> {
    const strategy = this.getStrategy(providerName)
    if (!strategy) throw new Error(`Payment strategy not found for provider: ${providerName}`)

    if (!strategy.isScriptLoaded) {
      const ok = await strategy.loadScript()
      if (!ok) throw new Error(`Failed to load script for ${providerName}`)
    }
    if (!strategy.isConfigured) await strategy.configure(config)
    return strategy
  }

  async loadProviderScript(providerName: string): Promise<boolean> {
    const s = this.getStrategy(providerName)
    if (!s) throw new Error(`Payment strategy not found for provider: ${providerName}`)
    if (s.isScriptLoaded) return true
    return await s.loadScript()
  }

  async configureProvider(providerName: string, config: Record<string, unknown>): Promise<void> {
    const s = this.getStrategy(providerName)
    if (!s) throw new Error(`Payment strategy not found for provider: ${providerName}`)
    if (s.isConfigured) return
    await s.configure(config)
  }

  async processPayment(
    providerName: string,
    config: Record<string, unknown>,
    paymentData: PaymentInput,
  ): Promise<PaymentResult> {
    const s = await this.ensureReady(providerName, config)
    return await s.processPayment(paymentData as PaymentData)
  }

  async processEnrollment(
    providerName: string,
    config: Record<string, unknown>,
    data: EnrollmentPaymentData,
  ): Promise<PaymentResult> {
    const s = await this.ensureReady(providerName, config)
    const ext = s as unknown as {
      processEnrollment?: (d: EnrollmentPaymentData) => Promise<PaymentResult>
      processPayment?: (d: PaymentData) => Promise<PaymentResult>
    }
    if (ext.processEnrollment) return await ext.processEnrollment(data)

    return await this.processPayment(providerName, config, {
      ...data,
      transactionType: 'enrollment',
      extras: { extra1: 'enrollment', extra3: data.planId },
      extra_1: 'enrollment',
      extra_3: data.planId,
    })
  }

  async processRecharge(
    providerName: string,
    config: Record<string, unknown>,
    data: RechargePaymentData,
  ): Promise<PaymentResult> {
    const s = await this.ensureReady(providerName, config)
    const ext = s as unknown as {
      processRecharge?: (d: RechargePaymentData) => Promise<PaymentResult>
      processPayment?: (d: PaymentData) => Promise<PaymentResult>
    }
    if (ext.processRecharge) return await ext.processRecharge(data)

    if (!data.organizationId) throw new Error('organizationId es requerido para recarga')
    return await this.processPayment(providerName, config, {
      ...data,
      transactionType: 'recharge',
      organizationId: data.organizationId,
      extras: { extra1: 'recharge', extra2: data.organizationId, extra3: data.planId },
      extra_1: 'recharge',
      extra_2: data.organizationId,
      extra_3: data.planId,
    })
  }

  getProviderDiagnostics(providerName: string): Record<string, unknown> {
    const strategy = this.getStrategy(providerName)
    if (!strategy) return { error: `Payment strategy not found for provider: ${providerName}`, available: false }

    const base = {
      providerName: strategy.providerName,
      scriptUrl: strategy.scriptUrl,
      isScriptLoaded: strategy.isScriptLoaded,
      isConfigured: strategy.isConfigured,
      available: true,
    }

    if (providerName === 'epayco') {
      const w = window
      return {
        ...base,
        windowEpaycoExists: typeof window !== 'undefined' && !!w.ePayco,
        epaycoCheckoutExists: typeof window !== 'undefined' && !!w.ePayco?.checkout,
        epaycoConfigureExists:
          typeof window !== 'undefined' && typeof w.ePayco?.checkout?.configure === 'function',
      }
    }
    return base
  }

  destroy(): void {
    this.strategies.forEach((s) => s.destroy())
    this.strategies.clear()
  }
}
