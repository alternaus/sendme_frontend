import type { I18n } from 'vue-i18n'
import { createI18n } from 'vue-i18n'

import en from '@/locales/en.json'
import es from '@/locales/es.json'

type MessageSchema = typeof es

const messages: Record<'es' | 'en', MessageSchema> = { es, en }

// Obtener el idioma guardado en localStorage o usar 'es' por defecto
const savedLang = (localStorage.getItem('lang') as 'es' | 'en') || 'es'

// Función para cambiar el idioma dinámicamente en la app
export function setI18nLanguage(i18n: I18n, locale: keyof typeof messages) {
  if (i18n.mode === 'legacy') {
    i18n.global.locale = locale
  } else {
    (i18n.global.locale as unknown as { value: string }).value = locale
  }
  document.documentElement.lang = locale // Actualiza el atributo lang en HTML
}

// Instancia de Vue I18n
export const instanceI18n = createI18n<[MessageSchema], 'es' | 'en'>({
  legacy: false,
  locale: savedLang,
  fallbackLocale: 'en',
  globalInjection: true,
  messages,
})
