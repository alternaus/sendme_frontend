<!-- <script lang="ts">
import { defineComponent } from 'vue'

// import CustomCard from './components/CustomCard.vue'
import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'
export default defineComponent({
  name: 'BuyPage',
  components: {
    AppHeader,
    AppButton,
  },
  setup() {
    return {
      IconTypes,
    }
  },
})
</script>
<template>
  <AppHeader :icon="IconTypes.BUY" :text="$t('general.buy')" :actions="[]" />
  <div
    class="flex flex-col flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 lg:gap-5 p-4 w-fit mx-auto lg:mx-8"
  >
    <small class="text-lg text-center">
      {{ $t('general.choose_value_recharge') }}
    </small>
    <AppButton severity="primary" class="w-full sm:w-auto" :label="$t('general.pay')" />
    <small class="text-sm text-gray-700 dark:text-gray-200 text-center">
      {{ $t('general.info_description_recharge') }}
    </small>
  </div>
</template> -->

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppInputNumber from '@/components/atoms/inputs/AppInputNumber.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'

export default defineComponent({
  components: {
    AppHeader,
    AppButton,
    AppInputNumber,
  },
  setup() {
    const { t } = useI18n()
    const router = useRouter()
    const toast = useToast()

    const defaultValues = ref([
      { id: 1, value: 50000, currency: 'COP' },
      { id: 2, value: 100000, currency: 'COP' },
    ])
    const customValue = ref<number | undefined>(undefined)
    const selectedValue = ref<number | null>(null)

    const selectOption = (value: number) => {
      selectedValue.value = selectedValue.value === value ? null : value
      customValue.value = undefined
    }

    watch(customValue, (newValue) => {
      if (newValue !== undefined && newValue > 0) {
        selectedValue.value = null
      }
    })

    const formatCurrency = (valor: number, currency: string) => {
      const modeCurrency = currency === 'USD' ? 'en-US' : 'es-CO'
      return new Intl.NumberFormat(modeCurrency, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(valor)
    }

    const handlePayment = () => {
      if (selectedValue.value !== null) {
        console.log(`Valor de la recarga: ${selectedValue.value} COP`)
      } else if (customValue.value !== undefined && customValue.value > 0) {
        console.log(`Valor de la recarga: ${customValue.value} COP`)
      } else {
        toast.add({
          severity: 'warn',
          summary: t('general.warning'),
          detail: t('general.select_valid_recharge_value'),
          life: 3000,
        })
      }
    }

    return {
      router,
      IconTypes,
      t,
      defaultValues,
      formatCurrency,
      selectedValue,
      selectOption,
      customValue,
      handlePayment,
    }
  },
})
</script>

<template>
  <AppHeader :icon="IconTypes.BUY" :text="$t('general.buy_messages')" :actions="[]" />
  <div class="flex justify-start align-center gap-8 m-4">
    <div class="flex flex-col items-center">
      <small class="text-lg text-center">
        {{ $t('general.choose_value_recharge') }}
      </small>
      <div class="my-6 flex flex-row justify-center flex-wrap gap-6">
        <div
          class="flex flex-row flex-wrap"
          v-for="item in defaultValues"
          :key="item.id"
          @click="selectOption(item.value)"
        >
          <div
            class="flex flex-col items-center justify-center w-60 h-38 p-4 border-1 border-gray-900 rounded-md dark:border-white hover:shadow-2xl dark:hover:bg-neutral-600 hover:bg-[var(--p-primary-300)] cursor-pointer"
            :class="
              selectedValue === item.value ? 'bg-[var(--p-primary-color)] dark:bg-neutral-700' : ''
            "
          >
            <small class="text-xl font-semibold text-center">
              {{ formatCurrency(item.value, item.currency) }}
              <span class="text-xs">
                {{ item.currency }}
              </span>
            </small>
          </div>
        </div>
        <div
          class="flex flex-col items-center justify-center w-60 h-38 !p-4 border-1 border-gray-900 rounded-md dark:border-white hover:shadow-2xl cursor-pointer hover:bg-[var(--p-primary-300)]"
          :class="
              customValue && customValue > 0 ? 'bg-[var(--p-primary-color)] dark:bg-neutral-700' : ''
            "
        >
          <AppInputNumber
            v-model="customValue"
            mode="currency"
            currency="COP"
            suffix=" COP"
            locale="es-CO"
            class="!w-full text-center"
            :label="$t('general.enter_value')"
          />
        </div>
      </div>
      <AppButton class="!w-auto !px-8 mb-4" :label="$t('general.pay')" @click="handlePayment" />
      <small class="text-sm text-center text-slate-600 dark:text-slate-300">
        {{ $t('general.info_remember_recharge') }}
      </small>
    </div>
  </div>
</template>
