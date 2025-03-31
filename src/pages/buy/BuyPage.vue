<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useI18n } from 'vue-i18n'

import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'
export default defineComponent({
  components: {
    AppHeader,
  },
  setup() {
    const { t } = useI18n()
    const router = useRouter()

    const defaultValues = ref([
      {
        id: 1,
        value: 50000,
        currency: 'COP',
      },
      {
        id: 2,
        value: 100000,
        currency: 'COP',
      },
    ])

    const formatCurrency = ref((valor: number, currency: string) => {
      const modeCurrency = currency === 'USD' ? 'en-US' : 'es-CO'
      return new Intl.NumberFormat(modeCurrency, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(valor)
    })

    return {
      router,
      IconTypes,
      t,
      defaultValues,
      formatCurrency,
    }
  },
})
</script>
<template>
  <AppHeader :icon="IconTypes.BUY" :text="$t('general.buy_messages')" :actions="[]" />
  <div class="flex justify-start align-center gap-8 m-4">
    <div class="flex flex-col items-center">
      <small>
        {{ $t('general.choose_value_recharge') }}
      </small>
      <div class="my-6 flex flex-row justify-center flex-wrap gap-6">
        <div class="flex flex-row flex-wrap" v-for="item in defaultValues" :key="item.id">
          <div
            class="flex flex-col items-center justify-center w-48 h-38 p-4 border-1 border-gray-900 rounded-md dark:border-white hover:shadow-2xl dark:hover:bg-neutral-700 hover:bg-[var(--p-primary-color)] cursor-pointer"
          >
            <small class="text-xl font-semibold"> {{ formatCurrency(item.value, item.currency) }} </small>
          </div>
        </div>
        <div
          class="flex flex-col items-center justify-center w-48 h-38 p-4 border-1 border-gray-900 rounded-md dark:border-white hover:shadow-2xl dark:hover:bg-neutral-700 hover:bg-[var(--p-primary-color)] cursor-pointer"
        >
        
      </div>
      </div>
      <small>
        {{ $t('general.info_remember_recharge') }}
      </small>
    </div>
  </div>
</template>
