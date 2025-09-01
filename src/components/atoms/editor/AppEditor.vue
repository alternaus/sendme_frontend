<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import Editor, { type EditorTextChangeEvent } from 'primevue/editor'

import { useI18n } from 'vue-i18n'

import AppAIGenerate from '@/components/atoms/editor/AppAIGenerate.vue'
import AppTextarea from '@/components/atoms/textarea/AppTextarea.vue'

interface Props {
  modelValue?: string
  errorMessage?: string
  contentType?: 'html' | 'text'
  showErrorMessage?: boolean
  aiAttach?: boolean
  readonly?: boolean
  showToolbar?: boolean
  placeholder?: string
  disabled?: boolean
  rows?: number
  maxlength?: number
  aiInsertMode?: 'append' | 'replace'
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  errorMessage: '',
  contentType: 'html',
  showErrorMessage: true,
  aiAttach: false,
  readonly: false,
  showToolbar: true,
  placeholder: '',
  disabled: false,
  rows: 6,
  maxlength: undefined,
  aiInsertMode: 'append'
})

const emit = defineEmits<Emits>()

const { t } = useI18n()

// Constantes para límites de SMS
const SMS_CHAR_LIMITS = {
  GSM_7BIT: 160,
  GSM_7BIT_EXTENDED: 160,
  UCS2: 70,
  MAX_SINGLE_MESSAGE: 160,
  MAX_CONCATENATED_MESSAGE: 153,
  MAX_CHARACTERS: 459
}

// Referencia al contenido interno
const internalContent = ref('')

const editorContent = computed({
  get: () => internalContent.value || props.modelValue || '',
  set: (value) => {
    const newValue = value || ''
    internalContent.value = newValue
    emit('update:modelValue', newValue)
  },
})

// Contador de caracteres para SMS
const smsStats = computed(() => {
  if (props.contentType !== 'text') return null

  const text = editorContent.value || ''
  const charCount = text.length
  const maxChars = props.maxlength || SMS_CHAR_LIMITS.MAX_CHARACTERS

  // Calcular número de mensajes usando la lógica optimizada
  let messageCount = 1
  if (charCount > SMS_CHAR_LIMITS.MAX_SINGLE_MESSAGE) {
    messageCount = Math.ceil((charCount - SMS_CHAR_LIMITS.MAX_SINGLE_MESSAGE) / SMS_CHAR_LIMITS.MAX_CONCATENATED_MESSAGE) + 1
  }

  // Determinar si excede el límite
  const isOverLimit = charCount > maxChars

  return {
    charCount,
    messageCount,
    isOverLimit,
    maxChars
  }
})

// Sincronizar con modelValue externo
watch(
  () => props.modelValue,
  (newValue) => {
    const value = newValue || ''
    if (value !== internalContent.value) {
      internalContent.value = value
    }
  },
  { immediate: true }
)

// Método para insertar campos dinámicos o contenido personalizado
const insertContent = (content: string, position: 'start' | 'end' | 'cursor' = 'cursor') => {
  const currentContent = editorContent.value || ''
  let newContent = ''

  switch (position) {
    case 'start':
      newContent = content + (currentContent ? '\n' + currentContent : '')
      break
    case 'end':
      newContent = currentContent + (currentContent ? '\n' : '') + content
      break
    case 'cursor':
    default:
      // Para campos dinámicos, insertar con un espacio si es necesario
      if (currentContent && !currentContent.endsWith(' ') && !currentContent.endsWith('\n')) {
        newContent = currentContent + ' ' + content
      } else {
        newContent = currentContent + content
      }
      break
  }

  // Para SMS, verificar límite antes de insertar
  const maxLength = props.maxlength || SMS_CHAR_LIMITS.MAX_CHARACTERS
  if (props.contentType === 'text' && newContent.length > maxLength) {
    return false // Retornar false si excede el límite
  }

  editorContent.value = newContent
  return true // Retornar true si la inserción fue exitosa
}

const handleTextChange = (event: EditorTextChangeEvent) => {
  const newValue = props.contentType === 'html' ? event.htmlValue : event.textValue

  // Para SMS, limitar caracteres si se define maxlength
  const maxLength = props.maxlength || SMS_CHAR_LIMITS.MAX_CHARACTERS
  if (props.contentType === 'text' && props.maxlength && newValue.length > maxLength) {
    return // No permitir más caracteres
  }

  editorContent.value = newValue
}

