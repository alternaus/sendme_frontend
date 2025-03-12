import { computed, ref, watch } from 'vue'

import { defineStore } from 'pinia'
import type { I18n } from 'vue-i18n'

import { instanceI18n, setI18nLanguage } from '@/plugins/i18n'

export const useI18nStore = defineStore('i18n', () => {
  const defaultLang = (localStorage.getItem('lang') as 'es' | 'en') || 'es'
  const currentLang = ref<'es' | 'en'>(defaultLang)

  const language = computed(() => currentLang.value)

  const changeLanguage = (lang: 'es' | 'en') => {
    if (currentLang.value !== lang) {
      currentLang.value = lang
      localStorage.setItem('lang', lang)
      setI18nLanguage(instanceI18n as unknown as I18n, lang)
    }
  }

  watch(currentLang, (newLang) => {
    setI18nLanguage(instanceI18n as unknown as I18n, newLang)
  }, { immediate: true })

  return {
    language,
    changeLanguage,
  }
})
