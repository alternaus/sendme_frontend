import type { I18n } from "vue-i18n"; 
import { createI18n } from "vue-i18n";

import en from '@/locales/en.json'
import es from '@/locales/es.json'

type MessageSchema = typeof es

// Crear el objeto de mensajes con tipado
const messages: Record<'es' | 'en', MessageSchema> = { es, en }

// Función para cambiar el idioma con tipado correcto
export function setI18nLanguage(i18n: I18n, locale: keyof typeof messages) {
  if (i18n.mode === 'legacy') {
    i18n.global.locale = locale
  } else {
    ;(i18n.global.locale as unknown as { value: string }).value = locale
  }
}

// Instancia de Vue I18n con tipado
export const instanceI18n = createI18n<[MessageSchema], 'es' | 'en'>({
  legacy: false,
  locale: 'es',
  fallbackLocale: 'en',
  globalInjection: true, 
  messages,
})
