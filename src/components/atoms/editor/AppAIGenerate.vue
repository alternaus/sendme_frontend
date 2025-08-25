<script setup lang="ts">
import { ref } from 'vue'

import Popover from 'primevue/popover'
import TabPanel from 'primevue/tabpanel'
import TabView from 'primevue/tabview'

import { useI18n } from 'vue-i18n'

import IconSparkles from '@/assets/svg/sparkles.svg?component'
import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import AppTextarea from '@/components/atoms/textarea/AppTextarea.vue'
import { useAiService } from '@/services/ai'

const props = defineProps({
  appendMode: {
    type: String as () => 'replace' | 'append',
    default: 'replace',
  },
  buttonTitle: {
    type: String,
    default: 'Generar con IA',
  },
  currentText: {
    type: String,
    default: '',
  },
})

const emit = defineEmits<{
  (e: 'insert', value: string): void
}>()

const opRef = ref<InstanceType<typeof Popover> | null>(null)
const isGenerating = ref(false)
const prompt = ref('')
const result = ref('')
const activeTab = ref('generate')

// Translate state
const translateSource = ref('')
const translateTargetLanguage = ref('en')
const translateResult = ref('')
const isTranslating = ref(false)

const { t } = useI18n()
const aiService = useAiService()

async function generate() {
  if (!prompt.value.trim() || isGenerating.value) return
  isGenerating.value = true
  result.value = ''

  try {
    const response = await aiService.generateSms({ context: prompt.value })
    result.value = response.generatedText
  } catch (error) {
    console.error('Error generating SMS:', error)
    result.value = 'No se pudo generar el contenido.'
  } finally {
    isGenerating.value = false
  }
}

function insertToParent() {
  emit('insert', result.value)
  opRef.value?.hide()
}

function toggle(event: MouseEvent) {
  translateSource.value = props.currentText || translateSource.value
  opRef.value?.toggle(event)
}

async function translate() {
  if (!translateSource.value.trim() || isTranslating.value) return
  isTranslating.value = true
  translateResult.value = ''

  try {
    const response = await aiService.translate({
      text: translateSource.value,
      targetLanguage: translateTargetLanguage.value,
    })
    translateResult.value = response.translatedText
  } catch (error) {
    console.error('Error translating text:', error)
    translateResult.value = t('ai.errors.translate_failed')
  } finally {
    isTranslating.value = false
  }
}
</script>

<template>
  <div class="relative inline-flex items-center">
    <button
      type="button"
      :title="buttonTitle"
      class="w-6 h-6 rounded-md text-xs flex items-center justify-center bg-surface-200 dark:bg-surface-800 hover:bg-surface-300 dark:hover:bg-surface-700 transition-colors"
      @click="toggle"
    >
      <IconSparkles class="w-4 h-4 text-[var(--p-primary-color)]" />
    </button>

    <Popover ref="opRef" class="!w-[min(92vw,28rem)]">
      <div class="flex flex-col gap-3 p-1">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium">{{ t('ai.title') }}</span>
        </div>

        <TabView v-model:value="activeTab">
          <TabPanel value="generate" :header="t('ai.tabs.generate')">
            <div class="flex flex-col gap-3">
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
                  :block="false"
                  :disable-when-loading="false"
                  @click="generate()"
                />

                <AppButton
                  class="ml-auto"
                  :label="t('ai.buttons.insert')"
                  variant="success"
                  :disabled="!result.length"
                  :block="false"
                  :disable-when-loading="false"
                  @click="insertToParent"
                />
              </div>

              <AppTextarea
                v-model="result"
                :label="t('ai.labels.result')"
                :readonly="true"
                :rows="Math.max(4, Math.ceil(result.length / 120))"
                :placeholder="t('ai.placeholders.result')"
                :useFloatLabel="false"
              />
            </div>
          </TabPanel>
          <TabPanel value="translate" :header="t('ai.tabs.translate')">
            <div class="flex flex-col gap-3">
              <div class="grid grid-cols-1 gap-2">
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
              </div>

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
                  :block="false"
                  :disable-when-loading="false"
                  @click="translate"
                />

                <AppButton
                  class="ml-auto"
                  :label="t('ai.buttons.insert')"
                  variant="success"
                  :disabled="!translateResult.length"
                  :block="false"
                  :disable-when-loading="false"
                  @click="() => emit('insert', translateResult)"
                />
              </div>

              <AppTextarea
                v-model="translateResult"
                :label="t('ai.labels.translation')"
                :readonly="true"
                :rows="Math.max(4, Math.ceil(translateResult.length / 120))"
                :placeholder="t('ai.placeholders.result')"
                :useFloatLabel="false"
              />
            </div>
          </TabPanel>
        </TabView>
      </div>
    </Popover>
  </div>
</template>

<style scoped></style>
