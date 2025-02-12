<script lang="ts">
import { defineComponent } from 'vue'

import Password from 'primevue/password'

export default defineComponent({
  name: 'AppInputPassword',
  components: {
    Password,
  },
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: 'Ingrese su contraseña',
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
    <Password
      :placeholder="placeholder"
      :feedback="false"
      toggleMask
      size="small"
      class="w-full"
      inputClass="w-full !rounded-xl"
      :class="{ 'p-invalid': errorMessage.length > 0 }"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />

    <div
      v-if="showErrorMessage && errorMessage.length"
      class="text-red-400 dark:text-red-300 p-0 m-0"
    >
      <small>{{ errorMessage }}</small>
    </div>
  </div>
</template>
