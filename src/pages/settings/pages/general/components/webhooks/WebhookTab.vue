<script setup lang="ts">
import { onMounted, ref } from 'vue'

import ConfirmDialog from 'primevue/confirmdialog'
import Toast from 'primevue/toast'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppDialog from '@/components/atoms/dialogs/AppDialog.vue'
import AppTag from '@/components/atoms/tag/AppTag.vue'
import { useDateFormat } from '@/composables/useDateFormat'
import type { CreateWebhookEndpointDto, WebhookConfig,WebhookEndpoint } from '@/services/webhook/interfaces/webhook.interface'
import { useWebhookService } from '@/services/webhook/useWebhookService'

import WebhookForm from './components/WebhookForm.vue'

const { t } = useI18n()
const toast = useToast()
const confirm = useConfirm()
const { list, create, remove, toggleStatus } = useWebhookService()
const { formatDate } = useDateFormat()

const rows = ref<WebhookEndpoint[]>([])
const loading = ref(false)
const creating = ref(false)
const showForm = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    rows.value = await list()
  } finally {
    loading.value = false
  }
})

const onCreate = async (webhookData: CreateWebhookEndpointDto) => {
  creating.value = true
  try {
    const created = await create(webhookData)
    rows.value.unshift(created)
    showForm.value = false
    toast.add({
      severity: 'success',
      summary: t('webhooks.created'),
      detail: t('webhooks.created'),
      life: 1800
    })
  } catch {
    toast.add({
      severity: 'error',
      summary: t('webhooks.error_create'),
      detail: t('webhooks.error_create'),
      life: 2500
    })
  } finally {
    creating.value = false
  }
}

const onToggleStatus = async (webhook: WebhookEndpoint) => {
  try {
    const updated = await toggleStatus(webhook.id, !webhook.isActive)
    const index = rows.value.findIndex(r => r.id === webhook.id)
    if (index !== -1) {
      rows.value[index] = updated
    }
    toast.add({
      severity: 'success',
      summary: t('webhooks.status_updated'),
      detail: t('webhooks.status_updated'),
      life: 1600
    })
  } catch {
    toast.add({
      severity: 'error',
      summary: t('webhooks.error_update'),
      detail: t('webhooks.error_update'),
      life: 2500
    })
  }
}

const confirmDelete = (webhook: WebhookEndpoint) => {
  confirm.require({
    message: t('webhooks.delete_confirm', { name: webhook.name }),
    header: t('webhooks.delete_header'),
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        await remove(webhook.id)
        rows.value = rows.value.filter(r => r.id !== webhook.id)
        toast.add({
          severity: 'success',
          summary: t('webhooks.delete_success'),
          detail: t('webhooks.delete_success'),
          life: 1600
        })
      } catch {
        toast.add({
          severity: 'error',
          summary: t('webhooks.error_delete'),
          detail: t('webhooks.error_delete'),
          life: 2500
        })
      }
    },
    rejectProps: {
      label: t('webhooks.no'),
      severity: 'secondary',
      outlined: true,
      size: 'small'
    },
    acceptProps: {
      label: t('webhooks.delete'),
      size: 'small',
      severity: 'danger'
    },
  })
}

const getAuthType = (config: WebhookConfig | undefined) => {
  if (!config?.auth) return 'none'
  return config.auth.type || 'none'
}

const getEventCount = (webhook: WebhookEndpoint) => {
  return webhook.endpointEvents?.length || 0
}

const getEventKeys = (webhook: WebhookEndpoint) => {
  return webhook.endpointEvents?.map(ee => ee.event.key) || []
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-lg font-semibold text-neutral-900 dark:text-white">
          {{ $t('webhooks.title') }}
        </h2>
        <p class="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
          {{ $t('webhooks.description') }}
        </p>
      </div>

      <AppButton
        :label="t('webhooks.add_new')"
        icon="pi pi-plus"
        @click="showForm = true"
        class="!w-auto"
      />
    </div>

    <!-- Webhooks List Section -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-semibold text-neutral-900 dark:text-white">
          {{ $t('webhooks.configured_webhooks') }}
        </h3>
        <span class="text-xs text-neutral-500">
          {{ rows.length }} {{ rows.length === 1 ? $t('webhooks.webhook_count') : $t('webhooks.webhook_count_plural') }}
        </span>
      </div>

      <div v-if="loading" class="text-center py-6">
        <div class="text-neutral-500 text-sm">{{ $t('webhooks.loading') }}</div>
      </div>

      <div v-else-if="rows.length === 0" class="text-center py-6">
        <div class="text-neutral-500 text-sm">{{ $t('webhooks.no_webhooks') }}</div>
      </div>

      <div v-else class="space-y-3">
        <div v-for="webhook in rows" :key="webhook.id"
          class="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
          <div class="flex items-start justify-between">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span class="font-medium text-neutral-900 dark:text-white text-base truncate">
                  {{ webhook.name }}
                </span>
                <AppTag
                  :value="webhook.isActive ? t('webhooks.active') : t('webhooks.inactive')"
                  :severity="webhook.isActive ? 'success' : 'danger'"
                  class="!py-0.5 !px-1.5 !text-xs"
                />
                <AppTag
                  :value="webhook.method"
                  severity="info"
                  class="!py-0.5 !px-1.5 !text-xs"
                />
              </div>

              <div class="text-xs text-neutral-600 dark:text-neutral-400 font-mono mb-2">
                {{ webhook.url }}
              </div>

              <div class="text-xs text-neutral-500 mb-2">
                {{ $t('webhooks.auth') }}: {{ getAuthType(webhook.config) }} •
                {{ $t('webhooks.events') }}: {{ getEventCount(webhook) }} •
                {{ $t('webhooks.retries') }}: {{ webhook.config?.retries?.maxAttempts || 3 }} •
                {{ $t('webhooks.timeout') }}: {{ (webhook.config?.retries?.backoffMs || 30000) / 1000 }}s •
                {{ $t('webhooks.created') }}: {{ formatDate(webhook.createdAt) }}
              </div>

              <div class="flex flex-wrap gap-1.5">
                <AppTag
                  v-for="eventKey in getEventKeys(webhook)"
                  :key="eventKey"
                  :value="eventKey"
                  severity="secondary"
                  class="!py-0.5 !px-1.5 !text-xs"
                />
              </div>
            </div>

            <div class="flex items-center gap-1.5 ml-3">
              <button
                @click="onToggleStatus(webhook)"
                :class="[
                  'p-1.5 rounded-md transition-colors',
                  webhook.isActive
                    ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                    : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                ]"
                :title="webhook.isActive ? t('webhooks.disable') : t('webhooks.enable')"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M5 13l4 4L19 7"></path>
                </svg>
              </button>

              <button
                @click="confirmDelete(webhook)"
                class="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                :title="t('webhooks.delete')"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                  </path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <AppDialog
      v-model:modelValue="showForm"
      modal
      :header="t('webhooks.configure_new_webhook')"
      :style="{ width: '95vw', maxWidth: '1200px', height: '90vh' }"
      :draggable="false"
    >
      <WebhookForm
        :loading="creating"
        @submit="onCreate"
        @cancel="showForm = false"
      />
    </AppDialog>

    <ConfirmDialog />
    <Toast />
  </div>
</template>

<style scoped>
:deep(.p-button.p-button-text) {
  padding: .25rem .375rem;
}

:deep(.p-tag) {
  line-height: 1.1;
}
</style>
