<script lang="ts">
import { computed, defineComponent } from 'vue'

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

    // Detectar cambios entre "before" y "after"
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

    return {
      internalVisible,
      closeDialog,
      changes,
    }
  },
})
</script>

<template>
  <div>
    <AppDialog
      v-model="internalVisible"
      :header="$t('general.visualize_changes')"
      :closable="true"
      customClass="custom-style"
      @update:modelValue="(val) => { if (!val) closeDialog() }"
    >
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-3">
          <AppCard class="w-full shadow-sm">
            <template #content>
              <div class="flex flex-col">
                <p class="text-md font-bold text-gray-600 dark:text-gray-300 mb-2">{{ $t('general.before') }}</p>
                <div class="max-h-[60vh] overflow-y-auto overflow-x-hidden pr-2">
                  <div v-for="change in changes" :key="change.key" class="text-sm text-gray-700 dark:text-gray-200 mb-2">
                    <div class="field-row">
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
                <p class="text-md font-bold text-gray-600 dark:text-gray-300 mb-2">{{ $t('general.after') }}</p>
                <div class="max-h-[60vh] overflow-y-auto overflow-x-hidden pr-2">
                  <div v-for="change in changes" :key="change.key" class="text-sm text-gray-700 dark:text-gray-200 mb-2">
                    <div class="field-row">
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
      </template>
    </AppDialog>
  </div>
</template>

<style scoped>
.field-row {
  display: flex;
  width: 100%;
  min-width: 0;
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
}

.field-value:hover {
  white-space: normal;
  overflow: visible;
  word-break: break-word;
  background-color: rgba(0, 0, 0, 0.05);
  z-index: 1;
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
</style>
