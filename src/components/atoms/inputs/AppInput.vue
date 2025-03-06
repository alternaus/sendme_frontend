<script lang="ts">
import { defineComponent, type PropType } from 'vue'

import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputText from 'primevue/inputtext'
import FloatLabel from 'primevue/floatlabel'

export default defineComponent({
  name: 'AppInput',
  components: {
    InputText,
    InputGroup,
    InputGroupAddon,
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
})
</script>

<template>
  <div class="w-full">
    <!-- ✅ Input con icono -->
    <InputGroup v-if="$slots.icon">
      <InputGroupAddon class="!rounded-l-xl !border-r-0">
        <slot name="icon"></slot>
      </InputGroupAddon>
      <FloatLabel>
        <InputText
          :type="type"
          :placeholder="placeholder"
          :size="size"
          class="!w-full !rounded-r-xl !border-l-0"
          :class="{ 'p-invalid': errorMessage.length > 0 }"
          :value="modelValue"
          @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        />
        <label :for="inputId">{{ label }}</label>
      </FloatLabel>
    </InputGroup>

    <FloatLabel v-else>
      <InputText
        :type="type"
        :placeholder="placeholder"
        :size="size"
        class="!w-full !rounded-xl"
        :class="{ 'p-invalid': errorMessage.length > 0 }"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <label :for="inputId">{{ label }}</label>
    </FloatLabel>

    <div
      v-if="showErrorMessage && errorMessage.length"
      class="text-red-400 dark:text-red-300 p-0 m-0"
    >
      <small>{{ errorMessage }}</small>
    </div>
  </div>
</template>
