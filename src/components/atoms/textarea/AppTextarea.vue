<script setup lang="ts">
import { computed, ref, useAttrs, watch } from 'vue'

import { IconField, InputIcon } from 'primevue'
import FloatLabel from 'primevue/floatlabel'
import PrimeTextarea from 'primevue/textarea'

import AppAIGenerate from '@/components/atoms/editor/AppAIGenerate.vue'

type TextareaSize = 'small' | 'large'
type TextareaVariant = 'filled' | 'outlined'
type AiInsertMode = 'replace' | 'append'

interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  size?: TextareaSize
  rows?: number
  cols?: number
  errorMessage?: string
  showErrorMessage?: boolean
  maxlength?: number
  disabled?: boolean
  readonly?: boolean
  invalid?: boolean
  variant?: TextareaVariant
  useFloatLabel?: boolean
  autoResize?: boolean
  aiAttach?: boolean
  aiInsertMode?: AiInsertMode
  containerClass?: string
  textareaClass?: string
  errorClass?: string
  inputId?: string
  pt?: object
  ptOptions?: object
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  placeholder: '',
  size: 'small',
  rows: 3,
  errorMessage: '',
  showErrorMessage: true,
  disabled: false,
  readonly: false,
  invalid: false,
  variant: 'outlined',
  useFloatLabel: true,
  autoResize: false,
  aiAttach: false,
  aiInsertMode: 'replace',
  containerClass: 'w-full',
  textareaClass: '!w-full !rounded-xl',
  errorClass: 'text-red-500 dark:text-red-400 p-0 m-0'
})

defineOptions({
  inheritAttrs: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'focus': [event: Event]
  'blur': [event: Event]
  'keydown': [event: KeyboardEvent]
  'input': [event: Event]
}>()

const attrs = useAttrs()

// Filtrar atributos conflictivos
const blockKeys = [
  'modelValue', 'onUpdate:modelValue',
  'class', 'placeholder'
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
const effectivePlaceholder = computed(() => {
  return props.placeholder || props.label || ' '
})

// Determinar si hay error
const hasError = computed(() => props.errorMessage.length > 0 || props.invalid)

// Clases del textarea con estado de error y AI
const textareaClasses = computed(() => {
  const classes = [props.textareaClass]
  if (hasError.value) classes.push('p-invalid')
  if (hasIcon.value) classes.push('!pl-10')
  return classes.join(' ')
})

// Determinar si hay icono (slot o AI)
const hasIcon = computed(() => {
  const slots = attrs as Record<string, unknown>
  return !!(slots['onVnodeBeforeMount'] || slots['v-slot:icon']) || props.aiAttach
})

// ID único para el input
const inputId = computed(() => props.inputId || `app-textarea-${crypto.randomUUID()}`)

const internalValue = ref('')

// Sincronizar con modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    internalValue.value = newValue || ''
  },
  { immediate: true }
)

// Emitir cambios
watch(internalValue, (newValue) => {
  emit('update:modelValue', newValue)
})

