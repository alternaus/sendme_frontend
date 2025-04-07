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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
          <AppCard class="w-full">
            <template #content>
              <div class="flex flex-col flex-wrap">
                <p class="text-lg font-bold text-gray-600 dark:text-gray-300 mb-3">{{ $t('general.before') }}</p>
                <div v-for="change in changes" :key="change.key" class="text-base text-gray-700 dark:text-gray-200 mb-2">
                  <small class="font-semibold">{{ change.key }}:</small>
                  <span class="ml-2">{{ change.before }}</span>
                </div>
              </div>
            </template>
          </AppCard>

          <AppCard class="w-full">
            <template #content>
              <div class="flex flex-col flex-wrap">
                <p class="text-lg font-bold text-gray-600 dark:text-gray-300 mb-3">{{ $t('general.after') }}</p>
                <div v-for="change in changes" :key="change.key" class="text-base text-gray-700 dark:text-gray-200 mb-2">
                  <small class="font-semibold">{{ change.key }}:</small>
                  <span
                    class="ml-2 px-2 rounded transition-all"
                    :class="change.changed ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 font-bold' : ''"
                  >
                    {{ change.after }}
                  </span>
                </div>
              </div>
            </template>
          </AppCard>
        </div>
      </template>

    </AppDialog>
  </div>
</template>
