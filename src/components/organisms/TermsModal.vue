<template>
  <Dialog
    :visible="visible"
    modal
    :header="$t('terms.modal.title')"
    :style="{ width: '60rem', maxWidth: '90vw' }"
    :closable="!blocking"
    :close-on-escape="!blocking"
    @update:visible="onVisibilityChange"
  >
    <ScrollPanel style="height: 400px">
      <div class="pr-3">
        <slot>
          <TermsViewer @scroll-to-end="handleScrollToEnd" />
        </slot>
      </div>
    </ScrollPanel>

    <template #footer>
      <div class="flex justify-between items-center gap-2">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          <span v-if="!hasReadToEnd" class="flex items-center gap-2">
            <i class="pi pi-info-circle"></i>
            {{ $t('terms.scroll_to_enable') }}
          </span>
          <span v-else class="flex items-center gap-2 text-[var(--p-toast-success-color)] ">
            <i class="pi pi-check-circle"></i>
            {{ $t('terms.ready_to_accept') }}
          </span>
        </div>
        <div class="flex gap-2">
          <Button
            v-if="!blocking"
            :label="$t('terms.actions.cancel')"
            severity="secondary"
            outlined
            @click="$emit('cancel')"
            :disabled="loading"
          />
          <Button
          size="small"
            :label="loading ? $t('terms.actions.accepting') : $t('terms.actions.accept')"
            :loading="loading"
            :disabled="!hasReadToEnd || loading"
            @click="$emit('accept')"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import ScrollPanel from 'primevue/scrollpanel'

import TermsViewer from '@/views/TermsViewer.vue'

interface Props {
  visible: boolean
  blocking?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  blocking: false,
  loading: false
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  accept: []
  cancel: []
}>()

const hasReadToEnd = ref(false)

const handleScrollToEnd = () => {
  hasReadToEnd.value = true
}

const onVisibilityChange = (value: boolean) => {
  // Solo permitir cerrar el modal si no está en modo blocking
  if (!props.blocking || value === true) {
    emit('update:visible', value)
  }

  // Reset el estado cuando se cierra el modal
  if (!value) {
    hasReadToEnd.value = false
  }
}
</script>
