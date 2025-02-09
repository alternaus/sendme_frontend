<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import InputText from 'primevue/inputtext'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'

export default defineComponent({
  name: 'AppInput',
  components: {
    InputText,
    InputGroup,
    InputGroupAddon,
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
  },
  emits: ['update:modelValue'],
})
</script>

<template>
  <div class="w-full">
    <InputGroup v-if="$slots.icon">
      <InputGroupAddon class="!rounded-l-xl !border-r-0">
        <slot name="icon"></slot>
      </InputGroupAddon>
      <InputText
        :type="type"
        :placeholder="placeholder"
        :size="size"
        class="!w-full !rounded-r-xl !border-l-0"
        :class="{ 'p-invalid': errorMessage.length > 0 }"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
    </InputGroup>

    <InputText
      v-else
      :type="type"
      :placeholder="placeholder"
      :size="size"
      class="!w-full !rounded-xl"
      :class="{ 'p-invalid': errorMessage.length > 0 }"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />

    <div v-if="errorMessage.length" class="text-red-400 dark:text-red-300 p-0 m-0">
      <small>{{ errorMessage }}</small>
    </div>
  </div>
</template>
