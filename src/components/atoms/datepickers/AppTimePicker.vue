<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import DatePicker from 'primevue/datepicker'

export default defineComponent({
  name: 'AppTimePicker',
  components: {
    DatePicker,
  },
  props: {
    modelValue: {
      type: Date,
      required: true,
    },
    label: {
      type: String,
      default: '',
    },
    hourFormat: {
      type: String as () => '12' | '24',
      default: '12',
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
    const selectedTime = ref<Date | null>(props.modelValue ? new Date(props.modelValue) : null)

    watch(selectedTime, (value) => {
      emit('update:modelValue', value)
    })

    return {
      selectedTime,
    }
  },
})
</script>

<template>
  <div class="w-full">
    <DatePicker
      v-model="selectedTime"
      timeOnly
      size="small"
      inputClass="!w-full !rounded-xl"
      class="!w-full rounded-xl"
      :class="{ 'p-invalid': errorMessage.length > 0 }"
      :hourFormat="hourFormat"
    />
    <div v-if="errorMessage.length" class="text-red-400 dark:text-red-300 p-0 m-0">
      <small>{{ errorMessage }}</small>
    </div>
  </div>
</template>

<style scoped></style>
