<template>
  <div class="bg-surface-50 dark:bg-surface-950 min-h-screen">
    <EnrollmentHeader :title="$t('enrollment.payment_title')"
      :description="$t('enrollment.payment_description', { plan: selectedPlanName })" />

    <div class="px-6 py-4 md:px-12 lg:px-20">
      <div v-if="loading" class="flex justify-center items-center py-16">
        <i class="pi pi-spin pi-spinner text-4xl text-[var(--p-primary-color)]"></i>
      </div>

      <div v-else-if="error" class="flex flex-col gap-4 items-center justify-center py-16">
        <i class="pi pi-exclamation-triangle text-4xl text-red-500"></i>
        <div class="text-red-500 font-bold text-xl text-center">{{ $t(error) }}</div>
        <AppButton @click="fetchPlanDetails(planId)" :label="$t('general.retry')" variant="secondary" class="mt-4" />
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mt-12">
        <div class="lg:col-span-1">
          <div
            class="w-full h-full flex-1 p-4 md:p-6 flex rounded-2xl flex-col bg-surface-0 dark:bg-neutral-800 shadow-sm gap-4">
            <div class="flex flex-col gap-2">
              <h4 class="text-surface-900 dark:text-surface-0 font-bold text-md leading-tight">
                {{ $t('enrollment.plan_summary') }}
              </h4>
            </div>
            <div class="w-full h-px bg-surface-200 dark:bg-surface-700" />
            <PlanSummary v-if="selectedPlan" :plan="selectedPlan" />
            <div v-else class="py-4 text-center text-surface-500 dark:text-surface-400">
              {{ $t('enrollment.loading_plan') }}
            </div>
          </div>
        </div>

        <div class="lg:col-span-2">
          <div
            class="w-full h-full flex-1 p-4 md:p-6 flex rounded-2xl flex-col bg-surface-0 dark:bg-neutral-800 shadow-sm gap-4">
            <div class="flex flex-col gap-2">
              <h4 class="text-surface-900 dark:text-surface-0 font-bold text-md leading-tight">
                {{ $t('enrollment.payment_details') }}
              </h4>
            </div>
            <div class="w-full h-px bg-surface-200 dark:bg-surface-700" />
            <div class="mb-8">
              <h3 class="text-surface-900 dark:text-surface-0 font-bold text-lg mb-4">{{
                $t('enrollment.account_information') }}</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div class="flex flex-col gap-2">
                  <label for="name" class="block text-surface-800 dark:text-surface-200 font-medium text-sm">{{
                    $t('enrollment.full_name') }}</label>
                  <AppInput id="name" v-model="paymentForm.name.value" type="text" size="small"
                    :placeholder="$t('enrollment.full_name')" :error-message="paymentForm.nameError?.value || ''" />
                </div>
                <div class="flex flex-col gap-2">
                  <label for="email" class="block text-surface-800 dark:text-surface-200 font-medium text-sm">{{
                    $t('enrollment.email') }}</label>
                  <AppInput id="email" v-model="paymentForm.email.value" type="email" size="small"
                    :placeholder="$t('enrollment.email')" :error-message="paymentForm.emailError?.value || ''" />
                </div>
                <div class="flex flex-col gap-2">
                  <label for="dni" class="block text-surface-800 dark:text-surface-200 font-medium text-sm">{{
                    $t('enrollment.dni') }}</label>
                  <AppInput id="dni" v-model="paymentForm.dni.value" type="text" size="small"
                    :placeholder="$t('enrollment.dni')" :error-message="paymentForm.dniError?.value || ''" />
                </div>
                <div class="flex flex-col gap-2">
                  <label for="company" class="block text-surface-800 dark:text-surface-200 font-medium text-sm">{{
                    $t('enrollment.company_name') }}</label>
                  <AppInput id="company" v-model="paymentForm.company.value" type="text" size="small"
                    :placeholder="$t('enrollment.company_name')"
                    :error-message="paymentForm.companyError?.value || ''" />
                </div>
              </div>
            </div>

            <Divider />

            <div class="mt-8">
              <h3 class="text-surface-900 dark:text-surface-0 font-bold text-lg mb-4">{{
                $t('enrollment.payment_information') }}</h3>

              <div v-if="!paymentForm.isFormValid"
                class="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div class="flex items-center gap-2">
                  <i class="pi pi-exclamation-triangle text-yellow-600 dark:text-yellow-400"></i>
                  <p class="text-yellow-800 dark:text-yellow-200 text-sm">
                    {{ $t('enrollment.complete_form_to_pay') }}
                  </p>
                </div>
              </div>

              <PaymentProviderSelector v-if="selectedPlan && paymentForm.isFormValid" :amount="selectedPlan.cost"
                currency="COP" :customer-info="{
                  name: paymentForm.name.value,
                  email: paymentForm.email.value,
                  dni: paymentForm.dni.value,
                  company: paymentForm.company.value
                }" :plan-info="{ id: planId, name: selectedPlanName, features: selectedPlan.features }" transaction-type="enrollment"
                @payment-success="handlePaymentSuccess" @payment-error="handlePaymentError" />

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Divider from 'primevue/divider'

import { useI18n } from 'vue-i18n'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import PaymentProviderSelector from '@/pages/enrollment/components/PaymentProviderSelector.vue'
import type { IPlan } from '@/services/organization/interfaces/plan.interface'
import { usePlanService } from '@/services/organization/usePlanService'

import EnrollmentHeader from './components/EnrollmentHeader.vue'
import PlanSummary from './components/PlanSummary.vue'
import { usePaymentForm } from './composables/usePaymentForm'

interface EnhancedPlan extends IPlan {
  features: string[]
}

const paymentForm = usePaymentForm()
const selectedPlan = ref<EnhancedPlan | null>(null)
const route = useRoute()
const router = useRouter()
const { t } = useI18n()

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
      t('enrollment.features.contacts_limit', { count: plan.contactLimit.toLocaleString() }),
      t('enrollment.features.campaigns_limit', { count: plan.campaignLimit.toLocaleString() }),
      t('enrollment.features.price_per_message', { price: plan.pricePerMessage.toFixed(2) }),
      plan.name.toLowerCase() === 'premium'
        ? t('enrollment.features.priority_support')
        : t('enrollment.features.standard_support'),
      plan.name.toLowerCase() === 'trial'
        ? t('enrollment.features.limited_features')
        : t('enrollment.features.full_features')
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

const handlePaymentSuccess = (result: { transactionId?: string }) => {
  console.log('Payment successful:', result)
}

const handlePaymentError = (error: { message?: string }) => {
  console.error('Payment error:', error)
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

<style scoped></style>