const handleAiInsert = (aiContent: string) => {
  if (props.aiInsertMode === 'replace') {
    // Reemplazar todo el contenido
    editorContent.value = aiContent
  } else {
    // Modo append: agregar al final del contenido actual
    const currentContent = editorContent.value || ''
    const separator = currentContent && !currentContent.endsWith('\n') ? '\n' : ''
    const newContent = currentContent + separator + aiContent

    // Verificar límite para SMS
    const maxLength = props.maxlength || SMS_CHAR_LIMITS.MAX_CHARACTERS
    if (props.contentType === 'text' && newContent.length > maxLength) {
      return // No permitir inserción si excede el límite
    }

    editorContent.value = newContent
  }
}

// Exponer métodos para uso externo
defineExpose({
  insertContent
})
</script>

<template>
  <div class="w-full">
    <!-- Textarea para contenido de texto (SMS) -->
    <div v-if="contentType === 'text'" class="w-full">
      <AppTextarea
        v-model="editorContent"
        :rows="rows"
        :error-message="errorMessage"
        :show-error-message="showErrorMessage"
        :use-float-label="false"
        :auto-resize="true"
        :placeholder="placeholder || t('editor.sms_placeholder')"
        :disabled="disabled || readonly"
        :maxlength="maxlength"
        class="w-full"
        :ai-attach="aiAttach"
        :ai-insert-mode="aiInsertMode"
      />

      <!-- Contador de caracteres para SMS -->
      <div v-if="smsStats" class="mt-2 text-sm text-gray-600 dark:text-gray-400 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <span>{{ t('editor.characters') }}: {{ smsStats.charCount }}</span>
          <span>{{ t('editor.messages') }}: {{ smsStats.messageCount }}</span>
        </div>
        <span
          :class="{
            'text-green-600 dark:text-green-400': !smsStats.isOverLimit,
            'text-red-600 dark:text-red-400': smsStats.isOverLimit
          }"
        >
          {{ smsStats.charCount }}/{{ smsStats.maxChars }} {{ t('editor.characters') }} - {{ smsStats.messageCount }} {{ t('general.sms') }}
        </span>
      </div>

      <!-- Advertencia si excede el límite -->
      <div
        v-if="smsStats && smsStats.isOverLimit"
        class="mt-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded-md"
      >
        {{ t('editor.sms_limit_exceeded') }}
      </div>
    </div>

    <!-- Editor HTML para contenido HTML (Email) -->
    <Editor
      v-else
      v-model="editorContent"
      editorStyle="height: 200px"
      :readonly="readonly || disabled"
      :placeholder="placeholder || t('editor.email_placeholder')"
      class="w-full !rounded-xl transition-all duration-300"
      :class="{
        'p-invalid border-1 border-red-400  dark:border-red-300': errorMessage.length > 0,
        'readonly-editor': readonly || disabled,
      }"
      @text-change="handleTextChange"
    >
      <template v-if="showToolbar && !readonly && !disabled" v-slot:toolbar>
        <span class="ql-formats">
          <button v-tooltip.bottom="t('editor.bold')" class="ql-bold"></button>
          <button v-tooltip.bottom="t('editor.italic')" class="ql-italic"></button>
          <button v-tooltip.bottom="t('editor.underline')" class="ql-underline"></button>
          <button v-tooltip.bottom="t('editor.strike')" class="ql-strike"></button>
        </span>
        <span class="ql-formats">
          <select v-tooltip.bottom="t('editor.font_size')" class="ql-size">
            <option value="small"></option>
            <option selected></option>
            <option value="large"></option>
            <option value="huge"></option>
          </select>
        </span>
        <span class="ql-formats">
          <button v-tooltip.bottom="t('editor.ordered_list')" class="ql-list" value="ordered"></button>
          <button v-tooltip.bottom="t('editor.bullet_list')" class="ql-list" value="bullet"></button>
        </span>
        <span class="ql-formats">
          <button v-tooltip.bottom="t('editor.align_left')" class="ql-align" value=""></button>
          <button v-tooltip.bottom="t('editor.align_center')" class="ql-align" value="center"></button>
          <button v-tooltip.bottom="t('editor.align_right')" class="ql-align" value="right"></button>
          <button v-tooltip.bottom="t('editor.justify')" class="ql-align" value="justify"></button>
        </span>
        <span class="ql-formats">
          <button v-tooltip.bottom="t('editor.add_link')" class="ql-link"></button>
          <button v-tooltip.bottom="t('editor.add_image')" class="ql-image"></button>
        </span>

        <span class="ql-formats">
          <button v-tooltip.bottom="t('editor.clean_formatting')" class="ql-clean"></button>
        </span>
        <span v-if="aiAttach" class="ql-formats">
          <AppAIGenerate
            type="email"
            :current-text="editorContent"
            :append-mode="aiInsertMode"
            :button-title="t('editor.ai_generate')"
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
