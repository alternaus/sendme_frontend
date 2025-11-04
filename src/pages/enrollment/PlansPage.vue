<template>
  <div class="bg-surface-50 dark:bg-surface-950 min-h-screen">
    <EnrollmentHeader
      :title="$t('enrollment.page.select_plan')"
      :description="$t('enrollment.page.select_plan_description')"
    />

    <div class="px-6 py-4 md:px-12 lg:px-20">
      <div v-if="loading" class="flex justify-center items-center py-16">
        <i class="pi pi-spin pi-spinner text-4xl text-[var(--p-primary-color)]"></i>
      </div>

      <div v-else-if="error" class="flex flex-col gap-4 items-center justify-center py-16">
        <i class="pi pi-exclamation-triangle text-4xl text-red-500"></i>
        <div class="text-red-500 font-bold text-xl text-center">{{ $t(error) }}</div>
        <AppButton @click="fetchPlansData" :label="$t('enrollment.common.retry')" class="mt-4" />
      </div>

      <Carousel v-else :value="plans" :responsiveOptions="carouselResponsiveOptions" :numVisible="3" :numScroll="1"
        class="mt-12 flex max-w-6xl mx-auto">
      <template #item="slotProps">
        <div class="flex flex-col w-full h-full p-1 box-border">
          <div :key="slotProps.data.id"
            class="w-full h-full flex-1 p-4 md:p-6 flex rounded-2xl flex-col bg-surface-0 dark:bg-neutral-800 shadow-sm gap-4">
            <div class="flex flex-col gap-2">
              <h4 class="text-surface-900 dark:text-surface-0 font-bold text-md leading-tight capitalize">
                {{ slotProps.data.name }}
              </h4>
              <p class="text-surface-500 dark:text-surface-400 text-xs leading-normal">
                {{ slotProps.data.description }}
              </p>
            </div>

            <div class="w-full h-px bg-surface-200 dark:bg-surface-700" />
            <div class="flex items-center gap-2">
              <span class="font-bold text-xl text-surface-900 dark:text-surface-0 leading-tight">
                ${{ slotProps.data.cost }}
              </span>
              <span class="font-medium text-xs text-surface-500 dark:text-surface-400 leading-tight">
                /{{ $t('enrollment.plans.month') }}
              </span>
            </div>
            <div class="w-full h-px bg-surface-200 dark:bg-surface-600" />
            <ul class="list-none flex flex-col gap-4 flex-1">
              <li v-for="(feature, i) in slotProps.data.features" :key="i" class="flex items-center gap-2">
                <i class="pi pi-check-circle text-md! text-[var(--p-primary-color)]" />
                <span class="text-surface-800 text-sm dark:text-surface-100 leading-tight">{{ feature }}</span>
              </li>
            </ul>
            <AppButton @click="selectPlan(slotProps.data)" :label="$t('enrollment.plans.select_plan_button')"
              :aria-label="`${$t('enrollment.plans.select_plan_button')} ${slotProps.data.name}`" rounded class="w-full" />
          </div>
        </div>
      </template>
    </Carousel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import Carousel from 'primevue/carousel'
import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import type { IPlan } from '@/services/organization/interfaces/plan.interface'
import { usePlanService } from '@/services/organization/usePlanService'

import EnrollmentHeader from './components/EnrollmentHeader.vue'

interface EnhancedPlan extends IPlan {
  isPopular: boolean
  features: string[]
}

const carouselResponsiveOptions = [
  {
    breakpoint: '1024px',
    numVisible: 2,
    numScroll: 1
  },
  {
    breakpoint: '768px',
    numVisible: 2,
    numScroll: 1
  },
  {
    breakpoint: '640px',
    numVisible: 1,
    numScroll: 1
  }
]

const planService = usePlanService()
const apiPlans = ref<IPlan[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const toast = useToast()
const { t } = useI18n()

const plans = computed<EnhancedPlan[]>(() =>
  apiPlans.value
    .map((plan) => {
      const lname = plan.name.toLowerCase()
      const isPopular = lname === 'standard'
      const features = [
        t('enrollment.features.contacts_limit', { count: plan.contactLimit.toLocaleString() }),
        t('enrollment.features.campaigns_limit', { count: plan.campaignLimit.toLocaleString() }),
        t('enrollment.features.price_per_message', { price: Number(plan.pricePerMessage).toFixed(2) }),
        lname === 'premium'
          ? t('enrollment.features.priority_support')
          : t('enrollment.features.standard_support'),
        lname === 'trial'
          ? t('enrollment.features.limited_features')
          : t('enrollment.features.full_features')
      ]
      return { ...plan, isPopular, features }
    })
    .sort((a, b) => a.cost - b.cost)
)

const router = useRouter()

const selectPlan = (plan: EnhancedPlan) => {
  const id = String((plan as unknown as { id?: unknown }).id ?? '').trim()
  if (!id) {
    toast.add({
      severity: 'error',
      summary: t('enrollment.common.error'),
      detail: t('enrollment.plans.plan_not_found'),
      life: 3000
    })
    return
  }
  router.push({ name: 'enrollment-payment', params: { planId: id } })
}

const fetchPlansData = async () => {
  try {
    loading.value = true
    error.value = null
    apiPlans.value = await planService.fetchPlans()
  } catch {
    error.value = 'enrollment.plans.error_loading_plans'
    toast.add({
      severity: 'error',
      summary: t('enrollment.common.error'),
      detail: t('enrollment.plans.error_loading_plans'),
      life: 5000
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPlansData()
})
</script>

<style scoped>
:deep(.p-carousel) {
  width: 100%;
}

:deep(.p-carousel-container) {
  padding: 0 1rem;
}

:deep(.p-carousel-items-container) {
  margin: 0 -0.5rem;
}

:deep(.p-carousel-items-content) {
  overflow: hidden;
}

:deep(.p-carousel-item) {
  box-sizing: border-box;
  padding: 0 0.5rem;
}

:deep(.p-carousel-prev),
:deep(.p-carousel-next) {
  background-color: var(--p-primary-color);
  color: white;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
}

:deep(.p-carousel-prev:hover),
:deep(.p-carousel-next:hover) {
  background-color: var(--p-primary-darker-color, var(--p-primary-color));
  color: white;
}

:deep(.p-carousel-indicators .p-carousel-indicator.p-highlight button) {
  background-color: var(--p-primary-color);
}
</style>
