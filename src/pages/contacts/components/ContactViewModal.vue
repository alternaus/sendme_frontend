<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useI18n } from 'vue-i18n'

import AppAvatar from '@/components/atoms/avatar/AppAvatar.vue'
import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppDialog from '@/components/atoms/dialogs/AppDialog.vue'
import AppDivider from '@/components/atoms/divider/AppDivider.vue'
import FormattedDate from '@/components/atoms/formatted-date/FormattedDate.vue'
import AppTag from '@/components/atoms/tag/AppTag.vue'
import { useDateFormat } from '@/composables/useDateFormat'
import type { IContact } from '@/services/contact/interfaces/contact.interface'
import type { ICustomField } from '@/services/custom-field/interfaces/custom-field.interface'
import { useCustomFieldService } from '@/services/custom-field/useCustomFieldService'

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
const { formatDate } = useDateFormat()
const { getCustomFields } = useCustomFieldService()

const customFields = ref<ICustomField[]>([])
const isLoadingCustomFields = ref(false)

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

const loadCustomFields = async () => {
  if (isLoadingCustomFields.value || !props.contact?.customValues?.length) return

  isLoadingCustomFields.value = true
  try {
    const response = await getCustomFields()
    customFields.value = response
  } catch {
    customFields.value = []
  } finally {
    isLoadingCustomFields.value = false
  }
}

const getCustomFieldInfo = (customFieldId: number) => {
  return customFields.value.find(field => field.id === customFieldId)
}

const getCustomFieldName = (customFieldId: number): string => {
  const field = getCustomFieldInfo(customFieldId)
  return field?.fieldName || `${t('general.field')} #${customFieldId}`
}

const getCustomFieldDataType = (customFieldId: number): string => {
  const field = getCustomFieldInfo(customFieldId)
  return field?.dataType || 'string'
}

// Computed para obtener todos los custom fields
const allCustomFields = computed(() => {
  if (!props.contact?.customValues || customFields.value.length === 0) return []
  return props.contact.customValues
})

const formatCustomFieldValue = (value: string | null, customFieldId: number): string => {
  if (!value) return t('general.not_defined')

  const dataType = getCustomFieldDataType(customFieldId)

  if (dataType === 'date') {
    try {
      return formatDate(value)
    } catch {
      return value
    }
  }

  return value
}

const getCustomFieldIcon = (customFieldId: number): string => {
  const dataType = getCustomFieldDataType(customFieldId)

  switch (dataType) {
    case 'date':
      return 'pi pi-calendar'
    case 'number':
      return 'pi pi-hashtag'
    case 'string':
    default:
      return 'pi pi-file-edit'
  }
}

const getAvatarInitials = computed(() => {
  if (!props.contact?.name) return '?'
  return props.contact.name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
})

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

// Cargar custom fields solo cuando el contacto cambie y tenga customValues
watch(
  () => props.contact,
  (newContact) => {
    if (newContact?.customValues?.length) {
      loadCustomFields()
    } else {
      customFields.value = []
    }
  },
  { immediate: true }
)
</script>

<template>
      <AppDialog
    v-model:modelValue="dialogVisible"
    modal
    :header="t('contact_view.title')"
    :style="{ width: '500px' }"
    class="contact-view-modal"
  >
    <div v-if="contact" class="space-y-4">
      <!-- Sección Avatar y Nombre -->
      <div class="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <AppAvatar
              :label="getAvatarInitials"
              shape="circle"
            />
            <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {{ contact.name || t('general.not_defined') }}
            </h3>
          </div>
          <AppTag
            :label="contact.status === 'active' ? t('general.active') : t('general.inactive')"
            :severity="statusVariant"
          />
        </div>
      </div>

      <!-- Información básica del contacto -->
      <div class="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">

        <!-- Información de contacto en grid 2x2 -->
        <div class="grid grid-cols-2 gap-x-6 gap-y-4">
          <!-- Teléfono -->
          <div v-if="contact.phone" class="space-y-1">
            <div class="flex items-center gap-2">
              <i class="pi pi-phone text-neutral-500 dark:text-neutral-400"></i>
              <span class="text-xs text-neutral-600 dark:text-neutral-400">
                {{ t('general.phone') }}:
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ contact.phone }}</span>
              <AppButton
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

          <!-- Código de País -->
          <div v-if="contact.countryCode" class="space-y-1">
            <div class="flex items-center gap-2">
              <i class="pi pi-globe text-neutral-500 dark:text-neutral-400"></i>
              <span class="text-xs text-neutral-600 dark:text-neutral-400">
                {{ t('general.country_code') }}:
              </span>
            </div>
            <span class="text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ contact.countryCode }}</span>
          </div>

          <!-- Organización -->
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <i class="pi pi-bookmark text-neutral-500 dark:text-neutral-400"></i>
              <span class="text-xs text-neutral-600 dark:text-neutral-400">
                {{ t('general.organization') }}:
              </span>
            </div>
            <span class="text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ contact.organizationId }}</span>
          </div>

          <!-- Fecha de Nacimiento -->
          <div v-if="contact.birthDate" class="space-y-1">
            <div class="flex items-center gap-2">
              <i class="pi pi-calendar text-neutral-500 dark:text-neutral-400"></i>
              <span class="text-xs text-neutral-600 dark:text-neutral-400">
                {{ t('general.birth_date') }}:
              </span>
            </div>
            <FormattedDate :date="contact.birthDate" format="date" class="text-sm font-medium text-neutral-900 dark:text-neutral-100" />
          </div>
        </div>
      </div>


      <!-- Sección CAMPOS PERSONALIZADOS - todos los custom fields -->
      <div v-if="allCustomFields.length > 0">
        <AppDivider />
        <h4 class="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-3 tracking-wide">
          CAMPOS PERSONALIZADOS
        </h4>

        <div class="space-y-3">
          <div
            v-for="customValue in allCustomFields"
            :key="customValue.id"
            class="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
          >
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <i
                :class="getCustomFieldIcon(customValue.customFieldId)"
                class="text-neutral-500 dark:text-neutral-400 flex-shrink-0"
              ></i>
              <span class="text-xs text-neutral-600 dark:text-neutral-400 truncate">
                {{ getCustomFieldName(customValue.customFieldId) }}:
              </span>
            </div>
            <div class="flex items-center gap-2 min-w-0">
              <span
                class="text-xs text-neutral-900 dark:text-neutral-100 text-right"
                :class="{
                  'font-mono': getCustomFieldDataType(customValue.customFieldId) === 'date',
                  'italic text-neutral-500 dark:text-neutral-500': !customValue.value
                }"
              >
                {{ formatCustomFieldValue(customValue.value, customValue.customFieldId) }}
              </span>
              <AppButton
                v-if="customValue.value"
                v-tooltip="t('general.copy')"
                @click="copyToClipboard(formatCustomFieldValue(customValue.value, customValue.customFieldId))"
                icon="pi pi-copy"
                size="small"
                severity="secondary"
                text
                class="p-1 flex-shrink-0"
              />
            </div>
          </div>
        </div>
      </div>


    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <AppButton
          @click="dialogVisible = false"
          severity="secondary"
        >
          {{ t('general.cancel') }}
        </AppButton>
        <AppButton
          @click="editContact"
          :disabled="!contact"
        >
          <i class="pi pi-pencil mr-2"></i>
          {{ t('actions.edit') }}
        </AppButton>
      </div>
    </template>
  </AppDialog>
</template>

<style scoped>
.contact-view-modal :deep(.p-dialog-content) {
  padding: 1.5rem;
}
</style>
