<script lang="ts">
import { computed, defineComponent, type PropType } from 'vue'

import PrimeAccordion from 'primevue/accordion'
import PrimeAccordionTab from 'primevue/accordiontab'
import PrimeProgressBar from 'primevue/progressbar'

import { useI18n } from 'vue-i18n'

import type {
  IContactImportCompletionData,
  IContactImportProgressData,
  IContactImportStartData,
  INotification} from './interfaces/notification.interface'
import {
  isCompletionNotification,
  isProgressNotification,
  isStartNotification
} from './interfaces/notification.interface'

export default defineComponent({
  name: 'ContactImportNotification',
  components: {
    PrimeProgressBar,
    PrimeAccordion,
    PrimeAccordionTab
  },
  props: {
    notification: {
      type: Object as PropType<INotification>,
      required: true
    }
  },
  emits: ['delete', 'markAsRead'],
  setup(props, { emit }) {
    const { t } = useI18n()

    const progressData = computed((): IContactImportProgressData | null => {
      if (props.notification.data && isProgressNotification(props.notification.data)) {
        return props.notification.data
      }
      return null
    })

    const completionData = computed((): IContactImportCompletionData | null => {
      if (props.notification.data && isCompletionNotification(props.notification.data)) {
        return props.notification.data
      }
      return null
    })

    const startData = computed((): IContactImportStartData | null => {
      if (props.notification.data && isStartNotification(props.notification.data)) {
        return props.notification.data
      }
      return null
    })

    const isProgressType = computed(() => progressData.value !== null)
    const isCompletionType = computed(() => completionData.value !== null)
    const isStartType = computed(() => startData.value !== null)

    const getIconClass = computed(() => {
      switch (props.notification.type) {
        case 'success': return 'pi pi-check-circle text-green-600 dark:text-green-400'
        case 'error': return 'pi pi-times-circle text-red-600 dark:text-red-400'
        case 'warning': return 'pi pi-exclamation-triangle text-yellow-600 dark:text-yellow-400'
        case 'info':
        default: return 'pi pi-info-circle text-blue-600 dark:text-blue-400'
      }
    })

    const getProgressSeverity = computed(() => {
      if (!progressData.value) return 'info'
      if (progressData.value.errors > 0) return 'warning'
      return 'info'
    })

    const getCompletionSeverity = computed(() => {
      if (!completionData.value) return 'success'
      if (completionData.value.errors === 0) return 'success'
      if (completionData.value.processed > 0) return 'warning'
      return 'danger'
    })

    const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('es', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }).format(date)
    }

    const handleDelete = () => {
      emit('delete', props.notification)
    }

    const handleMarkAsRead = () => {
      if (!props.notification.read) {
        emit('markAsRead', props.notification)
      }
    }

    return {
      progressData,
      completionData,
      startData,
      isProgressType,
      isCompletionType,
      isStartType,
      getIconClass,
      getProgressSeverity,
      getCompletionSeverity,
      formatDate,
      handleDelete,
      handleMarkAsRead,
      t
    }
  }
})
</script>

