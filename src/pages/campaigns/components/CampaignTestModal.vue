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
  <AppDialog v-model:modelValue="dialogVisible" modal :header="t('campaign.test_rules.test_results')" :style="{ width: '900px' }"
    class="campaign-test-modal">
    <div v-if="testResults && currentCampaign" class="space-y-4">
      <!-- Grid de métricas en 3 columnas compacto -->
      <AppCard v-if="testResults.rules">
        <div class="grid grid-cols-3 gap-4">
          <!-- Total de Contactos -->
          <div class="text-center bg-white dark:bg-neutral-900 rounded-lg p-4">
            <div class="flex items-center justify-center gap-2 mb-2">
              <i class="pi pi-users text-neutral-500 dark:text-neutral-400 text-sm"></i>
              <span class="text-xs text-neutral-600 dark:text-neutral-400 font-medium">{{ t('campaign.test_rules.total_contacts')
                }}</span>
            </div>
            <div class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              {{ testResults.rules.total.toLocaleString() }}
            </div>
            <div class="text-xs text-neutral-500 dark:text-neutral-500">
              {{ t('campaign.test_rules.contacts_available') }}
            </div>
          </div>

          <!-- Contactos Seleccionados -->
          <div class="text-center bg-white dark:bg-neutral-900 rounded-lg p-4">
            <div class="flex items-center justify-center gap-2 mb-2">
              <i class="pi pi-check-circle text-neutral-500 dark:text-neutral-400 text-sm"></i>
              <span class="text-xs text-neutral-600 dark:text-neutral-400 font-medium">{{
                t('campaign.test_rules.selected_contacts') }}</span>
            </div>
            <div class="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
              {{ testResults.rules.selected.toLocaleString() }}
            </div>
            <div class="text-xs text-neutral-500 dark:text-neutral-500">
              {{ t('campaign.test_rules.contacts_match_rules') }}
            </div>
          </div>

          <!-- Porcentaje -->
          <div class="text-center bg-white dark:bg-neutral-900 rounded-lg p-4">
            <div class="flex items-center justify-center gap-2 mb-2">
              <i class="pi pi-percentage text-neutral-500 dark:text-neutral-400 text-sm"></i>
              <span class="text-xs text-neutral-600 dark:text-neutral-400 font-medium">{{ t('campaign.test_rules.match_percentage')
                }}</span>
            </div>
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {{ testResults.rules.percent.toFixed(1) }}%
            </div>
            <div class="text-xs text-neutral-500 dark:text-neutral-500">
              {{ t('campaign.test_rules.percentage_matched') }}
            </div>
          </div>
        </div>
      </AppCard>

      <!-- Próximas 10 Ejecuciones -->
      <AppCard v-if="testResults.executions">
        <div class="flex items-center gap-2 mb-3">
          <i class="pi pi-clock text-neutral-500 dark:text-neutral-400"></i>
          <h4 class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {{ t('campaign.test_rules.upcoming_executions') }}
          </h4>
        </div>



        <div v-if="testResults.executions.upcomingExecutions.length > 0" class="max-h-80 overflow-y-auto">
          <!-- Grid responsivo de 4 a 1 columnas -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            <Message v-for="(execution, index) in testResults.executions.upcomingExecutions.slice(0, 10)" :key="index"
              severity="info" :closable="false" class="execution-message">
              <span class="text-xs">
                {{ formatExecutionDate(execution) }}
              </span>
            </Message>
          </div>

          <!-- Indicador si hay más ejecuciones -->
          <div v-if="testResults.executions.upcomingExecutions.length > 10"
            class="text-center py-3 text-xs text-neutral-500 dark:text-neutral-500">
            ... {{ t('campaign.test_rules.more_executions', { count: testResults.executions.upcomingExecutions.length - 10 }) }}
          </div>
        </div>
      </AppCard>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2 pt-3">
        <AppButton @click="dialogVisible = false" :label="t('campaigns.common.close')" severity="secondary" size="small" />
      </div>
    </template>
  </AppDialog>
</template>

<style scoped>
</style>
