<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import Editor from 'primevue/editor'

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

const SMS_CHAR_LIMITS = {
  GSM_7BIT: 160,
  GSM_7BIT_EXTENDED: 160,
  UCS2: 70,
  MAX_SINGLE_MESSAGE: 160,
  MAX_CONCATENATED_MESSAGE: 153,
  MAX_CHARACTERS: 459
}
/** Fuente de verdad única */
const contentData = ref<string>('')
const updatingFromOutside = ref(false)

watch(
  () => props.modelValue,
  (nv) => {
    const v = nv ?? ''
    if (v !== contentData.value) {
      updatingFromOutside.value = true
      contentData.value = v
      updatingFromOutside.value = false
    }
  },
  { immediate: true }
)

/** Emite solo cuando el cambio viene del usuario */
watch(contentData, (nv) => {
  if (updatingFromOutside.value) return
  emit('update:modelValue', nv ?? '')
})

/** Métricas SMS */
const smsStats = computed(() => {
  if (props.contentType !== 'text') return null
  const text = contentData.value ?? ''
  const charCount = text.length
  const maxChars = props.maxlength || SMS_CHAR_LIMITS.MAX_CHARACTERS
  let messageCount = 1
  if (charCount > SMS_CHAR_LIMITS.MAX_SINGLE_MESSAGE) {
    messageCount = Math.ceil((charCount - SMS_CHAR_LIMITS.MAX_SINGLE_MESSAGE) / SMS_CHAR_LIMITS.MAX_CONCATENATED_MESSAGE) + 1
  }
  const isOverLimit = charCount > maxChars
  return { charCount, messageCount, isOverLimit, maxChars }
})

/** Inserción de contenido (placeholder o IA) */
const insertContent = (content: string, position: 'start' | 'end' | 'cursor' = 'cursor') => {
  const current = contentData.value ?? ''
  let next = ''

  switch (position) {
    case 'start':
      next = content + (current ? '\n' + current : '')
      break
    case 'end':
      next = current + (current ? '\n' : '') + content
      break
    case 'cursor':
    default:
      // Sin API de cursor del hijo, aproximamos: unión suave al final
      if (current && !current.endsWith(' ') && !current.endsWith('\n')) {
        next = current + ' ' + content
      } else {
        next = current + content
      }
      break
  }

  const max = props.maxlength || SMS_CHAR_LIMITS.MAX_CHARACTERS
  if (props.contentType === 'text' && next.length > max) return false

  contentData.value = next
  return true
}

const handleAiInsert = (aiContent: string) => {
  if (props.aiInsertMode === 'replace') {
    contentData.value = aiContent
  } else {
    const current = contentData.value ?? ''
    const sep = current && !current.endsWith('\n') ? '\n' : ''
    const next = current + sep + aiContent
    const max = props.maxlength || SMS_CHAR_LIMITS.MAX_CHARACTERS
    if (props.contentType === 'text' && next.length > max) return
    contentData.value = next
  }
}



defineExpose({ insertContent })
</script>

<template>
  <div class="w-full">
    <!-- SMS -->
    <div v-if="contentType === 'text'" class="w-full">
      <AppTextarea
        v-model="contentData"
        :rows="rows"
        :error-message="errorMessage"
        :show-error-message="showErrorMessage"
        :use-float-label="false"
        :auto-resize="true"
        :placeholder="placeholder || t('general.editor.sms_placeholder')"
        :disabled="disabled || readonly"
        :maxlength="maxlength"
        class="w-full"
        :ai-attach="aiAttach"
        :ai-insert-mode="aiInsertMode"
      />

      <div v-if="smsStats" class="mt-2 text-sm text-neutral-600 dark:text-neutral-400 flex justify-center items-center">
        <span>{{ smsStats.charCount }}/{{ smsStats.maxChars }} - {{ smsStats.messageCount }} {{ t('general.sms') }}</span>
      </div>

      <div
        v-if="smsStats && smsStats.isOverLimit"
        class="mt-2 text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded-md"
      >
        {{ t('general.editor.sms_limit_exceeded') }}
      </div>
    </div>

    <!-- HTML (Quill) -->
    <Editor
      v-else
      :key="contentType"
      v-model="contentData"
      editorStyle="height: 200px"
      :readonly="readonly || disabled"
      :placeholder="placeholder || t('general.editor.email_placeholder')"
      class="w-full !rounded-xl transition-all duration-300"
      :class="{
        'p-invalid border-1 border-red-400 dark:border-red-300': !!errorMessage,
        'readonly-editor': readonly || disabled,
      }"
    >
      <template v-if="showToolbar && !readonly && !disabled" #toolbar>
        <span class="ql-formats">
          <button v-tooltip.bottom="t('general.editor.bold')" class="ql-bold"></button>
          <button v-tooltip.bottom="t('general.editor.italic')" class="ql-italic"></button>
          <button v-tooltip.bottom="t('general.editor.underline')" class="ql-underline"></button>
          <button v-tooltip.bottom="t('general.editor.strike')" class="ql-strike"></button>
        </span>
        <span class="ql-formats">
          <select v-tooltip.bottom="t('general.editor.font_size')" class="ql-size">
            <option value="small"></option>
            <option selected></option>
            <option value="large"></option>
            <option value="huge"></option>
          </select>
        </span>
        <span class="ql-formats">
          <button v-tooltip.bottom="t('general.editor.ordered_list')" class="ql-list" value="ordered"></button>
          <button v-tooltip.bottom="t('general.editor.bullet_list')" class="ql-list" value="bullet"></button>
        </span>
        <span class="ql-formats">
          <button v-tooltip.bottom="t('general.editor.align_left')" class="ql-align" value=""></button>
          <button v-tooltip.bottom="t('general.editor.align_center')" class="ql-align" value="center"></button>
          <button v-tooltip.bottom="t('general.editor.align_right')" class="ql-align" value="right"></button>
          <button v-tooltip.bottom="t('general.editor.justify')" class="ql-align" value="justify"></button>
        </span>
        <span class="ql-formats">
          <button v-tooltip.bottom="t('general.editor.add_link')" class="ql-link"></button>
          <button v-tooltip.bottom="t('general.editor.add_image')" class="ql-image"></button>
        </span>
        <span class="ql-formats">
          <button v-tooltip.bottom="t('general.editor.clean_formatting')" class="ql-clean"></button>
        </span>
        <span v-if="aiAttach" class="ql-formats">
          <AppAIGenerate
            type="email"
            :current-text="contentData"
            :append-mode="aiInsertMode"
            :button-title="t('general.editor.ai_generate')"
            @insert="handleAiInsert"
          />
        </span>
      </template>
    </Editor>

    <div
      v-if="contentType === 'html' && showErrorMessage && errorMessage"
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
:deep(.ql-formats) { margin-right: 8px; }
:deep(.ql-picker-label) { border: none !important; background-color: transparent !important; }
:deep(.ql-picker-options) {
  background-color: var(--p-inputtext-background) !important;
  border: 1px solid var(--p-select-border-color) !important;
  border-radius: var(--radius-md);
}
:deep(.ql-snow .ql-tooltip){ position: sticky; }

:deep(.readonly-editor) {
  .ql-toolbar { display: none !important; }
  .ql-container { border-radius: var(--radius-xl) !important; border: 1px solid var(--p-select-border-color) !important; }
  .ql-editor { border-radius: var(--radius-xl) !important; border: 1px solid var(--p-select-border-color) !important; cursor: default !important; }
}
</style>
