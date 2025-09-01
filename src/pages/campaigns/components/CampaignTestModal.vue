<script setup lang="ts">
import { computed } from 'vue'

import Message from 'primevue/message'

import { useI18n } from 'vue-i18n'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppCard from '@/components/atoms/cards/AppCard.vue'
import AppDialog from '@/components/atoms/dialogs/AppDialog.vue'
import { useDateFormat } from '@/composables/useDateFormat'
import type { ICampaign } from '@/services/campaign/interfaces/campaign.interface'
import type { ITestCampaignResponse } from '@/services/campaign/interfaces/test-rules.interface'

interface Props {
  visible: boolean
  campaign: ICampaign | ICampaign[] | null
  testResults: ITestCampaignResponse | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
const { formatDateTime } = useDateFormat()

const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
})

// Obtener la campaña individual del array o la campaña directa
const currentCampaign = computed(() => {
  if (Array.isArray(props.campaign)) {
    return props.campaign.length > 0 ? props.campaign[0] : null
  }
  return props.campaign
})

const formatExecutionDate = (dateString: string): string => {
  return formatDateTime(dateString)
}




</script>

<template>
    <AppDialog
    v-model:modelValue="dialogVisible"
    modal
    :header="t('campaign.test_results')"
    :style="{ width: '900px' }"
    class="campaign-test-modal"
  >
    <div v-if="testResults && currentCampaign" class="space-y-4">
            <!-- Grid de métricas en 3 columnas compacto -->
      <AppCard v-if="testResults.rules">
        <div class="grid grid-cols-3 gap-4">
          <!-- Total de Contactos -->
          <div class="text-center">
            <div class="flex items-center justify-center gap-2 mb-2">
              <i class="pi pi-users text-neutral-500 dark:text-neutral-400 text-sm"></i>
              <span class="text-xs text-neutral-600 dark:text-neutral-400 font-medium">{{ t('campaign.total_contacts') }}</span>
            </div>
            <div class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              {{ testResults.rules.total.toLocaleString() }}
            </div>
            <div class="text-xs text-neutral-500 dark:text-neutral-500">
              {{ t('campaign.contacts_available') }}
            </div>
          </div>

          <!-- Contactos Seleccionados -->
          <div class="text-center">
            <div class="flex items-center justify-center gap-2 mb-2">
              <i class="pi pi-check-circle text-neutral-500 dark:text-neutral-400 text-sm"></i>
              <span class="text-xs text-neutral-600 dark:text-neutral-400 font-medium">{{ t('campaign.selected_contacts') }}</span>
            </div>
            <div class="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
              {{ testResults.rules.selected.toLocaleString() }}
            </div>
            <div class="text-xs text-neutral-500 dark:text-neutral-500">
              {{ t('campaign.contacts_match_rules') }}
            </div>
          </div>

          <!-- Porcentaje -->
          <div class="text-center">
            <div class="flex items-center justify-center gap-2 mb-2">
              <i class="pi pi-percentage text-neutral-500 dark:text-neutral-400 text-sm"></i>
              <span class="text-xs text-neutral-600 dark:text-neutral-400 font-medium">{{ t('campaign.match_percentage') }}</span>
            </div>
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {{ testResults.rules.percent.toFixed(1) }}%
            </div>
            <div class="text-xs text-neutral-500 dark:text-neutral-500">
              {{ t('campaign.percentage_matched') }}
            </div>
          </div>
        </div>
      </AppCard>

      <!-- Próximas 10 Ejecuciones -->
      <AppCard v-if="testResults.executions">
        <div class="flex items-center gap-2 mb-3">
          <i class="pi pi-clock text-neutral-500 dark:text-neutral-400"></i>
          <h4 class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {{ t('campaign.upcoming_executions') }}
          </h4>
        </div>



                <div v-if="testResults.executions.upcomingExecutions.length > 0" class="max-h-80 overflow-y-auto">
          <!-- Grid responsivo de 4 a 1 columnas -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            <Message
              v-for="(execution, index) in testResults.executions.upcomingExecutions.slice(0, 10)"
              :key="index"
              severity="info"
              :closable="false"
              class="execution-message"
            >
              <div class="flex items-center gap-3">
                <div class="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <span class="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {{ index + 1 }}
                  </span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-medium text-blue-800 dark:text-blue-200 truncate">
                    {{ formatExecutionDate(execution) }}
                  </div>
                </div>
                <i class="pi pi-calendar text-blue-600 dark:text-blue-400 text-sm flex-shrink-0"></i>
              </div>
            </Message>
          </div>

          <!-- Indicador si hay más ejecuciones -->
          <div v-if="testResults.executions.upcomingExecutions.length > 10"
               class="text-center py-3 text-xs text-neutral-500 dark:text-neutral-500">
            ... {{ t('campaign.more_executions', { count: testResults.executions.upcomingExecutions.length - 10 }) }}
          </div>
        </div>
      </AppCard>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2 pt-3">
        <AppButton
          @click="dialogVisible = false"
          :label="t('general.close')"
          severity="secondary"
          size="small"
        />
      </div>
    </template>
  </AppDialog>
</template>

<style scoped>
.campaign-test-modal :deep(.p-dialog-content) {
  padding: 1rem;
}

.campaign-test-modal :deep(.p-dialog-header) {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border-radius: 8px 8px 0 0;
  padding: 0.75rem 1rem;
}

.campaign-test-modal :deep(.p-dialog-header .p-dialog-title) {
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

.campaign-test-modal :deep(.p-dialog-header .p-dialog-header-icon) {
  color: white;
}

.campaign-test-modal :deep(.p-dialog-footer) {
  padding: 0.75rem 1rem;
}

/* Compactar el espaciado del modal */
.campaign-test-modal :deep(.p-dialog) {
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Estilos para los componentes Message de ejecuciones */
.execution-message :deep(.p-message) {
  border-radius: 8px;
  padding: 0.5rem;
  border: 1px solid rgb(147, 197, 253);
  background-color: rgb(239, 246, 255);
  margin: 0;
}

.execution-message :deep(.p-message-content) {
  padding: 0;
  margin: 0;
}

/* Dark mode para los Message */
@media (prefers-color-scheme: dark) {
  .execution-message :deep(.p-message) {
    border-color: rgb(59, 130, 246, 0.3);
    background-color: rgb(30, 58, 138, 0.2);
  }
}
</style>
