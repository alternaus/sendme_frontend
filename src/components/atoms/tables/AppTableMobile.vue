<script setup lang="ts">
import { computed } from 'vue'

import dayjs from 'dayjs'

import FormattedDate from '@/components/atoms/formatted-date/FormattedDate.vue'
import type { DateFormatConfig } from '@/components/atoms/tables/AppTable.vue'
import AppTag from '@/components/atoms/tag/AppTag.vue'

import type { MobileConfig } from './types/mobile-config.type'
import type { TableHeader } from './types/table-header.type'

type TagSeverity = 'secondary' | 'success' | 'info' | 'warn' | 'warning' | 'danger' | 'contrast'

interface Props {
  data: Record<string, unknown>[]
  headers: TableHeader[]
  loading?: boolean
  emptyMessage?: string
  multipleSelection?: boolean
  selectedItems: Record<string, unknown> | Record<string, unknown>[] | null
  dateFields?: DateFormatConfig[]
  autoDetectDateFields?: boolean
  mobileConfig?: MobileConfig
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  emptyMessage: 'common.general.no_results',
  multipleSelection: false,
  dateFields: () => [],
  autoDetectDateFields: true,
})

const emit = defineEmits<{
  'selection-change': [selection: Record<string, unknown> | Record<string, unknown>[] | null]
  'row-double-click': [row: Record<string, unknown>]
}>()

// Detectar campos de fecha automáticamente
const detectedDateFields = computed(() => {
  if (!props.autoDetectDateFields || props.data.length === 0) {
    return props.dateFields
  }

  const dateFieldConfigs: DateFormatConfig[] = [...props.dateFields]
  const existingFields = dateFieldConfigs.map((config) => config.field)

  const item = props.data[0]

  props.headers.forEach((header) => {
    const field = header.field
    const value = item[field]

    if (existingFields.includes(field)) {
      return
    }

    const isDateField =
      typeof value === 'string' &&
      (field.toLowerCase().includes('date') ||
        field.toLowerCase().includes('at') ||
        (value && dayjs(value).isValid() && /^\d{4}-\d{2}-\d{2}/.test(value as string)))

    if (isDateField) {
      dateFieldConfigs.push({
        field,
        format: field.toLowerCase().includes('time') ? 'time' : 'datetime',
      })
    }
  })

  return dateFieldConfigs
})

const isDateField = (field: string): boolean => {
  return detectedDateFields.value.some((config) => config.field === field)
}

const getDateConfig = (field: string): DateFormatConfig | undefined => {
  return detectedDateFields.value.find((config) => config.field === field)
}

// Utilidades para la configuración móvil
const getFieldValue = (item: Record<string, unknown>, field: string | undefined, fallbackFields?: string[]): string => {
  if (field && item[field]) {
    return String(item[field])
  }

  if (fallbackFields) {
    for (const fallbackField of fallbackFields) {
      if (item[fallbackField]) {
        return String(item[fallbackField])
      }
    }
  }

  return ''
}

const findFieldByKeywords = (keywords: string[]): string | undefined => {
  return props.headers.find(h =>
    keywords.some(keyword => h.field.toLowerCase().includes(keyword))
  )?.field
}

const getInitials = (item: Record<string, unknown>): string => {
  const avatarConfig = props.mobileConfig?.avatar
  let value = ''

  if (avatarConfig?.field) {
    value = getFieldValue(item, avatarConfig.field, avatarConfig.fallbackFields)
  } else {
    const autoField = findFieldByKeywords(['name', 'nombre'])
    value = getFieldValue(item, autoField)
  }

  if (value) {
    return value
      .split(' ')
      .slice(0, 2)
      .map(word => word.charAt(0).toUpperCase())
      .join('')
  }
  return 'NA'
}

const getMobileTitle = (item: Record<string, unknown>): string => {
  const titleConfig = props.mobileConfig?.title

  if (titleConfig?.field) {
    return getFieldValue(item, titleConfig.field, titleConfig.fallbackFields)
  }

  const autoField = findFieldByKeywords(['name', 'nombre', 'title', 'titulo'])
  return getFieldValue(item, autoField)
}

const isItemSelected = (item: Record<string, unknown>): boolean => {
  if (!props.selectedItems) return false

  if (Array.isArray(props.selectedItems)) {
    return props.selectedItems.some(selected => {
      if (selected.id && item.id) {
        return selected.id === item.id
      }
      return selected === item
    })
  } else {
    if (props.selectedItems.id && item.id) {
      return props.selectedItems.id === item.id
    }
    return props.selectedItems === item
  }
}