// Manejar inserción de AI
const handleAiInsert = (aiText: string) => {
  if (props.aiInsertMode === 'append') {
    internalValue.value = `${internalValue.value}${internalValue.value ? '\n' : ''}${aiText}`
  } else {
    internalValue.value = aiText
  }
}
</script>
<template>
  <div :class="containerClasses">
    <!-- Con FloatLabel -->
    <template v-if="useFloatLabel">
      <!-- Con label y icono/AI -->
      <FloatLabel variant="on" v-if="label && hasIcon">
        <IconField>
          <InputIcon>
            <slot v-if="!aiAttach" name="icon" />
            <AppAIGenerate
              v-if="aiAttach"
              type="SMS"
              :current-text="String(internalValue ?? '')"
              @insert="handleAiInsert"
            />
          </InputIcon>
          <PrimeTextarea
            v-bind="forwardedAttrs"
            v-model="internalValue"
            :placeholder="effectivePlaceholder"
            :size="size"
            :rows="rows"
            :cols="cols"
            :maxlength="maxlength"
            :disabled="disabled"
            :readonly="readonly"
            :invalid="invalid"
            :variant="variant"
            :auto-resize="autoResize"
            :class="textareaClasses"
            :pt="pt"
            :pt-options="ptOptions"
            @focus="emit('focus', $event)"
            @blur="emit('blur', $event)"
            @keydown="emit('keydown', $event as KeyboardEvent)"
            @input="emit('input', $event)"
            :input-id="inputId"
          />
        </IconField>
        <label class="text-sm">{{ label }}</label>
      </FloatLabel>

      <!-- Con label sin icono -->
      <FloatLabel variant="on" v-else-if="label">
        <PrimeTextarea
          v-bind="forwardedAttrs"
          v-model="internalValue"
          :placeholder="effectivePlaceholder"
          :size="size"
          :rows="rows"
          :cols="cols"
          :maxlength="maxlength"
          :disabled="disabled"
          :readonly="readonly"
          :invalid="invalid"
          :variant="variant"
          :auto-resize="autoResize"
          :class="textareaClasses"
          :pt="pt"
          :pt-options="ptOptions"
          @focus="emit('focus', $event)"
          @blur="emit('blur', $event)"
          @keydown="emit('keydown', $event as KeyboardEvent)"
          @input="emit('input', $event)"
          :input-id="inputId"
        />
        <label class="text-sm">{{ label }}</label>
      </FloatLabel>

      <!-- Sin label con icono/AI -->
      <IconField v-else-if="hasIcon">
        <InputIcon>
          <slot v-if="!aiAttach" name="icon" />
          <AppAIGenerate
            v-if="aiAttach"
            type="SMS"
            :current-text="String(internalValue ?? '')"
            @insert="handleAiInsert"
          />
        </InputIcon>
        <PrimeTextarea
          v-bind="forwardedAttrs"
          v-model="internalValue"
          :placeholder="placeholder"
          :size="size"
          :rows="rows"
          :cols="cols"
          :maxlength="maxlength"
          :disabled="disabled"
          :readonly="readonly"
          :invalid="invalid"
          :variant="variant"
          :auto-resize="autoResize"
          :class="textareaClasses"
          :pt="pt"
          :pt-options="ptOptions"
          :input-id="inputId"
          @focus="emit('focus', $event)"
          @blur="emit('blur', $event)"
          @keydown="emit('keydown', $event as KeyboardEvent)"
          @input="emit('input', $event)"
        />
      </IconField>

      <!-- Sin label sin icono pero con FloatLabel -->
      <FloatLabel variant="on" v-else>
        <PrimeTextarea
          v-bind="forwardedAttrs"
          v-model="internalValue"
          :placeholder="effectivePlaceholder"
          :size="size"
          :rows="rows"
          :cols="cols"
          :maxlength="maxlength"
          :disabled="disabled"
          :readonly="readonly"
          :invalid="invalid"
          :variant="variant"
          :auto-resize="autoResize"
          :class="textareaClasses"
          :pt="pt"
          :pt-options="ptOptions"
          :input-id="inputId"
          @focus="emit('focus', $event)"
          @blur="emit('blur', $event)"
          @keydown="emit('keydown', $event as KeyboardEvent)"
          @input="emit('input', $event)"
        />
        <label class="text-sm">&nbsp;</label>
      </FloatLabel>
    </template>

    <!-- Sin FloatLabel -->
    <template v-else>
      <!-- Con icono/AI -->
      <IconField v-if="hasIcon">
        <InputIcon>
          <slot v-if="!aiAttach" name="icon" />
          <AppAIGenerate
            v-if="aiAttach"
            type="SMS"
            :current-text="String(internalValue ?? '')"
            @insert="handleAiInsert"
          />
        </InputIcon>
        <PrimeTextarea
          v-bind="forwardedAttrs"
          v-model="internalValue"
          :placeholder="placeholder"
          :size="size"
          :rows="rows"
          :cols="cols"
          :maxlength="maxlength"
          :disabled="disabled"
          :readonly="readonly"
          :invalid="invalid"
          :variant="variant"
          :auto-resize="autoResize"
          :class="textareaClasses"
          :pt="pt"
          :pt-options="ptOptions"
          :input-id="inputId"
          @focus="emit('focus', $event)"
          @blur="emit('blur', $event)"
          @keydown="emit('keydown', $event as KeyboardEvent)"
          @input="emit('input', $event)"
        />
      </IconField>

      <!-- Sin icono -->
      <PrimeTextarea
        v-else
        v-bind="forwardedAttrs"
        v-model="internalValue"
        :placeholder="placeholder"
        :size="size"
        :rows="rows"
        :cols="cols"
        :maxlength="maxlength"
        :disabled="disabled"
        :readonly="readonly"
        :invalid="invalid"
        :variant="variant"
        :auto-resize="autoResize"
        :class="textareaClasses"
        :pt="pt"
        :pt-options="ptOptions"
        :input-id="inputId"
        @focus="emit('focus', $event)"
        @blur="emit('blur', $event)"
        @keydown="emit('keydown', $event as KeyboardEvent)"
        @input="emit('input', $event)"
      />
    </template>

    <!-- Mensaje de error -->
    <div v-if="showErrorMessage && hasError" :class="errorClass">
      <small>{{ errorMessage }}</small>
    </div>
  </div>
</template>
