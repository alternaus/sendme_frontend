<script setup lang="ts">
import { computed, useAttrs } from 'vue'

import Divider from 'primevue/divider'

type DividerAlign = 'left' | 'center' | 'right'
type DividerLayout = 'horizontal' | 'vertical'
type DividerType = 'solid' | 'dashed' | 'dotted'

interface Props {
  align?: DividerAlign
  layout?: DividerLayout
  type?: DividerType
  customClass?: string
  containerClass?: string
  pt?: object
  ptOptions?: object
}

const props = withDefaults(defineProps<Props>(), {
  align: 'center',
  layout: 'horizontal',
  type: 'solid',
  customClass: '!m-0'
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
  const combinedClasses = [props.customClass, classAttr].filter(Boolean).join(' ')
  return props.containerClass ? `${props.containerClass} ${combinedClasses}` : combinedClasses
})
</script>

<template>
  <div v-if="containerClass" :class="containerClass">
    <Divider
      v-bind="forwardedAttrs"
      :align="align"
      :layout="layout"
      :type="type"
      :class="containerClasses"
      :pt="pt"
      :pt-options="ptOptions"
    >
      <slot>
      </slot>
    </Divider>
  </div>
  <Divider
    v-else
    v-bind="forwardedAttrs"
    :align="align"
    :layout="layout"
    :type="type"
    :class="containerClasses"
    :pt="pt"
    :pt-options="ptOptions"
  >
    <slot>
    </slot>
  </Divider>
</template>