const getMobileSubtitle = (item: Record<string, unknown>): { value: string; isDate: boolean; field: string } => {
  const subtitleConfig = props.mobileConfig?.subtitle
  let field = ''
  let value = ''

  if (subtitleConfig?.field) {
    field = subtitleConfig.field
    value = getFieldValue(item, subtitleConfig.field, subtitleConfig.fallbackFields)
  } else {
    const autoField = findFieldByKeywords(['phone', 'telefono', 'tel', 'frequency', 'frecuencia', 'email', 'correo'])
    if (autoField) {
      field = autoField
      value = getFieldValue(item, autoField)
    }
  }

  return {
    value,
    isDate: isDateField(field),
    field
  }
}

const getMobileMetadata = (item: Record<string, unknown>): Array<{ value: string; label?: string; isDate: boolean; field: string; position: 'left' | 'right'; separator?: string }> => {
  if (!props.mobileConfig?.metadata) {
    const emailField = findFieldByKeywords(['email', 'correo'])
    const sourceField = findFieldByKeywords(['source', 'origen', 'canal', 'channel', 'type', 'tipo', 'date', 'fecha', 'start', 'end'])

    const metadata = []
    if (emailField && item[emailField]) {
      metadata.push({
        value: String(item[emailField]),
        isDate: isDateField(emailField),
        field: emailField,
        position: 'left' as const
      })
    }
    if (sourceField && item[sourceField]) {
      metadata.push({
        value: String(item[sourceField]),
        isDate: isDateField(sourceField),
        field: sourceField,
        position: 'right' as const
      })
    }
    return metadata
  }

  return props.mobileConfig.metadata
    .map(config => {
      const value = getFieldValue(item, config.field)
      return {
        value,
        label: config.label,
        isDate: isDateField(config.field),
        field: config.field,
        position: config.position || 'left',
        separator: config.separator
      }
    })
    .filter(meta => meta.value)
}

const getMobileStatus = (item: Record<string, unknown>): string => {
  const statusConfig = props.mobileConfig?.status

  if (statusConfig?.field) {
    return getFieldValue(item, statusConfig.field, statusConfig.fallbackFields)
  }

  const autoField = findFieldByKeywords(['status', 'estado', 'state'])
  return getFieldValue(item, autoField)
}

const shouldShowAvatar = computed(() => {
  return props.mobileConfig?.showAvatar !== false && (props.mobileConfig?.avatar?.field || findFieldByKeywords(['name', 'nombre']))
})

const getStatusSeverity = (item: Record<string, unknown>): TagSeverity => {
  const status = getMobileStatus(item).toLowerCase()

  if (status.includes('activ') || status.includes('active')) {
    return 'success'
  }
  if (status.includes('pendient') || status.includes('pending')) {
    return 'warn'
  }
  if (status.includes('inactiv') || status.includes('inactive')) {
    return 'secondary'
  }

  return 'info'
}

const handleItemClick = (item: Record<string, unknown>) => {
  let newSelection: Record<string, unknown> | Record<string, unknown>[] | null

  if (props.multipleSelection) {
    const currentSelection = Array.isArray(props.selectedItems) ? props.selectedItems : []
    const isCurrentlySelected = isItemSelected(item)

    if (isCurrentlySelected) {
      newSelection = currentSelection.filter(selected => {
        if (selected.id && item.id) {
          return selected.id !== item.id
        }
        return selected !== item
      })
    } else {
      newSelection = [...currentSelection, item]
    }
  } else {
    newSelection = isItemSelected(item) ? null : item
  }

  emit('selection-change', newSelection)
}

const handleRowDoubleClick = (item: Record<string, unknown>) => {
  emit('row-double-click', item)
}
</script>

