<template>
  <div class="bg-surface-50 dark:bg-surface-950 px-6 py-4 md:px-12 lg:px-20">
    <div class="flex flex-col gap-4 items-center justify-center mb-12">
      <div class="text-surface-900 dark:text-surface-0 font-bold text-3xl lg:text-4xl text-center leading-tight">
        {{ $t('enrollment.payment_title') }}
      </div>
      <div class="text-surface-500 dark:text-surface-400 text-md text-center leading-normal">
        {{ $t('enrollment.payment_description', { plan: selectedPlanName }) }}
      </div>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-16">
      <i class="pi pi-spin pi-spinner text-4xl text-[var(--p-primary-color)]"></i>
    </div>

    <div v-else-if="error" class="flex flex-col gap-4 items-center justify-center py-16">
      <i class="pi pi-exclamation-triangle text-4xl text-red-500"></i>
      <div class="text-red-500 font-bold text-xl text-center">{{ $t(error) }}</div>
      <AppButton @click="fetchPlanDetails(planId)" :label="$t('general.retry')" variant="secondary" class="mt-4" />
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      <Card class="lg:col-span-1">
        <template #title>
          <div class="text-surface-900 dark:text-surface-0 font-bold text-xl mb-4 pb-2 border-b border-surface-200 dark:bg-surface-700">
            {{ $t('enrollment.plan_summary') }}
          </div>
        </template>
        <template #content>
          <div v-if="selectedPlan" class="flex flex-col gap-4">
            <div class="text-surface-900 dark:text-surface-0 font-bold text-xl">{{ selectedPlan.name }}</div>
            <div class="flex items-baseline">
              <span class="text-surface-500 dark:text-surface-400 text-base">$</span>
              <span class="text-surface-900 dark:text-surface-0 text-3xl font-bold">{{ selectedPlan.cost }}</span>
              <span class="text-surface-500 dark:text-surface-400 text-base">/{{ $t('enrollment.month') }}</span>
            </div>
            <Divider />
            <ul class="list-none flex flex-col gap-3">
              <li v-for="(feature, index) in selectedPlan.features" :key="index" class="flex items-center gap-2">
                <i class="pi pi-check-circle text-md! text-[var(--p-primary-color)]" />
                <span class="text-surface-800 text-sm dark:text-surface-100 leading-tight">{{ feature }}</span>
              </li>
            </ul>
          </div>
          <div v-else class="py-4 text-center text-surface-500 dark:text-surface-400">
            {{ $t('enrollment.loading_plan') }}
          </div>
        </template>
      </Card>

      <Card class="lg:col-span-2">
        <template #title>
          <div class="text-surface-900 dark:text-surface-0 font-bold text-xl mb-4 pb-2 border-b border-surface-200 dark:bg-surface-700">
            {{ $t('enrollment.payment_details') }}
          </div>
        </template>
        <template #content>
          <div class="mb-8">
            <h3 class="text-surface-900 dark:text-surface-0 font-bold text-lg mb-4">{{ $t('enrollment.account_information') }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div class="flex flex-col gap-2">
                <label for="name" class="block text-surface-800 dark:text-surface-200 font-medium text-sm">{{ $t('enrollment.full_name') }}</label>
                <AppInput
                  id="name"
                  v-model="paymentForm.name.value"
                  type="text"
                  size="small"
                  :placeholder="$t('enrollment.full_name')"
                  :error-message="paymentForm.nameError?.value || ''"
                />
              </div>
              <div class="flex flex-col gap-2">
                <label for="email" class="block text-surface-800 dark:text-surface-200 font-medium text-sm">{{ $t('enrollment.email') }}</label>
                <AppInput
                  id="email"
                  v-model="paymentForm.email.value"
                  type="email"
                  size="small"
                  :placeholder="$t('enrollment.email')"
                  :error-message="paymentForm.emailError?.value || ''"
                />
              </div>
            </div>
            <div class="flex flex-col gap-2 mb-4">
              <label for="company" class="block text-surface-800 dark:text-surface-200 font-medium text-sm">{{ $t('enrollment.company_name') }}</label>
              <AppInput
                id="company"
                v-model="paymentForm.company.value"
                type="text"
                size="small"
                :placeholder="$t('enrollment.company_name')"
                :error-message="paymentForm.companyError?.value || ''"
              />
            </div>
          </div>

          <Divider />

          <div class="mt-8">
            <h3 class="text-surface-900 dark:text-surface-0 font-bold text-lg mb-4">{{ $t('enrollment.payment_information') }}</h3>

            <div v-if="!paymentForm.isFormValid" class="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div class="flex items-center gap-2">
                <i class="pi pi-exclamation-triangle text-yellow-600 dark:text-yellow-400"></i>
                <p class="text-yellow-800 dark:text-yellow-200 text-sm">
                  {{ $t('enrollment.complete_form_to_pay') }}
                </p>
              </div>
            </div>

            <PaymentProviderSelector
              v-if="selectedPlan && paymentForm.isFormValid"
              :amount="selectedPlan.cost"
              :currency="'USD'"
              :customer-info="{
                name: paymentForm.name.value,
                email: paymentForm.email.value,
                company: paymentForm.company.value
              }"
              :plan-info="{
                id: planId,
                name: selectedPlanName,
                features: selectedPlan.features
              }"
              @payment-success="handlePaymentSuccess"
              @payment-error="handlePaymentError"
            />
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Card from 'primevue/card'
import Divider from 'primevue/divider'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import PaymentProviderSelector from '@/components/organisms/PaymentProviderSelector.vue'
import type { IPlan } from '@/services/organization/interfaces/plan.interface'
import { usePlanService } from '@/services/organization/usePlanService'

