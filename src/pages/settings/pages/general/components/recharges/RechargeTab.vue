<script setup lang="ts">
import { onMounted, ref } from 'vue'

import ConfirmDialog from 'primevue/confirmdialog'
import Toast from 'primevue/toast'

import { useI18n } from 'vue-i18n'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppDialog from '@/components/atoms/dialogs/AppDialog.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import AppTextarea from '@/components/atoms/textarea/AppTextarea.vue'
import { useDateFormat } from '@/composables/useDateFormat'
import { RechargeStatus } from '@/services/organization/interfaces/filter-recharge.interface'
import type { IRecharge } from '@/services/organization/interfaces/recharge.interface'
import { useOrganizationService } from '@/services/organization/useOrganizationService'

import { useRechargeForm } from './composables/useRechargeForm'

const { t } = useI18n()
const { getRecharges } = useOrganizationService()
const { formatDate } = useDateFormat()

const {
  formData,
  errors,
  organizationOptions,
  selectedOrganization,
  pricePerMessage,
  isLoadingOrganizations,
  isSubmitting,
  isFormValid,
  lastEditedField,
  loadOrganizations,
  submitRecharge,
  resetForm,
} = useRechargeForm()

const rows = ref<IRecharge[]>([])
const loading = ref(false)
const showForm = ref(false)
const totalRecords = ref(0)
const currentPage = ref(1)

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount)
}

