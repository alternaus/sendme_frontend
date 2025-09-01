<script setup lang="ts">
import { computed } from 'vue'

import PrimeButton from 'primevue/button'

type ButtonSeverity = 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'help' | 'danger' | 'contrast'
type ButtonVariant = 'filled' | 'outlined' | 'text'
type ButtonSize = 'small' | 'large'

interface Props {
  label?: string
  severity?: ButtonSeverity
  variant?: ButtonVariant
  outlined?: boolean
  loading?: boolean
  size?: ButtonSize
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  icon?: string
  iconPos?: 'left' | 'right' | 'top' | 'bottom'
  buttonClass?: string
  pt?: object
  ptOptions?: object
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  severity: 'primary',
  variant: 'filled',
  outlined: false,
  loading: false,
  size: 'small',
  disabled: false,
  type: 'button',
  iconPos: 'left',
  buttonClass: 'w-full !rounded-xl flex items-center justify-center gap-2'
})

defineOptions({
  inheritAttrs: false
})

const isDisabled = computed(() => props.loading || props.disabled)
</script>

<template>
  <PrimeButton
    v-bind="{
      label,
      severity,
      variant: variant === 'outlined' ? 'outlined' : variant === 'text' ? 'text' : undefined,
      loading,
      size,
      disabled: isDisabled,
      type,
      icon,
      iconPos,
      pt,
      ptOptions,
      ...$attrs
    }"
    :class="buttonClass"
  >
    <slot name="icon-start" v-if="!loading" />
    <slot v-if="!icon || ($slots.default && label)" />
    <slot name="icon-end" v-if="!loading" />
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
