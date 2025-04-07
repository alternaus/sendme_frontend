<script lang="ts">
import { defineComponent, ref, watch } from 'vue'

import PrimeDialog from 'primevue/dialog'

export default defineComponent({
  name: 'AppDialog',
  components: {
    PrimeDialog,
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    header: {
      type: String,
      default: '',
    },
    modal: {
      type: Boolean,
      default: true,
    },
    closable: {
      type: Boolean,
      default: true,
    },
    dismissableMask: {
      type: Boolean,
      default: true,
    },
    draggable: {
      type: Boolean,
      default: true,
    },
    maximizable: {
      type: Boolean,
      default: false,
    },
    customClass: {
      type: String,
      default: '',
    },
    width: {
      type: String,
      default: '50vw',
    },
    breakpoints: {
      type: Object,
      default: () => ({
        '1199px': '75vw', 
        '575px': '90vw',  
      }),
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const isVisible = ref(false)

    watch(
      () => props.modelValue,
      (newValue) => {
        isVisible.value = newValue
      },
      { immediate: true },
    )

    watch(
      () => props.modelValue,
      (newValue) => {
        isVisible.value = newValue
      },
    )

    watch(isVisible, (newValue) => {
      emit('update:modelValue', newValue)
    })

    return {
      isVisible,
    }
  },
})
</script>

<template>
  <PrimeDialog
    v-model:visible="isVisible"
    :modal="modal"
    :header="header"
    :closable="closable"
    :dismissableMask="dismissableMask"
    :draggable="draggable"
    :maximizable="maximizable"
    :class="customClass"
    :style="{ width }"
    :breakpoints="breakpoints"
  >
    <slot name="content"> </slot>

    <template #footer>
      <slot name="footer"> </slot>
    </template>
  </PrimeDialog>
</template>
