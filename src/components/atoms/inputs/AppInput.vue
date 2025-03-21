<script lang="ts">
import { defineComponent, type PropType, ref, toRefs, watch } from 'vue'

import { IconField, InputIcon } from 'primevue'
import FloatLabel from 'primevue/floatlabel'
import InputText from 'primevue/inputtext'

export default defineComponent({
  name: 'AppInput',
  components: {
    InputText,
    IconField,
    InputIcon,
    FloatLabel,
  },
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'text',
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
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { modelValue } = toRefs(props)
    const internalValue = ref(modelValue.value)
    watch(
      () => props.modelValue,
      (value) => {
        internalValue.value = value
      }
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
        <InputText v-model="internalValue" :type="type" :placeholder="placeholder" :size="size"
          class="!w-full !rounded-xl" :class="{ 'p-invalid': errorMessage.length > 0 }" />
      </IconField>
      <label class="text-sm">{{ label }}</label>
    </FloatLabel>

    <FloatLabel v-else>
      <InputText v-model="internalValue" :type="type" :placeholder="placeholder" :size="size"
        class="!w-full !rounded-xl" :class="{ 'p-invalid': errorMessage.length > 0 }" />
      <label class="text-sm">{{ label }}</label>
    </FloatLabel>

    <div v-if="showErrorMessage && errorMessage.length" class="text-red-400 dark:text-red-300 p-0 m-0">
      <small>{{ errorMessage }}</small>
    </div>
  </div>
</template>
