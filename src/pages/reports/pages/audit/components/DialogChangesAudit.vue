<script lang="ts">
import { computed, defineComponent, ref } from 'vue'

import AppCard from '@/components/atoms/cards/AppCard.vue'
import AppDialog from '@/components/atoms/dialogs/AppDialog.vue'

export default defineComponent({
  components: {
    AppDialog,
    AppCard,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    changesData: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['update:visible'],
  setup(props, { emit }) {
    const internalVisible = computed({
      get: () => props.visible,
      set: (value) => emit('update:visible', value)
    })

    const closeDialog = () => {
      emit('update:visible', false)
    }

    //Detectar cambios entre "before" y "after"
    const changes = computed(() => {
      const before = props.changesData.before || {}
      const after = props.changesData.after || {}
      const fields = new Set([...Object.keys(before), ...Object.keys(after)])

      return [...fields].map((key) => ({
        key,
        before: before[key] ?? '—',
        after: after[key] ?? '—',
        changed: JSON.stringify(before[key]) !== JSON.stringify(after[key]),
      }))
    })

    const changedCount = computed(() => {
      return changes.value.filter(change => change.changed).length
    })

    const searchTerm = ref('')

    const filteredChanges = computed(() => {
      if (!searchTerm.value) return changes.value

      const term = searchTerm.value.toLowerCase()
      return changes.value.filter(change =>
        change.key.toLowerCase().includes(term) ||
        String(change.before).toLowerCase().includes(term) ||
        String(change.after).toLowerCase().includes(term)
      )
    })

    return {
      internalVisible,
      closeDialog,
      changes,
      changedCount,
      searchTerm,
      filteredChanges
    }
  },
})
</script>

<template>
  <div>
    <AppDialog
      v-model="internalVisible"
      :header="$t('reports.common.visualize_changes')"
      :closable="true"
      :maximizable="true"
      customClass="custom-style"
      @update:modelValue="(val) => { if (!val) closeDialog() }"
    >
      <template #content>
        <div class="flex flex-col p-3 gap-3">
          <div class="flex justify-between items-center">
            <div class="text-sm text-gray-500">
              <span class="font-medium">{{ changedCount }}</span> {{ $t('reports.common.changes_detected') }}
              <span class="mx-2">|</span>
              <span>{{ changes.length }} {{ $t('reports.common.fields_total') }}</span>
            </div>

            <div class="relative">
              <input
                v-model="searchTerm"
                type="text"
                class="pl-8 pr-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                :placeholder="$t('reports.common.search')"
              />
              <span class="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AppCard class="w-full shadow-sm">
              <template #content>
                <div class="flex flex-col">
                  <p class="text-md font-bold text-gray-600 dark:text-gray-300 mb-2">{{ $t('reports.common.before') }}</p>
                  <div class="max-h-[60vh] overflow-y-auto overflow-x-hidden pr-2 relative">
                    <div v-if="filteredChanges.length === 0" class="text-center py-4 text-gray-500 italic">
                      {{ $t('reports.common.no_results') }}
                    </div>
                    <div v-for="(change, index) in filteredChanges" :key="change.key" class="text-sm text-gray-700 dark:text-gray-200 mb-2 relative py-1 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                      <div class="field-row">
                        <div class="field-index">{{ index + 1 }}</div>
                        <div class="field-label">{{ change.key }}:</div>
                        <div class="field-value" :title="change.before">{{ change.before }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </AppCard>

            <AppCard class="w-full shadow-sm">
              <template #content>
                <div class="flex flex-col">
                  <p class="text-md font-bold text-gray-600 dark:text-gray-300 mb-2">{{ $t('reports.common.after') }}</p>
                  <div class="max-h-[60vh] overflow-y-auto overflow-x-hidden pr-2 relative">
                    <div v-if="filteredChanges.length === 0" class="text-center py-4 text-gray-500 italic">
                      {{ $t('reports.common.no_results') }}
                    </div>
                    <div v-for="(change, index) in filteredChanges" :key="change.key" class="text-sm text-gray-700 dark:text-gray-200 mb-2 relative py-1 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                      <div class="field-row">
                        <div class="field-index">{{ index + 1 }}</div>
                        <div class="field-label">{{ change.key }}:</div>
                        <div
                          class="field-value"
                          :class="change.changed ? 'changed-value' : ''"
                          :title="change.after"
                        >
                          {{ change.after }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </AppCard>
          </div>
        </div>
      </template>
    </AppDialog>
  </div>
</template>

<style scoped>
.field-row {
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: baseline;
}

.field-index {
  flex: 0 0 20px;
  font-size: 10px;
  color: #6b7280;
  text-align: right;
  margin-right: 4px;
}

.field-label {
  flex: 0 0 80px;
  font-weight: 600;
  white-space: nowrap;
  margin-right: 8px;
}

.field-value {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
  padding: 0 2px;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.field-value:hover {
  white-space: normal;
  overflow: visible;
  word-break: break-word;
  background-color: rgba(0, 0, 0, 0.05);
  z-index: 5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.changed-value {
  background-color: #ecfdf5;
  color: #065f46;
  font-weight: 600;
  padding: 2px 6px;
}

.dark .changed-value {
  background-color: #064e3b;
  color: #d1fae5;
}

.dark .field-index {
  color: #9ca3af;
}
</style>
