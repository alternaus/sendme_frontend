<script setup lang="ts">
import { computed, ref, useAttrs, watch } from 'vue'

import { IconField, InputIcon } from 'primevue'
import FloatLabel from 'primevue/floatlabel'
import Password from 'primevue/password'

type PasswordSize = 'small' | 'large'

interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  size?: PasswordSize
  errorMessage?: string
  showErrorMessage?: boolean
  disabled?: boolean
  readonly?: boolean
  feedback?: boolean
  toggleMask?: boolean
  mediumRegex?: string
  strongRegex?: string
  promptLabel?: string
  weakLabel?: string
  mediumLabel?: string
  strongLabel?: string
  panelClass?: string
  panelStyle?: object
  hideIcon?: string
  showIcon?: string
  containerClass?: string
  inputClass?: string
  errorClass?: string
  pt?: object
  ptOptions?: object
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  placeholder: '',
  size: 'small',
  errorMessage: '',
  showErrorMessage: true,
  disabled: false,
  readonly: false,
  feedback: false,
  toggleMask: true,
  promptLabel: 'Enter a password',
  weakLabel: 'Weak',
  mediumLabel: 'Medium',
  strongLabel: 'Strong',
  containerClass: 'w-full',
  inputClass: 'w-full !rounded-xl',
  errorClass: 'text-red-400 dark:text-red-300 p-0 m-0'
})

defineOptions({
  inheritAttrs: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const attrs = useAttrs()

// Filtrar atributos conflictivos
const blockKeys = [
  'modelValue', 'onUpdate:modelValue',
  'class', 'inputClass', 'placeholder'
]

const forwardedAttrs = computed(() => {
  const src = attrs ?? {}
  return Object.fromEntries(Object.entries(src).filter(([k]) => !blockKeys.includes(k)))
})

// Manejar clases del contenedor
const containerClasses = computed(() => {
  const classAttr = attrs.class as string | undefined
  return classAttr ? `${props.containerClass} ${classAttr}` : props.containerClass
})

// Placeholder efectivo para FloatLabel
/* const effectivePlaceholder = computed(() => {
  return props.placeholder || props.label || ' '
}) */

// Determinar si hay error
const hasError = computed(() => props.errorMessage.length > 0)

// Clases del input con estado de error
const inputClasses = computed(() => {
  const classes = [props.inputClass]
  if (hasError.value) classes.push('p-invalid')
  return classes.join(' ')
})

const internalValue = ref<string>('')

// Sincronizar con modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    internalValue.value = newValue
  },
  { immediate: true }
)

// Emitir cambios
watch(internalValue, (newValue) => {
  emit('update:modelValue', newValue)
})
</script>

<template>
  <div :class="containerClasses">
    <FloatLabel v-if="label && $slots.icon">
      <IconField>
        <InputIcon>
          <slot name="icon" />
        </InputIcon>
        <Password
          v-bind="forwardedAttrs"
          v-model="internalValue"
          :size="size"
          :disabled="disabled"
          :readonly="readonly"
          :feedback="feedback"
          :toggle-mask="toggleMask"
          :medium-regex="mediumRegex"
          :strong-regex="strongRegex"
          :prompt-label="promptLabel"
          :weak-label="weakLabel"
          :medium-label="mediumLabel"
          :strong-label="strongLabel"
          :panel-class="panelClass"
          :panel-style="panelStyle"
          :hide-icon="hideIcon"
          :show-icon="showIcon"
          :input-class="inputClasses"
          :pt="pt"
          :pt-options="ptOptions"
          class="w-full"
        />
      </IconField>
      <label class="text-sm">{{ label }}</label>
    </FloatLabel>

    <FloatLabel v-else-if="label">
      <Password
        v-bind="forwardedAttrs"
        v-model="internalValue"
        :size="size"
        :disabled="disabled"
        :readonly="readonly"
        :feedback="feedback"
        :toggle-mask="toggleMask"
        :medium-regex="mediumRegex"
        :strong-regex="strongRegex"
        :prompt-label="promptLabel"
        :weak-label="weakLabel"
        :medium-label="mediumLabel"
        :strong-label="strongLabel"
        :panel-class="panelClass"
        :panel-style="panelStyle"
        :hide-icon="hideIcon"
        :show-icon="showIcon"
        :input-class="inputClasses"
        :pt="pt"
        :pt-options="ptOptions"
        class="w-full"
      />
      <label class="text-sm">{{ label }}</label>
    </FloatLabel>

    <!-- Sin label -->
    <IconField v-else-if="$slots.icon">
      <InputIcon>
        <slot name="icon" />
      </InputIcon>
      <Password
        v-bind="forwardedAttrs"
        v-model="internalValue"
        :placeholder="placeholder"
        :size="size"
        :disabled="disabled"
        :readonly="readonly"
        :feedback="feedback"
        :toggle-mask="toggleMask"
        :medium-regex="mediumRegex"
        :strong-regex="strongRegex"
        :prompt-label="promptLabel"
        :weak-label="weakLabel"
        :medium-label="mediumLabel"
        :strong-label="strongLabel"
        :panel-class="panelClass"
        :panel-style="panelStyle"
        :hide-icon="hideIcon"
        :show-icon="showIcon"
        :input-class="inputClasses"
        :pt="pt"
        :pt-options="ptOptions"
        class="w-full"
      />
    </IconField>

    <Password
      v-else
      v-bind="forwardedAttrs"
      v-model="internalValue"
      :placeholder="placeholder"
      :size="size"
      :disabled="disabled"
      :readonly="readonly"
      :feedback="feedback"
      :toggle-mask="toggleMask"
      :medium-regex="mediumRegex"
      :strong-regex="strongRegex"
      :prompt-label="promptLabel"
      :weak-label="weakLabel"
      :medium-label="mediumLabel"
      :strong-label="strongLabel"
      :panel-class="panelClass"
      :panel-style="panelStyle"
      :hide-icon="hideIcon"
      :show-icon="showIcon"
      :input-class="inputClasses"
      :pt="pt"
      :pt-options="ptOptions"
      class="w-full"
    />

    <div v-if="showErrorMessage && hasError" :class="errorClass">
      <small>{{ errorMessage }}</small>
    </div>
  </div>
</template>
