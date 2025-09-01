<script setup lang="ts">
import { computed, ref, useAttrs, watch } from 'vue'

import PrimeDialog from 'primevue/dialog'

type DialogPosition = 'center' | 'top' | 'bottom' | 'left' | 'right' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright'

interface Props {
  modelValue: boolean
  header?: string
  modal?: boolean
  closable?: boolean
  dismissableMask?: boolean
  draggable?: boolean
  maximizable?: boolean
  minimizable?: boolean
  resizable?: boolean
  focusOnShow?: boolean
  closeOnEscape?: boolean
  showHeader?: boolean
  baseZIndex?: number
  autoZIndex?: boolean
  position?: DialogPosition
  customClass?: string
  width?: string
  height?: string
  minX?: number
  minY?: number
  keepInViewport?: boolean
  contentClass?: string
  contentStyle?: object
  breakpoints?: Record<string, string>
  blockScroll?: boolean
  pt?: object
  ptOptions?: object
}

const props = withDefaults(defineProps<Props>(), {
  header: '',
  modal: true,
  closable: true,
  dismissableMask: true,
  draggable: true,
  maximizable: false,
  minimizable: false,
  resizable: true,
  focusOnShow: true,
  closeOnEscape: true,
  showHeader: true,
  baseZIndex: 0,
  autoZIndex: true,
  position: 'center',
  customClass: '',
  width: '50vw',
  height: 'auto',
  minX: 0,
  minY: 0,
  keepInViewport: true,
  blockScroll: true,
  breakpoints: () => ({
    '1199px': '75vw',
    '575px': '90vw'
  })
})

defineOptions({
  inheritAttrs: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'show': []
  'hide': []
  'after-hide': []
  'maximize': []
  'unmaximize': []
  'dragend': []
}>()

const attrs = useAttrs()

// Filtrar atributos conflictivos
const blockKeys = [
  'modelValue', 'onUpdate:modelValue',
  'visible', 'onUpdate:visible',
  'class', 'style'
]

const forwardedAttrs = computed(() => {
  const src = (attrs ?? {}) as Record<string, unknown>
  return Object.fromEntries(Object.entries(src).filter(([k]) => !blockKeys.includes(k) && k !== 'class'))
})

// Manejar clases del contenedor
const containerClasses = computed(() => {
  const classAttr = attrs.class as string | undefined
  return classAttr ? `${props.customClass} ${classAttr}` : props.customClass
})

const isVisible = ref(false)

// Sincronizar con modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    isVisible.value = newValue
  },
  { immediate: true }
)

// Emitir cambios
watch(isVisible, (newValue) => {
  emit('update:modelValue', newValue)
})
</script>

<template>
  <PrimeDialog
    v-bind="forwardedAttrs"
    v-model:visible="isVisible"
    :header="header"
    :modal="modal"
    :closable="closable"
    :dismissable-mask="dismissableMask"
    :draggable="draggable"
    :maximizable="maximizable"
    :minimizable="minimizable"
    :resizable="resizable"
    :focus-on-show="focusOnShow"
    :close-on-escape="closeOnEscape"
    :show-header="showHeader"
    :base-z-index="baseZIndex"
    :auto-z-index="autoZIndex"
    :position="position"
    :min-x="minX"
    :min-y="minY"
    :keep-in-viewport="keepInViewport"
    :content-class="contentClass"
    :content-style="contentStyle"
    :block-scroll="blockScroll"
    :pt="pt"
    :pt-options="ptOptions"
    :class="containerClasses"
    :style="{ width, height }"
    :breakpoints="breakpoints"
    @show="emit('show')"
    @hide="emit('hide')"
    @after-hide="emit('after-hide')"
    @maximize="emit('maximize')"
    @unmaximize="emit('unmaximize')"
    @dragend="emit('dragend')"
  >
    <!-- Header slot -->
    <template v-if="$slots.header" #header>
      <slot name="header" />
    </template>

    <!-- Default content slot -->
    <slot name="content">
      <slot />
    </slot>

    <!-- Footer slot -->
    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>

    <!-- Custom slots pass-through -->
    <template v-for="(_, slotName) in $slots" :key="slotName" #[slotName]>
      <slot :name="String(slotName)" v-if="!['header', 'content', 'footer', 'default'].includes(String(slotName))" />
    </template>
  </PrimeDialog>
</template>
