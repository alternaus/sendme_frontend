import { createI18n,type I18n } from 'vue-i18n'

import en from '@/locales/en.json'
import es from '@/locales/es.json'

type MessageSchema = typeof en

const messages: Record<'es' | 'en', MessageSchema> = { es, en }

const savedLang = (localStorage.getItem('lang') as 'es' | 'en') || 'es'

export function setI18nLanguage(i18n: I18n, locale: keyof typeof messages) {
  if (i18n.mode === 'legacy') {
    i18n.global.locale = locale
  } else {
    (i18n.global.locale as unknown as { value: string }).value = locale
  }
  document.documentElement.lang = locale
}


export const instanceI18n = createI18n<[MessageSchema], 'es' | 'en'>({
  legacy: false,
  locale: savedLang,
  fallbackLocale: 'en',
  globalInjection: true,
  messages,
})
