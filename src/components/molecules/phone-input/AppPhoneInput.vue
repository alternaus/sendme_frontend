<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import FloatLabel from 'primevue/floatlabel'
import InputGroup from 'primevue/inputgroup'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'

import allCountriesData from './all-countries'
import { usePhoneFormat } from './composables/usePhoneFormat'
import type { CountryObject } from './interfaces/countries.interface'

let uid = 0

interface Props {
  modelValue?: string
  countryCode?: string
  label?: string
  placeholder?: string
  size?: 'small' | 'large'
  disabled?: boolean
  required?: boolean
  invalid?: boolean
  errorMessage?: string
  showErrorMessage?: boolean
  inputId?: string
  defaultCountry?: string
  preferredCountries?: string[]
}

interface Emits {
  (event: 'update:modelValue', value: string): void
  (event: 'update:countryCode', value: string): void
  (event: 'input', value: { number: string; valid: boolean; country: { dialCode: string } }): void
  (event: 'country-changed', country: CountryObject): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  countryCode: '',
  label: '',
  placeholder: 'Número de teléfono',
  size: 'small',
  disabled: false,
  required: false,
  invalid: false,
  errorMessage: '',
  showErrorMessage: true,
  inputId: '',
  defaultCountry: 'co',
  preferredCountries: () => []
})

const emit = defineEmits<Emits>()


const id = ref('')
if (!props.inputId) {
  id.value = `app-phone-input-${++uid}`
} else {
  id.value = props.inputId
}

const invalidClass = computed(() => ({ 'p-invalid': props.errorMessage.length > 0 }))
const inputClasses = computed(() => ['!w-full !rounded-xl', invalidClass.value])
const selectClasses = computed(() => ['!rounded-l-xl', invalidClass.value])


const {
  rawPhoneNumber,
  formattedPhoneNumber,
  isCurrentNumberValid,
  updatePhoneNumber,
  handleFormattedInput,
  parseFullPhoneNumber
} = usePhoneFormat()


const toLowerCase = (str: string) => str.toLowerCase()

const countries = computed((): CountryObject[] => {
  const allCountries = [...allCountriesData]

  if (props.preferredCountries?.length > 0) {
    const preferred: CountryObject[] = []
    const others: CountryObject[] = []

    allCountries.forEach(country => {
      if (props.preferredCountries.includes(country.iso2)) {
        preferred.push(country)
      } else {
        others.push(country)
      }
    })

    preferred.sort((a, b) => {
      const indexA = props.preferredCountries.indexOf(a.iso2)
      const indexB = props.preferredCountries.indexOf(b.iso2)
      return indexA - indexB
    })

    return [...preferred, ...others]
  }

  return allCountries
})

const selectedCountry = ref<CountryObject | null>(null)

const initializeDefaultCountry = () => {
  const defaultCountry = countries.value.find(
    country => country.iso2.toLowerCase() === props.defaultCountry.toLowerCase()
  )
  if (defaultCountry) {
    selectedCountry.value = defaultCountry
  } else {
    selectedCountry.value = countries.value[0] || null
  }
}

const fullPhoneNumber = computed(() => {
  if (!selectedCountry.value || !rawPhoneNumber.value) return ''
  return `+${selectedCountry.value.dialCode}${rawPhoneNumber.value}`
})

watch(fullPhoneNumber, (newValue) => {
  emit('update:modelValue', newValue)

  if (selectedCountry.value && rawPhoneNumber.value) {
    emit('input', {
      number: newValue,
      valid: isCurrentNumberValid.value,
      country: {
        dialCode: selectedCountry.value.dialCode
      }
    })
  }
})

watch(selectedCountry, (newCountry) => {
  if (newCountry) {
    emit('update:countryCode', newCountry.dialCode)
    emit('country-changed', newCountry)
    if (rawPhoneNumber.value) {
      updatePhoneNumber(rawPhoneNumber.value, newCountry.iso2)
    }
  }
})

watch(() => props.modelValue, (newValue) => {
  if (newValue && newValue !== fullPhoneNumber.value) {

    const { countryCode, localNumber } = parseFullPhoneNumber(newValue)

    if (countryCode) {

      const country = countries.value.find(c => c.iso2.toLowerCase() === countryCode.toLowerCase())
      if (country) {
        selectedCountry.value = country
        updatePhoneNumber(localNumber, country.iso2)
        return
      }
    }


    const cleanNumber = newValue.replace(/^\+/, '')
    updatePhoneNumber(cleanNumber, selectedCountry.value?.iso2)
  }
}, { immediate: true })



const handleInputChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const inputValue = target.value


  handleFormattedInput(inputValue, selectedCountry.value?.iso2)


  target.value = formattedPhoneNumber.value
}

initializeDefaultCountry()
</script>

<template>
  <div class="w-full">
    <FloatLabel>
      <InputGroup class="!w-full">
        <InputGroupAddon>
          <Select v-model="selectedCountry" :options="countries" option-label="name" :size="size" :disabled="disabled"
            :invalid="invalid || !!errorMessage" class="!w-min !rounded-l-xl !h-full" :class="selectClasses"
            :show-clear="false" filter filter-placeholder="Buscar país...">
            <template #value="{ value }">
              <div v-if="value" class="flex items-center gap-1">
                <span :class="['country-flag', toLowerCase(value.iso2), 'text-sm']"></span>
                <span class="text-sm">+{{ value.dialCode }}</span>
              </div>
              <span v-else class="text-xs">🌍</span>
            </template>

            <template #option="{ option }">
              <div class="flex items-center gap-2">
                <span :class="['country-flag', toLowerCase(option.iso2), 'text-sm']"></span>
                <span>{{ option.name }}</span>
                <span class="text-surface-500 ml-auto">+{{ option.dialCode }}</span>
              </div>
            </template>
          </Select>
        </InputGroupAddon>


        <InputText :id="id" v-model="formattedPhoneNumber" :placeholder="placeholder" :size="size" :disabled="disabled"
          :required="required" :invalid="invalid || !!errorMessage" type="tel"
          class="!flex-1 !rounded-r-xl !rounded-l-none !w-full" :class="inputClasses" @input="handleInputChange" />
      </InputGroup>
      <label class="text-sm" :for="id">{{ label }}</label>
    </FloatLabel>

    <div v-if="showErrorMessage && errorMessage.length" class="text-red-400 dark:text-red-300 p-0 m-0">
      <small>{{ errorMessage }}</small>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "./scss/country-flags.scss";

:deep(.p-inputgroup) {
  .p-select {
    border-right: none !important;
    border-top-right-radius: 0 !important;
    border-bottom-right-radius: 0 !important;

    .p-select-label {
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      min-width: fit-content;
    }

    &.p-select-sm {
      .p-select-label {
        padding: 0.375rem 0.5rem;
        font-size: 0.75rem;
      }
    }
  }

  .p-inputtext {
    border-left: none !important;

  }

  &> :first-child {
    border-top-right-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
  }

  &> :last-child {
    border-top-left-radius: 0 !important;
    border-bottom-left-radius: 0 !important;
  }
}

:deep(.p-select) {
  width: auto !important;
  min-width: fit-content !important;

}
</style>
