<script lang="ts" setup>
import type { CustomClientFormData } from '@/composables/useCustomClientForm'

interface Props {
  form: Record<keyof CustomClientFormData, { value: unknown }>
}

defineProps<Props>()

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  if (typeof value === 'number') return value.toLocaleString()
  return String(value)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {{ $t('custom_clients.form.confirmation.title') }}
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ $t('custom_clients.form.confirmation.subtitle') }}
      </p>
    </div>

    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-2">
          <i class="pi pi-building text-lg text-primary-500"></i>
          <h4 class="font-semibold text-gray-900 dark:text-gray-100">
            {{ $t('custom_clients.form.confirmation.organization_section') }}
          </h4>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2">
              <i class="pi pi-tag text-gray-500"></i>
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ $t('custom_clients.form.organization.name') }}</span>
            </div>
            <span class="text-base font-medium text-gray-900 dark:text-gray-100 ml-6">{{ formatValue(form.orgName.value) }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2">
              <i class="pi pi-id-card text-gray-500"></i>
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ $t('custom_clients.form.organization.document') }}</span>
            </div>
            <span class="text-base font-medium text-gray-900 dark:text-gray-100 ml-6">{{ formatValue(form.orgDocument.value) }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2">
              <i class="pi pi-envelope text-gray-500"></i>
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ $t('custom_clients.form.organization.email') }}</span>
            </div>
            <span class="text-base font-medium text-gray-900 dark:text-gray-100 ml-6">{{ formatValue(form.orgEmail.value) }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2">
              <i class="pi pi-phone text-gray-500"></i>
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ $t('custom_clients.form.organization.phone') }}</span>
            </div>
            <span class="text-base font-medium text-gray-900 dark:text-gray-100 ml-6">{{ formatValue(form.orgPhone.value) }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2">
              <i class="pi pi-globe text-gray-500"></i>
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ $t('custom_clients.form.organization.country') }}</span>
            </div>
            <span class="text-base font-medium text-gray-900 dark:text-gray-100 ml-6">{{ formatValue(form.orgCountry.value) }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2">
              <i class="pi pi-map-marker text-gray-500"></i>
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ $t('custom_clients.form.organization.city') }}</span>
            </div>
            <span class="text-base font-medium text-gray-900 dark:text-gray-100 ml-6">{{ formatValue(form.orgCity.value) }}</span>
          </div>
          <div class="flex flex-col gap-1 md:col-span-2 lg:col-span-3">
            <div class="flex items-center gap-2">
              <i class="pi pi-home text-gray-500"></i>
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ $t('custom_clients.form.organization.address') }}</span>
            </div>
            <span class="text-base font-medium text-gray-900 dark:text-gray-100 ml-6">{{ formatValue(form.orgAddress.value) }}</span>
          </div>
        </div>
      </div>

      <div v-if="form.planType.value === 'custom'" class="flex flex-col gap-3">
        <div class="flex items-center gap-2">
          <i class="pi pi-box text-lg text-primary-500"></i>
          <h4 class="font-semibold text-gray-900 dark:text-gray-100">
            {{ $t('custom_clients.form.confirmation.plan_section') }}
          </h4>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="flex flex-col gap-1 md:col-span-2 lg:col-span-3">
            <div class="flex items-center gap-2">
              <i class="pi pi-bookmark text-gray-500"></i>
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ $t('custom_clients.form.custom_plan.plan_name') }}</span>
            </div>
            <span class="text-base font-medium text-gray-900 dark:text-gray-100 ml-6">{{ formatValue(form.planName.value) }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2">
              <i class="pi pi-dollar text-gray-500"></i>
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ $t('custom_clients.form.custom_plan.subscription_price') }}</span>
            </div>
            <span class="text-base font-medium text-gray-900 dark:text-gray-100 ml-6">${{ formatValue(form.subscriptionPrice.value) }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2">
              <i class="pi pi-comments text-gray-500"></i>
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ $t('custom_clients.form.custom_plan.included_messages') }}</span>
            </div>
            <span class="text-base font-medium text-gray-900 dark:text-gray-100 ml-6">{{ formatValue(form.includedMessages.value) }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2">
              <i class="pi pi-money-bill text-gray-500"></i>
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ $t('custom_clients.form.custom_plan.message_price') }}</span>
            </div>
            <span class="text-base font-medium text-gray-900 dark:text-gray-100 ml-6">${{ formatValue(form.messagePrice.value) }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2">
              <i class="pi pi-megaphone text-gray-500"></i>
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ $t('custom_clients.form.custom_plan.campaign_limit') }}</span>
            </div>
            <span class="text-base font-medium text-gray-900 dark:text-gray-100 ml-6">{{ formatValue(form.campaignLimit.value) }}</span>
          </div>
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2">
              <i class="pi pi-users text-gray-500"></i>
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ $t('custom_clients.form.custom_plan.contact_limit') }}</span>
            </div>
            <span class="text-base font-medium text-gray-900 dark:text-gray-100 ml-6">{{ formatValue(form.contactLimit.value) }}</span>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-2">
          <i class="pi pi-user text-lg text-primary-500"></i>
          <h4 class="font-semibold text-gray-900 dark:text-gray-100">
            {{ $t('custom_clients.form.confirmation.managers_section') }}
          </h4>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="(manager, index) in (form.managers.value as Array<{ name: string; email: string; password: string }>)"
            :key="index"
            class="flex flex-col gap-2"
          >
            <h5 class="font-medium text-gray-900 dark:text-gray-100">
              {{ $t('custom_clients.form.managers.manager_number', { number: index + 1 }) }}
            </h5>
            <div class="flex flex-col gap-2">
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <i class="pi pi-user text-gray-500"></i>
                  <span class="text-sm text-gray-500 dark:text-gray-400">{{ $t('custom_clients.form.managers.name') }}</span>
                </div>
                <span class="text-base font-medium text-gray-900 dark:text-gray-100 ml-6">{{ manager.name }}</span>
              </div>
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <i class="pi pi-envelope text-gray-500"></i>
                  <span class="text-sm text-gray-500 dark:text-gray-400">{{ $t('custom_clients.form.managers.email') }}</span>
                </div>
                <span class="text-base font-medium text-gray-900 dark:text-gray-100 ml-6">{{ manager.email }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
