<template>
  <div class="w-full max-w-6xl mx-auto px-4">
    <h1 class="text-4xl text-center mb-4">{{ $t('enrollment.payment_title') }}</h1>
    <p class="text-center text-gray-600 mb-12 text-lg">{{ $t('enrollment.payment_description', { plan: selectedPlanName }) }}</p>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Plan Summary -->
      <AppCard class="lg:col-span-1">
        <template #title>
          <h2 class="text-xl font-bold mb-6 pb-2 border-b border-gray-200">{{ $t('enrollment.plan_summary') }}</h2>
        </template>
        <template #content>
          <div v-if="selectedPlan" class="flex flex-col gap-4">
            <div class="text-xl font-bold">{{ selectedPlan.name }}</div>
            <div class="flex items-baseline">
              <span class="text-gray-500 text-base">$</span>
              <span class="text-3xl font-bold">{{ selectedPlan.cost }}</span>
              <span class="text-gray-500 text-base">/{{ $t('enrollment.month') }}</span>
            </div>
            <div class="mt-4">
              <ul class="space-y-2">
                <li v-for="(feature, index) in selectedPlan.features" :key="index" class="flex items-center">
                  <span class="feature-check font-bold mr-2">✓</span> {{ feature }}
                </li>
              </ul>
            </div>
          </div>
          <div v-else class="py-4 text-center text-gray-500">
            {{ $t('enrollment.loading_plan') }}
          </div>
        </template>
      </AppCard>

      <!-- Payment Details -->
      <AppCard class="lg:col-span-2">
        <template #title>
          <h2 class="text-xl font-bold mb-6 pb-2 border-b border-gray-200">{{ $t('enrollment.payment_details') }}</h2>
        </template>
        <template #content>
          <form @submit.prevent="processPayment">
            <!-- User Information -->
            <div class="mb-8">
              <h3 class="text-lg font-medium mb-4">{{ $t('enrollment.account_information') }}</h3>
              <div class="mb-4">
                <label for="name" class="block mb-2 font-medium">{{ $t('enrollment.full_name') }}</label>
                <input
                  id="name"
                  v-model="paymentForm.name"
                  type="text"
                  required
                  class="form-input w-full"
                />
              </div>
              <div class="mb-4">
                <label for="email" class="block mb-2 font-medium">{{ $t('enrollment.email') }}</label>
                <input
                  id="email"
                  v-model="paymentForm.email"
                  type="email"
                  required
                  class="form-input w-full"
                />
              </div>
              <div class="mb-4">
                <label for="company" class="block mb-2 font-medium">{{ $t('enrollment.company_name') }}</label>
                <input
                  id="company"
                  v-model="paymentForm.company"
                  type="text"
                  required
                  class="form-input w-full"
                />
              </div>
            </div>

            <!-- Credit Card Information -->
            <div class="mb-8">
              <h3 class="text-lg font-medium mb-4">{{ $t('enrollment.payment_information') }}</h3>
              <div class="mb-4">
                <label for="cardNumber" class="block mb-2 font-medium">{{ $t('enrollment.card_number') }}</label>
                <input
                  id="cardNumber"
                  v-model="paymentForm.cardNumber"
                  type="text"
                  placeholder="XXXX XXXX XXXX XXXX"
                  required
                  class="form-input w-full"
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label for="expiry" class="block mb-2 font-medium">{{ $t('enrollment.expiry_date') }}</label>
                  <input
                    id="expiry"
                    v-model="paymentForm.expiryDate"
                    type="text"
                    placeholder="MM/YY"
                    required
                    class="form-input w-full"
                  />
                </div>
                <div>
                  <label for="cvc" class="block mb-2 font-medium">{{ $t('enrollment.cvc') }}</label>
                  <input
                    id="cvc"
                    v-model="paymentForm.cvc"
                    type="text"
                    placeholder="CVC"
                    required
                    class="form-input w-full"
                  />
                </div>
              </div>

              <div class="mb-4">
                <label for="address" class="block mb-2 font-medium">{{ $t('enrollment.billing_address') }}</label>
                <input
                  id="address"
                  v-model="paymentForm.billingAddress"
                  type="text"
                  required
                  class="form-input w-full"
                />
              </div>
            </div>

            <div class="mt-8">
              <AppButton
                type="submit"
                :label="processing ? $t('enrollment.processing') : $t('enrollment.complete_payment')"
                :loading="processing"
              />
            </div>
          </form>
        </template>
      </AppCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppCard from '@/components/atoms/cards/AppCard.vue'
import type { IPlan } from '@/services/organization/interfaces/plan.interface'
import { usePlanService } from '@/services/organization/usePlanService'

interface EnhancedPlan extends IPlan {
  features: string[]
}

// Form data
const paymentForm = ref({
  name: '',
  email: '',
  company: '',
  cardNumber: '',
  expiryDate: '',
  cvc: '',
  billingAddress: ''
})

const processing = ref(false)
const selectedPlan = ref<EnhancedPlan | null>(null)

const route = useRoute()
const router = useRouter()

// Get the plan ID from route params
const planId = computed(() => route.params.planId as string)

// Get plan name for display
const selectedPlanName = computed(() => selectedPlan.value?.name || '')

const planService = usePlanService()
const loading = ref(false)
const error = ref<string | null>(null)

// Fetch plan details from the API
const fetchPlanDetails = async (id: string): Promise<EnhancedPlan | null> => {
  loading.value = true
  try {
    const plan = await planService.getPlanById(parseInt(id))

    if (!plan) return null

    // Generate features based on plan attributes
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

const processPayment = async () => {
  processing.value = true

  try {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    // In a real app, you would call your payment API here

    // Success - redirect to success page or dashboard
    router.push({
      name: 'home',
      query: { enrollment: 'success' }
    })
  } catch {
    // Handle payment error
    processing.value = false
  }
}

onMounted(async () => {
  if (!planId.value) {
    router.push({ name: 'enrollment-plans' })
    return
  }

  try {
    selectedPlan.value = await fetchPlanDetails(planId.value)

    if (!selectedPlan.value) {
      router.push({ name: 'enrollment-plans' })
    }
  } catch {
    router.push({ name: 'enrollment-plans' })
  }
})
</script>

<style scoped>
.feature-check {
  color: var(--p-primary-color);
}

.form-input {
  padding: 0.75rem;
  border: 1px solid var(--surface-border);
  border-radius: 6px;
  font-size: 1rem;
}

/* Make sure the card height is consistent */
:deep(.p-card) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.p-card-body) {
  flex: 1;
}

:deep(.p-card-content) {
  display: flex;
  flex-direction: column;
  flex: 1;
}
</style>
