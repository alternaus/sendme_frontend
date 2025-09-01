<script setup lang="ts">
import { computed, useAttrs } from 'vue'

import PrimeTag from 'primevue/tag'

type TagSeverity = 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'contrast'

interface Props {
  label?: string
  value?: string
  severity?: TagSeverity
  rounded?: boolean
  icon?: string
  containerClass?: string
  tagClass?: string
  pt?: object
  ptOptions?: object
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  value: '',
  severity: 'secondary',
  rounded: true,
  containerClass: '',
  tagClass: '!text-xs !px-3 !py-1'
})

defineOptions({
  inheritAttrs: false
})

const attrs = useAttrs()

const blockKeys = ['class']

const forwardedAttrs = computed(() => {
  const src = attrs ?? {}
  return Object.fromEntries(Object.entries(src).filter(([k]) => !blockKeys.includes(k)))
})

const containerClasses = computed(() => {
  const classAttr = attrs.class as string | undefined
  return classAttr ? `${props.containerClass} ${classAttr}` : props.containerClass
})

const effectiveValue = computed(() => {
  return props.value || props.label
})
</script>

<template>
  <div v-if="containerClass" :class="containerClasses">
    <PrimeTag
      v-bind="forwardedAttrs"
      :value="effectiveValue"
      :severity="severity"
      :rounded="rounded"
      :icon="icon"
      :class="tagClass"
      :pt="pt"
      :pt-options="ptOptions"
    >
      <slot />
    </PrimeTag>
  </div>
  <PrimeTag
    v-else
    v-bind="forwardedAttrs"
    :value="effectiveValue"
    :severity="severity"
    :rounded="rounded"
    :icon="icon"
    :class="[tagClass, containerClasses]"
    :pt="pt"
    :pt-options="ptOptions"
  >
    <slot />
  </PrimeTag>
</template>