<template>
  <div class="space-y-3 overflow-y-auto max-h-[60vh] p-1">
    <div v-if="loading" class="flex justify-center py-8">
      <i class="pi pi-spin pi-spinner text-3xl text-neutral-400"></i>
    </div>

    <div
      v-else-if="data.length === 0"
      class="flex flex-col items-center justify-center p-8 text-center"
    >
      <slot name="empty">
        <i class="pi pi-inbox text-8xl text-neutral-300 dark:text-neutral-600 mb-4"></i>
        <p class="text-neutral-500 dark:text-neutral-400">
          {{ $t('common.general.no_records_found') }}
        </p>
      </slot>
    </div>

    <template v-else>
      <div
        v-for="(item, index) in data"
        :key="index"
        class="rounded-xl p-4 flex items-center shadow-sm transition-all duration-200 cursor-pointer active:scale-[0.95]"
        :class="[
          shouldShowAvatar ? 'gap-4' : 'gap-0',
          isItemSelected(item)
            ? 'border-1'
            : 'bg-white dark:bg-neutral-800 border-neutral-100 dark:border-neutral-700 hover:shadow-md'
        ]"
        :data-selected="isItemSelected(item)"
        @click="handleItemClick(item)"
        @dblclick="handleRowDoubleClick(item)"
      >
        <!-- Avatar -->
        <div v-if="shouldShowAvatar" class="flex-shrink-0">
          <div class="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-600 flex items-center justify-center text-neutral-700 dark:text-neutral-300 font-semibold text-lg">
            <slot name="avatar" :data="item">
              {{ getInitials(item) }}
            </slot>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <slot name="mobile-content" :data="item">
            <!-- Title -->
            <h3 v-if="getMobileTitle(item)" class="font-semibold text-neutral-900 dark:text-white text-base truncate leading-tight">
              {{ getMobileTitle(item) }}
            </h3>

            <!-- Subtitle -->
            <p v-if="getMobileSubtitle(item).value" class="text-neutral-600 dark:text-neutral-300 text-sm truncate mt-0.5">
              <FormattedDate
                v-if="getMobileSubtitle(item).isDate"
                :date="getMobileSubtitle(item).value"
                :format="getDateConfig(getMobileSubtitle(item).field)?.format"
                :custom-format="getDateConfig(getMobileSubtitle(item).field)?.customFormat"
                :show-timezone="getDateConfig(getMobileSubtitle(item).field)?.showTimezone"
              />
              <span v-else>{{ getMobileSubtitle(item).value }}</span>
            </p>

            <!-- Metadata -->
            <div v-if="getMobileMetadata(item).length > 0" class="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              <template v-for="(meta, metaIndex) in getMobileMetadata(item)" :key="metaIndex">
                <span v-if="meta.position === 'left'" class="truncate max-w-[150px]">
                  <span v-if="meta.label" class="font-medium">{{ meta.label }}: </span>
                  <FormattedDate
                    v-if="meta.isDate"
                    :date="meta.value"
                    :format="getDateConfig(meta.field)?.format"
                    :custom-format="getDateConfig(meta.field)?.customFormat"
                    :show-timezone="getDateConfig(meta.field)?.showTimezone"
                  />
                  <span v-else>{{ meta.value }}</span>
                </span>
              </template>

              <span v-if="getMobileMetadata(item).some(m => m.position === 'left') && getMobileMetadata(item).some(m => m.position === 'right')" class="text-neutral-300 dark:text-neutral-600">•</span>

              <template v-for="(meta, metaIndex) in getMobileMetadata(item)" :key="`right-${metaIndex}`">
                <span v-if="meta.position === 'right'" class="flex-shrink-0 font-medium">
                  <span v-if="meta.label" class="font-medium">{{ meta.label }}: </span>
                  <FormattedDate
                    v-if="meta.isDate"
                    :date="meta.value"
                    :format="getDateConfig(meta.field)?.format"
                    :custom-format="getDateConfig(meta.field)?.customFormat"
                    :show-timezone="getDateConfig(meta.field)?.showTimezone"
                  />
                  <span v-else>{{ meta.value }}</span>
                </span>
              </template>
            </div>
          </slot>
        </div>

        <!-- Status and Arrow -->
        <div class="flex items-center gap-3 flex-shrink-0">
          <div class="flex items-center">
            <slot name="mobile-status" :data="item">
              <AppTag
                v-if="getMobileStatus(item)"
                :label="getMobileStatus(item)"
                :severity="getStatusSeverity(item)"
              />
            </slot>
          </div>

          <div class="w-6 h-6 flex items-center justify-center">
            <slot name="mobile-arrow" :data="item" :selected="isItemSelected(item)">
              <div
                v-if="isItemSelected(item)"
                class="w-6 h-6 rounded-full flex items-center justify-center shadow-sm transition-all duration-200"
                style="background-color: var(--p-primary-color);"
              >
                <i class="pi pi-check text-sm font-semibold" style="color: var(--p-primary-contrast-color);"></i>
              </div>
            </slot>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
[data-selected="true"] {
  background-color: var(--p-primary-50) !important;
  border-color: var(--p-primary-color) !important;
  color: var(--p-primary-800) !important;

  html.dark & {
    background-color: var(--p-primary-900) !important;
    border-color: var(--p-primary-color) !important;
    color: var(--p-primary-100) !important;
  }
}
</style>
