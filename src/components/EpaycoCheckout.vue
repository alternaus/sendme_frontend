<template>
  <div>
    <app-button @click="initCheckout" :disabled="isProcessing">
      {{ isProcessing ? 'Procesando...' : 'Pagar con ePayco' }}
    </app-button>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue'
import AppButton from '@/components/AppButton.vue'

export default {
  name: 'EpaycoCheckout',
  components: {
    AppButton,
  },
  props: {
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: 'Descripción del producto',
    },
    name: {
      type: String,
      default: 'Nombre del producto',
    },
    currency: {
      type: String,
      default: 'COP',
    },
    customerEmail: {
      type: String,
      required: true,
    },
    invoice: {
      type: String,
      required: true,
    },
    planId: {
      type: String,
      default: undefined,
    },
    organizationId: {
      type: String,
      default: undefined,
    },
    type: {
      type: String,
      default: 'enrollment',
    },
  },
  setup(props) {
    const isProcessing = ref(false)

    const initCheckout = () => {
      isProcessing.value = true

      const handler = window.ePayco.checkout.configure({
        key: '0809d1c1e7faa9574f77c095d50beeae',
        test: true,
      })

      handler.open({
        external: 'false',
        amount: props.amount.toFixed(2),
        tax: '0',
        tax_base: '0',
        name: props.name,
        description: `${props.description} - ${props.invoice}`,
        currency: props.currency,
        country: 'CO',
        invoice: props.invoice,
        email: props.customerEmail,
        response: `https://681e-2800-484-5787-4c00-5135-e152-7290-6233.ngrok-free.app/payment-response`,
        confirmation: `https://51b8-2800-484-5787-4c00-874-d4c9-570f-8652.ngrok-free.app/api/webhooks/payment/epayco`,
        lang: 'es',
        extra1: props.type,
        extra2: props.organizationId,
        extra3: props.planId,
      })

      isProcessing.value = false
    }

    return {
      isProcessing,
      initCheckout,
    }
  },
}
</script>
