<script lang="ts">
import { defineComponent } from 'vue'

import PrimeButton from 'primevue/button'

export default defineComponent({
  name: 'AppLink',
  props: {
    label: {
      type: String,
      default: '',
    },
  },
  components: {
    PrimeButton,
  },
  setup() {
    return {}
  },
})
</script>

<template>
  <PrimeButton class="w-full !rounded-xl" :label="label" variant="link" size="small"></PrimeButton>
</template>
