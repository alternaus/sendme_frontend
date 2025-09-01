<script lang="ts">
import { computed, defineComponent } from 'vue'

import AppDialog from '@/components/atoms/dialogs/AppDialog.vue'
import AppEditor from '@/components/atoms/editor/AppEditor.vue'

export default defineComponent({
  name: 'AppHtmlViewerDialog',
  components: {
    AppDialog,
    AppEditor,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    htmlContent: {
      type: String,
      default: '',
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

    return {
      internalVisible,
      closeDialog,
    }
  },
})
</script>

<template>
  <div>
    <AppDialog
      v-model="internalVisible"
      :header="$t('general.html_content')"
      :closable="true"
      :maximizable="true"
      customClass="html-viewer-dialog"
      @update:modelValue="(val) => { if (!val) closeDialog() }"
    >
      <template #content>
        <div >
          <AppEditor
            v-if="internalVisible"
            :model-value="htmlContent"
            :readonly="true"
            :show-toolbar="false"
            content-type="html"
          />
        </div>
      </template>
    </AppDialog>
  </div>
</template>

<style scoped lang="scss">
@media (max-width: 768px) {
  .html-viewer-dialog {
    :deep(.p-dialog) {
      min-width: 95vw;
      width: 95vw;
    }
  }
}
</style>
