<script lang="ts">
import { computed, defineComponent } from 'vue'

import AppDialog from '@/components/atoms/dialogs/AppDialog.vue'
import AppEditor from '@/components/atoms/editor/AppEditor.vue'

export default defineComponent({
  name: 'HtmlViewerDialog',
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
        <div class="html-viewer-content">
          <AppEditor
            v-if="internalVisible"
            :model-value="htmlContent"
            :readonly="true"
            :show-toolbar="false"
            content-type="html"
            class="html-viewer-editor"
          />
        </div>
      </template>
    </AppDialog>
  </div>
</template>

<style scoped lang="scss">
.html-viewer-dialog {
  // Estilos base del modal
  :deep(.p-dialog) {
    min-width: 80vw;
    min-height: 70vh;
    max-width: 95vw;
    max-height: 95vh;

    .p-dialog-content {
      padding: 0 !important;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .p-dialog-header {
      flex-shrink: 0;
    }
  }

  // Cuando está maximizado, ocupa toda la pantalla
  :deep(.p-dialog-maximized) {
    width: 100vw !important;
    height: 100vh !important;
    max-width: 100vw !important;
    max-height: 100vh !important;
    top: 0 !important;
    left: 0 !important;
    margin: 0 !important;
    border-radius: 0 !important;

    .p-dialog-content {
      height: calc(100vh - 60px) !important; // Resta la altura del header
    }
  }
}

.html-viewer-content {
  padding: 1rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 60vh;

  // Cuando está maximizado
  .html-viewer-dialog :deep(.p-dialog-maximized) & {
    min-height: calc(100vh - 120px);
    height: calc(100vh - 120px);
  }
}

.html-viewer-editor {
  flex: 1;
  min-height: 60vh;

  // Asegurar que el editor use todo el espacio disponible
  :deep(.p-editor) {
    height: 100%;
    display: flex;
    flex-direction: column;

    .ql-container {
      flex: 1;
      height: auto !important;
    }

    .ql-editor {
      height: 100% !important;
      min-height: 60vh;
      overflow-y: auto;
    }
  }

  // Cuando está maximizado
  .html-viewer-dialog :deep(.p-dialog-maximized) & {
    min-height: calc(100vh - 140px);

    :deep(.ql-editor) {
      min-height: calc(100vh - 140px) !important;
    }
  }
}

// Responsive design
@media (max-width: 768px) {
  .html-viewer-dialog {
    :deep(.p-dialog) {
      min-width: 95vw;
      width: 95vw;
    }
  }
}
</style>
