<script lang="ts">
import { computed, defineComponent, watchEffect } from 'vue'

import Editor, { type EditorTextChangeEvent } from 'primevue/editor'

export default defineComponent({
  name: 'AppEditor',
  components: {
    Editor,
  },
  props: {
    modelValue: {
      type: String,
      required: true,
    },
    errorMessage: {
      type: String,
      default: '',
    },
    contentType: {
      type: String,
      default: 'html',
      validator: (value: string) => ['html', 'text'].includes(value),
    },
    showErrorMessage: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const editorContent = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value),
    })

    watchEffect(() => {
      if (props.modelValue !== editorContent.value) {
        editorContent.value = props.modelValue
      }
    })

    const handleTextChange = (event: EditorTextChangeEvent) => {
      editorContent.value = props.contentType === 'html' ? event.htmlValue : event.textValue
      emit('update:modelValue', props.contentType === 'html' ? event.htmlValue : event.textValue)
    }

    return {
      editorContent,
      handleTextChange,
    }
  },
})
</script>

<template>
  <div class="w-full">
    <Editor
      v-model="editorContent"
      editorStyle="height: 150px"
      class="w-full !rounded-xl transition-all duration-300"
      :class="{
        'p-invalid border-1 border-red-400  dark:border-red-300': errorMessage.length > 0,
        'text-editor': contentType === 'text',
      }"
      @text-change="handleTextChange"
    >
      <template v-slot:toolbar v-if="contentType === 'html'">
        <span class="ql-formats">
          <button v-tooltip.bottom="'Bold'" class="ql-bold"></button>
          <button v-tooltip.bottom="'Italic'" class="ql-italic"></button>
          <button v-tooltip.bottom="'Underline'" class="ql-underline"></button>
        </span>
      </template>
      <template v-slot:toolbar v-else>
        <p></p>
      </template>
    </Editor>

    <div
      v-if="showErrorMessage && errorMessage.length"
      class="text-red-400 dark:text-red-300 p-0 m-0"
    >
      <small>{{ errorMessage }}</small>
    </div>
  </div>
</template>

<style lang="scss" scoped>
:deep(.ql-editor.ql-blank) {
  border-radius: 0% 0% var(--radius-xl) var(--radius-xl) !important;
  border: 1px solid var(--p-select-border-color) !important;
  background-color: var(--p-inputtext-background) !important;
}

:deep(.ql-editor) {
  border-radius: 0% 0% var(--radius-xl) var(--radius-xl) !important;
  border: 1px solid var(--p-select-border-color) !important;
  background-color: var(--p-inputtext-background) !important;
}

:deep(.ql-container) {
  border-radius: 0% 0% var(--radius-xl) var(--radius-xl);
  border: none;
}

.text-editor:deep(.p-editor-toolbar) {
  display: none;
}
</style>
