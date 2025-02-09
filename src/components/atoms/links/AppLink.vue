<script lang="ts">
import PrimeButton from 'primevue/button'
import { defineComponent } from 'vue'

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
