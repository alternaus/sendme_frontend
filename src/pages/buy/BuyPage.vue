<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'

import { useToast } from 'primevue/usetoast'

import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppInputNumber from '@/components/atoms/inputs/AppInputNumber.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'
import { useAuthStore } from '@/stores/useAuthStore'

import PaymentProviderSelector from '../enrollment/components/PaymentProviderSelector.vue'

export default defineComponent({
  components: { AppHeader, AppButton, AppInputNumber, PaymentProviderSelector },
  setup() {
    const { t } = useI18n()
    const toast = useToast()

    const auth = useAuthStore()
    const { user } = storeToRefs(auth)
    const organizationId = computed(() => user.value?.organizationId ?? '')

    const defaultValues = ref([
      { id: 1, value: 50000, currency: 'COP' },
      { id: 2, value: 100000, currency: 'COP' },
    ])
    const customValue = ref<number | undefined>()
    const selectedValue = ref<number | null>(null)
    const showProviders = ref(false)

    const customerInfo = ref({ name: '', email: '', dni: '', company: '', phone: '' })

    const amount = computed<number>(() => selectedValue.value ?? customValue.value ?? 0)

    const selectOption = (v: number) => {
      selectedValue.value = selectedValue.value === v ? null : v
      customValue.value = undefined
    }
    watch(customValue, (nv) => { if (nv && nv > 0) selectedValue.value = null })

    const formatCurrency = (valor: number, currency: string) =>
      new Intl.NumberFormat('es-CO', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valor)

    const handlePayClick = () => {
      if (!amount.value || amount.value <= 0) {
        toast.add({ severity: 'warn', summary: t('general.warning'), detail: t('general.select_valid_recharge_value'), life: 3000 })
        return
      }
      if (!organizationId.value) {
        toast.add({ severity: 'warn', summary: t('general.warning'), detail: 'organizationId requerido', life: 3000 })
        return
      }
      showProviders.value = true
    }

    const onPaymentSuccess = () => {
      toast.add({ severity: 'success', summary: t('payment.title'), detail: t('payment.success'), life: 3000 })
      showProviders.value = false
    }
    const onPaymentError = (e: { message: string }) => {
      toast.add({ severity: 'error', summary: t('payment.title'), detail: e.message, life: 4000 })
    }

    return {
      t, IconTypes, defaultValues, selectedValue, customValue, amount, selectOption, formatCurrency,
      showProviders, handlePayClick, customerInfo, organizationId, onPaymentSuccess, onPaymentError
    }
  },
})
</script>

<template>
  <AppHeader :icon="IconTypes.BUY" :text="$t('general.buy_messages')" :actions="[]" />

  <div class="flex justify-start align-center gap-8 m-4">
    <div class="flex flex-col items-center w-full max-w-5xl">
      <small class="text-lg text-center">{{ $t('general.choose_value_recharge') }}</small>

      <div class="my-6 flex flex-row justify-center flex-wrap gap-6">
        <div class="flex flex-row flex-wrap" v-for="item in defaultValues" :key="item.id"
          @click="selectOption(item.value)">
          <div
            class="flex flex-col items-center justify-center w-60 h-38 p-4 border border-gray-900 rounded-md dark:border-white hover:shadow-2xl dark:hover:bg-neutral-600 hover:bg-[var(--p-primary-300)] cursor-pointer"
            :class="selectedValue === item.value ? 'bg-[var(--p-primary-color)] dark:bg-neutral-700' : ''">
            <small class="text-xl font-semibold text-center">
              {{ formatCurrency(item.value, 'COP') }} <span class="text-xs">COP</span>
            </small>
          </div>
        </div>

        <div
          class="flex flex-col items-center justify-center w-60 h-38 p-4 border border-gray-900 rounded-md dark:border-white hover:shadow-2xl cursor-pointer hover:bg-[var(--p-primary-300)]"
          :class="amount > 0 && !selectedValue ? 'bg-[var(--p-primary-color)] dark:bg-neutral-700' : ''">
          <AppInputNumber v-model="customValue" mode="currency" currency="COP" suffix=" COP" locale="es-CO"
            class="!w-full text-center" :label="$t('general.enter_value')" />
        </div>
      </div>

      <AppButton class="!w-auto !px-8 my-4" :label="$t('general.pay')" :disabled="!amount || !organizationId"
        @click="handlePayClick" />
      <PaymentProviderSelector v-if="showProviders && organizationId" :amount="amount" currency="COP"
        :customer-info="customerInfo" :plan-info="{ id: 'recharge', name: 'Recarga', features: [] }"
        transaction-type="recharge" :organization-id="`${organizationId}`" @payment-success="onPaymentSuccess"
        @payment-error="onPaymentError" />

      <small class="text-sm text-center text-slate-600 dark:text-slate-300">
        {{ $t('general.info_remember_recharge') }}
      </small>
    </div>
  </div>
</template>
