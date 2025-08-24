<template>
  <div class="bg-surface-50 dark:bg-surface-950 px-6 py-8 md:px-12 lg:px-20">
    <header class="max-w-sm mx-auto text-center space-y-3">
      <h1 class="text-surface-900 dark:text-surface-0 font-bold text-xl leading-tight">
        {{ $t('enrollment.payment_confirmation') }}
      </h1>
      <p class="text-surface-500 dark:text-surface-400 text-base lg:text-lg leading-relaxed">
        {{ $t('enrollment.payment_confirmation_description') }}
      </p>
    </header>

    <section v-if="loading" class="max-w-sm mx-auto mt-10">
      <div class="bg-surface-0 dark:bg-neutral-800 rounded-2xl p-8 shadow-sm">
        <div class="flex flex-col items-center gap-4 py-10">
          <i class="pi pi-spin pi-spinner text-4xl text-[var(--p-primary-color)]" aria-hidden="true"></i>
          <span class="text-surface-500 dark:text-surface-400">{{ $t('general.loading') }}</span>
        </div>

        <div class="mt-6 space-y-3 animate-pulse">
          <div class="h-4 rounded bg-surface-200 dark:bg-surface-700 w-1/2 mx-auto"></div>
          <div class="h-4 rounded bg-surface-200 dark:bg-surface-700 w-2/3 mx-auto"></div>
          <div class="h-4 rounded bg-surface-200 dark:bg-surface-700 w-1/3 mx-auto"></div>
        </div>
      </div>
    </section>

    <section v-else-if="error" class="max-w-sm mx-auto mt-10">
      <div class="bg-surface-0 dark:bg-neutral-800 rounded-2xl p-8 shadow-sm">
        <div class="flex flex-col items-center gap-4 py-10" role="alert" aria-live="polite">
          <i class="pi pi-exclamation-triangle text-4xl text-red-500"></i>
          <h2 class="text-red-500 font-semibold text-xl text-center">{{ $t(error) }}</h2>
          <AppButton
            class="mt-2"
            :label="$t('general.retry')"
            :disabled="loading"
            @click="checkTransactionStatus"
          />
        </div>
      </div>
    </section>

    <section v-else-if="transactionInfo" class="max-w-sm mx-auto mt-10">
      <article
        class="bg-surface-0 dark:bg-neutral-800 rounded-2xl p-8 shadow-sm"
        aria-live="polite"
      >

        <div class="flex flex-col items-center text-center">
          <div
            class="w-20 h-20 rounded-full flex items-center justify-center ring-6"
            :class="[statusProps.bgRing, statusProps.bgSoft]"
          >
            <i :class="['pi', statusProps.icon, 'text-4xl', statusProps.fg]" aria-hidden="true"></i>
          </div>
          <h2 class="mt-2 text-lg font-bold" :class="statusProps.fg">
            {{ $t(statusProps.titleKey) }}
          </h2>
          <p v-if="transactionInfo.x_response_reason_text"
             class="mt-2 text-surface-500 dark:text-surface-400 text-sm">
            {{ transactionInfo.x_response_reason_text }}
          </p>
        </div>

        <dl class="mt-4 divide-y divide-surface-200 dark:divide-surface-700 text-sm">
          <div class="py-2 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
            <dt class="text-surface-500 dark:text-surface-400">{{ $t('enrollment.transaction_ref') }}</dt>
            <dd class="sm:col-span-2 flex items-center justify-between sm:justify-start gap-3">
              <span class="font-semibold text-surface-900 dark:text-surface-50">
                {{ transactionInfo.x_ref_payco }}
              </span>
              <button
                class="inline-flex items-center gap-1 text-xs text-[var(--p-primary-color)] hover:underline"
                type="button"
                @click="copy(transactionInfo.x_ref_payco)"
              >
                <i class="pi pi-copy text-xs"></i> {{ $t('general.copy') }}
              </button>
            </dd>
          </div>

          <div class="py-2 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
            <dt class="text-surface-500 dark:text-surface-400">{{ $t('enrollment.transaction_date') }}</dt>
            <dd class="sm:col-span-2 font-semibold text-surface-900 dark:text-surface-50">{{ formattedDate }}</dd>
          </div>

          <div class="py-2 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
            <dt class="text-surface-500 dark:text-surface-400">{{ $t('enrollment.transaction_amount') }}</dt>
            <dd class="sm:col-span-2 font-semibold text-surface-900 dark:text-surface-50">
              {{ formattedAmount }}
            </dd>
          </div>
        </dl>

        <!-- Acciones -->
        <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <AppButton
            v-if="statusProps.state === 'success'"
            rounded
            :label="$t('enrollment.go_to_dashboard')"
            @click="navigateToHome"
          />
          <AppButton
            v-else-if="statusProps.state === 'pending'"
            rounded
            :label="$t('general.refresh')"
            :disabled="loading"
            @click="checkTransactionStatus"
          />
          <AppButton
            v-else
            rounded
            :label="$t('enrollment.try_again')"
            @click="navigateToPlans"
          />
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import { useDateFormat } from '@/composables/useDateFormat'

