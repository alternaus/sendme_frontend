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

interface EpaycoConfig {
  publicKey: string
  testMode: boolean
}

interface EpaycoCheckout {
  checkout: {
    configure: (options: { key: string; test: boolean }) => {
      open: (data: EpaycoCheckoutData) => void;
    };
  };
}

declare global {
  interface Window {
    ePayco?: EpaycoCheckout;
  }
}

export class EpaycoPaymentStrategy extends BasePaymentStrategy {
  private config: EpaycoConfig | null = null

  constructor() {
    super('epayco', 'https://checkout.epayco.co/checkout.js')
  }

  async loadScript(): Promise<boolean> {
    if (this.isScriptLoaded && window.ePayco) {
      return true
    }

    const scriptLoaded = await super.loadScript()
    if (!scriptLoaded) {
      return false
    }

    const maxWaitTime = 10000
    const checkInterval = 100
    let waitTime = 0

    while (!window.ePayco && waitTime < maxWaitTime) {
      await new Promise(resolve => setTimeout(resolve, checkInterval))
      waitTime += checkInterval
    }

    if (window.ePayco?.checkout?.configure) {
      this.isScriptLoaded = true
      return true
    }

    return false
  }

  async configure(config: Record<string, unknown>): Promise<void> {
    const epaycoConfig: EpaycoConfig = {
      publicKey: config.publicKey as string,
      testMode: config.testMode as boolean
    }

    if (!epaycoConfig.publicKey || epaycoConfig.publicKey === 'undefined' || epaycoConfig.publicKey === 'null') {
      throw new Error(`ePayco public key is required. Received: ${epaycoConfig.publicKey}`)
    }

    if (epaycoConfig.testMode === undefined || epaycoConfig.testMode === null) {
      epaycoConfig.testMode = true
    }

    this.config = epaycoConfig
    this.isConfigured = true
  }

  async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
    if (!this.isConfigured || !this.config) {
      throw new Error('ePayco not configured. Call configure() first')
    }

    if (!this.isScriptLoaded || !window.ePayco?.checkout?.configure) {
      throw new Error('ePayco script not loaded properly')
    }

    const invoice = `INV_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const copAmount = paymentData.amount
    const baseAmount = Math.round(copAmount / 1.19)
    const taxAmount = copAmount - baseAmount

    const epayco = window.ePayco.checkout.configure({
      key: this.config.publicKey,
      test: this.config.testMode
    })

    const epaycoData = {
      key: this.config.publicKey,
      test: this.config.testMode,
      external: false,
      name: `Plan ${paymentData.planName}`,
      description: `Suscripción al plan ${paymentData.planName} - ${paymentData.customerInfo.company || 'SendMe'}`,
      currency: "cop",
      amount: copAmount.toString(),
      tax_base: baseAmount.toString(),
      tax: taxAmount.toString(),
      country: 'co',
      lang: "es",
      invoice: invoice,
      extra1: "enrollment",
      extra2: paymentData.customerInfo.company || '',
      extra3: paymentData.planId,
      confirmation: `${window.location.origin}/api/webhooks/epayco/confirmation`,
      response: `${window.location.origin}/enrollment/payment-confirmation?invoice=${invoice}`,
      name_billing: paymentData.customerInfo.name,
      address_billing: paymentData.customerInfo.company || 'Sin dirección',
      type_doc_billing: "cc",
      mobilephone_billing: paymentData.customerInfo.phone || '0000000000',
      number_doc_billing: '00000000',
      email_billing: paymentData.customerInfo.email
    }

    epayco.open(epaycoData)

    return {
      success: true,
      transactionId: invoice,
      provider: this.providerName,
      message: 'Checkout abierto exitosamente'
    }
  }

  destroy(): void {
    this.config = null
    super.destroy()
  }
}
