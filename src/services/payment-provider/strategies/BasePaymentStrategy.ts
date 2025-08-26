import { useScriptTag } from '@vueuse/core'

import type { PaymentData, PaymentResult, PaymentStrategy } from './PaymentStrategy.interface'

export type TransactionType = 'enrollment' | 'recharge'

export interface NormalizedExtras {
  extra1?: string
  extra2?: string
  extra3?: string
  transactionType: TransactionType
}

export type WithExtras = PaymentData & {
  transactionType?: TransactionType
  organizationId?: string
  extras?: { extra1?: string; extra2?: string; extra3?: string }
  extra_1?: string; extra_2?: string; extra_3?: string
}

export type EnrollmentPaymentData = Pick<PaymentData, 'planId' | 'planName' | 'amount' | 'currency' | 'customerInfo'>
export type RechargePaymentData = EnrollmentPaymentData & { organizationId: string }

export abstract class BasePaymentStrategy implements PaymentStrategy {
  public readonly providerName: string
  public readonly scriptUrl: string
  public isScriptLoaded = false
  public isConfigured = false

  constructor(providerName: string, scriptUrl: string) {
    this.providerName = providerName
    this.scriptUrl = scriptUrl
  }

  async loadScript(timeoutMs = 10000): Promise<boolean> {
    if (this.isScriptLoaded) return true
    if (typeof window === 'undefined') return false

    const id = `pay-sdk-${this.providerName}`
    if (document.getElementById(id)) {
      this.isScriptLoaded = true
      return true
    }

    let ok = false
    await new Promise<void>((resolve) => {
      useScriptTag(
        this.scriptUrl,
        () => { this.isScriptLoaded = true; ok = true; resolve() },
        { attrs: { id }, async: true, defer: true }
      )
      window.setTimeout(() => resolve(), timeoutMs)
    })
    return ok
  }

  protected async waitFor(check: () => unknown, timeoutMs = 10000, intervalMs = 100): Promise<boolean> {
    const start = Date.now()
    while (Date.now() - start < timeoutMs) {
      try { if (check()) return true } catch {}
      await new Promise((r) => setTimeout(r, intervalMs))
    }
    return false
  }

  async processEnrollment(data: EnrollmentPaymentData): Promise<PaymentResult> {
    const normalized = this.normalizeExtras({ ...data, transactionType: 'enrollment' })
    const payload = this.mergeExtras(data, normalized)
    return this.processWithExtras(payload)
  }

  async processRecharge(data: RechargePaymentData): Promise<PaymentResult> {
    const normalized = this.normalizeExtras({ ...data, transactionType: 'recharge', organizationId: data.organizationId })
    const payload = this.mergeExtras(data, normalized)
    return this.processWithExtras(payload)
  }

  async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
    const normalized = this.normalizeExtras(paymentData as WithExtras)
    const payload = this.mergeExtras(paymentData, normalized)
    return this.processWithExtras(payload)
  }

  protected abstract processWithExtras(
    data: PaymentData & { extras: { extra1?: string; extra2?: string; extra3?: string } }
  ): Promise<PaymentResult>

  abstract configure(config: Record<string, unknown>): Promise<void>

  protected normalizeExtras(data: WithExtras): NormalizedExtras {
    const inferredTx: TransactionType =
      data.transactionType ?? (data.extra_1 === 'recharge' ? 'recharge' : 'enrollment')

    const extra1 =
      data.extras?.extra1 ?? data.extra_1 ?? (inferredTx === 'recharge' ? 'recharge' : 'enrollment')

    const extra2 =
      data.extras?.extra2 ?? data.extra_2 ?? (inferredTx === 'recharge' ? data.organizationId : undefined)

    const extra3 = data.extras?.extra3 ?? data.extra_3 ?? data.planId

    if (inferredTx === 'recharge' && !extra2) {
      throw new Error('organizationId (extra2) es requerido para recarga')
    }
    return { transactionType: inferredTx, extra1, extra2, extra3 }
  }

  private mergeExtras<T extends PaymentData>(base: T, nx: NormalizedExtras): T & { extras: { extra1?: string; extra2?: string; extra3?: string } } {
    return {
      ...base,
      extras: { extra1: nx.extra1, extra2: nx.extra2, extra3: nx.extra3 },
    }
  }

  destroy(): void {
    this.isConfigured = false
    this.isScriptLoaded = false
  }
}
