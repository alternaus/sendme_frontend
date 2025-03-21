<script  lang="ts">
import { defineComponent, type PropType, ref, toRefs,watch  } from 'vue'

import FloatLabel from 'primevue/floatlabel'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import PrimeTextarea from 'primevue/textarea';

export default defineComponent({
  name: 'AppTextarea',
  components: {
    PrimeTextarea,
    InputGroup,
    InputGroupAddon,
    FloatLabel,
  },
  props:{
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
    <InputGroup v-if="$slots.icon">
      <InputGroupAddon class="!rounded-l-xl !border-r-0">
        <slot name="icon"></slot>
      </InputGroupAddon>
      <FloatLabel>
        <PrimeTextarea
          v-model="internalValue"
          :placeholder="placeholder"
          :size="size"
          :rows="rows"
          :maxlength="maxlength"
          class="!w-full !rounded-r-xl !border-l-0"
          :class="{ 'p-invalid': errorMessage.length > 0 }"
          />
          <label>{{ label }}</label>
        </FloatLabel>
      </InputGroup>
      
      <FloatLabel v-else>
        <PrimeTextarea
        v-model="internalValue"
        :placeholder="placeholder"
        :size="size"
        :rows="rows"
        :maxlength="maxlength"
        class="!w-full !rounded-xl"
        :class="{ 'p-invalid': errorMessage.length > 0 }"
      />
      <label>{{ label }}</label>
    </FloatLabel>

    <div v-if="showErrorMessage && errorMessage.length" class="text-red-400 dark:text-red-300 p-0 m-0">
      <small>{{ errorMessage }}</small>
    </div>
  </div>
</template>