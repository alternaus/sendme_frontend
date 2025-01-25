<template>
  <div class="container">
    <div>
      <h1>Enrollment</h1>
      <epayco-checkout
        :amount="150000"
        name="Producto de Prueba"
        description="Compra de producto demo 2"
        customerEmail="cliente2@demo.com"
        invoice="test1234101210000000011466"
        planId="2"
        type="enrollment"
      />
    </div>
    <div>
      <h1>Cambio de suscripcion</h1>
      <epayco-checkout
        :amount="100000"
        name="Producto de Prueba"
        description="Compra de producto demo 2"
        customerEmail="cliente2@demo.com"
        invoice="INV1234101210000000011000"
        planId="3"
        organizationId="1"
        type="subscription"
      />
    </div>
    <div>
      <h1>Recarga</h1>
      <epayco-checkout
        :amount="50000"
        name="Producto de Prueba"
        description="Compra de producto demo 2"
        customerEmail="cliente2@demo.com"
        invoice="INV1234101210000000011583587"
        organizationId="5"
        type="recharge"
      />
    </div>
  </div>
  <router-view />
</template>

<script lang="ts">
import EpaycoCheckout from '@/components/EpaycoCheckout.vue'

export default {
  components: {
    EpaycoCheckout,
  },
}
</script>

<style scoped>
.container {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
</style>
