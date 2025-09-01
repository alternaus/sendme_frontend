<script lang="ts">
import { computed, defineComponent, watchEffect } from 'vue'

import Editor, { type EditorTextChangeEvent } from 'primevue/editor'

import AppAIGenerate from '@/components/atoms/editor/AppAIGenerate.vue'
import AppTextarea from '@/components/atoms/textarea/AppTextarea.vue'

export default defineComponent({
  name: 'AppEditor',
  components: {
    Editor,
    AppTextarea,
    AppAIGenerate,
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
    aiAttach: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    showToolbar: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    // Constantes para límites de SMS
    const SMS_CHAR_LIMITS = {
      GSM_7BIT: 160,
      GSM_7BIT_EXTENDED: 160,
      UCS2: 70
    }

    const editorContent = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value),
    })

    // Contador de caracteres para SMS
    const smsStats = computed(() => {
      if (props.contentType !== 'text') return null

      const text = editorContent.value || ''
      const charCount = text.length

      // Calcular número de mensajes
      let messageCount = 1
      if (charCount > SMS_CHAR_LIMITS.GSM_7BIT) {
        messageCount = Math.ceil(charCount / SMS_CHAR_LIMITS.GSM_7BIT)
      }

      // Determinar si excede el límite
      const isOverLimit = charCount > SMS_CHAR_LIMITS.GSM_7BIT * 10 // Máximo 10 mensajes

      return {
        charCount,
        messageCount,
        isOverLimit,
        maxChars: SMS_CHAR_LIMITS.GSM_7BIT * 10
      }
    })

    watchEffect(() => {
      if (props.modelValue !== editorContent.value) {
        editorContent.value = props.modelValue
      }
    })

    const handleTextChange = (event: EditorTextChangeEvent) => {
      const newValue = props.contentType === 'html' ? event.htmlValue : event.textValue

      // Para SMS, limitar a 1600 caracteres (10 mensajes)
      if (props.contentType === 'text' && newValue.length > SMS_CHAR_LIMITS.GSM_7BIT * 10) {
        return // No permitir más caracteres
      }

      editorContent.value = newValue
      emit('update:modelValue', newValue)
    }

    const handleAiInsert = (aiContent: string) => {
      // Simplificar la inserción: agregar al final del contenido actual
      const currentContent = editorContent.value || ''
      const separator = currentContent && !currentContent.endsWith('\n') ? '\n' : ''
      const newContent = currentContent + separator + aiContent

      // Para SMS, verificar límite antes de insertar
      if (props.contentType === 'text' && newContent.length > SMS_CHAR_LIMITS.GSM_7BIT * 10) {
        return // No permitir inserción si excede el límite
      }

      editorContent.value = newContent
      emit('update:modelValue', newContent)
    }

    return {
      editorContent,
      handleTextChange,
      handleAiInsert,
      smsStats,
    }
  },
})
</script>

