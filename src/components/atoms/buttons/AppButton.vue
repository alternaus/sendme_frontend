<script lang="ts">
import { defineComponent } from 'vue'

import PrimeButton from 'primevue/button'

export default defineComponent({
  name: 'AppButton',
  props: {
    label: {
      type: String,
      default: '',
    },
    variant: {
      type: String,
      default: 'primary',
    },
  },
  components: {
    PrimeButton,
  },
  setup(props) {
    return { ...props }
  },
})
</script>

<template>
  <PrimeButton
    class="w-full !rounded-xl"
    :label="label"
    :severity="variant"
    size="small"
  ></PrimeButton>
</template>