const getStatusClasses = (status: RechargeStatus) => {
  const baseClasses = 'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium'

  switch (status) {
    case RechargeStatus.ACCEPTED:
      return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`
    case RechargeStatus.PENDING:
      return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400`
    case RechargeStatus.INITIATED:
      return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400`
    case RechargeStatus.HELD:
      return `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400`
    case RechargeStatus.REJECTED:
      return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400`
    case RechargeStatus.FAILED:
      return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400`
    case RechargeStatus.EXPIRED:
      return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400`
    case RechargeStatus.ABANDONED:
      return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400`
    case RechargeStatus.CANCELLED:
      return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400`
    case RechargeStatus.REVERSED:
      return `${baseClasses} bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400`
    default:
      return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400`
  }
}

const loadRecharges = async (page = 1) => {
  loading.value = true
  try {
    const response = await getRecharges({
      page,
      limit: 10,
    })
    if (response) {
      rows.value = response.data
      totalRecords.value = response.meta.totalRecords
    }
  } finally {
    loading.value = false
  }
}

const onCreate = async () => {
  const success = await submitRecharge()
  if (success) {
    showForm.value = false
    loadRecharges(currentPage.value)
  }
}

const handleCancel = () => {
  resetForm()
  showForm.value = false
}

const openCreateDialog = () => {
  loadOrganizations()
  showForm.value = true
}

onMounted(() => {
  loadRecharges()
})
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-lg font-semibold text-neutral-900 dark:text-white">
          {{ $t('settings.recharges.title') }}
        </h2>
        <p class="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
          {{ $t('settings.recharges.description') }}
        </p>
      </div>

      <AppButton
        :label="t('settings.recharges.add_new')"
        icon="pi pi-plus"
        @click="openCreateDialog"
        class="!w-auto"
      />
    </div>

    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-semibold text-neutral-900 dark:text-white">
          {{ $t('settings.recharges.configured_recharges') }}
        </h3>
        <span class="text-xs text-neutral-500">
          {{ rows.length }} {{ rows.length === 1 ? $t('settings.recharges.recharge_count') : $t('settings.recharges.recharge_count_plural') }}
        </span>
      </div>

      <div v-if="loading" class="text-center py-6">
        <div class="text-neutral-500 text-sm">{{ $t('settings.recharges.loading') }}</div>
      </div>

      <div v-else-if="rows.length === 0" class="text-center py-6">
        <div class="text-neutral-500 text-sm">{{ $t('settings.recharges.no_recharges') }}</div>
      </div>

      <div v-else class="space-y-3">
        <div v-for="recharge in rows" :key="recharge.id"
          class="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
          <div class="flex items-start justify-between">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span class="font-medium text-neutral-900 dark:text-white text-base">
                  {{ formatCurrency(recharge.amount) }}
                </span>
                <span :class="getStatusClasses(recharge.status)">
                  {{ t(`settings.recharges.status_${recharge.status.toLowerCase()}`) }}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-3 text-xs text-neutral-600 dark:text-neutral-400 mb-2">
                <div>
                  <span class="font-medium">{{ $t('settings.recharges.message_count') }}:</span>
                  {{ recharge.messageCount.toLocaleString('es-CO') }}
                </div>
                <div>
                  <span class="font-medium">{{ $t('settings.recharges.remaining_messages') }}:</span>
                  {{ recharge.remainingMessages.toLocaleString('es-CO') }}
                </div>
              </div>

              <div v-if="recharge.notes" class="text-xs text-neutral-500 italic mb-2">
                {{ recharge.notes }}
              </div>

              <div class="text-xs text-neutral-500">
                {{ $t('settings.recharges.created_on') }} {{ formatDate(recharge.createdAt) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <AppDialog
      v-model:modelValue="showForm"
      modal
      :header="t('settings.recharges.create_recharge')"
      :style="{ width: '40rem' }"
      :draggable="false"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1.5">
            {{ $t('settings.recharges.organization') }} <span class="text-red-500">*</span>
          </label>
          <AppSelect
            v-model="formData.organizationId"
            :options="organizationOptions"
            :placeholder="t('settings.recharges.select_organization')"
            :loading="isLoadingOrganizations"
            :disabled="isSubmitting"
            :errorMessage="errors.organizationId"
            class="w-full"
          />
          <p v-if="selectedOrganization && pricePerMessage > 0" class="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            💰 {{ $t('settings.recharges.price_per_message') }}: {{ formatCurrency(pricePerMessage) }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1.5">
            {{ $t('settings.recharges.amount') }} <span class="text-red-500">*</span>
          </label>
          <AppInput
            v-model.number="formData.amount"
            type="number"
            :min="1"
            :disabled="isSubmitting || !formData.organizationId"
            :errorMessage="errors.amount"
            :placeholder="t('settings.recharges.amount_placeholder')"
            class="w-full"
            @focus="lastEditedField = 'amount'"
          />
          <p class="text-xs text-neutral-500 mt-1">
            {{ $t('settings.recharges.amount_description') }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1.5">
            {{ $t('settings.recharges.message_count') }} <span class="text-red-500">*</span>
          </label>
          <AppInput
            v-model.number="formData.messageCount"
            type="number"
            :min="1"
            :disabled="isSubmitting || !formData.organizationId"
            :errorMessage="errors.messageCount"
            :placeholder="t('settings.recharges.message_count_placeholder')"
            class="w-full"
            @focus="lastEditedField = 'messageCount'"
          />
          <p class="text-xs text-neutral-500 mt-1">
            {{ $t('settings.recharges.message_count_description') }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1.5">
            {{ $t('settings.recharges.notes') }}
          </label>
          <AppTextarea
            v-model="formData.notes"
            :rows="3"
            :maxlength="500"
            :placeholder="t('settings.recharges.notes_placeholder')"
            :disabled="isSubmitting"
            class="w-full"
          />
          <p class="text-xs text-neutral-500 mt-1">
            {{ $t('settings.recharges.notes_description') }}
          </p>
        </div>

        <div class="flex justify-end gap-2 pt-3">
          <AppButton
            :label="t('settings.recharges.cancel')"
            severity="secondary"
            :disabled="isSubmitting"
            @click="handleCancel"
            class="!w-auto"
          />
          <AppButton
            :label="t('settings.recharges.create')"
            :loading="isSubmitting"
            :disabled="!isFormValid"
            @click="onCreate"
            class="!w-auto"
          />
        </div>
      </div>
    </AppDialog>

    <ConfirmDialog />
    <Toast />
  </div>
</template>