interface EpaycoPaymentData {
  x_response: string
  x_response_reason_text: string
  x_transaction_id: string
  x_ref_payco: string
  x_transaction_state: 'Aceptada' | 'Pendiente' | 'Rechazada' | string
  x_amount: string
  x_currency_code: string
  x_extra1: string
  x_extra2: string
  x_extra3: string
  x_transaction_date: string
  success: boolean
}

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { t } = useI18n()
const { formatDate } = useDateFormat()

const loading = ref(true)
const error = ref<string | null>(null)
const transactionInfo = ref<EpaycoPaymentData | null>(null)

const EPAYCO_API_URL = 'https://secure.epayco.co/validation/v1/reference/'

//Mapeo de estado → iconos/colores/textos
const statusProps = computed(() => {
  const info = transactionInfo.value
  if (!info) {
    return { state: 'idle', icon: 'pi-info-circle', fg: 'text-surface-500', bgSoft: 'bg-surface-100 dark:bg-surface-900', bgRing: 'ring-surface-100 dark:ring-surface-900', titleKey: 'general.status' } as const
  }
  if (info.success || info.x_response === 'Aceptada') {
    return { state: 'success', icon: 'pi-check-circle', fg: 'text-green-600', bgSoft: 'bg-green-50 dark:bg-green-900/30', bgRing: 'ring-green-100 dark:ring-green-900/30', titleKey: 'enrollment.payment_success' } as const
  }
  if (info.x_transaction_state === 'Pendiente') {
    return { state: 'pending', icon: 'pi-clock', fg: 'text-blue-600', bgSoft: 'bg-blue-50 dark:bg-blue-900/30', bgRing: 'ring-blue-100 dark:ring-blue-900/30', titleKey: 'enrollment.payment_pending' } as const
  }
  return { state: 'failed', icon: 'pi-times-circle', fg: 'text-red-600', bgSoft: 'bg-red-50 dark:bg-red-900/30', bgRing: 'ring-red-100 dark:ring-red-900/30', titleKey: 'enrollment.payment_failed' } as const
})

const formattedDate = computed(() => {
  const raw = transactionInfo.value?.x_transaction_date
  return raw ? formatDate(new Date(raw), 'DD/MM/YYYY') : ''
})

const formattedAmount = computed(() => {
  const amount = transactionInfo.value?.x_amount ?? '0'
  const currency = transactionInfo.value?.x_currency_code || 'COP'
  const num = Number(amount)
  const safe = Number.isFinite(num) ? num : 0
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency }).format(safe)
})

async function checkTransactionStatus() {
  const refPayco = route.query.ref_payco
  if (!refPayco || typeof refPayco !== 'string') {
    error.value = 'enrollment.missing_reference'
    loading.value = false
    return
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)

  try {
    loading.value = true
    error.value = null

    const res = await fetch(`${EPAYCO_API_URL}${encodeURIComponent(refPayco)}`, { signal: controller.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const data = await res.json()
    if (!data?.data) throw new Error('Invalid payload')

    transactionInfo.value = {
      ...data.data,
      success: data.data.x_response === 'Aceptada'
    }
  } catch {
    error.value = 'enrollment.error_loading_transaction'
    toast.add({
      severity: 'error',
      summary: t('general.error'),
      detail: t('enrollment.error_loading_transaction'),
      life: 5000
    })
  } finally {
    clearTimeout(timeout)
    loading.value = false
  }
}

function navigateToHome() {
  router.push({ name: 'home' })
}

function navigateToPlans() {
  router.push({ name: 'enrollment-plans' })
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.add({ severity: 'info', summary: t('general.copied'), life: 2000 })
  } catch {
    toast.add({ severity: 'warn', summary: t('general.copy_failed'), life: 2000 })
  }
}

onMounted(checkTransactionStatus)
</script>

<style scoped>
/* sin estilos extra: Tailwind + PrimeIcons manejan el diseño */
</style>
