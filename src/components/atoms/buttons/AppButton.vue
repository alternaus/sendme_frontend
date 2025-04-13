<script lang="ts">
import { computed, defineComponent } from 'vue'

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
    outlined: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    PrimeButton,

  },
  setup(props) {
    const isDisabled = computed(() => props.loading)

    return { isDisabled }
  },
})
</script>

<template>
  <PrimeButton  class="w-full !rounded-xl flex items-center justify-center gap-2" :variant="outlined ? 'outlined' : undefined" :loading="loading"
    size="small" :disabled="isDisabled" :severity="variant">

    <slot name="icon-start" v-if="!loading"></slot>
    {{ label }}
    <slot name="icon-end" v-if="!loading"></slot>
  </PrimeButton>
</template>

<style scoped>
:deep(.p-button) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
</style>
