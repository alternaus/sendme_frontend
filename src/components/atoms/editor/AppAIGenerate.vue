<script setup lang="ts">
import { computed, ref } from 'vue'

import Menu from 'primevue/menu'

import { useI18n } from 'vue-i18n'

import IconSparkles from '@/assets/svg/sparkles.svg?component'
import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppSelectButton from '@/components/atoms/buttons/AppSelectButton.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import AppTextarea from '@/components/atoms/textarea/AppTextarea.vue'
import { useAiService } from '@/services/ai'

const props = defineProps({
  appendMode: { type: String as () => 'replace' | 'append', default: 'replace' },
  buttonTitle: { type: String, default: 'Generar con IA' },
  currentText: { type: String, default: '' },
  type: { type: String as () => 'sms' | 'email', required: true },
})
const emit = defineEmits<{ (e: 'insert', value: string): void }>()

const { t } = useI18n()
const aiService = useAiService()

const menuRef = ref()
const activeTab = ref<'generate' | 'translate'>('generate')

const isGenerating = ref(false)
const prompt = ref('')
const result = ref('')

const isTranslating = ref(false)
const translateSource = ref('')
const translateTargetLanguage = ref('en')
const translateResult = ref('')

function toggle(event: Event) {
  translateSource.value = props.currentText || translateSource.value
  menuRef.value?.toggle(event)
}
function close() { menuRef.value?.hide() }

async function generate() {
  if (!prompt.value.trim() || isGenerating.value) return
  isGenerating.value = true
  result.value = ''
  try {
  const res = await aiService.generateSms({ context: prompt.value, type: props.type })
    result.value = res.generatedText
  } catch {
    result.value = t('common.ai.errors.generate_failed') || 'No se pudo generar el contenido.'
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
    translateResult.value = t('common.ai.errors.translate_failed') || 'No se pudo traducir el contenido.'
  } finally {
    isTranslating.value = false
  }
}

function insertGenerated() { emit('insert', result.value); close() }
function insertTranslated() { emit('insert', translateResult.value); close() }

const tabOptions = computed(() => [
  { name: t('common.ai.tabs.generate'), value: 'generate' },
  { name: t('common.ai.tabs.translate'), value: 'translate' },
])

const languageOptions = [
  { name: 'English', value: 'en' },
  { name: 'Español', value: 'es' },
  { name: 'Português', value: 'pt' },
  { name: 'Français', value: 'fr' },
  { name: 'Deutsch', value: 'de' },
  { name: 'Italiano', value: 'it' },
]
</script>

