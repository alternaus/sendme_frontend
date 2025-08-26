import { BasePaymentStrategy } from './BasePaymentStrategy'
import type { PaymentData, PaymentResult } from './PaymentStrategy.interface'

interface EpaycoCheckoutData {
  key: string
  test: boolean
  external: boolean
  name: string
  description: string
  currency: string
  amount: string
  tax_base: string
  tax: string
  country: string
  lang: string
  invoice: string
  extra1?: string
  extra2?: string
  extra3?: string
  confirmation: string
  response: string
  name_billing: string
  address_billing: string
  type_doc_billing: string
  mobilephone_billing: string
  number_doc_billing: string
  email_billing: string
}

interface EpaycoConfig { publicKey: string; testMode: boolean }

interface EpaycoCheckout {
  checkout: {
    configure: (options: { key: string; test: boolean }) => {
      open: (data: EpaycoCheckoutData) => void
    }
  }
}

declare global { interface Window { ePayco?: EpaycoCheckout } }

export class EpaycoPaymentStrategy extends BasePaymentStrategy {
  private config: EpaycoConfig | null = null
  constructor() { super('epayco', 'https://checkout.epayco.co/checkout.js') }

  async loadScript(): Promise<boolean> {
    if (this.isScriptLoaded && window.ePayco) return true
    const ok = await super.loadScript()
    if (!ok) return false
    const ready = await this.waitFor(() => !!window.ePayco?.checkout?.configure)
    if (ready) this.isScriptLoaded = true
    return ready
  }

  async configure(config: Record<string, unknown>): Promise<void> {
    const publicKey = String(config.publicKey ?? '')
    const testMode = Boolean(config.testMode ?? true)
    if (!publicKey) throw new Error('ePayco public key is required')
    this.config = { publicKey, testMode }
    this.isConfigured = true
  }

  protected async processWithExtras(
    data: PaymentData & { extras: { extra1?: string; extra2?: string; extra3?: string } }
  ): Promise<PaymentResult> {
    if (!this.isConfigured || !this.config) throw new Error('ePayco not configured. Call configure() first')
    const ready = await this.waitFor(() => !!window.ePayco?.checkout?.configure)
    if (!ready) throw new Error('ePayco script not loaded properly')

    const invoice = `INV_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
    const amount = data.amount
    const baseAmount = Math.round(amount / 1.19)
    const taxAmount = amount - baseAmount
    const currency = String(data.currency || 'COP').toLowerCase()
    const lang = 'es'
    const country = 'co'

    const epayco = window.ePayco!.checkout.configure({
      key: this.config.publicKey,
      test: this.config.testMode,
    })

    const epaycoData: EpaycoCheckoutData = {
      key: this.config.publicKey,
      test: this.config.testMode,
      external: false,
      name: `Plan ${data.planName}`,
      description: `Pago ${data.planName} - ${data.customerInfo.company || 'SendMe'}`,
      currency,
      amount: String(amount),
      tax_base: String(baseAmount),
      tax: String(taxAmount),
      country,
      lang,
      invoice,
      extra1: data.extras.extra1,
      extra2: data.extras.extra2,
      extra3: data.extras.extra3,
      confirmation: '',
      response: `${window.location.origin}/enrollment/payment-confirmation?invoice=${invoice}`,
      name_billing: data.customerInfo.name,
      address_billing: data.customerInfo.company || 'Sin dirección',
      type_doc_billing: 'cc',
      mobilephone_billing: data.customerInfo.phone || '0000000000',
      number_doc_billing: data.customerInfo.dni,
      email_billing: data.customerInfo.email,
    }

    epayco.open(epaycoData)

    return {
      success: true,
      transactionId: invoice,
      provider: this.providerName,
      message: 'Checkout abierto exitosamente',
    }
  }

  destroy(): void { this.config = null; super.destroy() }
}
