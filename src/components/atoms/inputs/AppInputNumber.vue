<script lang="ts">
import { defineComponent, type PropType, ref, toRefs, watch } from 'vue'

import { IconField, InputIcon } from 'primevue'
import FloatLabel from 'primevue/floatlabel'
import InputNumber from 'primevue/inputnumber'

export default defineComponent({
  name: 'AppInputNumber',
  components: {
    InputNumber,
    IconField,
    InputIcon,
    FloatLabel,
  },
  props: {
    modelValue: {
      type: Number,
      default: 0,
    },
    label: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    size: {
      type: String as PropType<'small' | 'large'>,
      default: 'small',
    },
    errorMessage: {
      type: String,
      default: '',
    },
    showErrorMessage: {
      type: Boolean,
      default: true,
    },
    min: {
      type: Number,
      default: null,
    },
    max: {
      type: Number,
      default: null,
    },
    step: {
      type: Number,
      default: 1,
    },
    showButtons: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String as PropType<'decimal' | 'currency'>,
      default: 'decimal',
    },
    currency: {
      type: String,
      default: 'USD',
    },
    locale: {
      type: String,
      default: 'en-US',
    },
    suffix : {
      type: String,
      default: '',
    },
    prefix : {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { modelValue } = toRefs(props)
    const internalValue = ref(modelValue.value)
    watch(
      () => props.modelValue,
      (value) => {
        internalValue.value = value
      },
    )

    watch(internalValue, (value) => {
      emit('update:modelValue', value)
    })

    return {
      internalValue,
    }
  },
})
</script>
<template>
  <div class="w-full">
    <FloatLabel v-if="$slots.icon">
      <IconField>
        <InputIcon>
          <slot name="icon"></slot>
        </InputIcon>
        <InputNumber
          v-model="internalValue"
          :placeholder="placeholder"
          :min="min"
          :max="max"
          :step="step"
          :showButtons="showButtons"
          :mode="mode"
          :currency="currency"
          :locale="locale"
          class="!w-full !rounded-xl"
          :class="{ 'p-invalid': errorMessage.length > 0 }"
        />
      </IconField>
      <label class="text-sm">{{ label }}</label>
    </FloatLabel>
    <FloatLabel v-else>
      <IconField>
        <InputNumber
          v-model="internalValue"
          :placeholder="placeholder"
          :min="min"
          :max="max"
          :step="step"
          :showButtons="showButtons"
          :mode="mode"
          :currency="currency"
          :locale="locale"
          :suffix="suffix"
          :prefix="prefix"
          class="!w-full !rounded-xl"
          :class="{ 'p-invalid': errorMessage.length > 0 }"
        />
      </IconField>
      <label class="text-sm">{{ label }}</label>
    </FloatLabel>

    <div v-if="showErrorMessage && errorMessage.length" class="text-red-400 dark:text-red-300 p-0 m-0">
      <small>{{ errorMessage }}</small>
    </div>
  </div>
</template>