<template>
  <div class="relative inline-flex items-center">
    <AppButton
      type="button"
      :title="buttonTitle"
      class="!w-7 !h-7 !p-0 !min-w-0"
      size="small"
      severity="secondary"
      outlined
      @click="toggle"
    >
      <IconSparkles class="w-4 h-4" />
    </AppButton>

    <Menu ref="menuRef" :model="[]" :popup="true" class="ai-menu">
      <template #start>
        <div class="p-4 w-80">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-medium text-surface-900 dark:text-surface-0">{{ t('common.ai.title') }}</h3>
          </div>

          <div class="mb-3">
            <AppSelectButton
              v-model="activeTab"
              :options="tabOptions"
              optionLabel="name"
              optionValue="value"
              size="small"
              class="w-full"
            />
          </div>

          <!-- Generate tab -->
          <div v-if="activeTab === 'generate'" class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-surface-700 dark:text-surface-300 mb-1">
                {{ t('common.ai.labels.prompt') }}
              </label>
              <AppTextarea
                v-model="prompt"
                :placeholder="t('common.ai.placeholders.prompt')"
                class="w-full"
                :rows="3"
                :autoResize="false"
                size="small"
              />
            </div>

            <div class="flex gap-2">
              <AppButton
                type="button"
                :disabled="isGenerating || !prompt.trim()"
                :loading="isGenerating"
                size="small"
                severity="primary"
                @click="generate"
              >
                {{ isGenerating ? t('common.ai.buttons.generating') : t('common.ai.buttons.generate') }}
              </AppButton>
              <AppButton
                v-if="result"
                type="button"
                size="small"
                severity="secondary"
                outlined
                @click="insertGenerated"
              >
                {{ t('common.ai.buttons.insert') }}
              </AppButton>
            </div>

            <div v-if="result || isGenerating">
              <label class="block text-xs font-medium text-surface-700 dark:text-surface-300 mb-1">
                {{ t('common.ai.labels.result') }}
              </label>
              <div
                class="result-container w-full px-3 py-2 text-xs rounded-md min-h-[60px] max-h-[120px] overflow-y-auto"
              >
                <div v-if="isGenerating" class="flex items-center space-x-2">
                  <div
                    class="animate-spin w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full"
                  ></div>
                  <span class="text-surface-500 dark:text-surface-400">{{ t('common.ai.buttons.generating') }}</span>
                </div>
                <p
                  v-else-if="result"
                  class="whitespace-pre-wrap text-surface-900 dark:text-surface-0"
                >
                  {{ result }}
                </p>
              </div>
            </div>
          </div>

          <!-- Translate tab -->
          <div v-else class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-surface-700 dark:text-surface-300 mb-1">
                {{ t('common.ai.labels.target_language') }}
              </label>
              <AppSelect
                v-model="translateTargetLanguage"
                :options="languageOptions"
                optionLabel="name"
                optionValue="value"
                :placeholder="t('common.ai.placeholders.target_language') || t('common.select')"
                class="w-full"
                size="small"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-surface-700 dark:text-surface-300 mb-1">
                {{ t('common.ai.labels.text_to_translate') }}
              </label>
              <AppTextarea
                v-model="translateSource"
                :placeholder="t('common.ai.placeholders.text_to_translate')"
                class="w-full"
                :rows="3"
                :autoResize="false"
                size="small"
              />
            </div>

            <div class="flex gap-2">
              <AppButton
                type="button"
                :disabled="isTranslating || !translateSource.trim()"
                :loading="isTranslating"
                size="small"
                severity="primary"
                @click="translate"
              >
                {{ isTranslating ? t('common.ai.buttons.translating') : t('common.ai.buttons.translate') }}
              </AppButton>
              <AppButton
                v-if="translateResult"
                type="button"
                size="small"
                severity="secondary"
                outlined
                @click="insertTranslated"
              >
                {{ t('common.ai.buttons.insert') }}
              </AppButton>
            </div>

            <div v-if="translateResult || isTranslating">
              <label class="block text-xs font-medium text-surface-700 dark:text-surface-300 mb-1">
                {{ t('common.ai.labels.translation') }}
              </label>
              <div
                class="result-container w-full px-3 py-2 text-xs rounded-md min-h-[60px] max-h-[120px] overflow-y-auto"
              >
                <div v-if="isTranslating" class="flex items-center space-x-2">
                  <div
                    class="animate-spin w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full"
                  ></div>
                  <span class="text-surface-500 dark:text-surface-400">{{ t('common.ai.buttons.translating') }}</span>
                </div>
                <p
                  v-else-if="translateResult"
                  class="whitespace-pre-wrap text-surface-900 dark:text-surface-0"
                >
                  {{ translateResult }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Menu>
  </div>
</template>

<style scoped>
/* Personalización del Menu (diseño integrado del copy) */
:deep(.ai-menu .p-menu) {
  min-width: 320px;
  max-width: 320px;
  border: none;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.95);
}

.dark :deep(.ai-menu .p-menu) {
  background: rgba(17, 24, 39, 0.95);
}

:deep(.ai-menu .p-menu-list) {
  padding: 0;
}

@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }

.overflow-y-auto::-webkit-scrollbar { width: 4px; }
.overflow-y-auto::-webkit-scrollbar-track { background: transparent; }
.overflow-y-auto::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.5); border-radius: 2px; }
.dark .overflow-y-auto::-webkit-scrollbar-thumb { background: rgba(75, 85, 99, 0.5); }
.overflow-y-auto::-webkit-scrollbar-thumb:hover { background: rgba(156, 163, 175, 0.7); }
.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover { background: rgba(75, 85, 99, 0.7); }

.result-container { background: rgb(var(--surface-50)); }
.dark .result-container { background: rgb(var(--surface-800)); }
</style>
