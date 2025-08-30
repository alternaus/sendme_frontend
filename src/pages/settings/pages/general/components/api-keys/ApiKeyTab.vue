<script setup lang="ts">
import { onMounted, ref } from 'vue'

import PrimeButton from 'primevue/button'
import ConfirmDialog from 'primevue/confirmdialog'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import { useDateFormat } from '@/composables/useDateFormat'
import type { IApiKey } from '@/services/api-key/interfaces/api-key.interface'
import { useApiKeysService } from '@/services/api-key/useApiKeyService'

import { useApiKeysForm } from './composables/useApiKeyForm'

const { t } = useI18n()
const toast = useToast()
const confirm = useConfirm()
const { list, create, remove } = useApiKeysService()
const { form, handleSubmit, resetForm, errors } = useApiKeysForm()
const { formatDate } = useDateFormat()

const rows = ref<IApiKey[]>([])
const loading = ref(false)
const creating = ref(false)

onMounted(async () => {
  loading.value = true
  try { rows.value = await list() } finally { loading.value = false }
})

const mask = (k: string) => (k?.length > 10 ? `${k.slice(0, 4)}••••${k.slice(-4)}` : k ?? '')

const showKeyDialog = ref(false)
const createdKey = ref<string | null>(null)

const copyNow = async (k?: string | null) => {
  if (!k) return
  await navigator.clipboard.writeText(k)
  toast.add({ severity: 'info', summary: t('api_keys.copied'), detail: t('api_keys.copied'), life: 1500 })
}



const onCreate = handleSubmit(async (values) => {
  creating.value = true
  try {
    const created = await create({ name: values.name })

    createdKey.value = created.key
    showKeyDialog.value = true
    rows.value.unshift(created)
    resetForm()
    toast.add({ severity: 'success', summary: t('api_keys.created'), detail: t('api_keys.created'), life: 1800 })
  } catch {
    toast.add({ severity: 'error', summary: t('api_keys.error_create'), detail: t('api_keys.error_create'), life: 2500 })
  } finally {
    creating.value = false
  }
})




const confirmDelete = (row: IApiKey) => {
  confirm.require({
    message: t('api_keys.delete_confirm', { name: row.name }),
    header: t('api_keys.delete_header'),
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        await remove(row.id)
        rows.value = rows.value.filter(r => r.id !== row.id)
        toast.add({ severity: 'success', summary: t('api_keys.delete_success'), detail: t('api_keys.delete_success'), life: 1600 })
      } catch {
        toast.add({ severity: 'error', summary: t('api_keys.error_delete'), detail: t('api_keys.error_delete'), life: 2500 })
      }
    },
    rejectProps: { label: t('api_keys.no'), severity: 'secondary', outlined: true, size: 'small' },
    acceptProps: { label: t('api_keys.delete'), size: 'small', severity: 'danger' },
  })
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- Header Section -->
    <div class="flex items-center gap-3 mb-2">
      <h2 class="text-xl font-semibold text-neutral-900 dark:text-white">
        {{ $t('api_keys.title') }}
      </h2>
    </div>

    <p class="text-neutral-600 dark:text-neutral-400 mb-8">
      {{ $t('api_keys.description') }}
    </p>

    <div class="space-y-2">
      <div>
        <AppInput v-model="form.name.value" class="w-full" :errorMessage="errors.name"
          :placeholder="t('api_keys.placeholder')" />
        <p class="text-xs text-neutral-500">
          {{ $t('api_keys.input_description') }}
        </p>
      </div>

      <div class="flex justify-end">
        <AppButton class="!w-auto" :loading="creating" :label="t('api_keys.create')" @click="onCreate" />
      </div>
    </div>


    <!-- API Keys List Section -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-white">
          {{ $t('api_keys.existing_keys') }}
        </h3>
        <span class="text-sm text-neutral-500">
          {{ rows.length }} {{ rows.length === 1 ? $t('api_keys.keys_count') : $t('api_keys.keys_count_plural') }}
        </span>
      </div>

      <div v-if="loading" class="text-center py-8">
        <div class="text-neutral-500">{{ $t('api_keys.loading') }}</div>
      </div>

      <div v-else-if="rows.length === 0" class="text-center py-8">
        <div class="text-neutral-500">{{ $t('api_keys.no_keys') }}</div>
      </div>

      <div v-else class="space-y-3">
        <div v-for="r in rows" :key="r.id"
          class="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
          <div class="flex items-center justify-between">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-3 mb-2">
                <span class="font-medium text-neutral-900 dark:text-white text-base truncate">
                  {{ r.name }}
                </span>
                <Tag :value="r.isActive ? t('api_keys.active') : t('api_keys.inactive')"
                  :severity="r.isActive ? 'success' : 'danger'" class="!py-1 !px-2 !text-xs" />
              </div>
              <div class="text-sm text-neutral-600 dark:text-neutral-400 font-mono">
                {{ mask(r.key) }}
              </div>
              <div class="text-xs text-neutral-500 mt-1">
                {{ $t('api_keys.created_on') }} {{ formatDate(r.createdAt) }}
              </div>
            </div>

            <div class="flex items-center ml-4">
              <button @click="confirmDelete(r)"
                class="p-2 text-red-500 dark:text-red-400 transition-colors"
                title="Eliminar API key">
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

    <Dialog v-model:visible="showKeyDialog" modal :header="t('api_keys.created')" :style="{ width: '34rem' }"
      :draggable="false">
      <div class="space-y-3 text-sm">
        <p class="font-medium">
          {{ t('api_keys.copy_now') }}
        </p>
        <div class="rounded-md border p-3 bg-surface-50 dark:bg-surface-900">
          <code class="font-mono break-all">{{ createdKey }}</code>
        </div>
        <div class="flex justify-end gap-2">
          <PrimeButton icon="pi pi-copy" size="small" :label="t('api_keys.copy')" @click="copyNow(createdKey)" />
        </div>
        <p class="text-xs text-muted-color">
          {{ t('api_keys.copy_warning') }}
        </p>
      </div>
    </Dialog>

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
