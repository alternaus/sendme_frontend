<script lang="ts">
import { defineComponent, ref, watch } from 'vue'

import DatePicker from 'primevue/datepicker'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'

export default defineComponent({
  name: 'AppDatePicker',
  components: {
    DatePicker,
    InputGroup,
    InputGroupAddon,
  },
  props: {
    modelValue: {
      type: Date,
      default: null,
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

    watch(
      () => props.modelValue,
      (newValue) => {
        selectedDate.value = newValue ? new Date(newValue) : null
      },
      { immediate: true },
    )

    watch(selectedDate, (value) => {
      emit('update:modelValue', value)
    })

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
    </InputGroup>

    <DatePicker
      v-else
      v-model="selectedDate"
      size="small"
      :placeholder="placeholder"
      :showIcon="showIcon"
      :dateFormat="dateFormat"
      input-class="!w-full !rounded-xl"
      class="!w-full"
      :class="[customClass, { 'p-invalid': errorMessage.length > 0 }]"
    />

    <div v-if="errorMessage.length" class="text-red-400 dark:text-red-300 p-0 m-0">
      <small>{{ errorMessage }}</small>
    </div>
  </div>
</template>
