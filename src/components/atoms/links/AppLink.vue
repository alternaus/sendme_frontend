<script setup lang="ts">
import { computed, useAttrs } from 'vue'

import PrimeButton from 'primevue/button'

type ButtonSize = 'small' | 'large'
type ButtonSeverity = 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'primary' | 'contrast'

interface Props {
  label?: string
  size?: ButtonSize
  severity?: ButtonSeverity
  disabled?: boolean
  loading?: boolean
  icon?: string
  iconPos?: 'left' | 'right' | 'top' | 'bottom'
  badge?: string
  badgeClass?: string
  badgeSeverity?: ButtonSeverity
  containerClass?: string
  buttonClass?: string
  pt?: object
  ptOptions?: object
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  size: 'small',
  severity: 'primary',
  disabled: false,
  loading: false,
  iconPos: 'left',
  containerClass: 'w-full',
  buttonClass: '!rounded-xl',
  theme: 'default'
})

defineOptions({
  inheritAttrs: false
})

const emit = defineEmits<{
  'click': [event: Event]
}>()

const attrs = useAttrs()

const blockKeys = ['class', 'onClick']

const forwardedAttrs = computed(() => {
  const src = attrs ?? {}
  return Object.fromEntries(Object.entries(src).filter(([k]) => !blockKeys.includes(k)))
})

const containerClasses = computed(() => {
  const classAttr = attrs.class as string | undefined
  return classAttr ? `${props.containerClass} ${classAttr}` : props.containerClass
})

const buttonClasses = computed(() => {
  return props.buttonClass
})

const ptConfig = computed(() => {
  return props.pt
})

const handleClick = (event: Event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<template>
  <div :class="containerClasses">
    <PrimeButton
      as="a"
      v-bind="forwardedAttrs"
      :label="label"
      :size="size"
      :severity="severity"
      :disabled="disabled"
      :loading="loading"
      :icon="icon"
      :icon-pos="iconPos"
      :badge="badge"
      :badge-class="badgeClass"
      :badge-severity="badgeSeverity"
      :class="buttonClasses"
      :pt="ptConfig"
      :pt-options="ptOptions"
      variant="text"
      @click="handleClick"
    >
      <slot />
    </PrimeButton>
  </div>
</template>
