<script lang="ts">
import { computed, defineComponent, type PropType } from 'vue'

import Steps from 'primevue/steps'

export default defineComponent({
  name: 'AppStepper',
  components: {
    Steps,
  },
  props: {
    modelValue: {
      type: Number,
      required: true,
    },
    steps: {
      type: Array as PropType<{ label: string; icon?: string }[]>,
      required: true,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const activeStep = computed({
      get: () => props.modelValue,
      set: (value: number) => emit('update:modelValue', value),
    })

    const handleItemClick = (event: { index: number }) => {
      emit('update:modelValue', event.index)
    }

    return {
      activeStep,
      handleItemClick,
    }
  },
})
</script>

<template>
  <div class="w-full flex justify-center">
    <div class="max-w-2xl w-full px-4">
      <Steps :model="steps" :activeStep="activeStep" @item-click="handleItemClick" class="custom-stepper" />
    </div>
  </div>
</template>

<style scoped>
:deep(.p-steps) {
  background: none;
  padding: 0;
}

:deep(.p-steps .p-steps-item .p-steps-number) {
  background: var(--p-primary-color);
  color: black;
  border-radius: 50%;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.75rem;
}

:deep(.p-steps .p-steps-item.p-highlight .p-steps-number) {
  background: var(--p-primary-color);
  color: black;
}

:deep(.p-steps .p-steps-item .p-steps-title) {
  font-weight: 500;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

:deep(.p-steps .p-steps-item .p-steps-connector) {
  background-color: var(--p-primary-color);
}

:deep(.p-steps .p-steps-item:not(.p-highlight):not(.p-disabled) .p-steps-connector) {
  background-color: #e5e7eb;
}

:deep(.dark .p-steps .p-steps-item:not(.p-highlight):not(.p-disabled) .p-steps-connector) {
  background-color: #374151;
}
</style>