import { usePaymentForm } from './composables/usePaymentForm'

interface EnhancedPlan extends IPlan {
  features: string[]
}

interface PaymentSuccessData {
  transactionId?: string
  id?: string
  provider?: string
  amount?: number
  currency?: string
}

interface PaymentErrorData {
  message?: string
  code?: string
  provider?: string
}


const paymentForm = usePaymentForm()
const selectedPlan = ref<EnhancedPlan | null>(null)
const route = useRoute()
const router = useRouter()

const planId = computed(() => route.params.planId as string)
const selectedPlanName = computed(() => selectedPlan.value?.name || '')

const planService = usePlanService()
const loading = ref(false)
const error = ref<string | null>(null)

const fetchPlanDetails = async (id: string): Promise<EnhancedPlan | null> => {
  loading.value = true
  error.value = null
  try {
    const plan = await planService.getPlanById(parseInt(id))

    if (!plan) {
      error.value = 'enrollment.plan_not_found'
      return null
    }

    const features = [
      `Up to ${plan.contactLimit.toLocaleString()} contacts`,
      `Up to ${plan.campaignLimit.toLocaleString()} campaigns`,
      `$${plan.pricePerMessage.toFixed(2)} per message`,
      plan.name.toLowerCase() === 'premium' ? 'Priority support' : 'Standard support',
      plan.name.toLowerCase() === 'trial' ? 'Limited features' : 'Full features'
    ]

    return {
      ...plan,
      features
    }
  } catch {
    error.value = 'enrollment.error_loading_plan'
    return null
  } finally {
    loading.value = false
  }
}

const handlePaymentSuccess = (data: PaymentSuccessData) => {
  console.log('Payment successful:', data)
}

const handlePaymentError = (_error: PaymentErrorData) => {
  // Error handling by PaymentProviderSelector component
}

onMounted(async () => {
  if (!planId.value) {
    router.push({ name: 'enrollment-plans' })
    return
  }

  selectedPlan.value = await fetchPlanDetails(planId.value)

  if (!selectedPlan.value && !error.value) {
    router.push({ name: 'enrollment-plans' })
  }
})
</script>

<style scoped>
:deep(.p-card) {
  background-color: var(--surface-0);
  color: var(--surface-900);
  border-radius: 1rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

:deep(.p-card-body) {
  padding: 1.5rem;
}

:deep(.p-card-title) {
  margin-bottom: 1rem;
}

:deep(.p-card-content) {
  padding-top: 0;
}

.dark :deep(.p-card) {
  background-color: var(--surface-800);
  color: var(--surface-0);
}

:deep(.p-inputtext) {
  font-size: 0.875rem;
}

:deep(.p-inputtext.p-inputtext-sm) {
  padding: 0.5rem 0.75rem;
}

:deep(.p-button.p-button-sm) {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

:deep(.p-divider) {
  margin: 1rem 0;
}
</style>
