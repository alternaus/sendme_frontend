<script lang="ts">
import { computed,defineComponent, type PropType, ref, toRefs, watch } from 'vue'

import { IconField, InputIcon } from 'primevue'
import FloatLabel from 'primevue/floatlabel'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'

let uid = 0

export default defineComponent({
  name: 'AppInput',
  components: { InputText, InputNumber, IconField, InputIcon, FloatLabel },
  props: {
    modelValue: { type: [String, Number] as PropType<string | number | null>, default: '' },
    type: { type: String as PropType<'text' | 'email' | 'password' | 'number' | 'tel'>, default: 'text' },
    label: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    size: { type: String as PropType<'small' | 'large'>, default: 'small' },
    errorMessage: { type: String, default: '' },
    showErrorMessage: { type: Boolean, default: true },
    inputId: { type: String, default: '' },

    /* Opcionales para number */
    numberUseGrouping: { type: Boolean, default: false },
    numberMinFractionDigits: { type: Number, default: undefined },
    numberMaxFractionDigits: { type: Number, default: undefined },
  },
  emits: ['update:modelValue'],
  setup(props, { emit, slots }) {
    const { modelValue, inputId } = toRefs(props)
    const id = ref(inputId.value || `app-input-${++uid}`)

    const isNumber = computed(
      () => props.type === 'number' || typeof props.modelValue === 'number'
    )

    const internalText = ref(
      typeof modelValue.value === 'string' ? modelValue.value : String(modelValue.value ?? '')
    )
    const internalNumber = ref<number | null>(
      typeof modelValue.value === 'number'
        ? modelValue.value
        : Number.isFinite(Number(modelValue.value))
          ? Number(modelValue.value)
          : null
    )

    watch(
      () => props.modelValue,
      v => {
        if (isNumber.value) {
          internalNumber.value =
            typeof v === 'number'
              ? v
              : Number.isFinite(Number(v))
                ? Number(v)
                : null
        } else {
          internalText.value = typeof v === 'string' ? v : String(v ?? '')
        }
      }
    )

    watch(internalText, v => {
      if (!isNumber.value) emit('update:modelValue', v)
    })
    watch(internalNumber, v => {
      if (isNumber.value) emit('update:modelValue', v)
    })

    const invalidClass = computed(() => ({ 'p-invalid': props.errorMessage.length > 0 }))
    const inputClasses = computed(() => ['!w-full !rounded-xl', invalidClass.value])
    const wrapperClass = '!w-full'

    return {
      id, isNumber, internalText, internalNumber, inputClasses, wrapperClass, slots
    }
  },
})
</script>

<template>
  <div class="w-full">
    <!-- Con label y FloatLabel -->
    <template v-if="label">
      <FloatLabel v-if="$slots.icon">
        <IconField>
          <InputIcon><slot name="icon" /></InputIcon>

          <!-- Number -->
          <InputNumber
            v-if="isNumber"
            :size="size"
            v-model="internalNumber"
            :inputId="id"
            :placeholder="placeholder"
            :useGrouping="numberUseGrouping"
            :minFractionDigits="numberMinFractionDigits"
            :maxFractionDigits="numberMaxFractionDigits"
            :class="wrapperClass"
            :inputClass="inputClasses"
          />

          <!-- Textual -->
          <InputText
            v-else
            :id="id"
            v-model="internalText"
            :type="type"
            :placeholder="placeholder"
            :size="size"
            class="!w-full !rounded-xl"
            :class="{ 'p-invalid': errorMessage.length > 0 }"
          />
        </IconField>
        <label class="text-sm" :for="id">{{ label }}</label>
      </FloatLabel>

      <FloatLabel v-else>
        <InputNumber
          v-if="isNumber"
          v-model="internalNumber"
          :inputId="id"
           :size="size"
          :placeholder="placeholder"
          :useGrouping="numberUseGrouping"
          :minFractionDigits="numberMinFractionDigits"
          :maxFractionDigits="numberMaxFractionDigits"
          :class="wrapperClass"
          :inputClass="inputClasses"
        />
        <InputText
          v-else
          :id="id"
          v-model="internalText"
          :type="type"
          :placeholder="placeholder"
          :size="size"
          class="!w-full !rounded-xl"
          :class="{ 'p-invalid': errorMessage.length > 0 }"
        />
        <label class="text-sm" :for="id">{{ label }}</label>
      </FloatLabel>
    </template>

    <!-- Sin label, solo input -->
    <template v-else>
      <IconField v-if="$slots.icon">
        <InputIcon><slot name="icon" /></InputIcon>

        <!-- Number -->
        <InputNumber
          v-if="isNumber"
          :size="size"
          v-model="internalNumber"
          :inputId="id"
          :placeholder="placeholder"
          :useGrouping="numberUseGrouping"
          :minFractionDigits="numberMinFractionDigits"
          :maxFractionDigits="numberMaxFractionDigits"
          :class="wrapperClass"
          :inputClass="inputClasses"
        />

        <!-- Textual -->
        <InputText
          v-else
          :id="id"
          v-model="internalText"
          :type="type"
          :placeholder="placeholder"
          :size="size"
          class="!w-full !rounded-xl"
          :class="{ 'p-invalid': errorMessage.length > 0 }"
        />
      </IconField>

      <template v-else>
        <InputNumber
          v-if="isNumber"
          v-model="internalNumber"
          :inputId="id"
           :size="size"
          :placeholder="placeholder"
          :useGrouping="numberUseGrouping"
          :minFractionDigits="numberMinFractionDigits"
          :maxFractionDigits="numberMaxFractionDigits"
          :class="wrapperClass"
          :inputClass="inputClasses"
        />
        <InputText
          v-else
          :id="id"
          v-model="internalText"
          :type="type"
          :placeholder="placeholder"
          :size="size"
          class="!w-full !rounded-xl"
          :class="{ 'p-invalid': errorMessage.length > 0 }"
        />
      </template>
    </template>

    <div v-if="showErrorMessage && errorMessage.length" class="text-red-400 dark:text-red-300 p-0 m-0">
      <small>{{ errorMessage }}</small>
    </div>
  </div>
</template>

<style scoped>
/* Ocultar flechas para inputs nativos si llegas a usar type="number" */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
input[type="number"] { -moz-appearance: textfield; }
</style>
