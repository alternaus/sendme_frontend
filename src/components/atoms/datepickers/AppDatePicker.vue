<script lang="ts">
import { defineComponent, type PropType, ref, watch } from 'vue'

import DatePicker from 'primevue/datepicker'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import FloatLabel from 'primevue/floatlabel'
export default defineComponent({
  name: 'AppDatePicker',
  components: {
    DatePicker,
    InputGroup,
    InputGroupAddon,
    FloatLabel
  },
  props: {
    modelValue: {
      type: [Date, null] as PropType<Date | null>,
      default: null,
    },
    label: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: 'Seleccione una fecha',
    },
    showIcon: {
      type: Boolean,
      default: false,
    },
    dateFormat: {
      type: String,
      default: 'dd/mm/yy',
    },
    errorMessage: {
      type: String,
      default: '',
    },
    customClass: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const selectedDate = ref<Date | null>(null)

    // ✅ Actualiza el valor inicial correctamente
    watch(
      () => props.modelValue,
      (newValue) => {
        if (newValue instanceof Date) {
          selectedDate.value = newValue
        } else {
          selectedDate.value = null
        }
      },
      { immediate: true },
    )

    // ✅ Evita emitir valores innecesarios con debounce y comparación previa
    let previousValue: Date | null = selectedDate.value

    watch(
      selectedDate,
      (value) => {
        if (
          (value instanceof Date && previousValue?.getTime() !== value.getTime()) ||
          (value === null && previousValue !== null)
        ) {
          previousValue = value
          emit('update:modelValue', value)
        }
      },
      { deep: true },
    )

    return {
      selectedDate,
    }
  },
})
</script>
<template>
  <div class="w-full">
    <InputGroup v-if="$slots.icon">
      <InputGroupAddon class="!rounded-l-xl !border-r-0">
        <slot name="icon"></slot>
      </InputGroupAddon>
      <FloatLabel>
      <DatePicker
        v-model="selectedDate"
        size="small"
        :placeholder="placeholder"
        :showIcon="false"
        :dateFormat="dateFormat"
        input-class="!w-full !rounded-r-xl !border-l-0"
        class="!w-full"
        :class="[customClass, { 'p-invalid': errorMessage.length > 0 }]"
      />
      <label :for="inputId">{{ label }}</label>
      </FloatLabel>
    </InputGroup>

    <FloatLabel v-else>

      <DatePicker
      v-model="selectedDate"
      size="small"
      :placeholder="placeholder"
      :showIcon="showIcon"
      :dateFormat="dateFormat"
      input-class="!w-full !rounded-xl"
      class="!w-full"
      :class="[customClass, { 'p-invalid': errorMessage.length > 0 }]"
      />
      <label :for="inputId">{{ label }}</label>
    </FloatLabel>
      
    <div v-if="errorMessage.length" class="text-red-400 dark:text-red-300 p-0 m-0">
      <small>{{ errorMessage }}</small>
    </div>
  </div>
</template>
