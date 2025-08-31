<script setup lang="ts">
import { computed } from 'vue'

import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Divider from 'primevue/divider'

import { useI18n } from 'vue-i18n'

import FormattedDate from '@/components/atoms/formatted-date/FormattedDate.vue'
import AppTag from '@/components/atoms/tag/AppTag.vue'
import type { IContact } from '@/services/contact/interfaces/contact.interface'

interface Props {
  visible: boolean
  contact: IContact | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'edit-contact', contact: IContact): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()

const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
})

const statusVariant = computed(() => {
  if (!props.contact?.status) return 'secondary'
  return props.contact.status === 'active' ? 'success' : 'warning'
})

const editContact = () => {
  if (props.contact) {
    emit('edit-contact', props.contact)
    dialogVisible.value = false
  }
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}
</script>

<template>
      <Dialog
    v-model:visible="dialogVisible"
    modal
    :header="t('contact_view.title')"
    :style="{ width: '500px' }"
    class="contact-view-modal"
  >
    <div v-if="contact" class="space-y-4">
      <!-- Información básica del contacto -->
      <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {{ contact.name || t('general.not_defined') }}
          </h3>
          <AppTag
            :label="contact.status === 'active' ? t('general.active') : t('general.inactive')"
            :severity="statusVariant"
          />
        </div>

        <!-- Información de contacto -->
        <div class="grid grid-cols-1 gap-3">
          <!-- Teléfono -->
          <div v-if="contact.phone" class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <i class="pi pi-phone text-blue-500"></i>
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
                {{ t('general.phone') }}:
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-900 dark:text-gray-100">{{ contact.phone }}</span>
              <Button
                v-tooltip="t('general.copy')"
                @click="copyToClipboard(contact.phone!)"
                icon="pi pi-copy"
                size="small"
                severity="secondary"
                text
                class="p-1"
              />
            </div>
          </div>

          <!-- Email -->
          <div v-if="contact.email" class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <i class="pi pi-envelope text-green-500"></i>
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
                {{ t('general.email') }}:
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-900 dark:text-gray-100">{{ contact.email }}</span>
              <Button
                v-tooltip="t('general.copy')"
                @click="copyToClipboard(contact.email!)"
                icon="pi pi-copy"
                size="small"
                severity="secondary"
                text
                class="p-1"
              />
            </div>
          </div>

          <!-- País -->
          <div v-if="contact.countryCode" class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <i class="pi pi-globe text-purple-500"></i>
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
                {{ t('general.country_code') }}:
              </span>
            </div>
            <span class="text-sm text-gray-900 dark:text-gray-100">{{ contact.countryCode }}</span>
          </div>

          <!-- ID de organización -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <i class="pi pi-bookmark text-orange-500"></i>
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
                {{ t('general.organization') }}:
              </span>
            </div>
            <span class="text-sm text-gray-900 dark:text-gray-100">{{ contact.organizationId }}</span>
          </div>
        </div>
      </div>

      <!-- Fechas importantes -->
      <div v-if="contact.birthDate || contact.createdAt || contact.updatedAt">
        <Divider />
        <h4 class="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
          {{ t('contact_view.important_dates') }}
        </h4>

        <div class="space-y-2">
          <!-- Fecha de nacimiento -->
          <div v-if="contact.birthDate" class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <i class="pi pi-calendar text-pink-500"></i>
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
                {{ t('general.birth_date') }}:
              </span>
            </div>
            <FormattedDate :date="contact.birthDate" format="date" />
          </div>

          <!-- Fecha de creación -->
          <div v-if="contact.createdAt" class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <i class="pi pi-plus-circle text-green-500"></i>
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
                {{ t('contact_view.created_at') }}:
              </span>
            </div>
            <FormattedDate :date="contact.createdAt" format="datetime" />
          </div>

          <!-- Fecha de actualización -->
          <div v-if="contact.updatedAt && contact.updatedAt !== contact.createdAt" class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <i class="pi pi-pencil text-blue-500"></i>
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">
                {{ t('contact_view.updated_at') }}:
              </span>
            </div>
            <FormattedDate :date="contact.updatedAt" format="datetime" />
          </div>
        </div>
      </div>

      <!-- Campos personalizados -->
      <div v-if="contact.customValues && contact.customValues.length > 0">
        <Divider />
        <h4 class="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
          {{ t('contact.custom_fields') }}
        </h4>

        <div class="space-y-2">
          <div
            v-for="customValue in contact.customValues"
            :key="customValue.id"
            class="flex items-center justify-between"
          >
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
              {{ t('general.field') }} {{ customValue.customFieldId }}:
            </span>
            <span class="text-sm text-gray-900 dark:text-gray-100">
              {{ customValue.value || t('general.not_defined') }}
            </span>
          </div>
        </div>
      </div>

      <!-- ID del contacto -->
      <div class="bg-gray-100 dark:bg-gray-700 p-2 rounded text-center">
        <span class="text-xs text-gray-500 dark:text-gray-400">
          ID: {{ contact.id }}
        </span>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          @click="dialogVisible = false"
          severity="secondary"
        >
          {{ t('general.cancel') }}
        </Button>
        <Button
          @click="editContact"
          :disabled="!contact"
        >
          <i class="pi pi-pencil mr-2"></i>
          {{ t('actions.edit') }}
        </Button>
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.contact-view-modal :deep(.p-dialog-content) {
  padding: 1.5rem;
}
</style>