<template>
  <div class="w-full">
    <!-- Textarea para contenido de texto -->
    <div v-if="contentType === 'text'" class="w-full">
      <AppTextarea
        v-model="editorContent"
        :rows="6"
        :error-message="errorMessage"
        :show-error-message="showErrorMessage"
        :use-float-label="false"
        :auto-resize="true"
        class="w-full"
        :ai-attach="aiAttach"
      />

      <!-- Contador de caracteres para SMS -->
      <div v-if="smsStats" class="mt-2 text-sm text-gray-600 dark:text-gray-400 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <span>Caracteres: {{ smsStats.charCount }}</span>
          <span>Mensajes: {{ smsStats.messageCount }}</span>
        </div>
        <span
          :class="{
            'text-green-600 dark:text-green-400': !smsStats.isOverLimit,
            'text-red-600 dark:text-red-400': smsStats.isOverLimit
          }"
        >
          {{ smsStats.charCount }}/{{ smsStats.maxChars }}
        </span>
      </div>

      <!-- Advertencia si excede el límite -->
      <div
        v-if="smsStats && smsStats.isOverLimit"
        class="mt-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded-md"
      >
        ⚠️ Has excedido el límite de 10 mensajes SMS. Por favor, acorta tu mensaje.
      </div>
    </div>

    <!-- Editor HTML para contenido HTML -->
    <Editor
      v-else
      v-model="editorContent"
      editorStyle="height: 200px"
      :readonly="readonly"
      class="w-full !rounded-xl transition-all duration-300"
      :class="{
        'p-invalid border-1 border-red-400  dark:border-red-300': errorMessage.length > 0,
        'readonly-editor': readonly,
      }"
      @text-change="handleTextChange"
    >
      <template v-if="showToolbar && !readonly" v-slot:toolbar>
        <span class="ql-formats">
          <button v-tooltip.bottom="'Bold'" class="ql-bold"></button>
          <button v-tooltip.bottom="'Italic'" class="ql-italic"></button>
          <button v-tooltip.bottom="'Underline'" class="ql-underline"></button>
          <button v-tooltip.bottom="'Strike'" class="ql-strike"></button>
        </span>
        <span class="ql-formats">
          <select v-tooltip.bottom="'Font Size'" class="ql-size">
            <option value="small"></option>
            <option selected></option>
            <option value="large"></option>
            <option value="huge"></option>
          </select>
        </span>
        <span class="ql-formats">
          <button v-tooltip.bottom="'Ordered List'" class="ql-list" value="ordered"></button>
          <button v-tooltip.bottom="'Bullet List'" class="ql-list" value="bullet"></button>
        </span>
        <span class="ql-formats">
          <button v-tooltip.bottom="'Align Left'" class="ql-align" value=""></button>
          <button v-tooltip.bottom="'Align Center'" class="ql-align" value="center"></button>
          <button v-tooltip.bottom="'Align Right'" class="ql-align" value="right"></button>
          <button v-tooltip.bottom="'Justify'" class="ql-align" value="justify"></button>
        </span>
        <span class="ql-formats">
          <button v-tooltip.bottom="'Add Link'" class="ql-link"></button>
          <button v-tooltip.bottom="'Add Image'" class="ql-image"></button>
        </span>

        <span class="ql-formats">
          <button v-tooltip.bottom="'Clean Formatting'" class="ql-clean"></button>
        </span>
        <span v-if="aiAttach" class="ql-formats">
          <AppAIGenerate
            type="email"
            :current-text="editorContent"
            append-mode="append"
            button-title="Generar con IA"
            @insert="handleAiInsert"
          />
        </span>
      </template>

    </Editor>

    <!-- Mensaje de error para el editor HTML (el textarea maneja su propio error) -->
    <div
      v-if="contentType === 'html' && showErrorMessage && errorMessage.length"
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

:deep(.ql-toolbar) {
  border-radius: var(--radius-xl) var(--radius-xl) 0% 0%;
  border: 1px solid var(--p-select-border-color) !important;
  background-color: var(--p-inputtext-background) !important;
}

:deep(.ql-formats) {
  margin-right: 8px;
}

:deep(.ql-picker-label) {
  border: none !important;
  background-color: transparent !important;
}

:deep(.ql-picker-options) {
  background-color: var(--p-inputtext-background) !important;
  border: 1px solid var(--p-select-border-color) !important;
  border-radius: var(--radius-md);
}

:deep(.ql-snow .ql-tooltip){
  position: sticky;
}


// Estilos para modo readonly
:deep(.readonly-editor) {
  .ql-toolbar {
    display: none !important;
  }

  .ql-container {
    border-radius: var(--radius-xl) !important;
    border: 1px solid var(--p-select-border-color) !important;
  }

  .ql-editor {
    border-radius: var(--radius-xl) !important;
    border: 1px solid var(--p-select-border-color) !important;
    background-color: var(--p-surface-50) !important;
    cursor: default !important;
  }
}
</style>
