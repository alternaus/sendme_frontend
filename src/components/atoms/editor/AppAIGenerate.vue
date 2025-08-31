<!-- components/ai/AiAssistantDialog.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue'

import Dialog from 'primevue/dialog'
import SelectButton from 'primevue/selectbutton'

import { useI18n } from 'vue-i18n'

import IconSparkles from '@/assets/svg/sparkles.svg?component'
import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import AppTextarea from '@/components/atoms/textarea/AppTextarea.vue'
import { useAiService } from '@/services/ai'

const props = defineProps({
  appendMode: { type: String as () => 'replace' | 'append', default: 'replace' },
  buttonTitle: { type: String, default: 'Generar con IA' },
  currentText: { type: String, default: '' },
  type: { type: String as () => 'sms' | 'email',required:true },
})
const emit = defineEmits<{ (e: 'insert', value: string): void }>()

const { t } = useI18n()
const aiService = useAiService()

const show = ref(false)
const activeTab = ref<'generate' | 'translate'>('generate')

const isGenerating = ref(false)
const prompt = ref('')
const result = ref('')

const isTranslating = ref(false)
const translateSource = ref('')
const translateTargetLanguage = ref('en')
const translateResult = ref('')

function open() {
  translateSource.value = props.currentText || translateSource.value
  show.value = true
}
function close() { show.value = false }

async function generate() {
  if (!prompt.value.trim() || isGenerating.value) return
  isGenerating.value = true
  result.value = ''
  try {
    const res = await aiService.generateSms({ context: prompt.value,type:props.type })
    result.value = res.generatedText
  } catch {
    result.value = t('ai.errors.generate_failed') || 'No se pudo generar el contenido.'
  } finally {
    isGenerating.value = false
  }
}

async function translate() {
  if (!translateSource.value.trim() || isTranslating.value) return
  isTranslating.value = true
  translateResult.value = ''
  try {
    const res = await aiService.translate({ text: translateSource.value, targetLanguage: translateTargetLanguage.value })
    translateResult.value = res.translatedText
  } catch {
    translateResult.value = t('ai.errors.translate_failed') || 'No se pudo traducir el contenido.'
  } finally {
    isTranslating.value = false
  }
}

function insertGenerated() { emit('insert', result.value); close() }
function insertTranslated() { emit('insert', translateResult.value); close() }

const tabOptions = computed(() => [
  { label: t('ai.tabs.generate'), value: 'generate' },
  { label: t('ai.tabs.translate'), value: 'translate' },
])
</script>

<template>
  <div class="relative inline-flex items-center">
    <button
      type="button"
      :title="buttonTitle"
      class="w-6 h-6 rounded-md cursor-pointer text-xs flex items-center justify-center bg-surface-200 dark:bg-surface-800 hover:bg-surface-300 dark:hover:bg-surface-700 transition-colors"
      @click="open"
    >
      <IconSparkles class="w-4 h-4 text-[var(--p-primary-color)] fill-[var(--p-primary-color)]" />
    </button>

    <Dialog
      v-model:visible="show"
      modal
      :draggable="false"
      :dismissableMask="true"
      :blockScroll="true"
      :closable="true"
      :header="t('ai.title')"
      :breakpoints="{ '960px': '70vw', '640px': '95vw' }"
      :pt="{
        root: 'w-[min(92vw,48rem)]',
        content: 'max-h-[70vh] overflow-auto p-2'
      }"
    >
      <div class="flex flex-col gap-3">
        <SelectButton
          v-model="activeTab"
          :options="tabOptions"
          optionLabel="label"
          optionValue="value"
          size="small"
          :allowEmpty="false"
          aria-label="AI actions"
          :pt="{
            root: 'inline-flex rounded-lg overflow-hidden mx-auto border border-[var(--p-content-border-color)]',
            button: () =>
              'px-3 py-2 text-sm transition-colors focus:outline-none '
          }"
        />

        <!-- Generate -->
        <div v-if="activeTab === 'generate'" class="flex flex-col gap-3">
          <AppTextarea
            v-model="prompt"
            :label="t('ai.labels.prompt')"
            :rows="4"
            :placeholder="t('ai.placeholders.prompt')"
            :useFloatLabel="false"
          />
          <div class="flex items-center gap-2">
            <AppButton
              :label="isGenerating ? t('ai.buttons.generating') : t('ai.buttons.generate')"
              :loading="isGenerating"
              variant="primary"
              :disabled="isGenerating || !prompt.trim()"
              @click="generate"
            />
            <AppButton
              class="ml-auto"
              :label="t('ai.buttons.insert')"
              variant="secondary"
              :disabled="!result.length"
              @click="insertGenerated"
            />
          </div>
          <AppTextarea
            v-model="result"
            :label="t('ai.labels.result')"
            :readonly="true"
            :rows="6"
            :placeholder="t('ai.placeholders.result')"
            :useFloatLabel="false"
          />
        </div>

        <!-- Translate -->
        <div v-else class="flex flex-col gap-3">
          <AppSelect
            v-model="translateTargetLanguage"
            :options="[
              { name: 'English', value: 'en' },
              { name: 'Español', value: 'es' },
              { name: 'Português', value: 'pt' },
              { name: 'Français', value: 'fr' },
              { name: 'Deutsch', value: 'de' },
              { name: 'Italiano', value: 'it' },
            ]"
            :label="t('ai.labels.target_language')"
          />
          <AppTextarea
            v-model="translateSource"
            :label="t('ai.labels.text_to_translate')"
            :rows="4"
            :placeholder="t('ai.placeholders.text_to_translate')"
            :useFloatLabel="false"
          />
          <div class="flex items-center gap-2">
            <AppButton
              :label="isTranslating ? t('ai.buttons.translating') : t('ai.buttons.translate')"
              :loading="isTranslating"
              variant="primary"
              :disabled="!translateSource.trim()"
              @click="translate"
            />
            <AppButton
              class="ml-auto"
              :label="t('ai.buttons.insert')"
              variant="secondary"
              :disabled="!translateResult.length"
              @click="insertTranslated"
            />
          </div>
          <AppTextarea
            v-model="translateResult"
            :label="t('ai.labels.translation')"
            :readonly="true"
            :rows="6"
            :placeholder="t('ai.placeholders.result')"
            :useFloatLabel="false"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
/* opcional: afinar tap targets del botón flotante */
</style>
