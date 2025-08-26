<script setup lang="ts">
import { onMounted, ref } from 'vue'

import PrimeButton from 'primevue/button'
import ConfirmDialog from 'primevue/confirmdialog'
import DataView from 'primevue/dataview'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import type { IApiKey } from '@/services/api-key/interfaces/api-key.interface'
import { useApiKeysService } from '@/services/api-key/useApiKeyService'

import { useApiKeysForm } from './composables/useApiKeyForm'

const { t } = useI18n()
const toast = useToast()
const confirm = useConfirm()
const { list, create, remove } = useApiKeysService()
const { form, handleSubmit, resetForm, errors } = useApiKeysForm()

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

const copy = async (k: string) => {
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
  <div class="space-y-4">
    <div v-if="rows.length<3" class="flex items-end gap-2">
      <AppInput v-model="form.name.value" class="w-full" :errorMessage="errors.name"
        :placeholder="t('api_keys.placeholder')" />
      <AppButton class="w-auto!" :loading="creating" :label="t('api_keys.create')" @click="onCreate" />
    </div>

    <DataView dataKey="id" :value="rows" :loading="loading" layout="list" class="mt-8">
      <template #list="{ items }">
        <ul class="rounded-lg">
          <li v-for="r in items" :key="r.id" class="flex items-center justify-between px-3 py-2 text-sm m-2">
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-medium truncate max-w-[280px] md:max-w-[420px]">{{ r.name }}</span>
                <Tag :value="r.isActive ? t('api_keys.active') : t('api_keys.inactive')"
                  :severity="r.isActive ? 'success' : 'danger'" class="!py-0 !px-2 !text-xs" />
              </div>
              <div class="mt-0.5 text-xs text-muted-color font-mono truncate">
                {{ mask(r.key) }} · {{ new Date(r.createdAt).toLocaleDateString() }}
              </div>
            </div>
            <div class="flex shrink-0 gap-1">
              <PrimeButton icon="pi pi-copy" text rounded severity="info" size="small" @click="copy(r.key)" />
              <PrimeButton icon="pi pi-trash" severity="danger" text rounded size="small" @click="confirmDelete(r)" />
            </div>
          </li>
        </ul>
      </template>

      <template #empty>
        <div class="text-center text-sm text-muted-color py-6">{{ t('api_keys.empty') }}</div>
      </template>
    </DataView>

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