<template>
  <div
    class="relative flex flex-col gap-3 px-4 py-4 mb-3 rounded-lg shadow-sm border-l-4 transition-all duration-300"
    :class="{
      'border-green-700 dark:border-green-300 bg-white dark:bg-neutral-800': notification.type === 'success',
      'border-red-700 dark:border-red-300 bg-white dark:bg-neutral-800': notification.type === 'error',
      'border-yellow-700 dark:border-yellow-300 bg-white dark:bg-neutral-800': notification.type === 'warning',
      'border-blue-700 dark:border-blue-300 bg-white dark:bg-neutral-800': notification.type === 'info',
      'opacity-60': notification.read
    }"
  >
    <!-- Header -->
    <div class="flex items-start gap-3">
      <i :class="[getIconClass, 'text-xl flex-shrink-0 mt-1']" />

      <div class="flex-grow min-w-0">
        <div class="flex justify-between items-center mb-1">
          <span
            class="font-semibold text-gray-800 dark:text-gray-200 truncate cursor-pointer"
            :class="{ 'font-bold': !notification.read }"
            @click="handleMarkAsRead"
            :title="!notification.read ? t('notifications.mark_as_read') : ''"
          >
            {{ notification.title }}
            <span
              v-if="!notification.read"
              class="inline-block w-2 h-2 bg-blue-500 rounded-full ml-2"
            ></span>
          </span>
        </div>
        <p
          class="text-gray-700 dark:text-gray-300 text-sm mb-2"
          :class="{ 'font-medium': !notification.read }"
        >
          {{ notification.message }}
        </p>
      </div>

      <!-- Action buttons -->
      <div class="flex flex-col gap-1">
        <button
          v-if="!notification.read"
          class="p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
          @click="handleMarkAsRead"
          :title="t('notifications.mark_as_read')"
        >
          <i class="pi pi-check text-blue-600 dark:text-blue-400"></i>
        </button>

        <button
          class="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
          @click="handleDelete"
          :title="t('notifications.delete')"
        >
          <i class="pi pi-times text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"></i>
        </button>
      </div>
    </div>

    <!-- Progress Details -->
    <div v-if="isProgressType && progressData" class="mt-2">
      <div class="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
        <span>{{ t('contacts.import.progress') }}: {{ progressData.progress }}%</span>
        <span>{{ progressData.processed }} {{ t('contacts.import.processed') }}</span>
      </div>
      <PrimeProgressBar
        :value="progressData.progress"
        :severity="getProgressSeverity"
        class="mb-2"
      />
      <div class="flex justify-between text-xs">
        <span class="text-green-600 dark:text-green-400">
          ✓ {{ progressData.processed }} {{ t('contacts.import.successful') }}
        </span>
        <span v-if="progressData.errors > 0" class="text-red-600 dark:text-red-400">
          ✗ {{ progressData.errors }} {{ t('contacts.import.errors') }}
        </span>
      </div>
    </div>

    <!-- Completion Details -->
    <div v-if="isCompletionType && completionData" class="mt-2">
      <div class="grid grid-cols-3 gap-2 text-center text-xs mb-3">
        <div class="bg-green-50 dark:bg-green-900/20 p-2 rounded">
          <div class="text-green-600 dark:text-green-400 font-bold text-lg">
            {{ completionData.processed }}
          </div>
          <div class="text-gray-600 dark:text-gray-400">
            {{ t('contacts.import.imported') }}
          </div>
        </div>
        <div class="bg-red-50 dark:bg-red-900/20 p-2 rounded">
          <div class="text-red-600 dark:text-red-400 font-bold text-lg">
            {{ completionData.errors }}
          </div>
          <div class="text-gray-600 dark:text-gray-400">
            {{ t('contacts.import.errors') }}
          </div>
        </div>
        <div class="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
          <div class="text-blue-600 dark:text-blue-400 font-bold text-lg">
            {{ completionData.total }}
          </div>
          <div class="text-gray-600 dark:text-gray-400">
            {{ t('contacts.import.total') }}
          </div>
        </div>
      </div>

      <!-- Error Details -->
      <div v-if="completionData.errorDetails && completionData.errorDetails.length > 0" class="mt-3">
        <PrimeAccordion>
          <PrimeAccordionTab>
            <template #header>
              <span class="text-sm text-red-600 dark:text-red-400">
                <i class="pi pi-exclamation-triangle mr-2"></i>
                {{ t('contacts.import.view_errors') }} ({{ completionData.errorDetails.length }})
              </span>
            </template>
            <div class="max-h-40 overflow-y-auto">
              <ul class="text-xs space-y-1">
                <li
                  v-for="(error, index) in completionData.errorDetails"
                  :key="index"
                  class="text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 p-2 rounded"
                >
                  {{ error }}
                </li>
              </ul>
            </div>
          </PrimeAccordionTab>
        </PrimeAccordion>
      </div>
    </div>

    <!-- Start notification details -->
    <div v-if="isStartType && startData" class="mt-2">
      <div class="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
        <i class="pi pi-clock"></i>
        <span>{{ t('contacts.import.started_at') }}: {{ formatDate(startData.timestamp) }}</span>
      </div>
    </div>

    <!-- Footer -->
    <div class="text-xs text-gray-400 dark:text-gray-500 mt-2 flex justify-between items-center">
      <span>{{ formatDate(notification.timestamp) }}</span>
      <span v-if="notification.read" class="text-green-600 dark:text-green-400">
        {{ t('notifications.read') }}
      </span>
    </div>
  </div>
</template>

<style scoped>
:deep(.p-progressbar) {
  height: 8px;
}

:deep(.p-accordion-tab-active .p-accordion-header) {
  border-color: #ef4444;
}
</style>
