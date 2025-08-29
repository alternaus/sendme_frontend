<script setup lang="ts">
import { type PropType, ref, watch } from 'vue'

import { IconField, InputIcon } from 'primevue'
import FloatLabel from 'primevue/floatlabel'
import PrimeTextarea from 'primevue/textarea'

import AppAIGenerate from '@/components/atoms/editor/AppAIGenerate.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
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
  rows: {
    type: Number,
    default: 3,
  },
  errorMessage: {
    type: String,
    default: '',
  },
  showErrorMessage: {
    type: Boolean,
    default: true,
  },
  maxlength: {
    type: Number,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  variant: {
    type: String as PropType<'filled' | 'outlined'>,
    default: 'outlined',
  },
  useFloatLabel: {
    type: Boolean,
    default: true,
  },
  autoResize: {
    type: Boolean,
    default: false,
  },
  aiAttach: {
    type: Boolean,
    default: false,
  },
  aiInsertMode: {
    type: String as PropType<'replace' | 'append'>,
    default: 'replace',
  },
})
const emit = defineEmits(['update:modelValue'])
const internalValue = ref('')

watch(
  () => props.modelValue,
  value => {
    internalValue.value = value
  }
)

watch(internalValue, value => {
  emit('update:modelValue', value)
})
</script>
<template>
  <div class="w-full">
    <template v-if="useFloatLabel">
      <FloatLabel v-if="$slots.icon || aiAttach">
        <IconField>
          <InputIcon>
            <slot name="icon" />
            <template v-if="aiAttach">
              <AppAIGenerate
                type="sms"
                :currentText="String(internalValue ?? '')"
                @insert="
                  val =>
                    (internalValue =
                      aiInsertMode === 'append'
                        ? `${internalValue}${internalValue ? '\n' : ''}${String(val)}`
                        : String(val))
                "
              />
            </template>
          </InputIcon>
          <PrimeTextarea
            v-model="internalValue"
            v-bind="$attrs"
            :placeholder="placeholder"
            :size="size"
            :rows="rows"
            :readonly="readonly"
            :variant="variant"
            :autoResize="autoResize"
            class="!w-full !pl-10 !rounded-xl"
            :class="{ 'p-invalid': errorMessage.length > 0 }"
          />
        </IconField>
        <label class="text-sm">{{ label }}</label>
      </FloatLabel>

      <FloatLabel v-else>
        <PrimeTextarea
          v-model="internalValue"
          v-bind="$attrs"
          :placeholder="placeholder"
          :size="size"
          :rows="rows"
          :readonly="readonly"
          :variant="variant"
          :autoResize="autoResize"
          class="!w-full !rounded-xl"
          :class="{ 'p-invalid': errorMessage.length > 0 }"
        />
        <label class="text-sm">{{ label }}</label>
      </FloatLabel>
    </template>

    <template v-else>
      <PrimeTextarea
        v-model="internalValue"
        v-bind="$attrs"
        :placeholder="placeholder"
        :size="size"
        :rows="rows"
        :readonly="readonly"
        :variant="variant"
        :autoResize="autoResize"
        class="!w-full !rounded-xl"
        :class="{ 'p-invalid': errorMessage.length > 0 }"
      />
    </template>

    <div
      v-if="showErrorMessage && errorMessage.length"
      class="text-red-500 dark:text-red-400 p-0 m-0"
    >
      <small>{{ errorMessage }}</small>
    </div>
  </div>
</template>
